import { PrismaClient, Location, Equipment } from '../../generated/client';

type EquipmentSpec = {
  model: string;
  equipmentClass: 'cardio' | 'strength' | 'flooring' | 'functional' | 'other';
  supplier: string;
};

const EQUIPMENT_SPECS: EquipmentSpec[] = [
  // Cardio (40%)
  { model: 'Life Fitness Treadmill T5', equipmentClass: 'cardio', supplier: 'Life Fitness' },
  { model: 'Precor EFX 885 Elliptical', equipmentClass: 'cardio', supplier: 'Precor' },
  { model: 'Concept2 RowErg Rowing Machine', equipmentClass: 'cardio', supplier: 'Concept2' },
  { model: 'Keiser M3i Indoor Bike', equipmentClass: 'cardio', supplier: 'Keiser' },
  { model: 'Technogym MyRun Treadmill', equipmentClass: 'cardio', supplier: 'Technogym' },
  { model: 'Matrix T75 Treadmill', equipmentClass: 'cardio', supplier: 'Matrix' },
  { model: 'Cybex 770T Treadmill', equipmentClass: 'cardio', supplier: 'Cybex' },
  { model: 'StairMaster 8 Series Stepper', equipmentClass: 'cardio', supplier: 'StairMaster' },
  { model: 'NordicTrack S15i Bike', equipmentClass: 'cardio', supplier: 'NordicTrack' },
  { model: 'Life Fitness Activate Series Elliptical', equipmentClass: 'cardio', supplier: 'Life Fitness' },
  { model: 'Precor C956i Treadmill', equipmentClass: 'cardio', supplier: 'Precor' },
  { model: 'WaterRower Rowing Machine', equipmentClass: 'cardio', supplier: 'WaterRower' },
  { model: 'Schwinn AC Performance Bike', equipmentClass: 'cardio', supplier: 'Schwinn' },
  { model: 'Assault AirBike Classic', equipmentClass: 'cardio', supplier: 'Assault Fitness' },
  { model: 'Peloton Bike+', equipmentClass: 'cardio', supplier: 'Peloton' },
  { model: 'Life Fitness 95X Elliptical', equipmentClass: 'cardio', supplier: 'Life Fitness' },
  { model: 'Octane Q47 Elliptical', equipmentClass: 'cardio', supplier: 'Octane Fitness' },
  { model: 'Cybex ARC Trainer 625A', equipmentClass: 'cardio', supplier: 'Cybex' },
  { model: 'Matrix Rower R50', equipmentClass: 'cardio', supplier: 'Matrix' },
  { model: 'Nautilus R618 Recumbent Bike', equipmentClass: 'cardio', supplier: 'Nautilus' },
  { model: 'True Fitness CS900 Treadmill', equipmentClass: 'cardio', supplier: 'True Fitness' },
  { model: 'Cardio Wave CW400', equipmentClass: 'cardio', supplier: 'Cybex' },
  { model: 'Life Fitness Integrity Treadmill', equipmentClass: 'cardio', supplier: 'Life Fitness' },
  { model: 'Bowflex BXT216 Treadmill', equipmentClass: 'cardio', supplier: 'Bowflex' },
  // Strength (25%)
  { model: 'Rogue SML-2 Squat Stand', equipmentClass: 'strength', supplier: 'Rogue' },
  { model: 'Life Fitness Signature Power Rack', equipmentClass: 'strength', supplier: 'Life Fitness' },
  { model: 'Cybex VR3 Chest Press', equipmentClass: 'strength', supplier: 'Cybex' },
  { model: 'Matrix Magnum Lat Pulldown', equipmentClass: 'strength', supplier: 'Matrix' },
  { model: 'Hammer Strength MTS Incline Press', equipmentClass: 'strength', supplier: 'Hammer Strength' },
  { model: 'Life Fitness Cable Motion Dual Adjustable Pulley', equipmentClass: 'strength', supplier: 'Life Fitness' },
  { model: 'Cybex Eagle Leg Press', equipmentClass: 'strength', supplier: 'Cybex' },
  { model: 'Precor Discovery Strength Seated Leg Curl', equipmentClass: 'strength', supplier: 'Precor' },
  { model: 'Hammer Strength Ground Base Jammer', equipmentClass: 'strength', supplier: 'Hammer Strength' },
  { model: 'Matrix Varsity Series Smith Machine', equipmentClass: 'strength', supplier: 'Matrix' },
  { model: 'Nautilus One Shoulder Press', equipmentClass: 'strength', supplier: 'Nautilus' },
  { model: 'Technogym Element+ Leg Extension', equipmentClass: 'strength', supplier: 'Technogym' },
  { model: 'Life Fitness Pro2 Series Chest Fly', equipmentClass: 'strength', supplier: 'Life Fitness' },
  // Flooring (15%)
  { model: 'Regupol Athletic Rubber Tile 3/8"', equipmentClass: 'flooring', supplier: 'Regupol' },
  { model: 'Vulcanized Rubber Flooring Roll 8mm', equipmentClass: 'flooring', supplier: 'IncStores' },
  { model: 'Greatmats Rubber Gym Flooring 3/4"', equipmentClass: 'flooring', supplier: 'Greatmats' },
  { model: 'American Floor Mats Interlocking Tile', equipmentClass: 'flooring', supplier: 'American Floor Mats' },
  { model: 'Horse Stall Mats 4x6', equipmentClass: 'flooring', supplier: 'Tractor Supply' },
  { model: 'Aerobic Exercise Floor Tile 1/2"', equipmentClass: 'flooring', supplier: 'BalanceFrom' },
  { model: 'Plyo Foam Mat 4"', equipmentClass: 'flooring', supplier: 'Spri' },
  { model: 'Sport Floor Luxury Vinyl Tile', equipmentClass: 'flooring', supplier: 'Tarkett' },
  { model: 'Gerflor Taraflex Multi-Sport Flooring', equipmentClass: 'flooring', supplier: 'Gerflor' },
  // Functional (15%)
  { model: 'TRX Pro4 System', equipmentClass: 'functional', supplier: 'TRX' },
  { model: 'Rogue Utility Rig 2.0', equipmentClass: 'functional', supplier: 'Rogue' },
  { model: 'Life Fitness Synrgy 360', equipmentClass: 'functional', supplier: 'Life Fitness' },
  { model: 'Matrix Connexus Center Hub', equipmentClass: 'functional', supplier: 'Matrix' },
  { model: 'FreeMotion Dual Cable Cross 960', equipmentClass: 'functional', supplier: 'FreeMotion' },
  { model: 'Rogue Echo Sled', equipmentClass: 'functional', supplier: 'Rogue' },
  { model: 'Power Systems Vertimax Raptor', equipmentClass: 'functional', supplier: 'Power Systems' },
  { model: 'Keiser Functional Trainer FT200', equipmentClass: 'functional', supplier: 'Keiser' },
  { model: 'Scifit PRO2 Total Body', equipmentClass: 'functional', supplier: 'Scifit' },
  // Other (5%)
  { model: 'Meier Locker System 24-Unit', equipmentClass: 'other', supplier: 'Meier' },
  { model: 'Water Fountain Elkay EZH2O', equipmentClass: 'other', supplier: 'Elkay' },
  { model: 'Dyson Airblade Hand Dryer', equipmentClass: 'other', supplier: 'Dyson' },
];

