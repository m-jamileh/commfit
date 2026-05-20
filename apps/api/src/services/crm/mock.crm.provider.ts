import { Injectable } from '@nestjs/common';
import { CRMService } from './crm.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MockCRMProvider extends CRMService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async upsertAccount(accountId: string): Promise<void> {
    await this.prisma.crmSyncLog.create({
      data: {
        entityType: 'Account',
        entityId: accountId,
        eventType: 'upsert',
        payload: { id: accountId },
      },
    });
  }

  async recordEvent(input: {
    accountId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.crmSyncLog.create({
      data: {
        entityType: 'Account',
        entityId: input.accountId,
        eventType: input.eventType,
        payload: input.payload as object,
      },
    });
  }
}
