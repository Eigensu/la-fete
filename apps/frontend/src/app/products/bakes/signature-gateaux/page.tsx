import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProducts, Product } from '@/lib/products-api';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CARD_IMAGES, assignDistinctImages } from '@/lib/gallery-images';
import { ArrowLeft } from 'lucide-react';

export default async function SignatureGateauxPage() {
  const products = await fetchProducts('category=signature-gateaux');

  const categories = [
    { title: 'Dark Chocolate', slug: 'dark-chocolate' },
    { title: 'White Chocolate', slug: 'white-chocolate' },
    { title: 'Coffee', slug: 'coffee' },
    { title: 'Praline', slug: 'praline' },
    { title: 'Pistachio', slug: 'pistachio' },
    { title: 'Citrus', slug: 'citrus' },
    { title: 'Liquor Infused', slug: 'liquor-infused' },
  ];

  const categoryGroups = categories.map(cat => {
    const groupProducts = products.filter(p =>
      p.collections?.some(c => c.toLowerCase() === cat.title.toLowerCase()) ||
      p.subcategory === cat.title,
    );
    return { ...cat, products: groupProducts };
  }).filter(group => group.products.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-16 md:mt-20 px-4 sm:px-5 md:px-6 lg:px-8">
        <Link
          href="/products/bakes"
          className="inline-flex items-center gap-1.5 pt-4 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/60 hover:text-[#86162f] transition-colors"
        >
          <ArrowLeft size={12} /> Back to Bakes
        </Link>
      </div>

      <div className="text-center">
        <p className="text-[#86162f]/40 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Premium Indulgence</p>
        <h1 className="font-seasons text-[#86162f] text-4xl md:text-6xl">Signature Gateaux</h1>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8">
        {categoryGroups.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Coming Soon</p>
              <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl mb-4">Nothing yet</h2>
            </div>
        ) : categoryGroups.map((group) => {
          const rowProducts = group.products.slice(0, 4);
          const cardImages = assignDistinctImages(
            rowProducts.map(p => String(p.id ?? p.name)),
            PRODUCT_CARD_IMAGES,
          );
          return (
            <section key={group.slug} className="mb-20">
              <div className="flex items-start justify-between mb-5 border-b border-[#86162f]/10 pb-3">
                <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl">{group.title}</h2>
                <Link
                  href={`/products/bakes/signature-gateaux/${group.slug}`}
                  className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] hover:text-[#a82043] transition-colors"
                >
                  Show All Products &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {rowProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    collectionSlug="bakes"
                    fallbackImage={cardImages[String(p.id ?? p.name)]}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
