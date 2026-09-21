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
