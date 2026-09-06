/**
 * Curated pool of real bakery/dessert photography (dropped into /public) used
 * to fill product tiles, hamper panels, and gallery cells that previously
 * showed flat-color placeholders. `wallpaper1.jpg` is intentionally excluded
 * — that one is reserved for the Hero background.
 *
 * The dropped-in batch also included granola/trail-mix product shots, jar
 * labels, and photos with someone else's name or event baked into the
 * decoration (e.g. "JINAYA", "baby Dhvi") — those are deliberately left out
 * so this pool is cakes/bakes only, generically reusable anywhere on the site.
 */
export const GALLERY_IMAGES: string[] = [
  '/Gemini_Generated_Image_2vg3ls2vg3ls2vg3.png',
  '/Gemini_Generated_Image_8lekx78lekx78lek.png',
  '/Gemini_Generated_Image_aehl2jaehl2jaehl.png',
  '/Gemini_Generated_Image_cedge8cedge8cedg.png',
  '/Gemini_Generated_Image_cnlg3zcnlg3zcnlg.png',
  '/Gemini_Generated_Image_dtpdfrdtpdfrdtpd.png',
  '/Gemini_Generated_Image_pyxs6npyxs6npyxs.png',
  '/Gemini_Generated_Image_vighyovighyovigh.png',
  '/Gemini_Generated_Image_wp5afjwp5afjwp5a.png',
  '/lafete12.1.jpg',
  '/WhatsApp Image 2026-08-29 at 17.31.27 (1).jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.27 (2).jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.27.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.28 (1).jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.28.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.29 (1).jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.29.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.37.28.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.37.45.jpeg',
];

/** Small curated subset for product tiles (ProductCard / Products), kept
 * shorter so repeat products land on a manageable rotation. */
export const PRODUCT_CARD_IMAGES: string[] = [
  '/Gemini_Generated_Image_2vg3ls2vg3ls2vg3.png',
  '/Gemini_Generated_Image_8lekx78lekx78lek.png',
  '/Gemini_Generated_Image_aehl2jaehl2jaehl.png',
  '/Gemini_Generated_Image_cedge8cedge8cedg.png',
  '/WhatsApp Image 2026-08-29 at 17.31.27.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.28.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.31.29.jpeg',
  '/WhatsApp Image 2026-08-29 at 17.37.28.jpeg',
];

/** Deterministic string hash (djb2 variant) — same input always yields the
 * same output, so server and client render identically (no hydration
 * mismatch), unlike Math.random(). */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Pick an image from a pool deterministically based on a key (e.g. product
 * id/name or a hamper id). Same key always yields the same image. */
export function pickImage(key: string, pool: string[] = GALLERY_IMAGES): string {
  if (pool.length === 0) return '';
  const index = hashString(key) % pool.length;
  return pool[index];
}

/**
 * Assign one image per key so that, within this list, no image repeats until
 * the pool runs out (Fisher–Yates shuffle seeded by the first key, so the
 * same set of keys in the same order always renders the same way — no
 * hydration mismatch). Grid cards using independent per-card hashing can
 * collide by chance; a whole-row/section listing calls this once instead.
 * Falls back to letting a pool run out gracefully by repeating once every
 * item has been used, rather than throwing or leaving a card blank.
 */
export function assignDistinctImages(keys: string[], pool: string[] = GALLERY_IMAGES): Record<string, string> {
  if (keys.length === 0 || pool.length === 0) return {};

  const seed = hashString(keys.join('|'));
  const shuffled = [...pool];
  // Deterministic seeded shuffle
  let s = seed;
  const nextRand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const result: Record<string, string> = {};
  keys.forEach((key, i) => {
    result[key] = shuffled[i % shuffled.length];
  });
  return result;
}
