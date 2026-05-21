import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../services/email/email.service';
import type { Notification } from '@commfit/db';

const TEMPLATES: Record<
  string,
  { subject: string; body: (data: Record<string, unknown>) => string }
> = {
  job_assigned: {
    subject: 'Job Assigned',
    body: (d) => `You have been assigned job #${d['jobId']}.`,
  },
  job_completed: {
    subject: 'Job Completed',
    body: (d) => `Job #${d['jobId']} has been completed.`,
  },
  job_cancelled: {
    subject: 'Job Cancelled',
    body: (d) => `Job #${d['jobId']} has been cancelled.`,
  },
  quote_sent: {
    subject: 'Quote Sent',
    body: (d) => `A quote has been sent to you. Title: ${d['title']}`,
  },
  quote_signed: {
    subject: 'Quote Signed',
    body: (d) => `Quote ${d['title']} has been signed.`,
  },
  contract_sent: {
    subject: 'Contract Sent',
    body: (d) => `Your contract "${d['title']}" has been sent for signature.`,
  },
  contract_signed: {
    subject: 'Contract Signed',
    body: (d) => `Contract "${d['title']}" has been signed.`,
  },
  invoice_sent: {
    subject: 'Invoice Sent',
    body: (d) =>
      `Invoice ${d['invoiceNumber']} has been sent. Total: $${Number(d['totalCents']) / 100}`,
  },
  invoice_overdue: {
    subject: 'Invoice Overdue',
    body: (d) => `Invoice ${d['invoiceNumber']} is overdue.`,
  },
  payment_succeeded: {
    subject: 'Payment Received',
    body: (d) => `Payment of $${Number(d['amountCents']) / 100} received.`,
  },
  payment_failed: {
    subject: 'Payment Failed',
    body: (d) =>
      `Payment of $${Number(d['amountCents']) / 100} failed. Reason: ${d['failureReason']}`,
  },
  sr_submitted: {
    subject: 'Service Request Submitted',
    body: (d) => `Service request #${d['jobId']} has been submitted.`,
  },
  pm_reminder: {
    subject: 'PM Reminder',
    body: (d) =>
      `Upcoming preventive maintenance scheduled for ${d['scheduledAt']}.`,
  },
  commission_paid: {
    subject: 'Commission Paid',
    body: (d) =>
      `Commission of $${Number(d['commissionCents']) / 100} has been paid.`,
  },
  welcome: {
    subject: 'Welcome to Comm-Fit',
    body: (d) => `Welcome, ${d['name']}! Your account is ready.`,
  },
  pm_scheduled: {
    subject: 'PM Scheduled at {location}',
    body: (d) =>
      `Your preventive maintenance job has been scheduled for ${d['scheduledAt']}.`,
  },
  pm_completed: {
    subject: 'PM Completed',
    body: (d) => `Preventive maintenance job #${d['jobId']} has been completed.`,
  },
  sr_received: {
    subject: 'Service Request Received',
    body: (d) =>
      `We have received your service request. Reference: #${d['jobId']}.`,
  },
  sr_assigned: {
    subject: 'Service Request Assigned',
    body: (d) =>
      `Service request #${d['jobId']} has been assigned to a technician.`,
  },
  sr_completed: {
    subject: 'Service Request Completed',
    body: (d) => `Service request #${d['jobId']} has been completed.`,
  },
  payment_received: {
    subject: 'Payment Received',
    body: (d) =>
      `We have received your payment of $${Number(d['amountCents']) / 100}. Thank you!`,
  },
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async notify(input: {
    userId: string;
    templateKey: string;
    data: Record<string, unknown>;
    channels?: string[];
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) {
      throw new NotFoundException(`User ${input.userId} not found`);
    }

    // Create notification record as pending
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        templateKey: input.templateKey,
        channel: 'email',
        status: 'pending',
        payload: input.data as object,
        metadata: {} as object,
      },
    });

    // Render template
    const template = TEMPLATES[input.templateKey] ?? {
      subject: `Notification: ${input.templateKey}`,
      body: () => JSON.stringify(input.data),
    };
    const subject = template.subject;
    const body = template.body(input.data);

    try {
      await this.emailService.send({
        to: user.email,
        subject,
        body,
        metadata: {
          templateKey: input.templateKey,
          userId: input.userId,
          notificationId: notification.id,
        },
      });

      const updated = await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'delivered' },
      });
      return this.mapToDto(updated);
    } catch (err) {
      const updated = await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        },
      });
      return this.mapToDto(updated);
    }
  }

  async send(params: {
    userId?: string;
    templateKey: string;
    channel: 'email' | 'sms';
    to: string;
    payload: Record<string, unknown>;
  }): Promise<{ id: string; status: string }> {
    const { userId, templateKey, channel, to, payload } = params;

    if (!TEMPLATES[templateKey]) {
      throw new BadRequestException(`Unknown template key: ${templateKey}`);
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: userId ?? null,
        templateKey,
        channel,
        status: 'pending',
        payload: payload as object,
        metadata: {} as object,
      },
    });

    const { subject, body } = this.renderTemplate(templateKey, payload);

    try {
      await this.emailService.send({
        to,
        subject,
        body,
        metadata: { notificationId: notification.id, templateKey },
      });

      const updated = await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'delivered' },
      });
      return { id: updated.id, status: updated.status };
    } catch (err) {
      const updated = await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        },
      });
      return { id: updated.id, status: updated.status };
    }
  }

  private renderTemplate(
    key: string,
    payload: Record<string, unknown>,
  ): { subject: string; body: string } {
    const template = TEMPLATES[key];
    if (!template) {
      return {
        subject: `Notification: ${key}`,
        body: JSON.stringify(payload),
      };
    }
    return { subject: template.subject, body: template.body(payload) };
  }

  async findAll(query: {
    userId?: string;
    templateKey?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { userId, templateKey, status, limit = 50, cursor } = query;
    const notifications = await this.prisma.notification.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(templateKey ? { templateKey } : {}),
        ...(status
          ? { status: status as Notification['status'] }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return notifications.map((n) => this.mapToDto(n));
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    return this.mapToDto(notification);
  }

  async listEmailInbox(query: {
    toEmail?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { toEmail, limit = 50, cursor } = query;
    return this.prisma.emailInbox.findMany({
      where: {
        ...(toEmail ? { toEmail } : {}),
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  private mapToDto(notification: Notification) {
    return {
      id: notification.id,
      userId: notification.userId ?? undefined,
      templateKey: notification.templateKey,
      channel: notification.channel,
      status: notification.status,
      payload: notification.payload as Record<string, unknown>,
      error: notification.error ?? undefined,
      metadata: notification.metadata as Record<string, unknown>,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
