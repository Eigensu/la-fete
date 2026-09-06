import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProducts, Product } from '@/lib/products-api';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CARD_IMAGES, assignDistinctImages } from '@/lib/gallery-images';

function generateSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await fetchProducts();

  // Find products that match the requested format slug
  const formatProducts = products.filter(p => {
    const pSlug = p.format ? generateSlug(p.format) : 'other';
    return pSlug === slug;
  });

  // Get the display name for the format
  const formatName = formatProducts.length > 0 && formatProducts[0].format 
    ? formatProducts[0].format 
    : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (formatProducts.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Not Found</p>
          <h2 className="font-seasons text-[#86162f] text-4xl mb-6">Category not found</h2>
          <Link
            href="/products/bakes"
            className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
          >
            &larr; Back to All Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero banner */}
      <div className="mt-16 md:mt-20 text-center">
        <p className="text-[#86162f]/40 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Category</p>
        <h1 className="font-seasons text-[#86162f] text-4xl md:text-6xl capitalize">{formatName}</h1>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/products/bakes"
            className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f] hover:text-[#a82043] transition-colors"
          >
            &larr; Back to All Products
          </Link>
        </div>
        
        <section className="mb-20">
          <div className="flex items-start justify-between mb-5 border-b border-[#86162f]/10 pb-3">
            <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl capitalize">{formatName}</h2>
            <div className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]">
              {formatProducts.length} Products
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {(() => {
              const cardImages = assignDistinctImages(
                formatProducts.map(p => String(p.id ?? p.name)),
                PRODUCT_CARD_IMAGES,
              );
              return formatProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  collectionSlug={p.category?.slug || 'products'}
                  fallbackImage={cardImages[String(p.id ?? p.name)]}
                />
              ));
            })()}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
