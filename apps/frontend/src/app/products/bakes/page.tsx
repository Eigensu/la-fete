import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProducts, Product } from '@/lib/products-api';
import ProductCard from '@/components/ProductCard';

export default async function BakesPage() {
  const products = await fetchProducts();

  const categories = [
    { title: 'Bestsellers', slug: 'bestsellers' },
    { title: 'SZN Special', slug: 'szn-special' },
    { title: 'Signature Gateaux', slug: 'signature-gateaux' },
    { title: 'Tea Cakes', slug: 'tea-cakes' },
    { title: 'Tub Cakes', slug: 'tub-cakes' }
  ];

  const categoryGroups = categories.map(cat => {
    let groupProducts: Product[] = [];
    if (cat.slug === 'bestsellers') {
      groupProducts = products.filter(p => p.tag?.toLowerCase().includes('bestseller') || p.isFeatured);
    } else if (cat.slug === 'szn-special') {
      groupProducts = products.filter(p => p.tag?.toLowerCase().includes('seasonal') || p.tag?.toLowerCase().includes('szn'));
    } else if (cat.slug === 'signature-gateaux') {
      groupProducts = products.filter(p => p.category?.slug === 'signature-gateaux');
    } else if (cat.slug === 'tea-cakes') {
      groupProducts = products.filter(p => p.category?.slug === 'tea-cakes');
    } else if (cat.slug === 'tub-cakes') {
      groupProducts = products.filter(p => p.category?.slug === 'tub-cakes');
    }
    return { ...cat, products: groupProducts };
  }).filter(group => group.products.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Our Collection</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">Bakes</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-16">
        {categoryGroups.map((group) => {
          return (
            <section key={group.slug} className="mb-20">
              <div className="flex items-start justify-between mb-5 border-b border-[#86162f]/10 pb-3">
                <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{group.title}</h2>
                <Link 
                  href={`/products/bakes/${group.slug}`}
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
