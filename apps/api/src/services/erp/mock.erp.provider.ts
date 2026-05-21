import { Injectable } from '@nestjs/common';
import { ERPService } from './erp.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MockERPProvider extends ERPService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async syncJob(jobId: string): Promise<void> {
    await this.prisma.erpSyncLog.create({
      data: {
        entityType: 'job',
        entityId: jobId,
        action: 'sync',
        payload: { id: jobId },
        status: 'synced',
      },
    });
  }

  async syncInvoice(invoiceId: string): Promise<void> {
    await this.prisma.erpSyncLog.create({
      data: {
        entityType: 'invoice',
        entityId: invoiceId,
        action: 'sync',
        payload: { id: invoiceId },
        status: 'synced',
      },
    });
  }

  async syncPayment(paymentId: string): Promise<void> {
    await this.prisma.erpSyncLog.create({
      data: {
        entityType: 'payment',
        entityId: paymentId,
        action: 'sync',
        payload: { id: paymentId },
        status: 'synced',
      },
    });
  }
}
