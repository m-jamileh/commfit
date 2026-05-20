export type JobType = 'pm' | 'sr' | 'disinfecting' | 'install';
export type JobStatus = 'scheduled' | 'en_route' | 'on_site' | 'completed' | 'cancelled';
export type JobPriority = 'normal' | 'urgent';

export class CreateJobDto {
  accountId!: string;
  locationId!: string;
  jobType!: JobType;
  scheduledAt!: string;
  priority?: JobPriority;
  technicianId?: string;
  equipmentIds?: string[];
  notes?: string;
  customerNotes?: string;
  warrantyClaim?: boolean;
  warrantySupplier?: string;
  metadata?: Record<string, unknown>;
}

export class UpdateJobDto {
  technicianId?: string;
  scheduledAt?: string;
  priority?: JobPriority;
  status?: JobStatus;
  notes?: string;
  customerNotes?: string;
  warrantyClaim?: boolean;
  warrantySupplier?: string;
  metadata?: Record<string, unknown>;
}

export class AssignJobDto {
  technicianId!: string;
}

export class JobResponseDto {
  id!: string;
  accountId!: string;
  locationId!: string;
  technicianId?: string;
  jobType!: JobType;
  status!: JobStatus;
  scheduledAt!: Date;
  startedAt?: Date;
  completedAt?: Date;
  priority!: JobPriority;
  notes?: string;
  customerNotes?: string;
  warrantyClaim!: boolean;
  warrantySupplier?: string;
  stripeChargeId?: string;
  statusChangedAt?: Date;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
