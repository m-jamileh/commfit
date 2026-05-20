import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueSummary(query: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { accountId, startDate, endDate } = query;

    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter['createdAt'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const where: Record<string, unknown> = {
      ...(accountId ? { accountId } : {}),
      ...dateFilter,
    };

    const invoices = await this.prisma.invoice.findMany({ where });

    let totalInvoicedCents = 0;
    let totalPaidCents = 0;
    let totalOverdueCents = 0;
    let totalPendingCents = 0;

    const monthlyMap = new Map<string, number>();

    for (const inv of invoices) {
      const total = Number(inv.totalCents);
      const paid = Number(inv.paidCents);
      totalInvoicedCents += total;
      totalPaidCents += paid;

      if (inv.status === 'overdue') {
        totalOverdueCents += total - paid;
      } else if (
        inv.status === 'sent' ||
        inv.status === 'partially_paid' ||
        inv.status === 'draft'
      ) {
        totalPendingCents += total - paid;
      }

      const d = inv.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + total);
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, totalCents]) => ({ month, totalCents }));

    return {
      totalInvoicedCents,
      totalPaidCents,
      totalOverdueCents,
      totalPendingCents,
      monthlyBreakdown,
    };
  }

  async getJobPipeline(query: {
    accountId?: string;
    technicianId?: string;
  }) {
    const { accountId, technicianId } = query;

    const where: Record<string, unknown> = {
      ...(accountId ? { accountId } : {}),
      ...(technicianId ? { technicianId } : {}),
    };

    const [statusGroups, typeGroups, priorityGroups] = await Promise.all([
      this.prisma.job.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.job.groupBy({ by: ['jobType'], where, _count: { _all: true } }),
      this.prisma.job.groupBy({ by: ['priority'], where, _count: { _all: true } }),
    ]);

    const completedJobs = await this.prisma.job.findMany({
      where: {
        ...where,
        status: 'completed',
        completedAt: { not: null },
        startedAt: { not: null },
      },
      select: { startedAt: true, completedAt: true },
    });

    let avgCompletionMinutes: number | null = null;
    if (completedJobs.length > 0) {
      const totalMs = completedJobs.reduce((sum, j) => {
        if (j.completedAt && j.startedAt) {
          return sum + (j.completedAt.getTime() - j.startedAt.getTime());
        }
        return sum;
      }, 0);
      avgCompletionMinutes = Math.round(totalMs / completedJobs.length / 60000);
    }

    const byStatus: Record<string, number> = {};
    for (const g of statusGroups) {
      byStatus[g.status] = g._count._all;
    }

    const byJobType: Record<string, number> = {};
    for (const g of typeGroups) {
      byJobType[g.jobType] = g._count._all;
    }

    const urgentCount =
      priorityGroups.find((g) => g.priority === 'urgent')?._count._all ?? 0;
    const normalCount =
      priorityGroups.find((g) => g.priority === 'normal')?._count._all ?? 0;

    return {
      byStatus: {
        scheduled: byStatus['scheduled'] ?? 0,
        en_route: byStatus['en_route'] ?? 0,
        on_site: byStatus['on_site'] ?? 0,
        completed: byStatus['completed'] ?? 0,
        cancelled: byStatus['cancelled'] ?? 0,
      },
      byJobType,
      urgentCount,
      normalCount,
      avgCompletionMinutes,
    };
  }

  async getTechPerformance(query: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = query;

    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter['scheduledAt'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [jobGroups, commissionGroups] = await Promise.all([
      this.prisma.job.groupBy({
        by: ['technicianId', 'status'],
        where: { technicianId: { not: null }, ...dateFilter },
        _count: { _all: true },
      }),
      this.prisma.commissionEarning.groupBy({
        by: ['technicianId'],
        _sum: { commissionCents: true },
      }),
    ]);

    const commissionMap = new Map(
      commissionGroups.map((g) => [
        g.technicianId,
        Number(g._sum.commissionCents ?? 0),
      ]),
    );

    const technicianIds = [
      ...new Set(
        jobGroups.map((g) => g.technicianId).filter((id): id is string => !!id),
      ),
    ];
    const technicians = await this.prisma.technician.findMany({
      where: { id: { in: technicianIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const techMap = new Map(
      technicians.map((t) => [t.id, `${t.firstName} ${t.lastName}`]),
    );

    const byTech = new Map<
      string,
      {
        technicianId: string;
        techName: string;
        jobCount: number;
        completedCount: number;
        totalCommissionCents: number;
      }
    >();

    for (const g of jobGroups) {
      if (!g.technicianId) continue;
      if (!byTech.has(g.technicianId)) {
        byTech.set(g.technicianId, {
          technicianId: g.technicianId,
          techName: techMap.get(g.technicianId) ?? '',
          jobCount: 0,
          completedCount: 0,
          totalCommissionCents: commissionMap.get(g.technicianId) ?? 0,
        });
      }
      const entry = byTech.get(g.technicianId)!;
      entry.jobCount += g._count._all;
      if (g.status === 'completed') entry.completedCount += g._count._all;
    }

    return Array.from(byTech.values()).map((t) => ({
      ...t,
      completionRate:
        t.jobCount > 0 ? Math.round((t.completedCount / t.jobCount) * 100) : 0,
    }));
  }

  async getEquipmentHealth(query: {
    accountId?: string;
    locationId?: string;
  }) {
    const { accountId, locationId } = query;

    const where: Record<string, unknown> = {
      ...(accountId ? { accountId } : {}),
      ...(locationId ? { locationId } : {}),
    };

    const [conditionGroups, allEquipment] = await Promise.all([
      this.prisma.equipment.groupBy({
        by: ['condition'],
        where,
        _count: { _all: true },
      }),
      this.prisma.equipment.findMany({
        where,
        select: { id: true, warrantyEnd: true, condition: true, repairCount: true },
        orderBy: { repairCount: 'desc' },
      }),
    ]);

    const now = new Date();
    let inWarrantyCount = 0;
    let outOfWarrantyCount = 0;
    for (const eq of allEquipment) {
      if (eq.warrantyEnd && eq.warrantyEnd >= now) {
        inWarrantyCount++;
      } else {
        outOfWarrantyCount++;
      }
    }

    const byCondition: Record<string, number> = {};
    for (const g of conditionGroups) {
      byCondition[g.condition] = g._count._all;
    }

    const mostRepaired = allEquipment.slice(0, 5).map((eq) => ({
      id: eq.id,
      condition: eq.condition,
      repairCount: eq.repairCount,
    }));

    return {
      byCondition: {
        excellent: byCondition['excellent'] ?? 0,
        good: byCondition['good'] ?? 0,
        fair: byCondition['fair'] ?? 0,
        poor: byCondition['poor'] ?? 0,
      },
      inWarrantyCount,
      outOfWarrantyCount,
      mostRepaired,
    };
  }

  async getCommissionSummary(query: {
    technicianId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { technicianId, startDate, endDate } = query;

    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter['createdAt'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const where: Record<string, unknown> = {
      ...(technicianId ? { technicianId } : {}),
      ...dateFilter,
    };

    const groups = await this.prisma.commissionEarning.groupBy({
      by: ['technicianId', 'status'],
      where,
      _sum: { commissionCents: true },
    });

    const technicianIds = [...new Set(groups.map((g) => g.technicianId))];
    const technicians = await this.prisma.technician.findMany({
      where: { id: { in: technicianIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const techMap = new Map(
      technicians.map((t) => [t.id, `${t.firstName} ${t.lastName}`]),
    );

    const byTech = new Map<
      string,
      {
        technicianId: string;
        techName: string;
        totalEarnedCents: number;
        pendingCents: number;
        approvedCents: number;
        paidCents: number;
      }
    >();

    for (const g of groups) {
      if (!byTech.has(g.technicianId)) {
        byTech.set(g.technicianId, {
          technicianId: g.technicianId,
          techName: techMap.get(g.technicianId) ?? '',
          totalEarnedCents: 0,
          pendingCents: 0,
          approvedCents: 0,
          paidCents: 0,
        });
      }
      const entry = byTech.get(g.technicianId)!;
      const cents = Number(g._sum.commissionCents ?? 0);
      entry.totalEarnedCents += cents;
      if (g.status === 'pending') entry.pendingCents += cents;
      if (g.status === 'approved') entry.approvedCents += cents;
      if (g.status === 'paid') entry.paidCents += cents;
    }

    return Array.from(byTech.values());
  }

  async getAccountOverview(accountId: string) {
    const [
      locationsCount,
      equipmentCount,
      activeJobsCount,
      invoiceAgg,
      openInvoicesCount,
      activeContractsCount,
    ] = await Promise.all([
      this.prisma.location.count({ where: { accountId, status: 'active' } }),
      this.prisma.equipment.count({ where: { accountId, status: 'active' } }),
      this.prisma.job.count({
        where: {
          accountId,
          status: { in: ['scheduled', 'en_route', 'on_site'] },
        },
      }),
      this.prisma.invoice.aggregate({
        where: { accountId },
        _sum: { totalCents: true },
      }),
      this.prisma.invoice.count({
        where: {
          accountId,
          status: { in: ['sent', 'overdue', 'partially_paid'] },
        },
      }),
      this.prisma.contract.count({
        where: { accountId, status: { in: ['sent', 'signed', 'partially_signed'] } },
      }),
    ]);

    return {
      accountId,
      locationsCount,
      equipmentCount,
      activeJobsCount,
      totalInvoicedCents: Number(invoiceAgg._sum.totalCents ?? 0),
      openInvoicesCount,
      activeContractsCount,
    };
  }

  // ---------------------------------------------------------------------------
  // Legacy endpoints (backwards compatibility)
  // ---------------------------------------------------------------------------

  async getServiceHistoryPerLocation(
    accountId: string,
    locationId?: string,
    from?: Date,
    to?: Date,
  ) {
    const where: Record<string, unknown> = { accountId };
    if (locationId) where['locationId'] = locationId;
    if (from || to) {
      where['scheduledAt'] = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    const groups = await this.prisma.job.groupBy({
      by: ['locationId', 'status'],
      where,
      _count: { _all: true },
    });

    const byLocation = new Map<string, Record<string, unknown>>();

    for (const g of groups) {
      const locId = g.locationId;
      if (!byLocation.has(locId)) {
        byLocation.set(locId, { locationId: locId });
      }
      const entry = byLocation.get(locId)!;
      entry[g.status] = ((entry[g.status] as number) ?? 0) + g._count._all;
      entry['total'] = ((entry['total'] as number) ?? 0) + g._count._all;
    }

    const locationIds = Array.from(byLocation.keys());
    const locations = await this.prisma.location.findMany({
      where: { id: { in: locationIds } },
      select: { id: true, name: true },
    });
    const locationNameMap = new Map(locations.map((l) => [l.id, l.name]));

    return Array.from(byLocation.values()).map((entry) => ({
      locationId: entry['locationId'] as string,
      locationName: locationNameMap.get(entry['locationId'] as string) ?? null,
      total: (entry['total'] as number) ?? 0,
      scheduled: (entry['scheduled'] as number) ?? 0,
      en_route: (entry['en_route'] as number) ?? 0,
      on_site: (entry['on_site'] as number) ?? 0,
      completed: (entry['completed'] as number) ?? 0,
      cancelled: (entry['cancelled'] as number) ?? 0,
    }));
  }

  async getSpendPerAccount(accountId?: string, from?: Date, to?: Date) {
    const where: Record<string, unknown> = {};
    if (accountId) where['accountId'] = accountId;
    if (from || to) {
      where['createdAt'] = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    const groups = await this.prisma.invoice.groupBy({
      by: ['accountId'],
      where,
      _sum: { totalCents: true },
      _count: { _all: true },
    });

    const accountIds = groups.map((g) => g.accountId);
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, name: true },
    });
    const accountNameMap = new Map(accounts.map((a) => [a.id, a.name]));

    return groups.map((g) => ({
      accountId: g.accountId,
      accountName: accountNameMap.get(g.accountId) ?? null,
      totalSpendCents: Number(g._sum.totalCents ?? 0),
      invoiceCount: g._count._all,
    }));
  }

  async getEquipmentConditionSummary(accountId: string) {
    const groups = await this.prisma.equipment.groupBy({
      by: ['condition', 'equipmentClass'],
      where: { accountId },
      _count: { _all: true },
    });

    return groups.map((g) => ({
      condition: g.condition,
      equipmentClass: g.equipmentClass,
      count: g._count._all,
    }));
  }

  async getJobsPerTechnician(accountId?: string, from?: Date, to?: Date) {
    const where: Record<string, unknown> = {};
    if (accountId) where['accountId'] = accountId;
    if (from || to) {
      where['scheduledAt'] = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    const groups = await this.prisma.job.groupBy({
      by: ['technicianId', 'status'],
      where: { ...where, technicianId: { not: null } },
      _count: { _all: true },
    });

    const technicianIds = [
      ...new Set(
        groups.map((g) => g.technicianId).filter((id): id is string => !!id),
      ),
    ];
    const technicians = await this.prisma.technician.findMany({
      where: { id: { in: technicianIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const techMap = new Map(
      technicians.map((t) => [t.id, `${t.firstName} ${t.lastName}`]),
    );

    const byTechnician = new Map<
      string,
      {
        technicianId: string;
        techName: string;
        total: number;
        completed: number;
        pending: number;
      }
    >();

    for (const g of groups) {
      if (!g.technicianId) continue;
      if (!byTechnician.has(g.technicianId)) {
        byTechnician.set(g.technicianId, {
          technicianId: g.technicianId,
          techName: techMap.get(g.technicianId) ?? '',
          total: 0,
          completed: 0,
          pending: 0,
        });
      }
      const entry = byTechnician.get(g.technicianId)!;
      entry.total += g._count._all;
      if (g.status === 'completed') entry.completed += g._count._all;
      if (
        g.status === 'scheduled' ||
        g.status === 'en_route' ||
        g.status === 'on_site'
      )
        entry.pending += g._count._all;
    }

    return Array.from(byTechnician.values());
  }

  async getInvoiceAgingSummary(accountId: string) {
    const now = new Date();
    const invoices = await this.prisma.invoice.findMany({
      where: {
        accountId,
        status: { in: ['sent', 'overdue', 'partially_paid'] },
      },
      select: { dueDate: true, totalCents: true, paidCents: true },
    });

    const result = {
      current: { count: 0, totalCents: 0 },
      bucket30: { count: 0, totalCents: 0 },
      bucket60: { count: 0, totalCents: 0 },
      bucket90plus: { count: 0, totalCents: 0 },
    };

    for (const inv of invoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const remainingCents = Number(inv.totalCents) - Number(inv.paidCents);

      if (daysOverdue < 30) {
        result.current.count++;
        result.current.totalCents += remainingCents;
      } else if (daysOverdue < 60) {
        result.bucket30.count++;
        result.bucket30.totalCents += remainingCents;
      } else if (daysOverdue < 90) {
        result.bucket60.count++;
        result.bucket60.totalCents += remainingCents;
      } else {
        result.bucket90plus.count++;
        result.bucket90plus.totalCents += remainingCents;
      }
    }

    return result;
  }
}
