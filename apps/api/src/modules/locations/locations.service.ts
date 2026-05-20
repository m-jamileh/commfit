import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateLocationDto,
  LocationResponseDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  UpdateLocationDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { Location } from '@commfit/db';

function toLocationDto(location: Location): LocationResponseDto {
  return {
    id: location.id,
    accountId: location.accountId,
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state,
    zip: location.zip,
    contactName: location.contactName ?? undefined,
    contactEmail: location.contactEmail ?? undefined,
    contactPhone: location.contactPhone ?? undefined,
    notes: location.notes ?? undefined,
    status: location.status as 'active' | 'archived',
    metadata: location.metadata as Record<string, unknown>,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
  };
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    accountId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<LocationResponseDto>> {
    const limit = query.limit ?? 50;
    const cursor = query.cursor;

    const where = { accountId, status: 'active' as const };

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.location.count({ where }),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return new PaginatedResponseDto(items.map(toLocationDto), nextCursor, total);
  }

  async findOne(id: string, accountId?: string): Promise<LocationResponseDto> {
    const where = accountId ? { id, accountId } : { id };
    const location = await this.prisma.location.findFirst({ where });
    if (!location) {
      throw new NotFoundException(`Location ${id} not found`);
    }
    return toLocationDto(location);
  }

  async create(dto: CreateLocationDto): Promise<LocationResponseDto> {
    const location = await this.prisma.location.create({
      data: {
        accountId: dto.accountId,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        notes: dto.notes,
        metadata: (dto.metadata ?? {}) as object,
      },
    });
    return toLocationDto(location);
  }

  async update(id: string, dto: UpdateLocationDto): Promise<LocationResponseDto> {
    await this.findOne(id);
    const location = await this.prisma.location.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.zip !== undefined && { zip: dto.zip }),
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
    });
    return toLocationDto(location);
  }

  async archive(id: string): Promise<LocationResponseDto> {
    await this.findOne(id);
    const location = await this.prisma.location.update({
      where: { id },
      data: { status: 'archived' },
    });
    return toLocationDto(location);
  }
}
