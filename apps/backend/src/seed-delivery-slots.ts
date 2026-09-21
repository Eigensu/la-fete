import { AppDataSource } from './data-source';
import { DeliverySlot } from './modules/delivery/entities/delivery-slot.entity';
import {
  SLOT_TIMES,
  ROLLING_WINDOW_DAYS,
} from './modules/delivery/delivery-slots.constants';

/** Seeds exactly the horizon DeliveryService's nightly job then maintains —
 *  sharing the constant is what keeps the two from leaving a gap of
 *  slot-less days between where the seed stopped and where the job starts. */
const DAYS_AHEAD = ROLLING_WINDOW_DAYS;

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
