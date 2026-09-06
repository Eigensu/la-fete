import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchProducts, Product } from '@/lib/products-api';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CARD_IMAGES, assignDistinctImages } from '@/lib/gallery-images';

export default async function BakesPage() {
  const products = await fetchProducts();

  const categories = [
    { title: 'Signature Gateaux', slug: 'signature-gateaux' },
    { title: 'Tea Cakes', slug: 'tea-cakes' },
    { title: 'Tub Cakes', slug: 'tub-cakes' },
    { title: 'Bestsellers', slug: 'bestsellers' },
    { title: 'Seasonal Special', slug: 'seasonal-special' }
  ];

  const categoryGroups = categories.map(cat => {
    let groupProducts: Product[] = [];
    if (cat.slug === 'bestsellers') {
      groupProducts = products.filter(p => p.tag?.toLowerCase().includes('bestseller') || p.isFeatured);
    } else if (cat.slug === 'seasonal-special') {
      groupProducts = products.filter(p => p.tag?.toLowerCase().includes('seasonal'));
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

      <div className="mt-16 md:mt-20 text-center">
        <p className="text-[#86162f]/40 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Our Collection</p>
        <h1 className="font-seasons text-[#86162f] text-4xl md:text-6xl">Bakes</h1>
        <p className="font-poppins text-gray-500 text-sm mt-4 max-w-md mx-auto leading-relaxed">
          Handcrafted cakes and bakes, made fresh to order.
        </p>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-4 pb-12 md:pb-16">
        {categoryGroups.map((group, i) => {
          const rowProducts = group.products.slice(0, 4);
          const cardImages = assignDistinctImages(
            rowProducts.map(p => String(p.id ?? p.name)),
            PRODUCT_CARD_IMAGES,
          );
          return (
            <section key={group.slug} className={i > 0 ? 'mt-16 md:mt-24' : ''}>
              <div className="flex items-end justify-between mb-6 md:mb-8 pb-4 border-b border-[#86162f]/10">
                <div>
                  <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-2">
                    {String(i + 1).padStart(2, '0')} · {rowProducts.length} of {group.products.length}
                  </p>
                  <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl">{group.title}</h2>
                </div>
                <Link
                  href={`/products/bakes/${group.slug}`}
                  className="shrink-0 ml-8 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
                >
                  Show All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {rowProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    collectionSlug="bakes"
                    redundantTags={[group.title, group.title.replace(/s$/, '')]}
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
