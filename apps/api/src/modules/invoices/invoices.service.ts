import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceResponseDto,
  InvoiceLineItemResponseDto,
  CreateInvoiceLineItemDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { Invoice, InvoiceLineItem } from '@commfit/db';

type InvoiceWithLineItems = Invoice & { lineItems: InvoiceLineItem[] };

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('commission-recompute') private readonly commissionQueue: Queue,
  ) {}

  async findAll(query: {
    accountId?: string;
    status?: string;
    jobId?: string;
    contractId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<InvoiceResponseDto[]> {
    const { accountId, status, jobId, contractId, limit, cursor } = query;
    const invoices = await this.prisma.invoice.findMany({
      where: {
        ...(accountId ? { accountId } : {}),
        ...(status ? { status: status as Invoice['status'] } : {}),
        ...(jobId ? { jobId } : {}),
        ...(contractId ? { contractId } : {}),
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: limit ?? 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return invoices.map((inv) => this.mapToDto(inv));
  }

  async findOne(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return this.mapToDto(invoice);
  }

  async create(dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const lineItems = dto.lineItems ?? [];
    const taxCents = BigInt(dto.taxCents ?? 0);

    const subtotalCents = lineItems.reduce(
      (sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPriceCents),
      BigInt(0),
    );
    const totalCents = subtotalCents + taxCents;

    const invoiceNumber = dto.invoiceNumber ?? `INV-${Date.now()}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        accountId: dto.accountId,
        locationId: dto.locationId ?? null,
        jobId: dto.jobId ?? null,
        contractId: dto.contractId ?? null,
        invoiceNumber,
        dueDate: new Date(dto.dueDate),
        subtotalCents,
        taxCents,
        totalCents,
        paidCents: BigInt(0),
        warrantyClaim: dto.warrantyClaim ?? false,
        warrantySupplier: dto.warrantySupplier ?? null,
        warrantyAmountCents: dto.warrantyAmountCents ? BigInt(dto.warrantyAmountCents) : BigInt(0),
        notes: dto.notes ?? null,
        metadata: (dto.metadata ?? {}) as object,
        lineItems: {
          create: lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: BigInt(item.unitPriceCents),
            totalCents: BigInt(item.quantity) * BigInt(item.unitPriceCents),
            jobEquipmentId: item.jobEquipmentId ?? null,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    return this.mapToDto(invoice);
  }

  async generateFromJob(jobId: string): Promise<InvoiceResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        jobEquipment: {
          include: { equipment: true },
        },
        jobParts: {
          include: { part: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    const equipmentLineItems = job.jobEquipment.map((je, index) => ({
      description: je.equipment.model
        ? `${je.equipment.model} (${je.equipment.equipmentClass})`
        : `${je.equipment.equipmentClass} equipment`,
      quantity: 1,
      unitPriceCents: BigInt(0),
      totalCents: BigInt(0),
      jobEquipmentId: je.id,
      sortOrder: index,
    }));

    const partLineItems = job.jobParts.map((jp, index) => ({
      description: jp.part?.name ?? `Part ${jp.partId}`,
      quantity: jp.quantity,
      unitPriceCents: jp.unitCostCents,
      totalCents: jp.unitCostCents * BigInt(jp.quantity),
      jobEquipmentId: null,
      sortOrder: equipmentLineItems.length + index,
    }));

    const allLineItems = [...equipmentLineItems, ...partLineItems];
    const subtotalCents = allLineItems.reduce((sum, item) => sum + item.totalCents, BigInt(0));
    const taxCents = BigInt(0);
    const totalCents = subtotalCents + taxCents;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await this.prisma.invoice.create({
      data: {
        accountId: job.accountId,
        locationId: job.locationId,
        jobId: job.id,
        invoiceNumber: `INV-${Date.now()}`,
        dueDate,
        subtotalCents,
        taxCents,
        totalCents,
        paidCents: BigInt(0),
        warrantyClaim: job.warrantyClaim,
        warrantySupplier: job.warrantySupplier ?? null,
        warrantyAmountCents: BigInt(0),
        metadata: {},
        lineItems: {
          create: allLineItems,
        },
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    return this.mapToDto(invoice);
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    await this.findOne(id);
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(dto.taxCents !== undefined && { taxCents: BigInt(dto.taxCents) }),
        ...(dto.warrantyClaim !== undefined && { warrantyClaim: dto.warrantyClaim }),
        ...(dto.warrantySupplier !== undefined && { warrantySupplier: dto.warrantySupplier }),
        ...(dto.warrantyAmountCents !== undefined && {
          warrantyAmountCents: BigInt(dto.warrantyAmountCents),
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    if (dto.status === 'paid') {
      await this.commissionQueue.add('recompute', { invoiceId: id });
    }

    return this.mapToDto(invoice);
  }

  async send(id: string): Promise<InvoiceResponseDto> {
    await this.findOne(id);
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'sent' },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(invoice);
  }

  async void_(id: string): Promise<InvoiceResponseDto> {
    await this.findOne(id);
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'void' },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(invoice);
  }

  async recordPayment(
    id: string,
    data: { amountCents: number; paymentId: string },
  ): Promise<InvoiceResponseDto> {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!existing) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    const newPaidCents = existing.paidCents + BigInt(data.amountCents);
    const isPaid = newPaidCents >= existing.totalCents;
    const newStatus = isPaid ? 'paid' : 'partially_paid';

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        paidCents: newPaidCents,
        status: newStatus,
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    if (isPaid) {
      await this.commissionQueue.add('recompute', { invoiceId: id, paymentId: data.paymentId });
    }

    return this.mapToDto(invoice);
  }

  async addLineItem(invoiceId: string, dto: CreateInvoiceLineItemDto): Promise<InvoiceResponseDto> {
    const existing = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lineItems: true },
    });
    if (!existing) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const sortOrder = dto.sortOrder ?? existing.lineItems.length;
    await this.prisma.invoiceLineItem.create({
      data: {
        invoiceId,
        description: dto.description,
        quantity: dto.quantity,
        unitPriceCents: BigInt(dto.unitPriceCents),
        totalCents: BigInt(dto.quantity) * BigInt(dto.unitPriceCents),
        jobEquipmentId: dto.jobEquipmentId ?? null,
        sortOrder,
      },
    });

    return this.recalculate(invoiceId);
  }

  private async recalculate(invoiceId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lineItems: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const subtotalCents = invoice.lineItems.reduce(
      (sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPriceCents),
      BigInt(0),
    );
    const totalCents = subtotalCents + invoice.taxCents;

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { subtotalCents, totalCents },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(updated);
  }

  private mapLineItemToDto(item: InvoiceLineItem): InvoiceLineItemResponseDto {
    return {
      id: item.id,
      invoiceId: item.invoiceId,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: Number(item.unitPriceCents),
      totalCents: Number(item.totalCents),
      jobEquipmentId: item.jobEquipmentId ?? undefined,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
    };
  }

  private mapToDto(invoice: InvoiceWithLineItems): InvoiceResponseDto {
    return {
      id: invoice.id,
      accountId: invoice.accountId,
      locationId: invoice.locationId ?? undefined,
      jobId: invoice.jobId ?? undefined,
      contractId: invoice.contractId ?? undefined,
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      subtotalCents: Number(invoice.subtotalCents),
      taxCents: Number(invoice.taxCents),
      totalCents: Number(invoice.totalCents),
      paidCents: Number(invoice.paidCents),
      stripeInvoiceId: invoice.stripeInvoiceId ?? undefined,
      warrantyClaim: invoice.warrantyClaim,
      warrantySupplier: invoice.warrantySupplier ?? undefined,
      warrantyAmountCents: Number(invoice.warrantyAmountCents),
      status: invoice.status as InvoiceResponseDto['status'],
      notes: invoice.notes ?? undefined,
      lineItems: invoice.lineItems.map((item) => this.mapLineItemToDto(item)),
      metadata: invoice.metadata as Record<string, unknown>,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
