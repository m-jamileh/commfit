import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('commission-recompute') private readonly commissionQueue: Queue,
  ) {}

  private validateSignature(
    payload: string,
    signature: string,
    secret = process.env['WEBHOOK_SECRET'] ?? 'mock-secret',
  ): boolean {
    const hmac = createHmac('sha256', secret).update(payload).digest('hex');
    if (signature.length !== hmac.length) return false;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  }

  async handleESignEvent(
    payload: {
      envelopeId: string;
      event: string;
      signedAt?: string;
      signerName?: string;
    },
    signature: string,
    rawBody: string,
  ): Promise<{ ok: boolean }> {
    if (!this.validateSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid esign signature');
    }

    if (payload.event !== 'envelope.completed') {
      return { ok: true };
    }

    const signedAt = payload.signedAt ? new Date(payload.signedAt) : new Date();

    const envelope = await this.prisma.esignEnvelope.findFirst({
      where: { envelopeRef: payload.envelopeId },
    });

    if (!envelope) {
      return { ok: true };
    }

    await this.prisma.esignEnvelope.update({
      where: { id: envelope.id },
      data: { status: 'signed', signedAt },
    });

    const docType = envelope.documentType;
    const docId = envelope.documentId;

    if (docType === 'contract') {
      await this.prisma.contract.updateMany({
        where: { id: docId },
        data: { status: 'signed', signedAt },
      });
    } else if (docType === 'job_signoff') {
      await this.prisma.jobSignoff.updateMany({
        where: { id: docId },
        data: { status: 'signed', signedAt },
      });
    } else if (docType === 'quote') {
      await this.prisma.quote.updateMany({
        where: { id: docId },
        data: { status: 'signed', signedAt },
      });
    }

    return { ok: true };
  }

  async handlePaymentEvent(
    payload: {
      paymentId: string;
      event: string;
      status: string;
      failureReason?: string;
    },
    signature: string,
    rawBody: string,
  ): Promise<{ ok: boolean }> {
    if (!this.validateSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid payment signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: payload.paymentId },
    });

    if (!payment) {
      return { ok: true };
    }

    if (payload.event === 'payment.succeeded') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'succeeded' },
        }),
        this.prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paidCents: { increment: payment.amountCents },
          },
        }),
      ]);
    } else if (payload.event === 'payment.failed') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          failureReason: payload.failureReason ?? null,
        },
      });
    }

    return { ok: true };
  }
}
