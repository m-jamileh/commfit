import { PrismaClient, Account, Location } from '../../generated/client';

export async function seedLocations(
  prisma: PrismaClient,
  accounts: Account[],
): Promise<Location[]> {
  console.log('  Seeding locations...');

  const fitLife = accounts.find((a) => a.name === 'FitLife Gyms')!;
  const peak = accounts.find((a) => a.name === 'Peak Performance Centers')!;
  const coreFit = accounts.find((a) => a.name === 'CoreFit Studios')!;

  const locationData = [
    // FitLife — 3 TX locations
    {
      accountId: fitLife.id,
      name: 'FitLife Austin Main',
      address: '100 Congress Ave',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      contactName: 'Sarah Hensley',
      contactEmail: 'austin-main@fitlife.com',
      contactPhone: '512-555-0101',
    },
    {
      accountId: fitLife.id,
      name: 'FitLife Round Rock',
      address: '2500 Round Rock Ave',
      city: 'Round Rock',
      state: 'TX',
      zip: '78681',
      contactName: 'Mike Torrez',
      contactEmail: 'roundrock@fitlife.com',
      contactPhone: '512-555-0102',
    },
    {
      accountId: fitLife.id,
      name: 'FitLife Cedar Park',
      address: '1800 N Bell Blvd',
      city: 'Cedar Park',
      state: 'TX',
      zip: '78613',
      contactName: 'Linda Vu',
      contactEmail: 'cedarpark@fitlife.com',
      contactPhone: '512-555-0103',
    },
    // Peak — 2 TX + 1 AZ
    {
      accountId: peak.id,
      name: 'Peak Dallas Uptown',
      address: '3200 McKinney Ave',
      city: 'Dallas',
      state: 'TX',
      zip: '75204',
      contactName: 'Jordan Ellis',
      contactEmail: 'uptown@peakperf.com',
      contactPhone: '214-555-0201',
    },
    {
      accountId: peak.id,
      name: 'Peak Dallas Southlake',
      address: '1000 Southlake Blvd',
      city: 'Southlake',
      state: 'TX',
      zip: '76092',
      contactName: 'Renee Marsh',
      contactEmail: 'southlake@peakperf.com',
      contactPhone: '817-555-0202',
    },
    {
      accountId: peak.id,
      name: 'Peak Phoenix AZ',
      address: '4500 N Central Ave',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85012',
      contactName: 'Chris Navarro',
      contactEmail: 'phoenix@peakperf.com',
      contactPhone: '602-555-0203',
    },
    // CoreFit — 1 TX + 1 NY
    {
      accountId: coreFit.id,
      name: 'CoreFit Houston Heights',
      address: '720 Studewood St',
      city: 'Houston',
      state: 'TX',
      zip: '77007',
      contactName: 'Tanya Brooks',
      contactEmail: 'heights@corefit.com',
      contactPhone: '713-555-0301',
    },
    {
      accountId: coreFit.id,
      name: 'CoreFit New York NY',
      address: '250 W 57th St',
      city: 'New York',
      state: 'NY',
      zip: '10107',
      contactName: 'David Kim',
      contactEmail: 'newyork@corefit.com',
      contactPhone: '212-555-0302',
    },
  ];

  const locations: Location[] = [];

  for (const data of locationData) {
    const existing = await prisma.location.findFirst({
      where: { accountId: data.accountId, name: data.name },
    });
    if (existing) {
      locations.push(existing);
    } else {
      const location = await prisma.location.create({ data });
      locations.push(location);
    }
  }

  console.log(`  Created ${locations.length} locations`);
  return locations;
}
