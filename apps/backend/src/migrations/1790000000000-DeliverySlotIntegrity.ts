import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cleans up the delivery_slots table and then guards it with a unique index.
 *
 * Three things are entangled here and have to happen in this order:
 *
 *  1. The afternoon window moved from 14:00-17:00 to 15:00-18:00, but nothing
 *     retired the rows already seeded at 14:00. Availability returns every
 *     active row, so those databases offer a fourth afternoon window.
 *  2. Slot creation had no de-duplication before the idempotence check landed,
 *     so a live table may already hold several rows for one (date, startTime).
 *  3. Only once 1 and 2 are resolved can a unique index be created — on a
 *     table with existing duplicates, CREATE UNIQUE INDEX simply fails.
 *
 * Nothing is deleted. `orders.deliverySlotId` references delivery_slots with
 * ON DELETE NO ACTION, and a duplicate or stale row may carry bookings for
 * real orders, so removing one would either fail on the constraint or strand a
 * confirmed delivery. Deactivating keeps those orders intact and their
 * deliveries scheduled, while taking the row out of availability so nobody
 * books into it again.
 *
 * That is also why the index is PARTIAL (`WHERE "isActive"`): the retired rows
 * stay in the table forever, and a full constraint would collide with them.
 * The business rule is "at most one bookable window per date and time", which
 * is what the partial index states.
 */
export class DeliverySlotIntegrity1790000000000 implements MigrationInterface {
  name = 'DeliverySlotIntegrity1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Retire the superseded 14:00 afternoon window. Only future dates —
    //    past slots are delivery history and are left exactly as they are.
    const retired = await queryRunner.query(`
      UPDATE "delivery_slots"
      SET "isActive" = false
      WHERE "startTime" = '14:00:00'
        AND "date" >= CURRENT_DATE
        AND "isActive" = true
      RETURNING "id"
    `);

    // 2. Collapse duplicate (date, startTime) rows to a single active one.
    //    The survivor is the row carrying the most bookings, so the losers are
    //    as close to empty as the data allows; ties break on age, then id, to
    //    keep the choice deterministic across replicas.
    const deduped = await queryRunner.query(`
      WITH ranked AS (
        SELECT "id",
               ROW_NUMBER() OVER (
                 PARTITION BY "date", "startTime"
                 ORDER BY "currentBookings" DESC, "createdAt" ASC, "id" ASC
               ) AS rn
        FROM "delivery_slots"
        WHERE "isActive" = true
      )
      UPDATE "delivery_slots" s
      SET "isActive" = false
      FROM ranked
      WHERE s."id" = ranked."id" AND ranked.rn > 1
      RETURNING s."id"
    `);

    // 3. Now the table can carry the guarantee that generateSlots assumes.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_delivery_slots_active_date_start_time"
      ON "delivery_slots" ("date", "startTime")
      WHERE "isActive" = true
    `);

    // eslint-disable-next-line no-console
    console.log(
      `DeliverySlotIntegrity: retired ${retired?.length ?? 0} stale 14:00 slot(s), ` +
        `deactivated ${deduped?.length ?? 0} duplicate slot(s).`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_delivery_slots_active_date_start_time"`,
    );
    // The deactivations are deliberately not reversed. Which rows were stale
    // 14:00 windows and which were duplicates is not recoverable afterwards,
    // and reactivating them would put the double-booking and phantom-window
    // problems straight back. Rolling the schema back does not mean the data
    // problem was imaginary.
  }
}
