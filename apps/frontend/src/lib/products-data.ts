export interface WeightOption {
  weight: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  flavour: string;
  dietary: string[];
  format: string;
  collections: string[];
  featured?: boolean;
  shortDescription?: string;
  longDescription?: string;
  tasteProfile?: string;
  ingredients?: string;
  allergens?: string;
  storage?: string;
  serves?: string;
  availableWeights?: WeightOption[];
  sweetenerOptions?: string[];
}

export interface CollectionMeta {
  title: string;
  subtitle: string;
  description: string;
  group: 'cakes' | 'petite-indulgence' | 'dynamic';
}

export const COLLECTION_META: Record<string, CollectionMeta> = {
  'whole-wheat': {
    title: 'Whole Wheat',
    subtitle: 'Cakes',
    description: 'Rich, indulgent cakes crafted with whole wheat flour.',
    group: 'cakes',
  },
  'vegan-sugar-free': {
    title: 'Vegan & Sugar Free',
    subtitle: 'Cakes',
    description: 'Plant-based and refined sugar-free — indulgence without compromise.',
    group: 'cakes',
  },
  'gf-sugar-free': {
    title: 'GF & Sugar Free',
    subtitle: 'Cakes',
    description: 'Gluten-free and sugar-free cakes for every celebration.',
    group: 'cakes',
  },
  'liquor-infused': {
    title: 'Liquor-infused',
    subtitle: 'Cakes',
    description: 'Whole wheat cakes with a grown-up, spirited twist.',
    group: 'cakes',
  },
  'tea-cakes': {
    title: 'Tea Cakes',
    subtitle: 'Petite Indulgence',
    description: 'Light, delicate bakes perfect alongside your favourite brew.',
    group: 'petite-indulgence',
  },
  'tub-cakes': {
    title: 'Tub Cakes',
    subtitle: 'Petite Indulgence',
    description: 'Whole wheat cakes in elegant tubs — gifting-ready and utterly delicious.',
    group: 'petite-indulgence',
  },
  'bestsellers': {
    title: 'Bestsellers',
    subtitle: 'Shop All',
    description: 'Our most-loved creations, as chosen by you.',
    group: 'dynamic',
  },
  'special': {
    title: 'Special',
    subtitle: 'Shop All',
    description: 'Seasonal and limited edition offerings.',
    group: 'dynamic',
  },
};

// ── Weight presets ──────────────────────────────────────────────────────────
const WW: WeightOption[]       = [{ weight: '500g', price: 780  }, { weight: '1kg', price: 1450 }, { weight: '1.5kg', price: 2080 }, { weight: '2kg', price: 2700 }];
const WW_P: WeightOption[]     = [{ weight: '500g', price: 850  }, { weight: '1kg', price: 1580 }, { weight: '1.5kg', price: 2280 }, { weight: '2kg', price: 2950 }];
const VEGAN: WeightOption[]    = [{ weight: '500g', price: 900  }, { weight: '1kg', price: 1700 }, { weight: '1.5kg', price: 2450 }];
const GF: WeightOption[]       = [{ weight: '500g', price: 950  }, { weight: '1kg', price: 1800 }];
const LIQUOR: WeightOption[]   = [{ weight: '500g', price: 1000 }, { weight: '1kg', price: 1900 }];
const TEA: WeightOption[]      = [{ weight: '350g', price: 280  }, { weight: '500g', price: 380  }];
const TUB: WeightOption[]      = [{ weight: '350g', price: 480  }, { weight: '500g', price: 680  }];

// ── Sweetener presets ───────────────────────────────────────────────────────
const SW_WW     = ['Jaggery', 'Date', 'Coconut Jaggery', 'Cane Sugar'];
const SW_VEGAN  = ['Jaggery', 'Date Sugar', 'Coconut Sugar'];
const SW_GF     = ['Jaggery', 'Date Sugar'];
const SW_LIQUOR = ['Jaggery', 'Cane Sugar'];
const SW_TUB    = ['Jaggery', 'Cane Sugar'];

