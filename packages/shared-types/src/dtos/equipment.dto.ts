export type EquipmentClass = 'cardio' | 'strength' | 'flooring' | 'functional' | 'other';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor';

export class CreateEquipmentDto {
  accountId!: string;
  locationId!: string;
  serialNumber?: string;
  supplier?: string;
  model?: string;
  equipmentClass!: EquipmentClass;
  installDate?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  condition?: EquipmentCondition;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export class UpdateEquipmentDto {
  locationId?: string;
  serialNumber?: string;
  supplier?: string;
  model?: string;
  equipmentClass?: EquipmentClass;
  installDate?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  lastServiceDate?: string;
  condition?: EquipmentCondition;
  repairCount?: number;
  notes?: string;
  status?: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export class EquipmentResponseDto {
  id!: string;
  accountId!: string;
  locationId!: string;
  serialNumber?: string;
  supplier?: string;
  model?: string;
  equipmentClass!: EquipmentClass;
  installDate?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  lastServiceDate?: string;
  condition!: EquipmentCondition;
  repairCount!: number;
  notes?: string;
  status!: 'active' | 'archived';
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
