import { PrismaClient, Location, Technician } from '../../generated/client';

type PartDef = {
  sku: string;
  name: string;
  description: string;
  supplier: string;
  unitCostCents: number;
};

const PARTS: PartDef[] = [
  { sku: 'TREAD-BELT-STD', name: 'Treadmill Belt Standard', description: 'Replacement running belt for standard treadmill models', supplier: 'Life Fitness Parts', unitCostCents: 8500 },
  { sku: 'TREAD-MOTOR-DC', name: 'Treadmill DC Drive Motor', description: '2.5HP DC drive motor for treadmills', supplier: 'Life Fitness Parts', unitCostCents: 22000 },
  { sku: 'TREAD-CONSOLE-LCD', name: 'Treadmill LCD Console Assembly', description: 'LCD display console replacement', supplier: 'Life Fitness Parts', unitCostCents: 18500 },
  { sku: 'TREAD-ROLLER-FRONT', name: 'Treadmill Front Roller', description: 'Front roller assembly for treadmill', supplier: 'Precor Parts', unitCostCents: 4200 },
  { sku: 'TREAD-ROLLER-REAR', name: 'Treadmill Rear Roller', description: 'Rear roller assembly for treadmill', supplier: 'Precor Parts', unitCostCents: 3800 },
  { sku: 'ELLIP-PEDAL-ARM', name: 'Elliptical Pedal Arm Assembly', description: 'Replacement pedal arm with footplate', supplier: 'Precor Parts', unitCostCents: 12500 },
  { sku: 'ELLIP-FLYWHEEL', name: 'Elliptical Flywheel', description: 'Cast iron flywheel for elliptical trainers', supplier: 'Matrix Parts', unitCostCents: 16000 },
  { sku: 'ELLIP-RESISTANCE-UNIT', name: 'Elliptical Resistance Unit', description: 'Magnetic resistance module', supplier: 'Matrix Parts', unitCostCents: 9500 },
  { sku: 'BIKE-SEAT-STANDARD', name: 'Stationary Bike Seat', description: 'Padded standard replacement seat', supplier: 'Keiser Parts', unitCostCents: 2800 },
  { sku: 'BIKE-PEDALS-PAIR', name: 'Bike Pedal Set', description: 'Pair of replacement pedals with straps', supplier: 'Keiser Parts', unitCostCents: 3500 },
  { sku: 'BIKE-CONSOLE-DISPLAY', name: 'Bike Console Display', description: 'Digital display console for stationary bikes', supplier: 'Schwinn Parts', unitCostCents: 11000 },
  { sku: 'BIKE-DRIVE-BELT', name: 'Bike Drive Belt', description: 'Poly-V drive belt for indoor bikes', supplier: 'Schwinn Parts', unitCostCents: 1800 },
  { sku: 'FLOOR-GYM-MAT-STD', name: 'Gym Rubber Mat 4x6', description: '4x6 foot 3/4" rubber gym floor mat', supplier: 'Regupol', unitCostCents: 4500 },
  { sku: 'FLOOR-TILE-INTERLOCK', name: 'Interlocking Rubber Tile', description: '24"x24" interlocking rubber floor tile', supplier: 'Greatmats', unitCostCents: 1200 },
  { sku: 'CABLE-STEEL-3/16', name: 'Steel Cable 3/16" x 10ft', description: 'Aircraft grade steel cable for strength equipment', supplier: 'Cybex Parts', unitCostCents: 950 },
  { sku: 'PULLEY-ASSY-STD', name: 'Pulley Assembly Standard', description: 'Standard pulley assembly with bearing', supplier: 'Cybex Parts', unitCostCents: 2200 },
  { sku: 'LUBE-BELT-16OZ', name: 'Treadmill Belt Lubricant 16oz', description: '100% silicone treadmill belt lubricant', supplier: 'Life Fitness Parts', unitCostCents: 1500 },
  { sku: 'GRIP-HANDLEBAR-FOAM', name: 'Foam Handlebar Grip Pair', description: 'Replacement foam handlebar grips', supplier: 'Matrix Parts', unitCostCents: 800 },
  { sku: 'BEARING-SEALED-608', name: 'Sealed Bearing 608-2RS', description: 'Standard sealed ball bearing for fitness equipment', supplier: 'Industrial Supply', unitCostCents: 350 },
  { sku: 'FUSE-15A-BLADE', name: '15A Blade Fuse Pack (10)', description: 'Pack of 10 ATO 15A blade fuses', supplier: 'AutoFuse Inc', unitCostCents: 450 },
];

export async function seedParts(
  prisma: PrismaClient,
  locations: Location[],
  technicians: Technician[],
): Promise<void> {
  console.log('  Seeding parts and inventory...');

  const parts = [];

  for (const partDef of PARTS) {
    const part = await prisma.part.upsert({
      where: { sku: partDef.sku },
      create: {
        sku: partDef.sku,
        name: partDef.name,
        description: partDef.description,
        supplier: partDef.supplier,
        unitCostCents: BigInt(partDef.unitCostCents),
        status: 'active',
      },
      update: {},
    });
    parts.push(part);
  }

  console.log(`    Created ${parts.length} parts`);

  // Create PartInventory for each location (5-50 units per part)
  let invCount = 0;
  for (const location of locations) {
    for (const part of parts) {
      const existing = await prisma.partInventory.findFirst({
        where: { partId: part.id, locationId: location.id },
      });
      if (!existing) {
        const quantity = 5 + Math.floor(Math.random() * 46);
        await prisma.partInventory.create({
          data: {
            partId: part.id,
            locationId: location.id,
            quantity,
            reorderThreshold: 5,
          },
        });
        invCount++;
      }
    }
  }

  // Create PartInventory for each in_house technician (van stock: 1-5 units)
  const inHouseTechs = technicians.filter((t) => t.techType === 'in_house');
  for (const tech of inHouseTechs) {
    // Van stocks a subset: first 10 parts
    for (const part of parts.slice(0, 10)) {
      const existing = await prisma.partInventory.findFirst({
        where: { partId: part.id, technicianId: tech.id },
      });
      if (!existing) {
        const quantity = 1 + Math.floor(Math.random() * 5);
        await prisma.partInventory.create({
          data: {
            partId: part.id,
            technicianId: tech.id,
            quantity,
            reorderThreshold: 1,
          },
        });
        invCount++;
      }
    }
  }

  console.log(`    Created ${invCount} part inventory records`);
}
