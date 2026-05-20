import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateLocationDto,
  LocationResponseDto,
  UpdateLocationDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { ScopedRepository } from '../../database/scoped.repository';
import type { Location } from '@commfit/db';

@Injectable()
export class LocationsService extends ScopedRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(accountId: string): Promise<LocationResponseDto[]> {
    const locations = await this.prisma.location.findMany({
      where: this.scopedWhere(accountId),
    });
    return locations.map((l) => this.mapToDto(l));
  }

  async findOne(id: string, accountId: string): Promise<LocationResponseDto> {
    const location = await this.prisma.location.findFirst({
      where: this.scopedWhere(accountId, { id }),
    });
    if (!location) {
      throw new NotFoundException(`Location ${id} not found`);
    }
    return this.mapToDto(location);
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
    return this.mapToDto(location);
  }

  async update(
    id: string,
    accountId: string,
    dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    await this.findOne(id, accountId);
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
    return this.mapToDto(location);
  }

  async archive(id: string, accountId: string): Promise<LocationResponseDto> {
    await this.findOne(id, accountId);
    const location = await this.prisma.location.update({
      where: { id },
      data: { status: 'archived' },
    });
    return this.mapToDto(location);
  }

  private mapToDto(location: Location): LocationResponseDto {
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
}
