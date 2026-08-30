import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProducts, Product } from '@/lib/products-api';
import ProductCard from '@/components/ProductCard';

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
    let groupProducts = products.filter(p => p.subcategory === cat.title);
    return { ...cat, products: groupProducts };
  }).filter(group => group.products.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Premium Indulgence</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">Signature Gateaux</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-16">
        {categoryGroups.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Coming Soon</p>
              <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl mb-4">Nothing yet</h2>
            </div>
        ) : categoryGroups.map((group) => {
          return (
            <section key={group.slug} className="mb-20">
              <div className="flex items-start justify-between mb-5 border-b border-[#86162f]/10 pb-3">
                <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{group.title}</h2>
                <Link 
                  href={`/products/bakes/signature-gateaux/${group.slug}`}
                  className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] hover:text-[#a82043] transition-colors"
                >
                  Show All Products &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {group.products.slice(0, 3).map(p => (
                  <ProductCard key={p.id} product={p} collectionSlug="bakes" />
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
