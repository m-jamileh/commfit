import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ESignService {
  abstract createEnvelope(input: {
    documentId: string;
    signerEmail: string;
    signerName: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ envelopeId: string; signingUrl: string }>;

  abstract getStatus(envelopeId: string): Promise<{
    status: 'sent' | 'partially_signed' | 'signed' | 'expired';
    signedAt?: Date;
    signerName?: string;
  }>;
}
