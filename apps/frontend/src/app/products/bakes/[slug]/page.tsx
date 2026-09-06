import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProductBySlug, fetchProducts } from '@/lib/products-api';
import { ProductClient } from './ProductClient';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  const allProducts = await fetchProducts();

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Not Found</p>
          <h2 className="font-seasons text-[#86162f] text-4xl mb-6">Product not found</h2>
          <Link
            href="/products/bakes"
            className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
          >
            ← Back to All Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="mt-16 md:mt-20" />
      <ProductClient product={product} allProducts={allProducts} collection="bakes" />
      <Footer />
    </main>
  );
}
