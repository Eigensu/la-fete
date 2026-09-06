export function toTitleCase(str: string | null | undefined) {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
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
