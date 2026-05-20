import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScheduledPmRolloverPayload, QUEUE_NAMES } from '../queues';

const logger = new Logger('ScheduledPmRolloverProcessor');

export async function processScheduledPmRollover(
  job: Job<ScheduledPmRolloverPayload>,
): Promise<void> {
  logger.log(`Processing job ${job.id} on queue ${QUEUE_NAMES.SCHEDULED_PM_ROLLOVER}`);
  logger.debug(`Contract: ${job.data.contractId}, Period start: ${job.data.periodStart}`);
  // M3: implement PM job generation for the next cadence period
  throw new Error('Not implemented — M3');
}
