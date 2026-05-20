import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class EmailService {
  abstract send(input: {
    to: string;
    subject: string;
    body: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ messageId: string }>;
}
