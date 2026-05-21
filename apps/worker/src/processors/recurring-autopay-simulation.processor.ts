import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { RecurringAutopaySimulationPayload, QUEUE_NAMES } from '../queues';

@Processor(QUEUE_NAMES.RECURRING_AUTOPAY_SIMULATION)
export class RecurringAutopaySimulationProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurringAutopaySimulationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<RecurringAutopaySimulationPayload>): Promise<void> {
    const { contractId, paymentMethodId, amountCents } = job.data;
    this.logger.log(
      `Processing recurring-autopay-simulation job ${job.id} for contract ${contractId}`,
    );

    // 1. Load contract, verify it's active and autoPay=true
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      this.logger.warn(`Contract ${contractId} not found — skipping autopay`);
      return;
    }

    if (contract.status !== 'signed') {
      this.logger.warn(
        `Contract ${contractId} is not signed (status=${contract.status}) — skipping autopay`,
      );
      return;
    }

    if (!contract.autoPay) {
      this.logger.warn(
        `Contract ${contractId} does not have autoPay enabled — skipping`,
      );
      return;
    }

    const now = Date.now();
    const invoiceNumber = `AUTO-${now}`;
    const idempotencyKey = `autopay-${contractId}-${now}`;
    const mockStripePaymentId = `mock_pay_${randomUUID()}`;

    // 2. Create Invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        accountId: contract.accountId,
        contractId,
        invoiceNumber,
        dueDate: new Date(),
        status: 'draft',
        totalCents: BigInt(amountCents),
        subtotalCents: BigInt(amountCents),
      },
    });

    this.logger.debug(`Created invoice ${invoice.id} (${invoiceNumber})`);

    // 3. Create Payment
    const payment = await this.prisma.payment.create({
      data: {
        accountId: contract.accountId,
        invoiceId: invoice.id,
        paymentMethodId,
        amountCents: BigInt(amountCents),
        currency: 'usd',
        idempotencyKey,
        status: 'succeeded',
        stripePaymentId: mockStripePaymentId,
      },
    });

    this.logger.debug(`Created payment ${payment.id} (${mockStripePaymentId})`);

    // 4. Update invoice paidCents, set status='paid'
    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidCents: BigInt(amountCents),
        status: 'paid',
      },
    });

    // 5. Create AuditLog entry for the autopay execution
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Invoice',
        entityId: invoice.id,
        action: 'autopay_executed',
        after: {
          invoiceId: invoice.id,
          invoiceNumber,
          contractId,
          paymentId: payment.id,
          amountCents,
          stripePaymentId: mockStripePaymentId,
          idempotencyKey,
          executedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(
      `Autopay complete for contract ${contractId}: invoice=${invoice.id} payment=${payment.id} amount=${amountCents} cents (job ${job.id})`,
    );
  }
}
