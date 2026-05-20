export type TechType = 'in_house' | 'third_party';
export type TechAvailabilityStatus = 'available' | 'busy' | 'offline';
export type EquipmentClassForCert = 'cardio' | 'strength' | 'flooring' | 'functional' | 'other';

export class TechnicianCertificationDto {
  equipmentClass!: EquipmentClassForCert;
  certifiedAt!: string;
  notes?: string;
}

export class CreateTechnicianDto {
  userId!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone?: string;
  techType!: TechType;
  baseLat?: number;
  baseLng?: number;
  region!: string;
  availabilityStatus?: TechAvailabilityStatus;
  certifications?: TechnicianCertificationDto[];
  metadata?: Record<string, unknown>;
}

export class UpdateTechnicianDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  techType?: TechType;
  baseLat?: number;
  baseLng?: number;
  region?: string;
  availabilityStatus?: TechAvailabilityStatus;
  performanceScore?: number;
  status?: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export class TechnicianResponseDto {
  id!: string;
  userId!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone?: string;
  techType!: TechType;
  baseLat?: number;
  baseLng?: number;
  region!: string;
  availabilityStatus!: TechAvailabilityStatus;
  performanceScore?: number;
  certifications!: TechnicianCertificationDto[];
  status!: 'active' | 'archived';
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
