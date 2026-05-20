import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CommissionRecomputePayload, QUEUE_NAMES } from '../queues';

const logger = new Logger('CommissionRecomputeProcessor');

export async function processCommissionRecompute(
  job: Job<CommissionRecomputePayload>,
): Promise<void> {
  logger.log(`Processing job ${job.id} on queue ${QUEUE_NAMES.COMMISSION_RECOMPUTE}`);
  logger.debug(
    `Invoice: ${job.data.invoiceId}, TriggeredBy: ${job.data.triggeredByUserId ?? 'system'}`,
  );
  // M3: implement commission engine evaluation per commission-engine.spec.md
  // Steps:
  // 1. Load Invoice + InvoiceLineItems + Job + Technician
  // 2. For each InvoiceLineItem × Technician:
  //    a. Assemble context (techType, jobType, equipmentClass, technicianId)
  //    b. Run rule engine → first-match priority order
  //    c. Apply bonus tier check (completedJobsThisMonth vs bonusThresholdJobs)
  //    d. Upsert CommissionEarning (idempotency: check existing by composite key)
  //    e. Write AuditLog row in same transaction
  throw new Error('Not implemented — M3');
}
