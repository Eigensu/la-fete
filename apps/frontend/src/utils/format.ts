export function toTitleCase(str: string | null | undefined) {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Formats a 24-hour "HH:mm:ss" delivery-slot time (as the backend stores
 * it) into a 12-hour "10 AM" / "3:30 PM" label. Falls back to the raw
 * string if it doesn't parse, so a malformed value never disappears.
 */
export function formatSlotTime(time: string | null | undefined): string {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;

  const hour24 = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return minutes === '00' ? `${hour12} ${period}` : `${hour12}:${minutes} ${period}`;
}

/**
 * Converts a free-text weight label ("500g", "1kg", "1.5 Kg") to grams, so
 * variants can sort smallest-to-largest regardless of the unit each one was
 * entered in. Unparseable labels sort last rather than breaking the order.
 */
export function weightToGrams(weight: string | null | undefined): number {
  if (!weight) return Infinity;
  const match = weight.match(/([\d.]+)\s*(kg|g)/i);
  if (!match) return Infinity;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  return unit === 'kg' ? value * 1000 : value;
}

/** Sorts a copy of variants by weight ascending (500g, 1kg, 2kg, ...). */
export function sortByWeightAsc<T extends { weight: string }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => weightToGrams(a.weight) - weightToGrams(b.weight));
}

/**
 * Splits a raw comma-separated catalogue field (e.g. "nut,milk product,soy")
 * into clean, title-cased items for display — the source data is written in
 * lowercase shorthand with inconsistent spacing around commas.
 */
export function splitTagList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => toTitleCase(item.trim()))
    .filter(Boolean);
}

/** "gluten -free" / "Gluten-Free" / "gluten free" all collapse to "glutenfree". */
const canonTag = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Words that already convey a dietary tag on their own, so the tag would
 * just repeat text the reader has already seen (a product's format label,
 * its name). Mirrors the same suppression used on product grid cards.
 */
const TAG_IMPLIED_BY: Record<string, RegExp> = {
  glutenfree: /\bgf\b|gluten[\s-]*free/i,
  vegan: /\bvegan\b/i,
  norefinedsugar: /\bsugar[\s-]*free\b/i,
  sweetenedwithnorefinedsugar: /\bsugar[\s-]*free\b/i,
  sugarfree: /\bsugar[\s-]*free\b|\bsf\b/i,
  flourless: /\bflourless\b/i,
  wholewheat: /\bwhole\s*wheat\b/i,
};

/**
 * Dietary tags (raw comma-separated field, "a, b" or "a & b") with any tag
 * already stated by `context` (e.g. the product's format label, its name)
 * dropped and duplicates collapsed — so a product page doesn't show "Gluten
 * Free Cake" as the format and then "Gluten Free" again as a badge.
 */
export function visibleDietaryTags(dietaryTags: string | null | undefined, context: string): string[] {
  if (!dietaryTags) return [];
  return dietaryTags
    .split(/,|\s&\s/)
    .map((d) => d.trim())
    .filter(Boolean)
    .filter((d) => !TAG_IMPLIED_BY[canonTag(d)]?.test(context))
    .filter((d, i, all) => all.findIndex((o) => canonTag(o) === canonTag(d)) === i);
}
