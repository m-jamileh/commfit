import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { EmailDispatchPayload, QUEUE_NAMES } from '../queues';

@Processor(QUEUE_NAMES.EMAIL_DISPATCH)
export class EmailDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailDispatchProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<EmailDispatchPayload>): Promise<void> {
    this.logger.log(`Processing email-dispatch job ${job.id}`);
    const { to, subject, body, metadata } = job.data;

    await this.prisma.emailInbox.create({
      data: {
        toEmail: to,
        subject,
        body,
        sentAt: new Date(),
        metadata: (metadata as object) ?? {},
      },
    });

    this.logger.log(`Email dispatched to ${to} (job ${job.id})`);
  }
}
