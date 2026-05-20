import { PrismaClient, Account, Location, Technician, Equipment } from '../../generated/client';

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86400000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86400000);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export async function seedJobs(
  prisma: PrismaClient,
  accounts: Account[],
  locations: Location[],
  technicians: Technician[],
  equipment: Equipment[],
): Promise<void> {
  console.log('  Seeding jobs, invoices, and line items...');

  const jobTypes: Array<'pm' | 'sr' | 'disinfecting' | 'install'> = ['pm', 'sr', 'disinfecting', 'pm', 'pm', 'sr'];
  let invoiceSeq = 1;

  const getInvoiceNumber = () => {
    const num = String(invoiceSeq).padStart(3, '0');
    invoiceSeq++;
    return `INV-SEED-${num}`;
  };

  const getLocationEquipment = (locationId: string) =>
    equipment.filter((e) => e.locationId === locationId);

  const getTechForLocation = (location: Location) =>
    technicians[Math.floor(Math.random() * technicians.length)];

  // ─── 15 Completed Jobs (with invoices) ────────────────────────────────────
  for (let i = 0; i < 15; i++) {
    const location = randomFrom(locations);
    const tech = getTechForLocation(location);
    const completedDaysAgo = randomBetween(1, 90);
    const completedAt = daysAgo(completedDaysAgo);
    const scheduledAt = new Date(completedAt.getTime() - 2 * 3600000); // 2h before completion
    const jobType = randomFrom(jobTypes);
    const invoiceStatus = i < 10 ? 'paid' : 'sent';

    const job = await prisma.job.create({
      data: {
        accountId: location.accountId,
        locationId: location.id,
        technicianId: tech.id,
        jobType,
        status: 'completed',
        scheduledAt,
        startedAt: new Date(completedAt.getTime() - 1 * 3600000),
        completedAt,
        priority: 'normal',
        notes: `Completed ${jobType} service`,
      },
    });

    // Attach 1-2 equipment items
    const locEquipment = getLocationEquipment(location.id);
    const eqSample = locEquipment.slice(0, Math.min(2, locEquipment.length));
    const jobEquipmentRecords = [];
    for (const eq of eqSample) {
      const je = await prisma.jobEquipment.create({
        data: { jobId: job.id, equipmentId: eq.id },
      });
      jobEquipmentRecords.push({ je, eq });
    }

    // Create invoice
    const lineItemCount = randomBetween(1, 3);
    let subtotal = 0;
    const lineItems = [];

    for (let li = 0; li < lineItemCount; li++) {
      const qty = randomBetween(1, 2);
      const unitPrice = randomBetween(15000, 35000);
      const total = qty * unitPrice;
      subtotal += total;
      lineItems.push({
        description: `Service - ${jobType.toUpperCase()} line item ${li + 1}`,
        quantity: qty,
        unitPriceCents: BigInt(unitPrice),
        totalCents: BigInt(total),
        jobEquipmentId: jobEquipmentRecords[li % jobEquipmentRecords.length]?.je?.id ?? null,
        sortOrder: li,
      });
    }

    const invoiceNumber = getInvoiceNumber();
    const invoice = await prisma.invoice.create({
      data: {
        accountId: location.accountId,
        locationId: location.id,
        jobId: job.id,
        invoiceNumber,
        dueDate: daysAgo(completedDaysAgo - 30),
        subtotalCents: BigInt(subtotal),
        totalCents: BigInt(subtotal),
        paidCents: invoiceStatus === 'paid' ? BigInt(subtotal) : BigInt(0),
        status: invoiceStatus as any,
      },
    });

    for (const liData of lineItems) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          ...liData,
        },
      });
    }
  }

  // ─── 5 In-Progress Jobs ────────────────────────────────────────────────────
  const inProgressStatuses: Array<'on_site' | 'en_route'> = ['on_site', 'on_site', 'en_route', 'on_site', 'en_route'];
  for (let i = 0; i < 5; i++) {
    const location = randomFrom(locations);
    const tech = getTechForLocation(location);
    const status = inProgressStatuses[i];
    const scheduledAt = new Date(Date.now() - randomBetween(1, 4) * 3600000);

    await prisma.job.create({
      data: {
        accountId: location.accountId,
        locationId: location.id,
        technicianId: tech.id,
        jobType: randomFrom(['pm', 'sr'] as const),
        status,
        scheduledAt,
        startedAt: status === 'on_site' ? new Date(scheduledAt.getTime() + 30 * 60000) : null,
        priority: 'normal',
        notes: `In-progress ${status} job`,
      },
    });
  }

  // ─── 20 Scheduled Jobs (next 30 days) ─────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    const location = randomFrom(locations);
    const tech = getTechForLocation(location);
    const scheduledAt = daysFromNow(randomBetween(1, 30));

    await prisma.job.create({
      data: {
        accountId: location.accountId,
        locationId: location.id,
        technicianId: tech.id,
        jobType: randomFrom(jobTypes),
        status: 'scheduled',
        scheduledAt,
        priority: 'normal',
        notes: 'Scheduled maintenance',
      },
    });
  }

  // ─── 5 Urgent Jobs ────────────────────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const location = randomFrom(locations);
    const tech = getTechForLocation(location);
    const scheduledAt = daysFromNow(randomBetween(0, 3));

    await prisma.job.create({
      data: {
        accountId: location.accountId,
        locationId: location.id,
        technicianId: tech.id,
        jobType: 'sr',
        status: 'scheduled',
        scheduledAt,
        priority: 'urgent',
        notes: 'URGENT: Equipment failure requiring immediate service',
      },
    });
  }

  console.log('  Created 45 jobs (15 completed, 5 in-progress, 20 scheduled, 5 urgent)');
}
