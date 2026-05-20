export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export class CreatePaymentDto {
  accountId!: string;
  invoiceId!: string;
  paymentMethodId?: string;
  amountCents!: number;
  currency?: string;
  idempotencyKey!: string;
  metadata?: Record<string, unknown>;
}

export class PaymentResponseDto {
  id!: string;
  accountId!: string;
  invoiceId!: string;
  paymentMethodId?: string;
  amountCents!: number;
  currency!: string;
  stripePaymentId?: string;
  idempotencyKey!: string;
  status!: PaymentStatus;
  failureReason?: string;
  refundedAt?: Date;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
