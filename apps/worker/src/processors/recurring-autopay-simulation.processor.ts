import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RecurringAutopaySimulationPayload, QUEUE_NAMES } from '../queues';

const logger = new Logger('RecurringAutopaySimulationProcessor');

export async function processRecurringAutopaySimulation(
  job: Job<RecurringAutopaySimulationPayload>,
): Promise<void> {
  logger.log(
    `Processing job ${job.id} on queue ${QUEUE_NAMES.RECURRING_AUTOPAY_SIMULATION}`,
  );
  logger.debug(
    `Contract: ${job.data.contractId}, PaymentMethod: ${job.data.paymentMethodId}, Amount: ${job.data.amountCents} cents`,
  );
  // M3: implement via PaymentService.charge() with idempotency key
  throw new Error('Not implemented — M3');
}
