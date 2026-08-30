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

  const categories = [
    { title: 'Whole Wheat', slug: 'whole-wheat' },
    { title: 'Vegan & Sugar Free', slug: 'vegan-sugar-free' },
    { title: 'GF & Sugar Free', slug: 'gf-sugar-free' },
    { title: 'Boozy Whole Wheat', slug: 'boozy-whole-wheat' },
    { title: 'Tea Cakes', slug: 'tea-cakes' },
    { title: 'Tub Cakes', slug: 'tub-cakes' }
  ];

  const categoryGroups = categories.map(cat => {
    let groupProducts: Product[] = [];
    if (cat.slug === 'boozy-whole-wheat') {
      groupProducts = products.filter(p => p.name.toLowerCase().includes('whiskey') || p.name.toLowerCase().includes('bailey'));
    } else if (cat.slug === 'tea-cakes') {
      groupProducts = products.filter(p => p.format?.toLowerCase() === 'tea cake');
    } else if (cat.slug === 'tub-cakes') {
      groupProducts = products.filter(p => p.format?.toLowerCase() === 'tub cake');
    } else if (cat.slug === 'whole-wheat') {
      groupProducts = products.filter(p => p.dietaryTags?.toLowerCase().includes('whole wheat') && p.format?.toLowerCase() !== 'tub cake' && p.format?.toLowerCase() !== 'tea cake' && !p.name.toLowerCase().includes('whiskey') && !p.name.toLowerCase().includes('bailey'));
    } else if (cat.slug === 'vegan-sugar-free') {
      groupProducts = products.filter(p => p.dietaryTags?.toLowerCase().includes('vegan'));
    } else if (cat.slug === 'gf-sugar-free') {
      groupProducts = products.filter(p => p.dietaryTags?.toLowerCase().includes('gluten'));
    }
    return { ...cat, products: groupProducts };
  }).filter(group => group.products.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero banner */}
      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Full Menu</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">Our Products</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-16">
        {categoryGroups.map((group) => {
          return (
            <section key={group.slug} className="mb-20">
              <div className="flex items-start justify-between mb-5 border-b border-[#86162f]/10 pb-3">
                <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{group.title}</h2>
                <Link 
                  href={`/products/${group.slug}`}
                  className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] hover:text-[#a82043] transition-colors"
                >
                  Show All Products &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {group.products.slice(0, 3).map(p => (
                  <ProductCard key={p.id} product={p} collectionSlug={group.slug} />
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
