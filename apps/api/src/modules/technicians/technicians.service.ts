import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateTechnicianDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  TechnicianCertificationDto,
  TechnicianResponseDto,
  UpdateTechnicianDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { EquipmentClass } from '@commfit/db';

type TechnicianWithRelations = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  techType: string;
  baseLat: unknown;
  baseLng: unknown;
  baseLocationId: string | null;
  region: string;
  availabilityStatus: string;
  performanceScore: unknown;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
  certifications: Array<{
    id: string;
    technicianId: string;
    equipmentClass: string;
    certifiedAt: Date;
    notes: string | null;
  }>;
  regions?: Array<{
    id: string;
    technicianId: string;
    region: string;
    createdAt: Date;
  }>;
};

export interface TechnicianFindAllQuery extends PaginationQueryDto {
  region?: string;
  techType?: string;
  availabilityStatus?: string;
}

function toTechnicianDto(technician: TechnicianWithRelations): TechnicianResponseDto {
  return {
    id: technician.id,
    userId: technician.userId,
    firstName: technician.firstName,
    lastName: technician.lastName,
    email: technician.email,
    phone: technician.phone ?? undefined,
    techType: technician.techType as TechnicianResponseDto['techType'],
    baseLat: technician.baseLat != null ? Number(technician.baseLat) : undefined,
    baseLng: technician.baseLng != null ? Number(technician.baseLng) : undefined,
    region: technician.region,
    availabilityStatus:
      technician.availabilityStatus as TechnicianResponseDto['availabilityStatus'],
    performanceScore:
      technician.performanceScore != null
        ? Number(technician.performanceScore)
        : undefined,
    certifications: technician.certifications.map(
      (c): TechnicianCertificationDto => ({
        equipmentClass: c.equipmentClass as TechnicianCertificationDto['equipmentClass'],
        certifiedAt: c.certifiedAt.toISOString(),
        notes: c.notes ?? undefined,
      }),
    ),
    status: technician.status as 'active' | 'archived',
    metadata: technician.metadata as Record<string, unknown>,
    createdAt: technician.createdAt,
    updatedAt: technician.updatedAt,
  };
}

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: TechnicianFindAllQuery,
  ): Promise<PaginatedResponseDto<TechnicianResponseDto>> {
    const limit = query.limit ?? 50;
    const cursor = query.cursor;

    const where: Record<string, unknown> = { status: 'active' };
    if (query.region) where['region'] = query.region;
    if (query.techType) where['techType'] = query.techType;
    if (query.availabilityStatus)
      where['availabilityStatus'] = query.availabilityStatus;

    const [items, total] = await Promise.all([
      this.prisma.technician.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: { certifications: true },
      }),
      this.prisma.technician.count({ where }),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return new PaginatedResponseDto(
      items.map((t) => toTechnicianDto(t as unknown as TechnicianWithRelations)),
      nextCursor,
      total,
    );
  }

  async findOne(id: string): Promise<TechnicianResponseDto> {
    const technician = await this.prisma.technician.findUnique({
      where: { id },
      include: { certifications: true, regions: true },
    });
    if (!technician) {
      throw new NotFoundException(`Technician ${id} not found`);
    }
    return toTechnicianDto(technician as unknown as TechnicianWithRelations);
  }

  async create(dto: CreateTechnicianDto): Promise<TechnicianResponseDto> {
    const certifications = dto.certifications ?? [];

    const technician = await this.prisma.technician.create({
      data: {
        userId: dto.userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        techType: dto.techType,
        baseLat: dto.baseLat,
        baseLng: dto.baseLng,
        region: dto.region,
        availabilityStatus: dto.availabilityStatus ?? 'available',
        metadata: (dto.metadata ?? {}) as object,
      },
      include: { certifications: true },
    });

    if (certifications.length > 0) {
      await this.prisma.$transaction(
        certifications.map((cert) =>
          this.prisma.technicianCertification.create({
            data: {
              technicianId: technician.id,
              equipmentClass: cert.equipmentClass,
              certifiedAt: new Date(cert.certifiedAt),
              notes: cert.notes,
            },
          }),
        ),
      );
    }

    return this.findOne(technician.id);
  }

  async update(id: string, dto: UpdateTechnicianDto): Promise<TechnicianResponseDto> {
    await this.findOne(id);
    await this.prisma.technician.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.techType !== undefined && { techType: dto.techType }),
        ...(dto.baseLat !== undefined && { baseLat: dto.baseLat }),
        ...(dto.baseLng !== undefined && { baseLng: dto.baseLng }),
        ...(dto.region !== undefined && { region: dto.region }),
        ...(dto.availabilityStatus !== undefined && {
          availabilityStatus: dto.availabilityStatus,
        }),
        ...(dto.performanceScore !== undefined && {
          performanceScore: dto.performanceScore,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
    });
    return this.findOne(id);
  }

  async archive(id: string): Promise<TechnicianResponseDto> {
    await this.findOne(id);
    await this.prisma.technician.update({
      where: { id },
      data: { status: 'archived' },
    });
    return this.findOne(id);
  }

  async addCertification(
    technicianId: string,
    data: { equipmentClass: string; certifiedAt: string; notes?: string },
  ): Promise<TechnicianResponseDto> {
    await this.findOne(technicianId);
    await this.prisma.technicianCertification.create({
      data: {
        technicianId,
        equipmentClass: data.equipmentClass as EquipmentClass,
        certifiedAt: new Date(data.certifiedAt),
        notes: data.notes,
      },
    });
    return this.findOne(technicianId);
  }

  async removeCertification(certificationId: string): Promise<void> {
    await this.prisma.technicianCertification.delete({
      where: { id: certificationId },
    });
  }

  async updateLoad(technicianId: string, load: number): Promise<TechnicianResponseDto> {
    await this.findOne(technicianId);
    const availabilityStatus = load > 5 ? 'busy' : 'available';
    await this.prisma.technician.update({
      where: { id: technicianId },
      data: { availabilityStatus },
    });
    return this.findOne(technicianId);
  }
}
