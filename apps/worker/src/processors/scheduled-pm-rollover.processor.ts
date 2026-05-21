import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { ScheduledPmRolloverPayload, QUEUE_NAMES } from '../queues';

@Processor(QUEUE_NAMES.SCHEDULED_PM_ROLLOVER)
export class ScheduledPmRolloverProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledPmRolloverProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ScheduledPmRolloverPayload>): Promise<void> {
    const { contractId, periodStart } = job.data;
    this.logger.log(
      `Processing scheduled-pm-rollover job ${job.id} for contract ${contractId} period ${periodStart}`,
    );

    // 1. Load contract + properties
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        properties: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!contract) {
      this.logger.warn(`Contract ${contractId} not found — skipping rollover`);
      return;
    }

    if (contract.status !== 'signed') {
      this.logger.warn(
        `Contract ${contractId} is not active (status=${contract.status}) — skipping rollover`,
      );
      return;
    }

    const periodStartDate = new Date(periodStart);
    // Schedule PM jobs 30 days after the period start
    const scheduledAt = new Date(periodStartDate.getTime() + 30 * 86400000);

    let createdCount = 0;

    for (const prop of contract.properties) {
      // 2. Check if a PM job is already scheduled for this location in the upcoming period
      const existing = await this.prisma.job.findFirst({
        where: {
          accountId: contract.accountId,
          locationId: prop.locationId,
          jobType: 'pm',
          status: 'scheduled',
          scheduledAt: {
            gte: periodStartDate,
            lt: new Date(periodStartDate.getTime() + 60 * 86400000),
          },
        },
      });

      if (existing) {
        this.logger.debug(
          `PM job already scheduled for location ${prop.locationId} in period ${periodStart} — skipping`,
        );
        continue;
      }

      // 3. Create a new PM job
      await this.prisma.job.create({
        data: {
          accountId: contract.accountId,
          locationId: prop.locationId,
          jobType: 'pm',
          status: 'scheduled',
          scheduledAt,
          priority: 'normal',
          notes: 'Auto-created from contract rollover',
        },
      });

      createdCount++;
      this.logger.log(
        `Created PM job for location ${prop.locationId} scheduled at ${scheduledAt.toISOString()}`,
      );
    }

    // 4. Update contract metadata to record last rollover timestamp
    const existingMetadata =
      typeof contract.metadata === 'object' && contract.metadata !== null
        ? (contract.metadata as Record<string, unknown>)
        : {};

    await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        metadata: {
          ...existingMetadata,
          lastRolloverAt: new Date().toISOString(),
          lastRolloverPeriodStart: periodStart,
          lastRolloverJobsCreated: createdCount,
        },
      },
    });

    this.logger.log(
      `PM rollover complete for contract ${contractId}: ${createdCount} job(s) created (job ${job.id})`,
    );
  }
}
