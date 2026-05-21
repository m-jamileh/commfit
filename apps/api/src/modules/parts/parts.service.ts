import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePartDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  PartInventoryResponseDto,
  PartResponseDto,
  UpdatePartDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { Part, PartInventory } from '@commfit/db';

export interface PartFindAllQuery extends PaginationQueryDto {
  status?: string;
}

function toPartDto(part: Part): PartResponseDto {
  return {
    id: part.id,
    sku: part.sku,
    name: part.name,
    description: part.description ?? undefined,
    supplier: part.supplier ?? undefined,
    unitCostCents: Number(part.unitCostCents),
    status: part.status as 'active' | 'archived',
    metadata: part.metadata as Record<string, unknown>,
    createdAt: part.createdAt,
    updatedAt: part.updatedAt,
  };
}

function toInventoryDto(inventory: PartInventory): PartInventoryResponseDto {
  return {
    id: inventory.id,
    partId: inventory.partId,
    locationId: inventory.locationId ?? undefined,
    technicianId: inventory.technicianId ?? undefined,
    quantity: inventory.quantity,
    reorderThreshold: inventory.reorderThreshold,
    metadata: inventory.metadata as Record<string, unknown>,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt,
  };
}

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PartFindAllQuery,
  ): Promise<PaginatedResponseDto<PartResponseDto>> {
    const limit = query.limit ?? 50;
    const cursor = query.cursor;
    const statusFilter = query.status ?? 'active';

    const where: Record<string, unknown> = { status: statusFilter };

    const [items, total] = await Promise.all([
      this.prisma.part.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.part.count({ where }),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return new PaginatedResponseDto(items.map(toPartDto), nextCursor, total);
  }

  async findBySku(sku: string): Promise<PartResponseDto | null> {
    const part = await this.prisma.part.findUnique({
      where: { sku },
      include: { partInventory: true },
    });
    if (!part) return null;
    return toPartDto(part);
  }

  async findOne(id: string): Promise<PartResponseDto> {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: { partInventory: true },
    });
    if (!part) {
      throw new NotFoundException(`Part ${id} not found`);
    }
    return toPartDto(part);
  }

  async create(dto: CreatePartDto): Promise<PartResponseDto> {
    const part = await this.prisma.part.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        supplier: dto.supplier,
        unitCostCents: BigInt(dto.unitCostCents),
        metadata: (dto.metadata ?? {}) as object,
      },
    });
    return toPartDto(part);
  }

  async update(id: string, dto: UpdatePartDto): Promise<PartResponseDto> {
    await this.findOne(id);
    const part = await this.prisma.part.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.supplier !== undefined && { supplier: dto.supplier }),
        ...(dto.unitCostCents !== undefined && {
          unitCostCents: BigInt(dto.unitCostCents),
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
    });
    return toPartDto(part);
  }

  async archive(id: string): Promise<PartResponseDto> {
    await this.findOne(id);
    const part = await this.prisma.part.update({
      where: { id },
      data: { status: 'archived' },
    });
    return toPartDto(part);
  }

  async getInventory(
    partId: string,
    locationId?: string,
    technicianId?: string,
  ): Promise<PartInventoryResponseDto[]> {
    const where: Record<string, unknown> = { partId };
    if (locationId) where['locationId'] = locationId;
    if (technicianId) where['technicianId'] = technicianId;

    const inventory = await this.prisma.partInventory.findMany({ where });
    return inventory.map(toInventoryDto);
  }

  async updateInventory(
    partId: string,
    locationId: string | undefined,
    technicianId: string | undefined,
    quantity: number,
    reorderThreshold?: number,
  ): Promise<PartInventoryResponseDto> {
    const existing = await this.prisma.partInventory.findFirst({
      where: {
        partId,
        ...(locationId !== undefined
          ? { locationId }
          : { locationId: null }),
        ...(technicianId !== undefined
          ? { technicianId }
          : { technicianId: null }),
      },
    });

    let inventory: PartInventory;
    if (existing) {
      inventory = await this.prisma.partInventory.update({
        where: { id: existing.id },
        data: {
          quantity,
          ...(reorderThreshold !== undefined && { reorderThreshold }),
        },
      });
    } else {
      inventory = await this.prisma.partInventory.create({
        data: {
          partId,
          locationId,
          technicianId,
          quantity,
          reorderThreshold: reorderThreshold ?? 0,
        },
      });
    }

    return toInventoryDto(inventory);
  }
}
