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
  tag?: string;
  subcategory?: string;
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
}

export async function fetchProducts(queryParams?: string): Promise<Product[]> {
  try {
    const url = `${API_URL}/products?limit=100${queryParams ? '&' + queryParams : ''}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const json = await res.json();
    const rawProducts = json.data || json.items || json;
    return rawProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
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
    return rawProduct;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}
