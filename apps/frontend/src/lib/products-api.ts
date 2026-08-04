import { ALL_PRODUCTS } from './products-data';

const isServer = typeof window === 'undefined';
const API_URL = isServer
  ? (process.env.API_URL ? `${process.env.API_URL}/api/v1` : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'))
  : '/api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  format: string;
  dietaryTags: string;
  otherTags: string;
  ingredients: string;
  sweetenerOptions: string[];
  shelfLife: string;
  allergyInformation: string;
  deliveryInstructions: string;
  nutritionalHighlight?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  category?: {
    name: string;
    slug: string;
  };
  variants: {
    id: string;
    name: string;
    price: number;
    weight: string;
    sku: string;
  }[];
  // Re-injected static fields from ALL_PRODUCTS
  flavour?: string;
  dietary?: string[];
  collections?: string[];
  shortDescription?: string;
  availableWeights?: any[];
}

function mergeStaticData(backendProduct: any): Product {
  const staticProduct = ALL_PRODUCTS.find(p => p.slug === backendProduct.slug);
  return {
    ...backendProduct,
    format: backendProduct.format || staticProduct?.format || 'Whole Cake',
    flavour: backendProduct.flavour || staticProduct?.flavour || '',
    dietary: backendProduct.dietary || staticProduct?.dietary || [],
    collections: staticProduct?.collections || [],
    shortDescription: staticProduct?.shortDescription || backendProduct.description,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=100`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const json = await res.json();
    const rawProducts = json.data || json.items || json;
    return rawProducts.map(mergeStaticData);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch product');
    }
    const rawProduct = await res.json();
    return mergeStaticData(rawProduct);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}
