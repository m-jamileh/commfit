export abstract class PaymentService {
  abstract collectPaymentMethod(input: {
    accountId: string;
  }): Promise<{ paymentMethodId: string; last4: string; brand: string }>;

  abstract charge(input: {
    paymentMethodId: string;
    amountCents: number;
    currency: string;
    description: string;
    idempotencyKey: string;
  }): Promise<{ paymentId: string; status: 'succeeded' | 'failed'; failureReason?: string }>;

  abstract setupRecurring(input: {
    paymentMethodId: string;
    contractId: string;
    cadence: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  }): Promise<{ scheduleId: string }>;
}
