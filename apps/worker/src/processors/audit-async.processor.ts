import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuditAsyncPayload, QUEUE_NAMES } from '../queues';

const logger = new Logger('AuditAsyncProcessor');

export async function processAuditAsync(job: Job<AuditAsyncPayload>): Promise<void> {
  logger.log(`Processing job ${job.id} on queue ${QUEUE_NAMES.AUDIT_ASYNC}`);
  logger.debug(
    `Entity: ${job.data.entityType}/${job.data.entityId}, Action: ${job.data.action}`,
  );
  // M3: implement — write AuditLog row to DB from async queue
  // Used for non-critical audit events that should not block the request path
  throw new Error('Not implemented — M3');
}
