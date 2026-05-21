import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEquipmentDto,
  EquipmentResponseDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  UpdateEquipmentDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';

type EquipmentWithPhotos = {
  id: string;
  accountId: string;
  locationId: string;
  serialNumber: string | null;
  supplier: string | null;
  model: string | null;
  equipmentClass: string;
  installDate: Date | null;
  warrantyStart: Date | null;
  warrantyEnd: Date | null;
  lastServiceDate: Date | null;
  condition: string;
  repairCount: number;
  notes: string | null;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
  jobPhotos: Array<{
    id: string;
    url: string;
    caption: string | null;
    jobId: string;
    equipmentId: string | null;
    uploadedByUserId: string | null;
    createdAt: Date;
  }>;
};

export interface EquipmentFindAllQuery extends PaginationQueryDto {
  accountId?: string;
  locationId?: string;
  equipmentClass?: string;
  condition?: string;
}

function toEquipmentDto(equipment: EquipmentWithPhotos): EquipmentResponseDto {
  return {
    id: equipment.id,
    accountId: equipment.accountId,
    locationId: equipment.locationId,
    serialNumber: equipment.serialNumber ?? undefined,
    supplier: equipment.supplier ?? undefined,
    model: equipment.model ?? undefined,
    equipmentClass: equipment.equipmentClass as EquipmentResponseDto['equipmentClass'],
    installDate: equipment.installDate
      ? equipment.installDate.toISOString()
      : undefined,
    warrantyStart: equipment.warrantyStart
      ? equipment.warrantyStart.toISOString()
      : undefined,
    warrantyEnd: equipment.warrantyEnd
      ? equipment.warrantyEnd.toISOString()
      : undefined,
    lastServiceDate: equipment.lastServiceDate
      ? equipment.lastServiceDate.toISOString()
      : undefined,
    condition: equipment.condition as EquipmentResponseDto['condition'],
    repairCount: equipment.repairCount,
    notes: equipment.notes ?? undefined,
    status: equipment.status as 'active' | 'archived',
    metadata: equipment.metadata as Record<string, unknown>,
    createdAt: equipment.createdAt,
    updatedAt: equipment.updatedAt,
  };
}

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: EquipmentFindAllQuery,
  ): Promise<PaginatedResponseDto<EquipmentResponseDto>> {
    const limit = query.limit ?? 50;
    const cursor = query.cursor;

    const where: Record<string, unknown> = { status: 'active' };
    if (query.accountId) where['accountId'] = query.accountId;
    if (query.locationId) where['locationId'] = query.locationId;
    if (query.equipmentClass) where['equipmentClass'] = query.equipmentClass;
    if (query.condition) where['condition'] = query.condition;

    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: { jobPhotos: true },
      }),
      this.prisma.equipment.count({ where }),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return new PaginatedResponseDto(
      items.map((e) => toEquipmentDto(e as unknown as EquipmentWithPhotos)),
      nextCursor,
      total,
    );
  }

  async findOne(id: string): Promise<EquipmentResponseDto> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: { jobPhotos: true },
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }
    return toEquipmentDto(equipment as unknown as EquipmentWithPhotos);
  }

  async create(dto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    const equipment = await this.prisma.equipment.create({
      data: {
        accountId: dto.accountId,
        locationId: dto.locationId,
        serialNumber: dto.serialNumber,
        supplier: dto.supplier,
        model: dto.model,
        equipmentClass: dto.equipmentClass,
        installDate: dto.installDate ? new Date(dto.installDate) : undefined,
        warrantyStart: dto.warrantyStart ? new Date(dto.warrantyStart) : undefined,
        warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : undefined,
        condition: dto.condition ?? 'good',
        notes: dto.notes,
        metadata: (dto.metadata ?? {}) as object,
      },
      include: { jobPhotos: true },
    });
    return toEquipmentDto(equipment as unknown as EquipmentWithPhotos);
  }

  async update(id: string, dto: UpdateEquipmentDto): Promise<EquipmentResponseDto> {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }

    // Increment repairCount when condition changes to 'poor'
    const shouldIncrementRepairCount =
      dto.condition === 'poor' && existing.condition !== 'poor';

    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.locationId !== undefined && { locationId: dto.locationId }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.supplier !== undefined && { supplier: dto.supplier }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.equipmentClass !== undefined && { equipmentClass: dto.equipmentClass }),
        ...(dto.installDate !== undefined && {
          installDate: dto.installDate ? new Date(dto.installDate) : null,
        }),
        ...(dto.warrantyStart !== undefined && {
          warrantyStart: dto.warrantyStart ? new Date(dto.warrantyStart) : null,
        }),
        ...(dto.warrantyEnd !== undefined && {
          warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : null,
        }),
        ...(dto.lastServiceDate !== undefined && {
          lastServiceDate: dto.lastServiceDate ? new Date(dto.lastServiceDate) : null,
        }),
        ...(dto.condition !== undefined && { condition: dto.condition }),
        ...(dto.repairCount !== undefined
          ? { repairCount: dto.repairCount }
          : shouldIncrementRepairCount
            ? { repairCount: { increment: 1 } }
            : {}),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
      include: { jobPhotos: true },
    });
    return toEquipmentDto(equipment as unknown as EquipmentWithPhotos);
  }

  async archive(id: string): Promise<EquipmentResponseDto> {
    await this.findOne(id);
    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: { status: 'archived' },
      include: { jobPhotos: true },
    });
    return toEquipmentDto(equipment as unknown as EquipmentWithPhotos);
  }
}
