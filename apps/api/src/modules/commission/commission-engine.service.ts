import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';

export interface RuleTrace {
  evaluatedAt: string;
  invoiceId: string;
  invoiceLineItemId: string | null;
  technicianId: string;
  context: {
    techType: string | null;
    jobType: string | null;
    equipmentClass: string | null;
    technicianId: string;
  };
  rulesEvaluated: Array<{
    ruleId: string;
    ruleName: string;
    priority: number;
    filters: {
      techTypeFilter: string | null;
      jobTypeFilter: string | null;
      equipmentClassFilter: string | null;
      technicianIdFilter: string | null;
    };
    matched: boolean;
  }>;
  matchedRuleId: string | null;
  matched: boolean;
  fallback: boolean;
  bonusTierActivated: boolean;
  bonusThresholdJobs: number | null;
  completedJobsThisMonth: number;
  rateApplied: number;
  baseAmountCents: number;
  commissionCents: number;
}

export interface ComputeResult {
  invoiceLineItemId: string | null;
  baseAmountCents: number;
  commissionPct: number;
  commissionCents: number;
  ruleTrace: RuleTrace;
}

@Injectable()
export class CommissionEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async computeForInvoice(
    invoiceId: string,
    triggeredByUserId?: string,
    persist = true,
  ): Promise<ComputeResult[]> {
    // Load invoice with all needed relations
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lineItems: {
          include: {
            jobEquipment: {
              include: {
                equipment: true,
              },
            },
          },
        },
        job: {
          include: {
            technician: true,
          },
        },
      },
    });

    if (!invoice || !invoice.job || !invoice.job.technician) {
      return [];
    }

    const { job } = invoice;
    const technician = job.technician!;

    // Load all active rules sorted by priority ASC, createdAt ASC
    const rules = await this.prisma.commissionRule.findMany({
      where: { active: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });

    const results: ComputeResult[] = [];

    for (const lineItem of invoice.lineItems) {
      const equipmentClass =
        lineItem.jobEquipment?.equipment?.equipmentClass ?? null;

      const context = {
        techType: technician.techType as string | null,
        jobType: job.jobType as string | null,
        equipmentClass: equipmentClass as string | null,
        technicianId: technician.id,
      };

      const rulesEvaluated: RuleTrace['rulesEvaluated'] = [];
      let matchedRule: (typeof rules)[number] | null = null;

      for (const rule of rules) {
        const techTypeMatch =
          rule.techTypeFilter === null ||
          rule.techTypeFilter === technician.techType;
        const jobTypeMatch =
          rule.jobTypeFilter === null || rule.jobTypeFilter === job.jobType;
        const equipmentClassMatch =
          rule.equipmentClassFilter === null ||
          rule.equipmentClassFilter === equipmentClass;
        const technicianIdMatch =
          rule.technicianIdFilter === null ||
          rule.technicianIdFilter === technician.id;

        const matched =
          techTypeMatch &&
          jobTypeMatch &&
          equipmentClassMatch &&
          technicianIdMatch;

        rulesEvaluated.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          filters: {
            techTypeFilter: rule.techTypeFilter ?? null,
            jobTypeFilter: rule.jobTypeFilter ?? null,
            equipmentClassFilter: rule.equipmentClassFilter ?? null,
            technicianIdFilter: rule.technicianIdFilter ?? null,
          },
          matched,
        });

        if (matched && matchedRule === null) {
          matchedRule = rule;
          break;
        }
      }

      // Determine rate
      let rateApplied = matchedRule ? Number(matchedRule.ratePct) : 0;
      let bonusTierActivated = false;
      let completedJobsThisMonth = 0;

      if (matchedRule && matchedRule.bonusThresholdJobs !== null) {
        const now = new Date();
        const monthStart = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
        );
        const monthEnd = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
        );

        completedJobsThisMonth = await this.prisma.job.count({
          where: {
            technicianId: technician.id,
            status: 'completed',
            completedAt: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
        });

        if (
          completedJobsThisMonth >= matchedRule.bonusThresholdJobs &&
          matchedRule.bonusRatePct !== null
        ) {
          rateApplied = Number(matchedRule.bonusRatePct);
          bonusTierActivated = true;
        }
      }

      const baseAmountCents = Number(lineItem.totalCents);
      const commissionCents = Math.floor((baseAmountCents * rateApplied) / 100);

      const ruleTrace: RuleTrace = {
        evaluatedAt: new Date().toISOString(),
        invoiceId,
        invoiceLineItemId: lineItem.id,
        technicianId: technician.id,
        context,
        rulesEvaluated,
        matchedRuleId: matchedRule?.id ?? null,
        matched: matchedRule !== null,
        fallback: matchedRule === null,
        bonusTierActivated,
        bonusThresholdJobs: matchedRule?.bonusThresholdJobs ?? null,
        completedJobsThisMonth,
        rateApplied,
        baseAmountCents,
        commissionCents,
      };

      if (persist) {
        // Idempotency check
        const existing = await this.prisma.commissionEarning.findFirst({
          where: {
            technicianId: technician.id,
            invoiceId,
            invoiceLineItemId: lineItem.id ?? null,
          },
        });

        if (existing) {
          // Return existing as result but don't re-insert
          results.push({
            invoiceLineItemId: lineItem.id,
            baseAmountCents,
            commissionPct: rateApplied,
            commissionCents,
            ruleTrace,
          });
          continue;
        }

        const earningId = randomUUID();

        await this.prisma.$transaction([
          this.prisma.commissionEarning.create({
            data: {
              id: earningId,
              technicianId: technician.id,
              invoiceId,
              invoiceLineItemId: lineItem.id,
              commissionRuleId: matchedRule?.id ?? null,
              jobId: job.id,
              baseAmountCents: BigInt(baseAmountCents),
              commissionPct: rateApplied,
              commissionCents: BigInt(commissionCents),
              ruleTrace: ruleTrace as object,
              status: 'pending',
            },
          }),
          this.prisma.auditLog.create({
            data: {
              entityType: 'CommissionEarning',
              entityId: earningId,
              action: 'create',
              actorUserId: triggeredByUserId ?? null,
              after: {
                id: earningId,
                technicianId: technician.id,
                invoiceId,
                invoiceLineItemId: lineItem.id,
                commissionRuleId: matchedRule?.id ?? null,
                jobId: job.id,
                baseAmountCents,
                commissionPct: rateApplied,
                commissionCents,
              },
            },
          }),
        ]);
      }

      results.push({
        invoiceLineItemId: lineItem.id,
        baseAmountCents,
        commissionPct: rateApplied,
        commissionCents,
        ruleTrace,
      });
    }

    return results;
  }
}
