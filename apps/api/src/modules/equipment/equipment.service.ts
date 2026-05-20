import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEquipmentDto,
  EquipmentResponseDto,
  UpdateEquipmentDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { ScopedRepository } from '../../database/scoped.repository';
import type { Equipment } from '@commfit/db';

@Injectable()
export class EquipmentService extends ScopedRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(accountId: string, locationId?: string): Promise<EquipmentResponseDto[]> {
    const equipment = await this.prisma.equipment.findMany({
      where: this.scopedWhere(accountId, {}, locationId),
    });
    return equipment.map((e) => this.mapToDto(e));
  }

  async findOne(id: string, accountId: string): Promise<EquipmentResponseDto> {
    const equipment = await this.prisma.equipment.findFirst({
      where: this.scopedWhere(accountId, { id }),
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }
    return this.mapToDto(equipment);
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
    });
    return this.mapToDto(equipment);
  }

  async update(
    id: string,
    accountId: string,
    dto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    await this.findOne(id, accountId);
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
        ...(dto.repairCount !== undefined && { repairCount: dto.repairCount }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
    });
    return this.mapToDto(equipment);
  }

  async archive(id: string, accountId: string): Promise<EquipmentResponseDto> {
    await this.findOne(id, accountId);
    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: { status: 'archived' },
    });
    return this.mapToDto(equipment);
  }

  private mapToDto(equipment: Equipment): EquipmentResponseDto {
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
}
