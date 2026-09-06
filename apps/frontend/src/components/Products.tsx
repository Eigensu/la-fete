import Image from 'next/image';
import Link from 'next/link';
import { COLLECTION_META } from '@/lib/products-data';
import { fetchProducts, Product } from '@/lib/products-api';
import { toTitleCase } from '@/utils/format';
import { PRODUCT_CARD_IMAGES, assignDistinctImages } from '@/lib/gallery-images';

const CARD_BG = '#f8aeb2';

const NAV_COLLECTIONS = [
  'whole-wheat',
  'vegan-sugar-free',
  'gf-sugar-free',
  'boozy-whole-wheat',
  'tea-cakes',
  'tub-cakes',
] as const;

export default async function Products() {
  const allProducts = await fetchProducts();
  
  const getProductForCollection = (slug: string) => {
    // Map the local slug to the corresponding format in the DB
    const formatMap: Record<string, string> = {
      'whole-wheat': 'whole wheat cake',
      'vegan-sugar-free': 'vegan cake',
      'gf-sugar-free': 'gluten free cake',
      'boozy-whole-wheat': 'boozy', // Just picking one if it exists or matches keywords
      'tea-cakes': 'tea cake',
      'tub-cakes': 'tub cake',
    };
    const format = formatMap[slug];
    if (!format) return null;
    
    if (format === 'boozy') {
      return allProducts.find(p => p.name.toLowerCase().includes('whiskey') || p.name.toLowerCase().includes('bailey')) || null;
    }
    return allProducts.find(p => p.format?.toLowerCase() === format) || null;
  };

  const items = NAV_COLLECTIONS.map(slug => ({
    slug,
    meta: COLLECTION_META[slug],
    product: getProductForCollection(slug),
  }));

  const cardImages = assignDistinctImages(
    items.filter(i => i.product).map(i => i.slug),
    PRODUCT_CARD_IMAGES,
  );

  return (
    <section id="products" className="relative pt-32 md:pt-40 pb-24 md:pb-32 bg-white">
      <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#f8aeb2] text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-poppins font-light">
            Our Collection
          </p>
          <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl mb-4">
            Crafted with Care
          </h2>
          <p className="font-poppins text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            A taste of everything we make — one from each of our collections.
          </p>
        </div>

        {/* 6-card grid: 2 col mobile, 3 col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map(({ slug, meta, product }) => {
            if (!product) return null;
            const cardImage = cardImages[slug];
            return (
              <div key={slug} className="flex flex-col group">
                {/* Card image → individual product */}
                <Link href={`/products/${slug}/${product.slug}`} className="block mb-3">
                  <div
                    className="relative aspect-square flex flex-col justify-end p-5 overflow-hidden"
                    style={{ background: CARD_BG }}
                  >
                    <Image
                      src={cardImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#86162f]/80 to-transparent" />
                    {/* Collection label — top left */}
                    <div className="absolute top-3 left-3">
                      <span className="font-poppins text-[8px] uppercase tracking-widest text-[#86162f]/70 bg-white/90 px-1.5 py-0.5">
                        {meta.title}
                      </span>
                    </div>

                    {/* Dietary tags — top right */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {product.dietaryTags?.split(',').slice(0, 2).map(d => (
                        <span
                          key={d.trim()}
                          className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/80 bg-white/90 px-1.5 py-0.5"
                        >
                          {d.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="w-8 h-px bg-white/40 mb-3" />
                    <p className="font-poppins text-[9px] uppercase tracking-[0.25em] text-white/70 mb-1">
                      {product.category?.name || 'Cake'}
                    </p>
                    <h3 className="font-poppins font-medium text-white text-sm md:text-base leading-snug">
                      {toTitleCase(product.name)}
                    </h3>
                  </div>
                </Link>

                {/* Collection link — below card, matches View All button style */}
                <Link
                  href={`/products/${slug}`}
                  className="w-full py-3 border border-[#86162f] text-[#86162f] font-poppins text-xs uppercase tracking-wider text-center hover:bg-[#86162f] hover:text-white transition-all duration-200"
                >
                  Shop {meta.title} →
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link
            href="/products/bakes"
            className="inline-block px-10 py-4 border border-[#86162f] text-[#86162f] font-poppins text-xs uppercase tracking-wider hover:bg-[#86162f] hover:text-white transition-all duration-200"
          >
            View All Products
          </Link>
        </div>

      </div>
    </section>
  );
}
