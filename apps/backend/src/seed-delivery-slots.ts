import { AppDataSource } from './data-source';
import { DeliverySlot } from './modules/delivery/entities/delivery-slot.entity';

/** Same three windows the checkout page and DeliveryService.generateSlots
 *  offer: morning, afternoon, evening. */
const SLOT_TIMES = [
  { startTime: '10:00:00', endTime: '13:00:00' },
  { startTime: '15:00:00', endTime: '18:00:00' },
  { startTime: '18:00:00', endTime: '21:00:00' },
];

/** How many days out (from day-after-tomorrow) to keep slots generated for. */
const DAYS_AHEAD = 14;

async function seedDeliverySlots() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const slotRepo = AppDataSource.getRepository(DeliverySlot);

  // Generate from the shortest lead time any product can use (next-day, for
  // Tea/Tub Cakes) — DeliveryController's `minLeadDays` filter is what
  // actually excludes these from a slower product's (e.g. signature
  // gateaux, needing 48h) available slots at checkout.
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  let created = 0;
  let skipped = 0;

  const date = new Date(start);
  for (let day = 0; day < DAYS_AHEAD; day++) {
    for (const slot of SLOT_TIMES) {
      const existing = await slotRepo.findOne({
        where: { date: new Date(date), startTime: slot.startTime },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await slotRepo.save(
        slotRepo.create({
          date: new Date(date),
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxCapacity: 5,
        }),
      );
      created++;
    }
    date.setDate(date.getDate() + 1);
  }

  console.log(`Delivery slots seeded: ${created} created, ${skipped} already existed.`);

  await AppDataSource.destroy();
}

seedDeliverySlots().catch((err) => {
  console.error(err);
  process.exit(1);
});
