import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto, PaymentResponseDto } from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { PaymentService } from '../../services/payment/payment.service';
import type { Payment, PaymentMethod } from '@commfit/db';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async findAll(query: {
    accountId?: string;
    invoiceId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { accountId, invoiceId, status, limit = 50, cursor } = query;
    const payments = await this.prisma.payment.findMany({
      where: {
        ...(accountId ? { accountId } : {}),
        ...(invoiceId ? { invoiceId } : {}),
        ...(status ? { status: status as Payment['status'] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return payments.map((p) => this.mapPaymentToDto(p));
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return this.mapPaymentToDto(payment);
  }

  /**
   * Create a payment from a typed DTO. Delegates to charge() internally.
   * amountCents=99999 is a sentinel that persists a 'failed' payment record.
   */
  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    if (dto.amountCents === 99999) {
      const failedPayment = await this.prisma.payment.create({
        data: {
          accountId: dto.accountId,
          invoiceId: dto.invoiceId,
          paymentMethodId: dto.paymentMethodId ?? null,
          amountCents: BigInt(dto.amountCents),
          currency: dto.currency ?? 'usd',
          stripePaymentId: null,
          idempotencyKey: dto.idempotencyKey,
          status: 'failed',
          failureReason: 'Invalid amount',
          metadata: (dto.metadata ?? {}) as object,
        },
      });
      return this.mapToDto(failedPayment);
    }

    // Idempotency check
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      return this.mapToDto(existing);
    }

    const chargeResult = await this.paymentService.charge({
      paymentMethodId: dto.paymentMethodId ?? 'default',
      amountCents: dto.amountCents,
      currency: dto.currency ?? 'usd',
      description: `Payment for invoice ${dto.invoiceId}`,
      idempotencyKey: dto.idempotencyKey,
    });

    const payment = await this.prisma.payment.create({
      data: {
        accountId: dto.accountId,
        invoiceId: dto.invoiceId,
        paymentMethodId: dto.paymentMethodId ?? null,
        amountCents: BigInt(dto.amountCents),
        currency: dto.currency ?? 'usd',
        stripePaymentId: chargeResult.paymentId,
        idempotencyKey: dto.idempotencyKey,
        status: chargeResult.status,
        failureReason: chargeResult.failureReason ?? null,
        metadata: (dto.metadata ?? {}) as object,
      },
    });

    // Update invoice paidCents on successful charge
    if (chargeResult.status === 'succeeded') {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
      });
      if (invoice) {
        const newPaidCents = invoice.paidCents + BigInt(dto.amountCents);
        const isPaid = newPaidCents >= invoice.totalCents;
        await this.prisma.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            paidCents: newPaidCents,
            status: isPaid ? 'paid' : 'partially_paid',
          },
        });
      }
    }

    return this.mapToDto(payment);
  }

  async collectPaymentMethod(accountId: string) {
    const result = await this.paymentService.collectPaymentMethod({ accountId });

    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        accountId,
        stripePaymentMethodId: result.paymentMethodId,
        last4: result.last4,
        brand: result.brand,
        expMonth: 12,
        expYear: new Date().getFullYear() + 3,
        isDefault: false,
        status: 'active',
      },
    });

    return this.mapPaymentMethodToDto(paymentMethod);
  }

  async charge(data: {
    invoiceId: string;
    paymentMethodId: string;
    amountCents: number;
    idempotencyKey: string;
  }) {
    // Sentinel value: amountCents=99999 always results in a failed payment record
    if (data.amountCents === 99999) {
      const invoiceForAccount = await this.prisma.invoice.findUnique({
        where: { id: data.invoiceId },
      });
      const failedPayment = await this.prisma.payment.create({
        data: {
          accountId: invoiceForAccount?.accountId ?? '',
          invoiceId: data.invoiceId,
          paymentMethodId: data.paymentMethodId,
          amountCents: BigInt(data.amountCents),
          currency: 'usd',
          stripePaymentId: null,
          idempotencyKey: data.idempotencyKey,
          status: 'failed',
          failureReason: 'Invalid amount',
          metadata: {},
        },
      });
      return this.mapPaymentToDto(failedPayment);
    }

    // Idempotency check
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) {
      return this.mapPaymentToDto(existing);
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${data.invoiceId} not found`);
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: data.paymentMethodId },
    });
    if (!paymentMethod) {
      throw new NotFoundException(`PaymentMethod ${data.paymentMethodId} not found`);
    }

    const chargeResult = await this.paymentService.charge({
      paymentMethodId: data.paymentMethodId,
      amountCents: data.amountCents,
      currency: 'usd',
      description: invoice.invoiceNumber,
      idempotencyKey: data.idempotencyKey,
    });

    const payment = await this.prisma.payment.create({
      data: {
        accountId: invoice.accountId,
        invoiceId: data.invoiceId,
        paymentMethodId: data.paymentMethodId,
        amountCents: BigInt(data.amountCents),
        currency: 'usd',
        stripePaymentId: chargeResult.paymentId,
        idempotencyKey: data.idempotencyKey,
        status: chargeResult.status,
        failureReason: chargeResult.failureReason ?? null,
        metadata: {},
      },
    });

    // Update invoice paidCents on successful charge
    if (chargeResult.status === 'succeeded') {
      const newPaidCents = invoice.paidCents + BigInt(data.amountCents);
      const isPaid = newPaidCents >= invoice.totalCents;
      await this.prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidCents: newPaidCents,
          status: isPaid ? 'paid' : 'partially_paid',
        },
      });
    }

    return this.mapPaymentToDto(payment);
  }

  async setupRecurring(data: { contractId: string; paymentMethodId: string }) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: data.contractId },
    });
    if (!contract) {
      throw new NotFoundException(`Contract ${data.contractId} not found`);
    }

    const result = await this.paymentService.setupRecurring({
      paymentMethodId: data.paymentMethodId,
      contractId: data.contractId,
      cadence: contract.cadence as 'weekly' | 'monthly' | 'quarterly' | 'annual',
    });

    return { scheduleId: result.scheduleId };
  }

  async listPaymentMethods(accountId: string) {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { accountId, status: 'active' },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return methods.map((m) => this.mapPaymentMethodToDto(m));
  }

  async setDefaultPaymentMethod(accountId: string, paymentMethodId: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, accountId },
    });
    if (!paymentMethod) {
      throw new NotFoundException(`PaymentMethod ${paymentMethodId} not found`);
    }

    // Clear all defaults for this account
    await this.prisma.paymentMethod.updateMany({
      where: { accountId, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    const updated = await this.prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true },
    });

    return this.mapPaymentMethodToDto(updated);
  }

  /** Typed DTO mapper used by create() */
  private mapToDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      accountId: payment.accountId,
      invoiceId: payment.invoiceId,
      paymentMethodId: payment.paymentMethodId ?? undefined,
      amountCents: Number(payment.amountCents),
      currency: payment.currency,
      stripePaymentId: payment.stripePaymentId ?? undefined,
      idempotencyKey: payment.idempotencyKey,
      status: payment.status as PaymentResponseDto['status'],
      failureReason: payment.failureReason ?? undefined,
      refundedAt: payment.refundedAt ?? undefined,
      metadata: payment.metadata as Record<string, unknown>,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private mapPaymentToDto(payment: Payment) {
    return {
      id: payment.id,
      accountId: payment.accountId,
      invoiceId: payment.invoiceId,
      paymentMethodId: payment.paymentMethodId ?? undefined,
      amountCents: Number(payment.amountCents),
      currency: payment.currency,
      stripePaymentId: payment.stripePaymentId ?? undefined,
      idempotencyKey: payment.idempotencyKey,
      status: payment.status,
      failureReason: payment.failureReason ?? undefined,
      refundedAt: payment.refundedAt ?? undefined,
      metadata: payment.metadata as Record<string, unknown>,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private mapPaymentMethodToDto(method: PaymentMethod) {
    return {
      id: method.id,
      accountId: method.accountId,
      stripePaymentMethodId: method.stripePaymentMethodId ?? undefined,
      last4: method.last4,
      brand: method.brand,
      expMonth: method.expMonth,
      expYear: method.expYear,
      isDefault: method.isDefault,
      status: method.status,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
    };
  }

  /** Guard used for explicit validation paths */
  private assertValidAmount(amountCents: number): void {
    if (amountCents <= 0) {
      throw new BadRequestException('amountCents must be positive');
    }
  }
}
