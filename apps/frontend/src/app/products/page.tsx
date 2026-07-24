import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProducts, Product } from '@/lib/products-api';
import ProductCard from '@/components/ProductCard';

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function generateSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  // Group by format dynamically
  const formatGroups = products.reduce((acc, p) => {
    const f = p.format ? toTitleCase(p.format) : 'Other';
    if (!acc[f]) acc[f] = [];
    acc[f].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero banner */}
      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Full Menu</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">Our Products</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-16">
        {Object.keys(formatGroups).map((format) => {
          const groupProducts = formatGroups[format];
          const formatSlug = generateSlug(format);
          
          return (
            <section key={format} className="mb-20">
              <div className="flex items-start justify-between mb-5 border-b border-[#86162f]/10 pb-3">
                <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{format}</h2>
                <Link 
                  href={`/products/category/${formatSlug}`}
                  className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] hover:text-[#a82043] transition-colors"
                >
                  Show All Products &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {groupProducts.slice(0, 3).map(p => (
                  <ProductCard key={p.id} product={p} collectionSlug={p.category?.slug || 'products'} />
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
