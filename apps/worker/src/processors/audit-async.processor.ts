import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { AuditAsyncPayload, QUEUE_NAMES } from '../queues';

@Processor(QUEUE_NAMES.AUDIT_ASYNC)
export class AuditAsyncProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditAsyncProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AuditAsyncPayload>): Promise<void> {
    this.logger.log(`Processing audit-async job ${job.id}`);
    const { entityType, entityId, action, actorUserId, before, after } = job.data;

    await this.prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        actorUserId: actorUserId ?? null,
        before: (before as object) ?? undefined,
        after: (after as object) ?? undefined,
      },
    });

    this.logger.log(
      `AuditLog created for ${entityType}/${entityId} action=${action} (job ${job.id})`,
    );
  }
}
