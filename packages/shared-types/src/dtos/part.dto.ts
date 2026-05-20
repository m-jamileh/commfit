export class CreatePartDto {
  sku!: string;
  name!: string;
  description?: string;
  supplier?: string;
  unitCostCents!: number;
  metadata?: Record<string, unknown>;
}

export class UpdatePartDto {
  name?: string;
  description?: string;
  supplier?: string;
  unitCostCents?: number;
  status?: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export class PartResponseDto {
  id!: string;
  sku!: string;
  name!: string;
  description?: string;
  supplier?: string;
  unitCostCents!: number;
  status!: 'active' | 'archived';
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PartInventoryResponseDto {
  id!: string;
  partId!: string;
  locationId?: string;
  technicianId?: string;
  quantity!: number;
  reorderThreshold!: number;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
