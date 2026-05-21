import { PrismaClient } from '../../generated/client';
import { seedAccounts } from './accounts.seed';
import { seedLocations } from './locations.seed';
import { seedEquipment } from './equipment.seed';
import { seedUsers } from './users.seed';
import { seedTechnicians } from './technicians.seed';
import { seedJobs } from './jobs.seed';
import { seedCommissionRules } from './commission-rules.seed';
import { seedParts } from './parts.seed';

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    console.log('Starting seed...');

    // Dependency order: accounts → locations/users → equipment/technicians → jobs/parts → rules
    const accounts = await seedAccounts(prisma);
    const locations = await seedLocations(prisma, accounts);
    const users = await seedUsers(prisma, accounts);
    const equipment = await seedEquipment(prisma, locations);
    const technicians = await seedTechnicians(prisma, users);

    await seedJobs(prisma, accounts, locations, technicians, equipment);
    await seedParts(prisma, locations, technicians);
    await seedCommissionRules(prisma);

    console.log('Seed complete.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
