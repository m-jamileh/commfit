import { Test } from '@nestjs/testing';
import { CommissionEngineService } from './commission-engine.service';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  invoice: { findUnique: jest.fn() },
  commissionRule: { findMany: jest.fn() },
  commissionEarning: { findFirst: jest.fn(), create: jest.fn() },
  auditLog: { create: jest.fn() },
  job: { count: jest.fn() },
  $transaction: jest.fn(),
};

describe('CommissionEngineService', () => {
  let service: CommissionEngineService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommissionEngineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(CommissionEngineService);
    jest.clearAllMocks();
  });

  it('returns empty array when invoice has no job', async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue(null);
    const result = await service.computeForInvoice('invoice-1', undefined, false);
    expect(result).toEqual([]);
  });

  it('returns empty array when invoice job has no technician', async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: 'inv-1',
      lineItems: [],
      job: { id: 'job-1', jobType: 'pm', technician: null },
    });
    const result = await service.computeForInvoice('invoice-1', undefined, false);
    expect(result).toEqual([]);
  });

  it('computes commission using first matching rule (dry run)', async () => {
    const technicianId = 'tech-1';
    const invoiceId = 'inv-1';
    const lineItemId = 'li-1';

    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: invoiceId,
      lineItems: [
        {
          id: lineItemId,
          totalCents: BigInt(25000),
          jobEquipment: {
            equipment: { equipmentClass: 'cardio' },
          },
        },
      ],
      job: {
        id: 'job-1',
        jobType: 'pm',
        technician: { id: technicianId, techType: 'in_house' },
      },
    });

    mockPrisma.commissionRule.findMany.mockResolvedValue([
      {
        id: 'rule-1',
        name: 'In-House PM Cardio',
        priority: 10,
        createdAt: new Date(),
        techTypeFilter: 'in_house',
        jobTypeFilter: 'pm',
        equipmentClassFilter: 'cardio',
        technicianIdFilter: null,
        ratePct: 8.5,
        bonusThresholdJobs: null,
        bonusRatePct: null,
        active: true,
      },
    ]);

    mockPrisma.job.count.mockResolvedValue(0);

    const results = await service.computeForInvoice(invoiceId, undefined, false);

    expect(results).toHaveLength(1);
    expect(results[0].commissionPct).toBe(8.5);
    expect(results[0].baseAmountCents).toBe(25000);
    expect(results[0].commissionCents).toBe(2125); // floor(25000 * 8.5 / 100)
    expect(results[0].ruleTrace.matched).toBe(true);
    expect(results[0].ruleTrace.fallback).toBe(false);
    expect(results[0].ruleTrace.matchedRuleId).toBe('rule-1');
  });

  it('applies 0% fallback when no rule matches', async () => {
    const invoiceId = 'inv-2';

    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: invoiceId,
      lineItems: [
        {
          id: 'li-2',
          totalCents: BigInt(10000),
          jobEquipment: null,
        },
      ],
      job: {
        id: 'job-2',
        jobType: 'install',
        technician: { id: 'tech-2', techType: 'third_party' },
      },
    });

    mockPrisma.commissionRule.findMany.mockResolvedValue([
      {
        id: 'rule-2',
        name: 'In-House Only',
        priority: 10,
        createdAt: new Date(),
        techTypeFilter: 'in_house',
        jobTypeFilter: null,
        equipmentClassFilter: null,
        technicianIdFilter: null,
        ratePct: 5.0,
        bonusThresholdJobs: null,
        bonusRatePct: null,
        active: true,
      },
    ]);

    mockPrisma.job.count.mockResolvedValue(0);

    const results = await service.computeForInvoice(invoiceId, undefined, false);

    expect(results).toHaveLength(1);
    expect(results[0].commissionPct).toBe(0);
    expect(results[0].commissionCents).toBe(0);
    expect(results[0].ruleTrace.matched).toBe(false);
    expect(results[0].ruleTrace.fallback).toBe(true);
  });

  it('activates bonus tier when threshold met', async () => {
    const invoiceId = 'inv-3';

    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: invoiceId,
      lineItems: [
        {
          id: 'li-3',
          totalCents: BigInt(25000),
          jobEquipment: { equipment: { equipmentClass: 'cardio' } },
        },
      ],
      job: {
        id: 'job-3',
        jobType: 'pm',
        technician: { id: 'tech-3', techType: 'in_house' },
      },
    });

    mockPrisma.commissionRule.findMany.mockResolvedValue([
      {
        id: 'rule-3',
        name: 'In-House PM Cardio with Bonus',
        priority: 10,
        createdAt: new Date(),
        techTypeFilter: 'in_house',
        jobTypeFilter: 'pm',
        equipmentClassFilter: 'cardio',
        technicianIdFilter: null,
        ratePct: 8.5,
        bonusThresholdJobs: 20,
        bonusRatePct: 10.0,
        active: true,
      },
    ]);

    // 22 completed jobs this month → bonus activates
    mockPrisma.job.count.mockResolvedValue(22);

    const results = await service.computeForInvoice(invoiceId, undefined, false);

    expect(results).toHaveLength(1);
    expect(results[0].commissionPct).toBe(10.0);
    expect(results[0].commissionCents).toBe(2500); // floor(25000 * 10 / 100)
    expect(results[0].ruleTrace.bonusTierActivated).toBe(true);
    expect(results[0].ruleTrace.completedJobsThisMonth).toBe(22);
  });
});
