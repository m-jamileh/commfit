export type CommissionStatus = 'pending' | 'approved' | 'paid';
export type CommissionTechType = 'in_house' | 'third_party';
export type CommissionJobType = 'pm' | 'sr' | 'disinfecting' | 'install';
export type CommissionEquipmentClass =
  | 'cardio'
  | 'strength'
  | 'flooring'
  | 'functional'
  | 'other';

export class CreateCommissionRuleDto {
  name!: string;
  description?: string;
  techTypeFilter?: CommissionTechType;
  jobTypeFilter?: CommissionJobType;
  equipmentClassFilter?: CommissionEquipmentClass;
  technicianIdFilter?: string;
  ratePct!: number;
  bonusThresholdJobs?: number;
  bonusRatePct?: number;
  priority?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

export class UpdateCommissionRuleDto {
  name?: string;
  description?: string;
  techTypeFilter?: CommissionTechType;
  jobTypeFilter?: CommissionJobType;
  equipmentClassFilter?: CommissionEquipmentClass;
  technicianIdFilter?: string;
  ratePct?: number;
  bonusThresholdJobs?: number;
  bonusRatePct?: number;
  priority?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

export class CommissionRuleResponseDto {
  id!: string;
  name!: string;
  description?: string;
  techTypeFilter?: CommissionTechType;
  jobTypeFilter?: CommissionJobType;
  equipmentClassFilter?: CommissionEquipmentClass;
  technicianIdFilter?: string;
  ratePct!: number;
  bonusThresholdJobs?: number;
  bonusRatePct?: number;
  priority!: number;
  active!: boolean;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CommissionEarningResponseDto {
  id!: string;
  technicianId!: string;
  invoiceId!: string;
  invoiceLineItemId?: string;
  commissionRuleId?: string;
  jobId?: string;
  baseAmountCents!: number;
  commissionPct!: number;
  commissionCents!: number;
  ruleTrace!: Record<string, unknown>;
  status!: CommissionStatus;
  paidAt?: Date;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
