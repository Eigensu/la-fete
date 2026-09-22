import moment from 'moment-timezone';

/**
 * Every kitchen slot is a Mumbai wall-clock time. Pinned explicitly rather
 * than inherited from the server clock: the API runs in UTC, while `date`
 * and `startTime` are bare DATE/TIME columns carrying no zone of their own.
 * Comparing a UTC "now" against an IST wall-clock slot hands out an extra
 * 5h30m of leeway — always in the permissive direction.
 */
export const DELIVERY_TIMEZONE = process.env.DELIVERY_TIMEZONE || 'Asia/Kolkata';

/** Tea Cakes and Tub Cakes ship next-day; everything else (signature gateaux
 *  and other celebration cakes) needs the full 48 hours to make. */
const NEXT_DAY_FORMATS = ['tea cake', 'tub cake'];

export const MIN_LEAD_DAYS = 1;
export const DEFAULT_LEAD_DAYS = 2;
/** Nothing legitimate asks to look further out than this; the cap stops a
 *  query param from pushing the search window into next year. */
export const MAX_LEAD_DAYS = 14;

const DATE_FORMAT = 'YYYY-MM-DD';
const HOURS_PER_DAY = 24;
const MS_PER_HOUR = 60 * 60 * 1000;

export function leadDaysForFormat(format?: string | null): number {
  return NEXT_DAY_FORMATS.includes((format || '').trim().toLowerCase())
    ? 1
    : DEFAULT_LEAD_DAYS;
}

/** The slowest lead time across a basket — one 48-hour gateau holds back the
 *  whole order, even sharing a cart with next-day tea cakes. */
export function leadDaysForFormats(
  formats: (string | null | undefined)[],
): number {
  if (formats.length === 0) return DEFAULT_LEAD_DAYS;
  return formats.reduce<number>(
    (slowest, format) => Math.max(slowest, leadDaysForFormat(format)),
    MIN_LEAD_DAYS,
  );
}

/** Clamps a client-supplied `minLeadDays` into a sane range, falling back to
 *  the 2-day floor for anything unparseable. */
export function clampLeadDays(raw: unknown): number {
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LEAD_DAYS;
  return Math.min(MAX_LEAD_DAYS, Math.max(MIN_LEAD_DAYS, parsed));
}

/**
 * The earliest instant an order placed at `now` may be delivered — a real
 * elapsed duration, not a calendar boundary.
 *
 * Rounding this up to midnight is what let a 23:00 order take a 10:00
 * next-day window: 11 hours of notice against an advertised 24.
 */
export function earliestDeliveryInstant(
  leadDays: number,
  now: Date = new Date(),
): Date {
  return new Date(now.getTime() + leadDays * HOURS_PER_DAY * MS_PER_HOUR);
}

/** Normalises TypeORM's DATE column, which arrives as a 'YYYY-MM-DD' string
 *  from Postgres but as a Date when one was set in memory. */
export function toDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return moment(date).format(DATE_FORMAT);
}

/** A slot's start as a real instant, by reading its bare date and time as
 *  wall-clock in the delivery timezone. */
export function slotStartInstant(date: Date | string, startTime: string): Date {
  return moment
    .tz(
      `${toDateString(date)} ${startTime}`,
      `${DATE_FORMAT} HH:mm:ss`,
      DELIVERY_TIMEZONE,
    )
    .toDate();
}

/** Whether a slot leaves enough notice for an order placed at `now`. */
export function isSlotDeliverable(
  slot: { date: Date | string; startTime: string },
  leadDays: number,
  now: Date = new Date(),
): boolean {
  return (
    slotStartInstant(slot.date, slot.startTime).getTime() >=
    earliestDeliveryInstant(leadDays, now).getTime()
  );
}

/** The delivery-timezone calendar date an instant falls on. */
export function zonedDateString(instant: Date): string {
  return moment(instant).tz(DELIVERY_TIMEZONE).format(DATE_FORMAT);
}

export function addDaysToDateString(date: string, days: number): string {
  return moment(date, DATE_FORMAT).add(days, 'days').format(DATE_FORMAT);
}

/** Parses a caller-supplied date param, returning null for anything that is
 *  not a real date so the caller can fall back to its own window. */
export function parseDateParam(raw?: string): string | null {
  if (!raw) return null;
  const parsed = moment(raw, [DATE_FORMAT, moment.ISO_8601], true);
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : null;
}