const CONDITIONS: Array<'excellent' | 'good' | 'fair' | 'poor'> = [
  'excellent', 'good', 'good', 'good', 'good', 'fair', 'fair', 'poor',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86400000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86400000);
}

export async function seedEquipment(
  prisma: PrismaClient,
  locations: Location[],
): Promise<Equipment[]> {
  console.log('  Seeding equipment...');

  const equipment: Equipment[] = [];
  let specIndex = 0;

  // Distribute ~60 units across 8 locations (roughly 7-8 per location)
  for (const location of locations) {
    const count = location.name.includes('Main') || location.name.includes('Uptown') ? 9 : 7;

    for (let i = 0; i < count; i++) {
      const spec = EQUIPMENT_SPECS[specIndex % EQUIPMENT_SPECS.length];
      specIndex++;

      const installDaysAgo = 365 + Math.floor(Math.random() * 4 * 365); // 1-5 years ago
      const installDate = daysAgo(installDaysAgo);
      const hasWarranty = Math.random() > 0.4;
      const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
      const serialNumber = `SN-${spec.equipmentClass.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;

      const eq = await prisma.equipment.create({
        data: {
          accountId: location.accountId,
          locationId: location.id,
          serialNumber,
          supplier: spec.supplier,
          model: spec.model,
          equipmentClass: spec.equipmentClass,
          installDate,
          warrantyStart: hasWarranty ? installDate : null,
          warrantyEnd: hasWarranty ? daysFromNow(180 + Math.floor(Math.random() * 365)) : null,
          condition,
          repairCount: condition === 'poor' ? 3 : condition === 'fair' ? 2 : condition === 'good' ? 1 : 0,
          status: 'active',
        },
      });

      equipment.push(eq);
    }
  }

  console.log(`  Created ${equipment.length} equipment units`);
  return equipment;
}
