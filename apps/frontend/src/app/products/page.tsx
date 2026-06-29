import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { COLLECTION_META, getProductsByCollection, Product } from '@/lib/products-data';

const CARD_BG = '#f8aeb2';

const REDUNDANT_TAGS: Record<string, string[]> = {
  'whole-wheat':      ['Whole Wheat'],
  'vegan-sugar-free': ['Vegan', 'Sugar Free'],
  'gf-sugar-free':    ['Gluten Free', 'Sugar Free'],
  'boozy-whole-wheat': ['Whole Wheat'],
  'tea-cakes':        ['Tea Cake'],
  'tub-cakes':        ['Whole Wheat', 'Tub Cake'],
};

function ProductCard({ product, collectionSlug }: { product: Product; collectionSlug: string }) {
  return (
    <div className="flex flex-col group">
      <Link href={`/products/${collectionSlug}/${product.slug}`} className="block">
        <div
          className="relative aspect-[5/6] flex flex-col justify-end p-5 overflow-hidden"
          style={{ background: CARD_BG }}
        >
          {/* All tags stacked top-right — skip tags implied by the collection */}
          {(() => {
            const hidden = REDUNDANT_TAGS[collectionSlug] ?? [];
            const visibleDietary = product.dietary.filter(d => !hidden.includes(d));
            const showFormat = !hidden.includes(product.format);
            if (!showFormat && visibleDietary.length === 0) return null;
            return (
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                {showFormat && (
                  <span className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                    {product.format}
                  </span>
                )}
                {visibleDietary.map(d => (
                  <span key={d} className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                    {d}
                  </span>
                ))}
              </div>
            );
          })()}

          <div className="w-8 h-px bg-[#86162f]/25 mb-3" />
          <p className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[#86162f]/55 mb-1">
            {product.flavour}
          </p>
          <h3 className="font-seasons text-[#86162f] text-xl md:text-2xl leading-snug">
            {product.name}
          </h3>
        </div>
      </Link>
    </div>
  );
}

const CAKE_COLLECTIONS    = ['whole-wheat', 'vegan-sugar-free', 'gf-sugar-free', 'boozy-whole-wheat'] as const;
const PETITE_COLLECTIONS  = ['tea-cakes', 'tub-cakes'] as const;

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero banner */}
      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Full Menu</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">Our Products</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">

        {/* ── CAKES ─────────────────────────────────────────────── */}
        <div className="pt-20 pb-4 flex items-center gap-6">
          <span className="font-poppins text-[10px] uppercase tracking-[0.4em] text-[#86162f]/40">Cakes</span>
          <div className="flex-1 h-px bg-[#86162f]/10" />
        </div>

        {CAKE_COLLECTIONS.map((slug) => {
          const meta     = COLLECTION_META[slug];
          const products = getProductsByCollection(slug);
          return (
            <section key={slug} className="mb-20">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{meta.title}</h2>
                  <p className="font-poppins text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">{meta.description}</p>
                </div>
                {products.length > 0 && (
                  <Link
                    href={`/products/${slug}`}
                    className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
                  >
                    See Full Collection ({products.length}) →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} collectionSlug={slug} />)}
              </div>
            </section>
          );
        })}

        {/* ── PETITE INDULGENCE ─────────────────────────────────── */}
        <div className="pb-4 flex items-center gap-6">
          <span className="font-poppins text-[10px] uppercase tracking-[0.4em] text-[#86162f]/40">Petite Indulgence</span>
          <div className="flex-1 h-px bg-[#86162f]/10" />
        </div>

        {PETITE_COLLECTIONS.map((slug) => {
          const meta     = COLLECTION_META[slug];
          const products = getProductsByCollection(slug);
          return (
            <section key={slug} className="mb-20">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{meta.title}</h2>
                  <p className="font-poppins text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">{meta.description}</p>
                </div>
                {products.length > 0 && (
                  <Link
                    href={`/products/${slug}`}
                    className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
                  >
                    See Full Collection ({products.length}) →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} collectionSlug={slug} />)}
              </div>
            </section>
          );
        })}

      </div>

      <Footer />
    </main>
  );
}
