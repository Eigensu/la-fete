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
  'boozy-whole-wheat': {
    title: 'Boozy Whole Wheat',
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

// ── Helpers ──────────────────────────────────────────────────────────────────

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
