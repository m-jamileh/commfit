import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EmailService } from './email.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MockEmailProvider extends EmailService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async send(input: {
    to: string;
    subject: string;
    body: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ messageId: string }> {
    const messageId = `mock_email_${randomUUID()}`;

    await this.prisma.emailInbox.create({
      data: {
        toEmail: input.to,
        subject: input.subject,
        body: input.body,
        sentAt: new Date(),
        metadata: (input.metadata ?? {}) as unknown as import('@commfit/db').Prisma.InputJsonValue,
      },
    });

    return { messageId };
  }
}
