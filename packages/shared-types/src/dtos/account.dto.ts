export class CreateAccountDto {
  name!: string;
  billingEmail!: string;
  billingPhone?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  metadata?: Record<string, unknown>;
}

export class UpdateAccountDto {
  name?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  status?: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export class AccountResponseDto {
  id!: string;
  name!: string;
  billingEmail!: string;
  billingPhone?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  stripeCustomerId?: string;
  status!: 'active' | 'archived';
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
