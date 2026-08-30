/**
 * Converts a string to Title Case while preserving specific formatting rules.
 * Examples:
 * - lotus biscoff cream cheese -> Lotus Biscoff Cream Cheese
 * - 46.5% dutch truffle cake -> 46.5% Dutch Truffle Cake
 * - boozy berry cake (whiskey) -> Boozy Berry Cake (Whiskey)
 */
export function toTitleCase(str: string | undefined | null): string {
  if (!str) return '';

  return str.replace(
    /\w\S*/g,
    (txt) => {
      // Don't modify if the word contains a number (e.g., 46.5%, 54.5%)
      if (/\d/.test(txt)) {
        return txt;
      }
      
      // Capitalize the first letter and make the rest lowercase
      // (This handles (whiskey) -> (Whiskey))
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    }
  );
}
