const isServer = typeof window === 'undefined';

// On the client every call goes through the /api rewrite in next.config.ts.
// On the server we need the backend origin directly. Never fall back to
// localhost in production: that turns a missing env var into ECONNREFUSED
// 127.0.0.1:3001 at request time instead of a message that says what is wrong.
function resolveApiUrl(): string {
  if (!isServer) return '/api';

  if (process.env.API_URL) return `${process.env.API_URL}/api/v1`;
  // NEXT_PUBLIC_API_URL is expected to already include the /api/v1 suffix.
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'API_URL is not set, so there is no backend to fetch products from. ' +
        'Set API_URL to the backend origin (no trailing /api/v1) for the ' +
        'Production environment and redeploy.',
    );
  }

  return 'http://localhost:3001/api/v1';
}

const API_URL = resolveApiUrl();

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