export const ALL_PRODUCTS: Product[] = [
  // ── WHOLE WHEAT ─────────────────────────────────────────────────────────
  {
    id: 'ww-1', slug: '465-dutch-truffle-cake',
    name: '46.5% Dutch Truffle Cake', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Whole Cake',
    featured: true,
    collections: ['whole-wheat', 'tub-cakes'],
    shortDescription: 'A deeply rich chocolate cake with Dutch truffle notes and a moist whole wheat crumb.',
    availableWeights: WW, sweetenerOptions: SW_WW,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-2', slug: '545-belgium-dark-chocolate-cake',
    name: '54.5% Belgium Dark Chocolate Cake', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat'],
    shortDescription: 'Intense dark chocolate from premium Belgian couverture, built on a whole wheat base.',
    availableWeights: WW, sweetenerOptions: SW_WW,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-3', slug: 'espresso-dark-chocolate-mousse-cake',
    name: 'Espresso Dark Chocolate Mousse Cake', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat'],
    shortDescription: 'Velvety dark chocolate mousse layered with an espresso-kissed whole wheat cake.',
    availableWeights: WW, sweetenerOptions: SW_WW,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-4', slug: 'almond-praline-dark-chocolate',
    name: 'Almond Praline Dark Chocolate', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat'],
    shortDescription: 'Dark chocolate and caramelised almond praline — equal parts crunch and richness.',
    availableWeights: WW_P, sweetenerOptions: SW_WW,
    allergens: 'Contains almonds and nuts. Made in a facility that handles dairy and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-5', slug: 'sea-salt-caramel-hazelnut-praline-dark-chocolate',
    name: 'Sea Salt Caramel Hazelnut Praline Dark Chocolate', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Whole Cake',
    featured: true,
    collections: ['whole-wheat', 'tub-cakes'],
    shortDescription: 'Salty-sweet perfection: dark chocolate, hazelnut praline, and a sea salt caramel finish.',
    availableWeights: WW_P, sweetenerOptions: SW_WW,
    allergens: 'Contains hazelnuts and nuts. Made in a facility that handles dairy and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-6', slug: 'dark-chocolate-peanut-butter-salted-caramel-cake',
    name: 'Dark Chocolate Peanut Butter Salted Caramel Cake', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat'],
    shortDescription: 'Bold peanut butter and dark chocolate layered with salted caramel on a whole wheat crumb.',
    availableWeights: WW_P, sweetenerOptions: SW_WW,
    allergens: 'Contains peanuts. Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-7', slug: 'dark-chocolate-pistachio-cake',
    name: 'Dark Chocolate Pistachio Cake', flavour: 'Pistachio', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat'],
    shortDescription: 'Deep dark chocolate meets the nuttiness of pistachio on a whole wheat crumb.',
    availableWeights: WW_P, sweetenerOptions: SW_WW,
    allergens: 'Contains pistachios and nuts. Made in a facility that handles dairy and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-8', slug: 'raspberry-pistachio-vanilla-cake',
    name: 'Raspberry Pistachio Vanilla Cake', flavour: 'Pistachio', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat'],
    shortDescription: 'Fruity raspberry, delicate pistachio, and vanilla cream on a whole wheat base.',
    availableWeights: WW_P, sweetenerOptions: SW_WW,
    allergens: 'Contains pistachios and nuts. Made in a facility that handles dairy and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-9', slug: 'rose-pistachio-vanilla-cake',
    name: 'Rose Pistachio Vanilla Cake', flavour: 'Pistachio', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat', 'tub-cakes'],
    shortDescription: 'Fragrant rose water and pistachio woven through a light vanilla whole wheat cake.',
    availableWeights: WW_P, sweetenerOptions: SW_WW,
    allergens: 'Contains pistachios and nuts. Made in a facility that handles dairy and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-10', slug: 'citrus-lemon-vanilla',
    name: 'Citrus Lemon Vanilla', flavour: 'Citrus', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat', 'tub-cakes'],
    shortDescription: 'Bright lemon zest and vanilla cream layered over a tender whole wheat sponge.',
    availableWeights: WW, sweetenerOptions: SW_WW,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'ww-11', slug: 'zesty-orange-dark-chocolate',
    name: 'Zesty Orange Dark Chocolate', flavour: 'Citrus', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['whole-wheat', 'tub-cakes'],
    shortDescription: 'Dark chocolate with a bright orange citrus note — a sophisticated whole wheat pairing.',
    availableWeights: WW, sweetenerOptions: SW_WW,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },

  // ── VEGAN & SUGAR FREE ──────────────────────────────────────────────────
  {
    id: 'vs-1', slug: 'vegan-dark-chocolate-cake',
    name: 'Vegan Dark Chocolate Cake', flavour: 'Chocolate', dietary: ['Vegan', 'Sugar Free'], format: 'Whole Cake',
    featured: true,
    collections: ['vegan-sugar-free'],
    shortDescription: 'A fully plant-based dark chocolate cake — no dairy, no eggs, no refined sugar, no compromise.',
    availableWeights: VEGAN, sweetenerOptions: SW_VEGAN,
    allergens: 'May contain traces of nuts. Made in a shared facility.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'vs-2', slug: 'vegan-mocha-cake',
    name: 'Vegan Mocha Cake', flavour: 'Chocolate', dietary: ['Vegan', 'Sugar Free'], format: 'Whole Cake',
    collections: ['vegan-sugar-free'],
    shortDescription: 'Coffee and dark chocolate, plant-based and refined sugar-free — indulgence without guilt.',
    availableWeights: VEGAN, sweetenerOptions: SW_VEGAN,
    allergens: 'May contain traces of nuts. Made in a shared facility.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'vs-3', slug: 'sea-salt-hazelnut-praline-vegan-dark-chocolate',
    name: 'Sea Salt Hazelnut Praline Vegan Dark Chocolate', flavour: 'Chocolate', dietary: ['Vegan', 'Sugar Free'], format: 'Whole Cake',
    collections: ['vegan-sugar-free'],
    shortDescription: 'Vegan dark chocolate meets hazelnut praline and a flicker of sea salt — completely plant-based.',
    availableWeights: VEGAN, sweetenerOptions: SW_VEGAN,
    allergens: 'Contains hazelnuts. Made in a shared facility.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'vs-4', slug: 'raspberry-pistachio-vegan-vanilla',
    name: 'Raspberry Pistachio Vegan Vanilla', flavour: 'Pistachio', dietary: ['Vegan', 'Sugar Free'], format: 'Whole Cake',
    collections: ['vegan-sugar-free'],
    shortDescription: 'Fresh raspberry and pistachio in a vegan vanilla cake, free from dairy and refined sugar.',
    availableWeights: VEGAN, sweetenerOptions: SW_VEGAN,
    allergens: 'Contains pistachios. Made in a shared facility.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'vs-5', slug: '70-dark-chocolate-vegan-orange-cake',
    name: '70% Dark Chocolate Vegan Orange Cake', flavour: 'Citrus', dietary: ['Vegan', 'Sugar Free'], format: 'Whole Cake',
    collections: ['vegan-sugar-free'],
    shortDescription: 'An assertively dark 70% chocolate cake with a burst of orange — vegan and sugar-free.',
    availableWeights: VEGAN, sweetenerOptions: SW_VEGAN,
    allergens: 'May contain traces of nuts. Made in a shared facility.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },

  // ── GF & SUGAR FREE ─────────────────────────────────────────────────────
  {
    id: 'gf-1', slug: 'classic-gooey-dark-chocolate-cake',
    name: 'Classic Gooey Dark Chocolate Cake', flavour: 'Chocolate', dietary: ['Gluten Free', 'Sugar Free'], format: 'Whole Cake',
    featured: true,
    collections: ['gf-sugar-free'],
    shortDescription: 'Our most classic gluten-free cake — dense, gooey, and intensely chocolatey.',
    availableWeights: GF, sweetenerOptions: SW_GF,
    allergens: 'Made in a facility that handles nuts and dairy. Gluten-free ingredients only.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'gf-2', slug: 'hazelnut-dark-chocolate-cake',
    name: 'Hazelnut Dark Chocolate Cake', flavour: 'Chocolate', dietary: ['Gluten Free', 'Sugar Free'], format: 'Whole Cake',
    collections: ['gf-sugar-free'],
    shortDescription: 'Dark chocolate and hazelnut in a moist, gluten-free, sugar-free cake.',
    availableWeights: GF, sweetenerOptions: SW_GF,
    allergens: 'Contains hazelnuts. Made in a facility that handles nuts and dairy.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'gf-3', slug: 'almond-dark-chocolate-cake',
    name: 'Almond Dark Chocolate Cake', flavour: 'Chocolate', dietary: ['Gluten Free', 'Sugar Free'], format: 'Whole Cake',
    collections: ['gf-sugar-free'],
    shortDescription: 'Ground almonds and dark chocolate create a naturally dense, gluten-free celebration cake.',
    availableWeights: GF, sweetenerOptions: SW_GF,
    allergens: 'Contains almonds. Made in a facility that handles nuts and dairy.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },

  // ── LIQUOR-INFUSED ───────────────────────────────────────────────────────
  {
    id: 'li-1', slug: 'baileys-coffee-crave',
    name: "Bailey's Coffee Crave", flavour: 'Liquor Infused', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['liquor-infused'],
    shortDescription: 'A whole wheat cake soaked in Baileys and espresso — indulgent, spirited, and impossible to resist.',
    availableWeights: LIQUOR, sweetenerOptions: SW_LIQUOR,
    allergens: 'Contains alcohol. Made in a facility that handles dairy and nuts. Not suitable for minors.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'li-2', slug: 'whiskey-dutch-truffle',
    name: 'Whiskey Dutch Truffle', flavour: 'Liquor Infused', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['liquor-infused', 'tub-cakes'],
    shortDescription: 'Dutch truffle cake enriched with a whiskey soak — for those who like their desserts bold.',
    availableWeights: LIQUOR, sweetenerOptions: SW_LIQUOR,
    allergens: 'Contains alcohol. Made in a facility that handles dairy and nuts. Not suitable for minors.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },
  {
    id: 'li-3', slug: 'boozy-berry-cake',
    name: 'Boozy Berry Cake (Whiskey)', flavour: 'Liquor Infused', dietary: ['Whole Wheat'], format: 'Whole Cake',
    collections: ['liquor-infused'],
    shortDescription: 'A fruity, whiskey-kissed cake with berry layers on a whole wheat base.',
    availableWeights: LIQUOR, sweetenerOptions: SW_LIQUOR,
    allergens: 'Contains alcohol. Made in a facility that handles dairy and nuts. Not suitable for minors.',
    storage: 'Best consumed within 3 days. Refrigerate after delivery.',
  },

  // ── TEA CAKES ───────────────────────────────────────────────────────────
  {
    id: 'tc-1', slug: 'date-and-walnut',
    name: 'Date & Walnut', flavour: 'Nutty', dietary: ['Gluten Free'], format: 'Tea Cake',
    collections: ['tea-cakes'],
    shortDescription: 'A classic gluten-free tea cake — chewy dates, toasted walnuts, and a naturally sweet crumb.',
    serves: 'Serves 4–6',
    availableWeights: TEA,
    allergens: 'Contains walnuts and nuts. Made in a shared facility.',
    storage: 'Best consumed within 4 days. Store in a cool, dry place or refrigerate.',
  },
  {
    id: 'tc-2', slug: 'caramelized-orange-vanilla-cake',
    name: 'Caramelized Orange Vanilla Cake', flavour: 'Citrus', dietary: ['Gluten Free'], format: 'Tea Cake',
    collections: ['tea-cakes'],
    shortDescription: 'Slow-caramelised orange and vanilla in a gluten-free tea cake built for any time of day.',
    serves: 'Serves 4–6',
    availableWeights: TEA,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 4 days. Refrigerate after delivery.',
  },
  {
    id: 'tc-3', slug: 'carrot-cake',
    name: 'Carrot Cake', flavour: 'Spiced', dietary: ['Whole Wheat'], format: 'Tea Cake',
    collections: ['tea-cakes'],
    shortDescription: 'A wholesome whole wheat carrot cake — warmly spiced and topped with cream cheese.',
    serves: 'Serves 4–6',
    availableWeights: TEA,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 4 days. Refrigerate after delivery.',
  },
  {
    id: 'tc-4', slug: 'banana-bread',
    name: 'Banana Bread', flavour: 'Fruity', dietary: ['Whole Wheat'], format: 'Tea Cake',
    featured: true,
    collections: ['tea-cakes'],
    shortDescription: 'Our signature whole wheat banana bread — moist, lightly sweet, and endlessly snackable.',
    serves: 'Serves 4–6',
    availableWeights: TEA,
    allergens: 'Made in a facility that handles dairy, nuts, and eggs.',
    storage: 'Best consumed within 4 days. Store in a cool, dry place.',
  },
  {
    id: 'tc-5', slug: 'almond-cake',
    name: 'Almond Cake', flavour: 'Nutty', dietary: ['Flourless', 'High Protein'], format: 'Tea Cake',
    collections: ['tea-cakes'],
    shortDescription: 'A simple, flourless almond cake — dense, protein-rich, and naturally delicious.',
    serves: 'Serves 4–6',
    availableWeights: TEA,
    allergens: 'Contains almonds and nuts. Made in a shared facility.',
    storage: 'Best consumed within 4 days. Refrigerate after delivery.',
  },

  // ── TUB CAKES (unique) ──────────────────────────────────────────────────
  {
    id: 'tb-1', slug: 'saffron-vanilla-milk-cake',
    name: 'Saffron Vanilla Milk Cake', flavour: 'White Chocolate', dietary: ['Whole Wheat'], format: 'Tub Cake',
    collections: ['tub-cakes'],
    shortDescription: 'Delicate saffron-infused milk cake with vanilla cream — in an elegant take-away tub.',
    serves: 'Serves 2–3',
    availableWeights: TUB, sweetenerOptions: SW_TUB,
    allergens: 'Made in a facility that handles dairy and nuts.',
    storage: 'Refrigerate immediately. Best consumed within 2 days.',
  },
  {
    id: 'tb-2', slug: 'tres-leches',
    name: 'Tres Leches', flavour: 'White Chocolate', dietary: ['Whole Wheat'], format: 'Tub Cake',
    collections: ['tub-cakes'],
    shortDescription: 'Our take on the classic — three-milk soaked whole wheat sponge in a gifting-ready tub.',
    serves: 'Serves 2–3',
    availableWeights: TUB, sweetenerOptions: SW_TUB,
    allergens: 'Contains dairy. Made in a facility that handles nuts and eggs.',
    storage: 'Refrigerate immediately. Best consumed within 2 days.',
  },
  {
    id: 'tb-3', slug: 'filter-coffee-tiramisu-cake',
    name: 'Filter Coffee Tiramisu Cake', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Tub Cake',
    collections: ['tub-cakes'],
    shortDescription: 'Filter coffee and mascarpone-inspired layers in a whole wheat tub cake.',
    serves: 'Serves 2–3',
    availableWeights: TUB, sweetenerOptions: SW_TUB,
    allergens: 'Contains dairy. Made in a facility that handles nuts and eggs.',
    storage: 'Refrigerate immediately. Best consumed within 2 days.',
  },
  {
    id: 'tb-4', slug: 'lotus-biscoff-cream-cheese',
    name: 'Lotus Biscoff Cream Cheese', flavour: 'Chocolate', dietary: ['Whole Wheat'], format: 'Tub Cake',
    featured: true,
    collections: ['tub-cakes'],
    shortDescription: 'Biscoff spread and cream cheese swirled over a whole wheat base — the crowd pleaser.',
    serves: 'Serves 2–3',
    availableWeights: TUB, sweetenerOptions: SW_TUB,
    allergens: 'Contains dairy and gluten (Biscoff). Made in a facility that handles nuts and eggs.',
    storage: 'Refrigerate immediately. Best consumed within 2 days.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getProductsByCollection(slug: string): Product[] {
  if (slug === 'bestsellers') return ALL_PRODUCTS.filter(p => p.featured);
  if (slug === 'special') return [];
  return ALL_PRODUCTS.filter(p => p.collections.includes(slug));
}

export function getProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.slug === slug);
}

export function getSimilarProducts(product: Product, limit = 6): Product[] {
  const fromSameCollection = ALL_PRODUCTS.filter(
    p => p.id !== product.id && p.collections.some(c => product.collections.includes(c))
  );
  if (fromSameCollection.length >= limit) return fromSameCollection.slice(0, limit);

  const extra = ALL_PRODUCTS.filter(
    p => p.id !== product.id &&
    !fromSameCollection.find(x => x.id === p.id) &&
    p.format === product.format
  );
  return [...fromSameCollection, ...extra].slice(0, limit);
}

export function getLowestPrice(product: Product): number | null {
  if (!product.availableWeights?.length) return null;
  return Math.min(...product.availableWeights.map(w => w.price));
}

export function uniqueValues(products: Product[], key: 'flavour' | 'format' | 'dietary'): string[] {
  const vals = products.flatMap(p => {
    const v = p[key];
    return Array.isArray(v) ? v : [v];
  });
  return [...new Set(vals)].sort();
}
