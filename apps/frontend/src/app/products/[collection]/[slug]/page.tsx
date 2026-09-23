import Link from 'next/link';
import { fetchProductBySlug, fetchProducts } from '@/lib/products-api';
import { ProductClient } from './ProductClient';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  const product = await fetchProductBySlug(slug);
  const allProducts = await fetchProducts();

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
<div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Not Found</p>
          <h2 className="font-seasons text-[#86162f] text-4xl mb-6">Product not found</h2>
          <Link
            href="/products/bakes"
            className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
          >
            ← <span className="md:hidden">Back</span><span className="hidden md:inline">Back to All Products</span>
          </Link>
        </div>
</main>
    );
  }

  return (
    <main className="min-h-screen bg-white">

      <ProductClient product={product} allProducts={allProducts} collection={collection} />
</main>
  );
}
