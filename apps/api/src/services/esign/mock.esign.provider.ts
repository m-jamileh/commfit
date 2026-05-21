import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ESignService } from './esign.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MockESignProvider extends ESignService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createEnvelope(input: {
    documentId: string;
    signerEmail: string;
    signerName: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ envelopeId: string; signingUrl: string }> {
    const envelopeId = `mock_env_${randomUUID()}`;
    const signingUrl = `http://localhost:3000/v1/mock-sign/${envelopeId}`;

    await this.prisma.esignEnvelope.create({
      data: {
        envelopeRef: envelopeId,
        documentType: 'document',
        documentId: input.documentId,
        signerEmail: input.signerEmail,
        signerName: input.signerName,
        signingUrl,
        status: 'sent',
        metadata: (input.metadata ?? {}) as unknown as import('@commfit/db').Prisma.InputJsonValue,
      },
    });

    return { envelopeId, signingUrl };
  }

  async getStatus(envelopeId: string): Promise<{
    status: 'sent' | 'partially_signed' | 'signed' | 'expired';
    signedAt?: Date;
    signerName?: string;
  }> {
    const envelope = await this.prisma.esignEnvelope.findFirst({
      where: { envelopeRef: envelopeId },
    });

    if (!envelope) {
      return { status: 'expired' };
    }

    return {
      status: envelope.status as 'sent' | 'partially_signed' | 'signed' | 'expired',
      signedAt: envelope.signedAt ?? undefined,
      signerName: envelope.signerName,
    };
  }
}
