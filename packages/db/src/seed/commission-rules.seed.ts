import { PrismaClient } from '../../generated/client';

export async function seedCommissionRules(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding commission rules...');

  const rules = [
    {
      name: 'In-House PM Rate',
      description: 'Standard commission for in-house technicians on preventive maintenance jobs',
      techTypeFilter: 'in_house' as const,
      jobTypeFilter: 'pm' as const,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 12.0,
      bonusThresholdJobs: 20 as number | null,
      bonusRatePct: 15.0 as number | null,
      priority: 100,
      active: true,
    },
    {
      name: 'In-House SR Rate',
      description: 'Standard commission for in-house technicians on service request jobs',
      techTypeFilter: 'in_house' as const,
      jobTypeFilter: 'sr' as const,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 10.0,
      bonusThresholdJobs: 15 as number | null,
      bonusRatePct: 13.0 as number | null,
      priority: 90,
      active: true,
    },
    {
      name: 'In-House Install Rate',
      description: 'Commission for in-house technicians on equipment installation jobs',
      techTypeFilter: 'in_house' as const,
      jobTypeFilter: 'install' as const,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 8.0,
      bonusThresholdJobs: null as null,
      bonusRatePct: null as null,
      priority: 85,
      active: true,
    },
    {
      name: 'Third-Party PM Rate',
      description: 'Commission for third-party contractors on preventive maintenance jobs',
      techTypeFilter: 'third_party' as const,
      jobTypeFilter: 'pm' as const,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 7.0,
      bonusThresholdJobs: null as null,
      bonusRatePct: null as null,
      priority: 80,
      active: true,
    },
    {
      name: 'Third-Party SR Rate',
      description: 'Commission for third-party contractors on service request jobs',
      techTypeFilter: 'third_party' as const,
      jobTypeFilter: 'sr' as const,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 6.0,
      bonusThresholdJobs: null as null,
      bonusRatePct: null as null,
      priority: 70,
      active: true,
    },
    {
      name: 'Cardio Equipment Specialist Rate',
      description: 'Elevated commission for any tech servicing cardio equipment',
      techTypeFilter: null as null,
      jobTypeFilter: null as null,
      equipmentClassFilter: 'cardio' as const,
      technicianIdFilter: null as null,
      ratePct: 11.0,
      bonusThresholdJobs: 25 as number | null,
      bonusRatePct: 14.0 as number | null,
      priority: 50,
      active: true,
    },
    {
      name: 'Strength Equipment Rate',
      description: 'Commission for technicians servicing strength equipment',
      techTypeFilter: null as null,
      jobTypeFilter: null as null,
      equipmentClassFilter: 'strength' as const,
      technicianIdFilter: null as null,
      ratePct: 9.0,
      bonusThresholdJobs: null as null,
      bonusRatePct: null as null,
      priority: 45,
      active: true,
    },
    {
      name: 'Disinfecting Flat Rate',
      description: 'Flat commission rate for all disinfecting jobs regardless of tech type',
      techTypeFilter: null as null,
      jobTypeFilter: 'disinfecting' as const,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 5.0,
      bonusThresholdJobs: null as null,
      bonusRatePct: null as null,
      priority: 30,
      active: true,
    },
    {
      name: 'Default Fallback Rate',
      description: 'Default commission rate applied when no other rule matches',
      techTypeFilter: null as null,
      jobTypeFilter: null as null,
      equipmentClassFilter: null as null,
      technicianIdFilter: null as null,
      ratePct: 5.0,
      bonusThresholdJobs: null as null,
      bonusRatePct: null as null,
      priority: 0,
      active: true,
    },
  ];

  for (const rule of rules) {
    const existing = await prisma.commissionRule.findFirst({ where: { name: rule.name } });
    if (!existing) {
      await prisma.commissionRule.create({ data: rule });
    }
  }

  const count = await prisma.commissionRule.count();
  console.log(`  Commission rules ready: ${count} total`);
}
