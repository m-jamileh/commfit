import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ERPService {
  abstract syncJob(jobId: string): Promise<void>;
  abstract syncInvoice(invoiceId: string): Promise<void>;
  abstract syncPayment(paymentId: string): Promise<void>;
}
