import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PaymentService } from './payment.service';

@Injectable()
export class MockPaymentProvider extends PaymentService {
  async collectPaymentMethod(_input: {
    accountId: string;
  }): Promise<{ paymentMethodId: string; last4: string; brand: string }> {
    return {
      paymentMethodId: `mock_pm_${randomUUID()}`,
      last4: '4242',
      brand: 'visa',
    };
  }

  async charge(input: {
    paymentMethodId: string;
    amountCents: number;
    currency: string;
    description: string;
    idempotencyKey: string;
  }): Promise<{ paymentId: string; status: 'succeeded' | 'failed'; failureReason?: string }> {
    const paymentId = `mock_pay_${randomUUID()}`;

    if (input.amountCents === 99999) {
      return { paymentId, status: 'failed', failureReason: 'mock failure' };
    }

    return { paymentId, status: 'succeeded' };
  }

  async setupRecurring(_input: {
    paymentMethodId: string;
    contractId: string;
    cadence: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  }): Promise<{ scheduleId: string }> {
    return { scheduleId: `mock_sched_${randomUUID()}` };
  }
}
