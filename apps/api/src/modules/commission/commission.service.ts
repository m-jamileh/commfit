import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
  CommissionRuleResponseDto,
  CommissionEarningResponseDto,
} from '@commfit/shared-types';
import { CommissionEngineService } from './commission-engine.service';
import type { CommissionRule, CommissionEarning } from '@commfit/db';

@Injectable()
export class CommissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionEngineService: CommissionEngineService,
  ) {}

  // ---------------------------------------------------------------------------
  // Rule management
  // ---------------------------------------------------------------------------

  /** All active rules ordered by priority desc (highest priority number first). */
  async findAllRules(): Promise<CommissionRuleResponseDto[]> {
    const rules = await this.prisma.commissionRule.findMany({
      where: { active: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
    return rules.map((r) => this.mapRuleToDto(r));
  }

  /** Controller alias for GET /commission/rules */
  async listRules() {
    return this.findAllRules();
  }

  /** Paginated rules query used by the controller */
  async findRules(query: { active?: boolean; limit?: number; cursor?: string }) {
    const { active, limit = 50, cursor } = query;
    const rules = await this.prisma.commissionRule.findMany({
      where: {
        ...(active !== undefined ? { active } : {}),
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return rules.map((r) => this.mapRuleToDto(r));
  }

  async findOneRule(id: string): Promise<CommissionRuleResponseDto> {
    const rule = await this.prisma.commissionRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`CommissionRule ${id} not found`);
    }
    return this.mapRuleToDto(rule);
  }

  async createRule(dto: CreateCommissionRuleDto): Promise<CommissionRuleResponseDto> {
    const rule = await this.prisma.commissionRule.create({
      data: {
        name: dto.name,
        description: dto.description,
        techTypeFilter: dto.techTypeFilter as never,
        jobTypeFilter: dto.jobTypeFilter as never,
        equipmentClassFilter: dto.equipmentClassFilter as never,
        technicianIdFilter: dto.technicianIdFilter,
        ratePct: dto.ratePct,
        bonusThresholdJobs: dto.bonusThresholdJobs,
        bonusRatePct: dto.bonusRatePct,
        priority: dto.priority ?? 0,
        active: dto.active ?? true,
        metadata: (dto.metadata as object) ?? {},
      },
    });
    return this.mapRuleToDto(rule);
  }

  async updateRule(
    id: string,
    dto: UpdateCommissionRuleDto,
  ): Promise<CommissionRuleResponseDto> {
    await this.findOneRule(id);
    const rule = await this.prisma.commissionRule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.techTypeFilter !== undefined && {
          techTypeFilter: dto.techTypeFilter as never,
        }),
        ...(dto.jobTypeFilter !== undefined && {
          jobTypeFilter: dto.jobTypeFilter as never,
        }),
        ...(dto.equipmentClassFilter !== undefined && {
          equipmentClassFilter: dto.equipmentClassFilter as never,
        }),
        ...(dto.technicianIdFilter !== undefined && {
          technicianIdFilter: dto.technicianIdFilter,
        }),
        ...(dto.ratePct !== undefined && { ratePct: dto.ratePct }),
        ...(dto.bonusThresholdJobs !== undefined && {
          bonusThresholdJobs: dto.bonusThresholdJobs,
        }),
        ...(dto.bonusRatePct !== undefined && {
          bonusRatePct: dto.bonusRatePct,
        }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
    });
    return this.mapRuleToDto(rule);
  }

  /** Soft-delete: sets active=false */
  async deleteRule(id: string): Promise<void> {
    await this.findOneRule(id);
    await this.prisma.commissionRule.update({
      where: { id },
      data: { active: false },
    });
  }

  // ---------------------------------------------------------------------------
  // Earnings queries
  // ---------------------------------------------------------------------------

  async findEarningsByInvoice(invoiceId: string): Promise<CommissionEarningResponseDto[]> {
    const earnings = await this.prisma.commissionEarning.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
    return earnings.map((e) => this.mapEarningToDto(e));
  }

  async findEarningsByTechnician(
    technicianId: string,
    status?: string,
  ): Promise<CommissionEarningResponseDto[]> {
    const earnings = await this.prisma.commissionEarning.findMany({
      where: {
        technicianId,
        ...(status ? { status: status as CommissionEarning['status'] } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return earnings.map((e) => this.mapEarningToDto(e));
  }

  /** Controller alias for GET /commission/earnings */
  async listEarnings(technicianId?: string, invoiceId?: string) {
    const earnings = await this.prisma.commissionEarning.findMany({
      where: {
        ...(technicianId && { technicianId }),
        ...(invoiceId && { invoiceId }),
      },
      orderBy: { createdAt: 'desc' },
    });
    return earnings.map((e) => this.mapEarningToDto(e));
  }

  /** Paginated earnings query used by the controller */
  async findEarnings(query: {
    technicianId?: string;
    invoiceId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { technicianId, invoiceId, status, limit = 50, cursor } = query;
    const earnings = await this.prisma.commissionEarning.findMany({
      where: {
        ...(technicianId ? { technicianId } : {}),
        ...(invoiceId ? { invoiceId } : {}),
        ...(status
          ? { status: status as CommissionEarning['status'] }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return earnings.map((e) => this.mapEarningToDto(e));
  }

  async findOneEarning(id: string) {
    const earning = await this.prisma.commissionEarning.findUnique({ where: { id } });
    if (!earning) {
      throw new NotFoundException(`CommissionEarning ${id} not found`);
    }
    return this.mapEarningToDto(earning);
  }

  async approveEarning(id: string) {
    const earning = await this.prisma.commissionEarning.findUnique({ where: { id } });
    if (!earning) {
      throw new NotFoundException(`CommissionEarning ${id} not found`);
    }
    if (earning.status !== 'pending') {
      throw new BadRequestException(
        `Earning ${id} is not in pending status (current: ${earning.status})`,
      );
    }
    const updated = await this.prisma.commissionEarning.update({
      where: { id },
      data: { status: 'approved' },
    });
    return this.mapEarningToDto(updated);
  }

  async markEarningPaid(id: string) {
    const earning = await this.prisma.commissionEarning.findUnique({ where: { id } });
    if (!earning) {
      throw new NotFoundException(`CommissionEarning ${id} not found`);
    }
    if (earning.status !== 'approved') {
      throw new BadRequestException(
        `Earning ${id} is not in approved status (current: ${earning.status})`,
      );
    }
    const updated = await this.prisma.commissionEarning.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    });
    return this.mapEarningToDto(updated);
  }

  // ---------------------------------------------------------------------------
  // Commission engine
  // ---------------------------------------------------------------------------

  /**
   * Run the commission engine for an invoice and persist CommissionEarning rows.
   * Idempotent: existing rows are skipped without re-inserting.
   */
  async computeForInvoice(invoiceId: string): Promise<CommissionEarningResponseDto[]> {
    await this.commissionEngineService.computeForInvoice(invoiceId, undefined, true);
    // Return all persisted earnings for this invoice as typed DTOs
    return this.findEarningsByInvoice(invoiceId);
  }

  /** Dry-run preview — no persistence */
  async computePreview(invoiceId: string, _technicianId?: string) {
    const results = await this.commissionEngineService.computeForInvoice(
      invoiceId,
      undefined,
      false,
    );
    const totalCommissionCents = results.reduce(
      (sum, r) => sum + r.commissionCents,
      0,
    );
    return {
      preview: results.map((r) => ({
        lineItemId: r.invoiceLineItemId,
        technicianId: (r.ruleTrace as unknown as { technicianId: string }).technicianId,
        ruleName: r.ruleTrace
          ? ((r.ruleTrace as unknown as { rulesEvaluated: Array<{ matched: boolean; ruleName: string }> })
              .rulesEvaluated?.find((re) => re.matched)?.ruleName ?? null)
          : null,
        commissionCents: r.commissionCents,
        ruleTrace: r.ruleTrace,
      })),
      totalCommissionCents,
      wouldPersist: false,
    };
  }

  // ---------------------------------------------------------------------------
  // Mappers
  // ---------------------------------------------------------------------------

  private mapRuleToDto(rule: CommissionRule): CommissionRuleResponseDto {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description ?? undefined,
      techTypeFilter: rule.techTypeFilter as CommissionRuleResponseDto['techTypeFilter'],
      jobTypeFilter: rule.jobTypeFilter as CommissionRuleResponseDto['jobTypeFilter'],
      equipmentClassFilter:
        rule.equipmentClassFilter as CommissionRuleResponseDto['equipmentClassFilter'],
      technicianIdFilter: rule.technicianIdFilter ?? undefined,
      ratePct: Number(rule.ratePct),
      bonusThresholdJobs: rule.bonusThresholdJobs ?? undefined,
      bonusRatePct:
        rule.bonusRatePct !== null ? Number(rule.bonusRatePct) : undefined,
      priority: rule.priority,
      active: rule.active,
      metadata: rule.metadata as Record<string, unknown>,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  private mapEarningToDto(earning: CommissionEarning): CommissionEarningResponseDto {
    return {
      id: earning.id,
      technicianId: earning.technicianId,
      invoiceId: earning.invoiceId,
      invoiceLineItemId: earning.invoiceLineItemId ?? undefined,
      commissionRuleId: earning.commissionRuleId ?? undefined,
      jobId: earning.jobId ?? undefined,
      baseAmountCents: Number(earning.baseAmountCents),
      commissionPct: Number(earning.commissionPct),
      commissionCents: Number(earning.commissionCents),
      ruleTrace: earning.ruleTrace as Record<string, unknown>,
      status: earning.status as CommissionEarningResponseDto['status'],
      paidAt: earning.paidAt ?? undefined,
      metadata: earning.metadata as Record<string, unknown>,
      createdAt: earning.createdAt,
      updatedAt: earning.updatedAt,
    };
  }
}
