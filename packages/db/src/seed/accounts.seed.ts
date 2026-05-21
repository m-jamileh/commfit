import { PrismaClient, Account } from '../../generated/client';

export async function seedAccounts(prisma: PrismaClient): Promise<Account[]> {
  console.log('  Seeding accounts...');

  const accountData = [
    {
      name: 'FitLife Gyms',
      billingEmail: 'billing@fitlife.com',
      billingPhone: '555-100-0001',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    {
      name: 'Peak Performance Centers',
      billingEmail: 'billing@peakperf.com',
      billingPhone: '555-100-0002',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
    },
    {
      name: 'CoreFit Studios',
      billingEmail: 'billing@corefit.com',
      billingPhone: '555-100-0003',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
    },
  ];

  const accounts: Account[] = [];
  for (const data of accountData) {
    const existing = await prisma.account.findFirst({
      where: { billingEmail: data.billingEmail },
    });
    if (existing) {
      accounts.push(existing);
    } else {
      const account = await prisma.account.create({ data });
      accounts.push(account);
    }
  }

  console.log(`  Created/found ${accounts.length} accounts`);
  return accounts;
}
