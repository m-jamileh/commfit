import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailDispatchPayload, QUEUE_NAMES } from '../queues';

const logger = new Logger('EmailDispatchProcessor');

export async function processEmailDispatch(job: Job<EmailDispatchPayload>): Promise<void> {
  logger.log(`Processing job ${job.id} on queue ${QUEUE_NAMES.EMAIL_DISPATCH}`);
  // M3: implement via EmailService
  throw new Error('Not implemented — M3');
}
