import { PrismaClient, Account, User } from '../../generated/client';

const TECH_NAMES = [
  { first: 'James', last: 'Rivera' },
  { first: 'Maria', last: 'Santos' },
  { first: 'Kevin', last: 'Okafor' },
  { first: 'Patricia', last: 'Chen' },
  { first: 'Robert', last: 'Nguyen' },
  { first: 'Sandra', last: 'Mitchell' },
  { first: 'Carlos', last: 'Reyes' },
  { first: 'Lisa', last: 'Patel' },
  { first: 'Michael', last: 'Thompson' },
  { first: 'Angela', last: 'Williams' },
  { first: 'Brian', last: 'Johnson' },
  { first: 'Donna', last: 'Martinez' },
  { first: 'Thomas', last: 'Brown' },
  { first: 'Rebecca', last: 'Davis' },
  { first: 'Steven', last: 'Wilson' },
  { first: 'Jennifer', last: 'Garcia' },
  { first: 'Mark', last: 'Anderson' },
];

export async function seedUsers(
  prisma: PrismaClient,
  accounts: Account[],
): Promise<User[]> {
  console.log('  Seeding users...');

  const users: User[] = [];

  // Staff users
  const staffUsers = [
    { email: 'admin@commfit.com', name: 'Admin User', role: 'admin' as const },
    { email: 'dispatch@commfit.com', name: 'Dispatch Team', role: 'dispatcher' as const },
    { email: 'am@commfit.com', name: 'Account Manager', role: 'account_manager' as const },
    { email: 'finance@commfit.com', name: 'Finance User', role: 'finance' as const },
  ];

  for (const data of staffUsers) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      create: data,
      update: {},
    });
    users.push(user);
  }

  // 17 technician users
  for (let i = 0; i < TECH_NAMES.length; i++) {
    const { first, last } = TECH_NAMES[i];
    const email = `tech.${first.toLowerCase()}.${last.toLowerCase()}@commfit.com`;
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: `${first} ${last}`,
        role: 'technician',
      },
      update: {},
    });
    users.push(user);
  }

  // 3 customer_org_user users (one per account)
  const customerUsers = [
    { email: 'contact@fitlife.com', name: 'FitLife Contact', accountIndex: 0 },
    { email: 'contact@peakperf.com', name: 'Peak Contact', accountIndex: 1 },
    { email: 'contact@corefit.com', name: 'CoreFit Contact', accountIndex: 2 },
  ];

  for (const cu of customerUsers) {
    const user = await prisma.user.upsert({
      where: { email: cu.email },
      create: {
        email: cu.email,
        name: cu.name,
        role: 'customer_org_user',
      },
      update: {},
    });
    users.push(user);

    // Link to account
    await prisma.accountUser.upsert({
      where: {
        accountId_userId: {
          accountId: accounts[cu.accountIndex].id,
          userId: user.id,
        },
      },
      create: {
        accountId: accounts[cu.accountIndex].id,
        userId: user.id,
        role: 'admin',
      },
      update: {},
    });
  }

  console.log(`  Created ${users.length} users`);
  return users;
}
