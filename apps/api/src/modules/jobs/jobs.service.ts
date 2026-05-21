import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobStatus } from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { ESignService } from '../../services/esign/esign.service';
import type { Job } from '@commfit/db';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audit-async') private readonly auditQueue: Queue,
    private readonly esignService: ESignService,
  ) {}

  async findAll(query: {
    accountId?: string;
    locationId?: string;
    technicianId?: string;
    status?: string;
    jobType?: string;
    limit?: number;
    cursor?: string;
  }): Promise<JobResponseDto[]> {
    const { accountId, locationId, technicianId, status, jobType, limit, cursor } = query;
    const jobs = await this.prisma.job.findMany({
      where: {
        ...(accountId ? { accountId } : {}),
        ...(locationId ? { locationId } : {}),
        ...(technicianId ? { technicianId } : {}),
        ...(status ? { status: status as Job['status'] } : {}),
        ...(jobType ? { jobType: jobType as Job['jobType'] } : {}),
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit ?? 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return jobs.map((j) => this.mapToDto(j));
  }

  async findOne(id: string): Promise<JobResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        jobEquipment: true,
        jobParts: true,
        jobPhotos: true,
        jobSignoff: true,
      },
    });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return this.mapToDto(job);
  }

  async create(dto: CreateJobDto): Promise<JobResponseDto> {
    const job = await this.prisma.job.create({
      data: {
        accountId: dto.accountId,
        locationId: dto.locationId,
        jobType: dto.jobType,
        scheduledAt: new Date(dto.scheduledAt),
        priority: dto.priority ?? 'normal',
        technicianId: dto.technicianId ?? null,
        notes: dto.notes ?? null,
        customerNotes: dto.customerNotes ?? null,
        warrantyClaim: dto.warrantyClaim ?? false,
        warrantySupplier: dto.warrantySupplier ?? null,
        metadata: (dto.metadata ?? {}) as object,
      },
    });

    if (dto.equipmentIds && dto.equipmentIds.length > 0) {
      await this.prisma.jobEquipment.createMany({
        data: dto.equipmentIds.map((equipmentId) => ({
          jobId: job.id,
          equipmentId,
        })),
        skipDuplicates: true,
      });
    }

    return this.mapToDto(job);
  }

  async update(id: string, dto: UpdateJobDto): Promise<JobResponseDto> {
    await this.findOne(id);
    const currentJob = await this.prisma.job.findUnique({ where: { id } });
    const statusChanging = dto.status !== undefined && dto.status !== currentJob?.status;

    // Shallow merge metadata so partial PATCH requests are non-destructive.
    // equipmentDone is deep-merged one level so individual equipment can be
    // marked done without overwriting sibling entries (COM-49).
    let mergedMetadata: Record<string, unknown> | undefined;
    if (dto.metadata !== undefined) {
      const existing = (currentJob?.metadata ?? {}) as Record<string, unknown>;
      const incoming = dto.metadata as Record<string, unknown>;
      mergedMetadata = { ...existing, ...incoming };
      if (
        incoming.equipmentDone !== undefined &&
        typeof existing.equipmentDone === 'object' &&
        existing.equipmentDone !== null
      ) {
        mergedMetadata.equipmentDone = {
          ...(existing.equipmentDone as Record<string, unknown>),
          ...(incoming.equipmentDone as Record<string, unknown>),
        };
      }
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...(dto.technicianId !== undefined && { technicianId: dto.technicianId }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.customerNotes !== undefined && { customerNotes: dto.customerNotes }),
        ...(dto.warrantyClaim !== undefined && { warrantyClaim: dto.warrantyClaim }),
        ...(dto.warrantySupplier !== undefined && { warrantySupplier: dto.warrantySupplier }),
        ...(mergedMetadata !== undefined && { metadata: mergedMetadata as object }),
        ...(statusChanging && { statusChangedAt: new Date() }),
      },
    });

    // Emit one named audit entry per equipment marked done (fire-and-forget,
    // same queue as AuditLogInterceptor).
    const incomingEquipDone = mergedMetadata !== undefined
      ? (dto.metadata as Record<string, unknown>).equipmentDone
      : undefined;
    if (incomingEquipDone && typeof incomingEquipDone === 'object') {
      for (const [equipmentId, value] of Object.entries(
        incomingEquipDone as Record<string, unknown>,
      )) {
        this.auditQueue
          .add('audit-async', {
            entityType: 'job',
            entityId: id,
            action: 'equipment_mark_done',
            after: { equipmentId, ...(value as Record<string, unknown>) },
          })
          .catch(() => {});
      }
    }

    return this.mapToDto(job);
  }

  async assign(id: string, dto: { technicianId: string }): Promise<JobResponseDto> {
    const existing = await this.prisma.job.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        technicianId: dto.technicianId,
        ...(existing.status === 'scheduled' || !existing.technicianId
          ? { status: 'scheduled', statusChangedAt: new Date() }
          : {}),
      },
    });
    return this.mapToDto(job);
  }

  async transition(id: string, newStatus: JobStatus): Promise<JobResponseDto> {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    const current = job.status as JobStatus;
    const validTransitions: Record<string, string[]> = {
      scheduled: ['en_route'],
      en_route: ['on_site'],
      on_site: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[current]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition job from ${current} to ${newStatus}`,
      );
    }

    const now = new Date();
    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: newStatus,
        statusChangedAt: now,
        ...(newStatus === 'on_site' && { startedAt: now }),
        ...(newStatus === 'completed' && { completedAt: now }),
      },
    });
    return this.mapToDto(updated);
  }

  async complete(
    id: string,
    signoff: { signerName: string; signerEmail: string },
  ): Promise<JobResponseDto> {
    await this.transition(id, 'completed');

    const envelope = await this.esignService.createEnvelope({
      documentId: id,
      signerEmail: signoff.signerEmail,
      signerName: signoff.signerName,
    });

    await this.prisma.jobSignoff.upsert({
      where: { jobId: id },
      create: {
        jobId: id,
        signerName: signoff.signerName,
        signerEmail: signoff.signerEmail,
        docusignEnvelopeId: envelope.envelopeId,
        signingUrl: envelope.signingUrl,
        status: 'pending',
      },
      update: {
        signerName: signoff.signerName,
        signerEmail: signoff.signerEmail,
        docusignEnvelopeId: envelope.envelopeId,
        signingUrl: envelope.signingUrl,
        status: 'pending',
      },
    });

    return this.findOne(id);
  }

  async cancel(id: string): Promise<JobResponseDto> {
    const existing = await this.prisma.job.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'cancelled',
        statusChangedAt: new Date(),
      },
    });
    return this.mapToDto(job);
  }

  async addPhoto(
    jobId: string,
    data: {
      url: string;
      caption?: string;
      equipmentId?: string;
      uploadedByUserId?: string;
    },
  ): Promise<Record<string, unknown>> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    const photo = await this.prisma.jobPhoto.create({
      data: {
        jobId,
        url: data.url,
        caption: data.caption ?? null,
        equipmentId: data.equipmentId ?? null,
        uploadedByUserId: data.uploadedByUserId ?? null,
      },
    });
    return {
      id: photo.id,
      jobId: photo.jobId,
      url: photo.url,
      caption: photo.caption,
      equipmentId: photo.equipmentId,
      uploadedByUserId: photo.uploadedByUserId,
      createdAt: photo.createdAt,
    };
  }

  async addPart(
    jobId: string,
    data: { partId: string; quantity: number; unitCostCents: number },
  ): Promise<Record<string, unknown>> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    const part = await this.prisma.jobPart.create({
      data: {
        jobId,
        partId: data.partId,
        quantity: data.quantity,
        unitCostCents: BigInt(data.unitCostCents),
        metadata: {},
      },
    });
    return {
      id: part.id,
      jobId: part.jobId,
      partId: part.partId,
      quantity: part.quantity,
      unitCostCents: Number(part.unitCostCents),
      createdAt: part.createdAt,
    };
  }

  private mapToDto(job: Job): JobResponseDto {
    return {
      id: job.id,
      accountId: job.accountId,
      locationId: job.locationId,
      technicianId: job.technicianId ?? undefined,
      jobType: job.jobType as JobResponseDto['jobType'],
      status: job.status as JobResponseDto['status'],
      scheduledAt: job.scheduledAt,
      startedAt: job.startedAt ?? undefined,
      completedAt: job.completedAt ?? undefined,
      priority: job.priority as JobResponseDto['priority'],
      notes: job.notes ?? undefined,
      customerNotes: job.customerNotes ?? undefined,
      warrantyClaim: job.warrantyClaim,
      warrantySupplier: job.warrantySupplier ?? undefined,
      stripeChargeId: job.stripeChargeId ?? undefined,
      statusChangedAt: job.statusChangedAt ?? undefined,
      metadata: job.metadata as Record<string, unknown>,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
