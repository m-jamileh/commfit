export class CreateLocationDto {
  accountId!: string;
  name!: string;
  address!: string;
  city!: string;
  state!: string;
  zip!: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export class UpdateLocationDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  status?: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export class LocationResponseDto {
  id!: string;
  accountId!: string;
  name!: string;
  address!: string;
  city!: string;
  state!: string;
  zip!: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  status!: 'active' | 'archived';
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
