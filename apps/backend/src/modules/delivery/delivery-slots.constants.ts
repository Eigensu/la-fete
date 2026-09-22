/** Morning, afternoon, evening — the only three windows ever offered. */
export const SLOT_TIMES = [
  { startTime: '10:00:00', endTime: '13:00:00' },
  { startTime: '15:00:00', endTime: '18:00:00' },
  { startTime: '18:00:00', endTime: '21:00:00' },
];

/** How far out slots are kept generated, counting from tomorrow. Must cover
 *  the longest lead time (48h, for signature gateaux) plus enough runway that
 *  shoppers always see a real choice of dates, not just tomorrow's.
 *
 *  The seed script and the nightly top-up job share this so their horizons
 *  line up — when they disagreed, the days between the two never got slots. */
export const ROLLING_WINDOW_DAYS = 21;

/** How far forward `getDeliverableSlots` looks when hunting for the earliest
 *  day that still has windows left. Only needs to outrun a lead time landing
 *  late in the day, which costs at most one extra day. */
export const SLOT_SEARCH_DAYS = 7;

/** Postgres `unique_violation`. Raised when two callers insert the same
 *  (date, startTime) window concurrently. */
export const PG_UNIQUE_VIOLATION = '23505';
