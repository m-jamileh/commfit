import { PrismaClient, User, Technician } from '../../generated/client';

const IN_HOUSE_TECHS = [
  { firstName: 'James', lastName: 'Rivera', region: 'TX-Central', certifications: ['cardio', 'strength'] },
  { firstName: 'Maria', lastName: 'Santos', region: 'TX-North', certifications: ['cardio', 'flooring', 'functional'] },
  { firstName: 'Kevin', lastName: 'Okafor', region: 'TX-South', certifications: ['strength', 'cardio'] },
  { firstName: 'Patricia', lastName: 'Chen', region: 'TX-East', certifications: ['cardio', 'functional'] },
  { firstName: 'Robert', lastName: 'Nguyen', region: 'TX-West', certifications: ['strength', 'flooring'] },
];

const THIRD_PARTY_TECHS = [
  { firstName: 'Sandra', lastName: 'Mitchell', region: 'TX-Central', certifications: ['cardio'] },
  { firstName: 'Carlos', lastName: 'Reyes', region: 'TX-North', certifications: ['strength', 'functional'] },
  { firstName: 'Lisa', lastName: 'Patel', region: 'TX-South', certifications: ['flooring', 'cardio'] },
  { firstName: 'Michael', lastName: 'Thompson', region: 'TX-East', certifications: ['cardio', 'strength'] },
  { firstName: 'Angela', lastName: 'Williams', region: 'TX-West', certifications: ['functional'] },
  { firstName: 'Brian', lastName: 'Johnson', region: 'TX-Central', certifications: ['cardio', 'flooring'] },
  { firstName: 'Donna', lastName: 'Martinez', region: 'TX-North', certifications: ['strength'] },
  { firstName: 'Thomas', lastName: 'Brown', region: 'TX-South', certifications: ['cardio', 'strength', 'functional'] },
  { firstName: 'Rebecca', lastName: 'Davis', region: 'TX-East', certifications: ['flooring', 'functional'] },
  { firstName: 'Steven', lastName: 'Wilson', region: 'TX-West', certifications: ['cardio'] },
  { firstName: 'Jennifer', lastName: 'Garcia', region: 'AZ-Phoenix', certifications: ['strength', 'cardio'] },
  { firstName: 'Mark', lastName: 'Anderson', region: 'NY-Metro', certifications: ['cardio', 'flooring'] },
];

function getTechUserEmail(firstName: string, lastName: string): string {
  return `tech.${firstName.toLowerCase()}.${lastName.toLowerCase()}@commfit.com`;
}

export async function seedTechnicians(
  prisma: PrismaClient,
  users: User[],
): Promise<Technician[]> {
  console.log('  Seeding technicians...');

  const technicians: Technician[] = [];

  const createTech = async (
    techDef: { firstName: string; lastName: string; region: string; certifications: string[] },
    techType: 'in_house' | 'third_party',
  ): Promise<Technician> => {
    const email = getTechUserEmail(techDef.firstName, techDef.lastName);
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error(`User not found for email ${email}`);

    const existing = await prisma.technician.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;

    const tech = await prisma.technician.create({
      data: {
        userId: user.id,
        firstName: techDef.firstName,
        lastName: techDef.lastName,
        email,
        techType,
        region: techDef.region,
        availabilityStatus: 'available',
        status: 'active',
      },
    });

    // Create certifications
    for (const eqClass of techDef.certifications) {
      await prisma.technicianCertification.create({
        data: {
          technicianId: tech.id,
          equipmentClass: eqClass as any,
          certifiedAt: new Date(Date.now() - Math.floor(Math.random() * 730) * 86400000),
        },
      });
    }

    // Create region record
    await prisma.technicianRegion.create({
      data: {
        technicianId: tech.id,
        region: techDef.region,
      },
    });

    return tech;
  };

  for (const techDef of IN_HOUSE_TECHS) {
    const tech = await createTech(techDef, 'in_house');
    technicians.push(tech);
  }

  for (const techDef of THIRD_PARTY_TECHS) {
    const tech = await createTech(techDef, 'third_party');
    technicians.push(tech);
  }

  console.log(`  Created ${technicians.length} technicians`);
  return technicians;
}
