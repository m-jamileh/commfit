export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'void';

export class CreateInvoiceLineItemDto {
  description!: string;
  quantity!: number;
  unitPriceCents!: number;
  jobEquipmentId?: string;
  sortOrder?: number;
}

export class CreateInvoiceDto {
  accountId!: string;
  locationId?: string;
  jobId?: string;
  contractId?: string;
  invoiceNumber!: string;
  dueDate!: string;
  taxCents?: number;
  warrantyClaim?: boolean;
  warrantySupplier?: string;
  warrantyAmountCents?: number;
  lineItems?: CreateInvoiceLineItemDto[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

export class UpdateInvoiceDto {
  dueDate?: string;
  taxCents?: number;
  warrantyClaim?: boolean;
  warrantySupplier?: string;
  warrantyAmountCents?: number;
  status?: InvoiceStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export class InvoiceLineItemResponseDto {
  id!: string;
  invoiceId!: string;
  description!: string;
  quantity!: number;
  unitPriceCents!: number;
  totalCents!: number;
  jobEquipmentId?: string;
  sortOrder!: number;
  createdAt!: Date;
}

export class InvoiceResponseDto {
  id!: string;
  accountId!: string;
  locationId?: string;
  jobId?: string;
  contractId?: string;
  invoiceNumber!: string;
  dueDate!: string;
  subtotalCents!: number;
  taxCents!: number;
  totalCents!: number;
  paidCents!: number;
  stripeInvoiceId?: string;
  warrantyClaim!: boolean;
  warrantySupplier?: string;
  warrantyAmountCents!: number;
  status!: InvoiceStatus;
  notes?: string;
  lineItems!: InvoiceLineItemResponseDto[];
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
