export type ServiceType = 'pm' | 'disinfecting' | 'combined';
export type Cadence = 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'partially_signed'
  | 'signed'
  | 'terminated';

export class CreateContractDto {
  accountId!: string;
  title!: string;
  serviceType!: ServiceType;
  cadence!: Cadence;
  startDate!: string;
  endDate!: string;
  autoRenew?: boolean;
  autoPay?: boolean;
  paymentMethodId?: string;
  totalValueCents?: number;
  propertyIds?: string[];
  metadata?: Record<string, unknown>;
}

export class UpdateContractDto {
  title?: string;
  serviceType?: ServiceType;
  cadence?: Cadence;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  autoPay?: boolean;
  paymentMethodId?: string;
  totalValueCents?: number;
  status?: ContractStatus;
  metadata?: Record<string, unknown>;
}

export class ContractResponseDto {
  id!: string;
  accountId!: string;
  createdByUserId?: string;
  title!: string;
  serviceType!: ServiceType;
  cadence!: Cadence;
  startDate!: string;
  endDate!: string;
  autoRenew!: boolean;
  autoPay!: boolean;
  paymentMethodId?: string;
  totalValueCents!: number;
  docusignEnvelopeId?: string;
  signedAt?: Date;
  status!: ContractStatus;
  propertyIds!: string[];
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
