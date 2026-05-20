export type QuoteJobType = 'pm' | 'sr' | 'disinfecting' | 'install';
export type QuoteStatus = 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';

export class CreateQuoteLineItemDto {
  description!: string;
  quantity!: number;
  unitPriceCents!: number;
  sortOrder?: number;
}

export class CreateQuoteDto {
  accountId!: string;
  locationId!: string;
  jobType!: QuoteJobType;
  title!: string;
  notes?: string;
  validUntil?: string;
  discountPct?: number;
  taxPct?: number;
  lineItems?: CreateQuoteLineItemDto[];
  metadata?: Record<string, unknown>;
}

export class UpdateQuoteDto {
  title?: string;
  notes?: string;
  validUntil?: string;
  discountPct?: number;
  taxPct?: number;
  status?: QuoteStatus;
  metadata?: Record<string, unknown>;
}

export class QuoteLineItemResponseDto {
  id!: string;
  quoteId!: string;
  description!: string;
  quantity!: number;
  unitPriceCents!: number;
  totalCents!: number;
  sortOrder!: number;
  createdAt!: Date;
}

export class QuoteResponseDto {
  id!: string;
  accountId!: string;
  locationId!: string;
  createdByUserId?: string;
  jobType!: QuoteJobType;
  title!: string;
  notes?: string;
  validUntil?: string;
  discountPct!: number;
  taxPct!: number;
  subtotalCents!: number;
  totalCents!: number;
  docusignEnvelopeId?: string;
  signedAt?: Date;
  status!: QuoteStatus;
  lineItems!: QuoteLineItemResponseDto[];
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
