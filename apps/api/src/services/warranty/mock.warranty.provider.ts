import { Injectable } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MockWarrantyProvider extends WarrantyService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async checkStatus(equipmentId: string): Promise<{
    inWarranty: boolean;
    warrantyEnd?: Date;
    supplierContact?: string;
  }> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return { inWarranty: false };
    }

    const now = new Date();

    if (equipment.warrantyEnd && equipment.warrantyEnd >= now) {
      return {
        inWarranty: true,
        warrantyEnd: equipment.warrantyEnd,
        supplierContact: (equipment as unknown as Record<string, unknown>)['supplier'] as string ?? 'Unknown',
      };
    }

    return {
      inWarranty: false,
      warrantyEnd: equipment.warrantyEnd ?? undefined,
    };
  }
}
