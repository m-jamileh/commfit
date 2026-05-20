import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteResponseDto,
  QuoteLineItemResponseDto,
  CreateQuoteLineItemDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { Quote, QuoteLineItem } from '@commfit/db';

type QuoteWithLineItems = Quote & { lineItems: QuoteLineItem[] };

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    accountId?: string;
    locationId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }): Promise<QuoteResponseDto[]> {
    const { accountId, locationId, status, limit, cursor } = query;
    const quotes = await this.prisma.quote.findMany({
      where: {
        ...(accountId ? { accountId } : {}),
        ...(locationId ? { locationId } : {}),
        ...(status ? { status: status as Quote['status'] } : {}),
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: limit ?? 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return quotes.map((q) => this.mapToDto(q));
  }

  async findOne(id: string): Promise<QuoteResponseDto> {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!quote) {
      throw new NotFoundException(`Quote ${id} not found`);
    }
    return this.mapToDto(quote);
  }

  async create(dto: CreateQuoteDto): Promise<QuoteResponseDto> {
    const lineItems = dto.lineItems ?? [];
    const discountPct = dto.discountPct ?? 0;
    const taxPct = dto.taxPct ?? 0;

    const subtotalCents = lineItems.reduce(
      (sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPriceCents),
      BigInt(0),
    );

    const discountAmount = BigInt(Math.round(Number(subtotalCents) * discountPct / 100));
    const taxAmount = BigInt(Math.round(Number(subtotalCents - discountAmount) * taxPct / 100));
    const totalCents = subtotalCents - discountAmount + taxAmount;

    const quote = await this.prisma.quote.create({
      data: {
        accountId: dto.accountId,
        locationId: dto.locationId,
        jobType: dto.jobType,
        title: dto.title,
        notes: dto.notes ?? null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        discountPct,
        taxPct,
        subtotalCents,
        totalCents,
        metadata: (dto.metadata ?? {}) as object,
        lineItems: {
          create: lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: BigInt(item.unitPriceCents),
            totalCents: BigInt(item.quantity) * BigInt(item.unitPriceCents),
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    return this.mapToDto(quote);
  }

  async update(id: string, dto: UpdateQuoteDto): Promise<QuoteResponseDto> {
    await this.findOne(id);
    const quote = await this.prisma.quote.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.validUntil !== undefined && {
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        }),
        ...(dto.discountPct !== undefined && { discountPct: dto.discountPct }),
        ...(dto.taxPct !== undefined && { taxPct: dto.taxPct }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    // Recompute totals after update if discount/tax changed
    if (dto.discountPct !== undefined || dto.taxPct !== undefined) {
      const currentDiscount = Number(quote.discountPct);
      const currentTax = Number(quote.taxPct);
      const subtotal = Number(quote.subtotalCents);
      const discountAmt = Math.round(subtotal * currentDiscount / 100);
      const taxAmt = Math.round((subtotal - discountAmt) * currentTax / 100);
      const newTotal = BigInt(subtotal - discountAmt + taxAmt);
      const recomputed = await this.prisma.quote.update({
        where: { id },
        data: { totalCents: newTotal },
        include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
      });
      return this.mapToDto(recomputed);
    }

    return this.mapToDto(quote);
  }

  async addLineItem(quoteId: string, dto: CreateQuoteLineItemDto): Promise<QuoteResponseDto> {
    const existing = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { lineItems: true },
    });
    if (!existing) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    const sortOrder = dto.sortOrder ?? existing.lineItems.length;
    await this.prisma.quoteLineItem.create({
      data: {
        quoteId,
        description: dto.description,
        quantity: dto.quantity,
        unitPriceCents: BigInt(dto.unitPriceCents),
        totalCents: BigInt(dto.quantity) * BigInt(dto.unitPriceCents),
        sortOrder,
      },
    });

    return this.recalculate(quoteId);
  }

  async removeLineItem(lineItemId: string): Promise<QuoteResponseDto> {
    const lineItem = await this.prisma.quoteLineItem.findUnique({ where: { id: lineItemId } });
    if (!lineItem) {
      throw new NotFoundException(`Line item ${lineItemId} not found`);
    }
    await this.prisma.quoteLineItem.delete({ where: { id: lineItemId } });
    return this.recalculate(lineItem.quoteId);
  }

  async send(id: string): Promise<QuoteResponseDto> {
    const existing = await this.prisma.quote.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Quote ${id} not found`);
    }
    if (existing.status !== 'draft') {
      throw new BadRequestException(`Quote ${id} is not in draft status`);
    }
    const quote = await this.prisma.quote.update({
      where: { id },
      data: { status: 'sent' },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(quote);
  }

  async expire(id: string): Promise<QuoteResponseDto> {
    const existing = await this.prisma.quote.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Quote ${id} not found`);
    }
    if (existing.status !== 'sent') {
      throw new BadRequestException(`Quote ${id} is not in sent status`);
    }
    const quote = await this.prisma.quote.update({
      where: { id },
      data: { status: 'expired' },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(quote);
  }

  async cancel(id: string): Promise<QuoteResponseDto> {
    const existing = await this.prisma.quote.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Quote ${id} not found`);
    }
    const quote = await this.prisma.quote.update({
      where: { id },
      data: { status: 'cancelled' },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(quote);
  }

  private async recalculate(quoteId: string): Promise<QuoteResponseDto> {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { lineItems: true },
    });
    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    const subtotalCents = quote.lineItems.reduce(
      (sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPriceCents),
      BigInt(0),
    );
    const discountPct = Number(quote.discountPct);
    const taxPct = Number(quote.taxPct);
    const discountAmt = BigInt(Math.round(Number(subtotalCents) * discountPct / 100));
    const taxAmt = BigInt(Math.round(Number(subtotalCents - discountAmt) * taxPct / 100));
    const totalCents = subtotalCents - discountAmt + taxAmt;

    const updated = await this.prisma.quote.update({
      where: { id: quoteId },
      data: { subtotalCents, totalCents },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapToDto(updated);
  }

  private mapLineItemToDto(item: QuoteLineItem): QuoteLineItemResponseDto {
    return {
      id: item.id,
      quoteId: item.quoteId,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: Number(item.unitPriceCents),
      totalCents: Number(item.totalCents),
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
    };
  }

  private mapToDto(quote: QuoteWithLineItems): QuoteResponseDto {
    return {
      id: quote.id,
      accountId: quote.accountId,
      locationId: quote.locationId,
      createdByUserId: quote.createdByUserId ?? undefined,
      jobType: quote.jobType as QuoteResponseDto['jobType'],
      title: quote.title,
      notes: quote.notes ?? undefined,
      validUntil: quote.validUntil ? quote.validUntil.toISOString().split('T')[0] : undefined,
      discountPct: Number(quote.discountPct),
      taxPct: Number(quote.taxPct),
      subtotalCents: Number(quote.subtotalCents),
      totalCents: Number(quote.totalCents),
      docusignEnvelopeId: quote.docusignEnvelopeId ?? undefined,
      signedAt: quote.signedAt ?? undefined,
      status: quote.status as QuoteResponseDto['status'],
      lineItems: quote.lineItems.map((item) => this.mapLineItemToDto(item)),
      metadata: quote.metadata as Record<string, unknown>,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };
  }
}
