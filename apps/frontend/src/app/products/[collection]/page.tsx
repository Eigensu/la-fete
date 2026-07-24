'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { COLLECTION_META, uniqueValues, Product, getLowestPrice } from '@/lib/products-data';
import { fetchProducts } from '@/lib/products-api';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toTitleCase } from '@/utils/format';

const CARD_BG = '#f8aeb2';

const REDUNDANT_TAGS: Record<string, string[]> = {
  'whole-wheat':      ['Whole Wheat'],
  'vegan-sugar-free': ['Vegan', 'Sugar Free'],
  'gf-sugar-free':    ['Gluten Free', 'Sugar Free'],
  'boozy-whole-wheat': ['Whole Wheat'],
  'tea-cakes':        ['Tea Cake'],
  'tub-cakes':        ['Whole Wheat', 'Tub Cake'],
};

function ProductCard({
  product,
  collectionSlug,
}: {
  product: Product;
  collectionSlug: string;
}) {
  const { cart, updateQuantity } = useCart();
  const cartItem = cart[product.name];

  return (
    <div className="flex flex-col">
      <Link
        href={`/products/${collectionSlug}/${product.slug}`}
        className="block mb-3"
      >
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
          <p className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[#86162f]/55 mb-1">{product.flavour}</p>
          <h3 className="font-seasons text-[#86162f] text-xl md:text-2xl leading-snug">{toTitleCase(product.name)}</h3>
        </div>
      </Link>

      {/* Cart controls */}
      {cartItem && cartItem.quantity > 0 ? (
        <div className="flex items-center justify-between border border-[#86162f]/20">
          <button
            onClick={() => updateQuantity(product.name, -1)}
            className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="font-poppins text-sm text-[#86162f]">{cartItem.quantity}</span>
          <button
            onClick={() => updateQuantity(product.name, 1)}
            className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => updateQuantity(product.name, 1, getLowestPrice(product) ?? 0)}
          className="w-full py-3 bg-[#86162f] text-white font-poppins text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 border border-[#86162f]/20 text-[#86162f] font-poppins text-[10px] uppercase tracking-wider hover:bg-[#86162f]/5 transition-all"
      >
        {label}: <span className="font-semibold">{value || 'All'}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[150px] bg-white border border-[#86162f]/20 shadow-xl z-20">
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 font-poppins text-xs hover:bg-[#86162f]/5 transition-colors ${!value ? 'text-[#86162f] font-semibold' : 'text-gray-500'}`}
          >
            All
          </button>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 font-poppins text-xs hover:bg-[#86162f]/5 transition-colors ${value === opt ? 'text-[#86162f] font-semibold' : 'text-gray-500'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = use(params);
  const meta = COLLECTION_META[collection];

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setAllProducts(data as any);
      setLoading(false);
    });
  }, []);
  
  const getCollectionProducts = (slug: string) => {
    const formatMap: Record<string, string> = {
      'whole-wheat': 'whole wheat cake',
      'vegan-sugar-free': 'vegan cake',
      'gf-sugar-free': 'gluten free cake',
      'boozy-whole-wheat': 'boozy',
      'tea-cakes': 'tea cake',
      'tub-cakes': 'tub cake',
    };
    const format = formatMap[slug];
    if (!format) return [];
    
    if (format === 'boozy') {
      return allProducts.filter(p => p.name.toLowerCase().includes('whiskey') || p.name.toLowerCase().includes('bailey'));
    }
    return allProducts.filter(p => p.format?.toLowerCase() === format);
  };

  const allInCollection = meta ? getCollectionProducts(collection) : [];
  const [flavourFilter, setFlavourFilter]   = useState('');
  const [dietaryFilter, setDietaryFilter]   = useState('');
  const [formatFilter,  setFormatFilter]    = useState('');

  const flavours  = uniqueValues(allInCollection, 'flavour');
  const dietaries = uniqueValues(allInCollection, 'dietary');
  const formats   = uniqueValues(allInCollection, 'format');

  const filtered = allInCollection.filter(p => {
    if (flavourFilter  && p.flavour !== flavourFilter)          return false;
    if (dietaryFilter  && !p.dietary.includes(dietaryFilter))   return false;
    if (formatFilter   && p.format  !== formatFilter)           return false;
    return true;
  });

  const hasFilters = flavourFilter || dietaryFilter || formatFilter;

  if (!meta) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
          <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Not Found</p>
          <h2 className="font-seasons text-[#86162f] text-4xl mb-6">This collection doesn&apos;t exist</h2>
          <Link href="/products" className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5">
            ← Back to All Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const isEmpty = allInCollection.length === 0;

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-2 font-poppins">{meta.subtitle}</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">{meta.title}</h1>
        <p className="font-poppins text-white/60 text-xs mt-4 max-w-sm mx-auto">{meta.description}</p>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">

        {/* Breadcrumb */}
        <div className="py-5 flex items-center gap-2 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/40">
          <Link href="/products" className="hover:text-[#86162f] transition-colors">Shop All</Link>
          <span>/</span>
          <span className="text-[#86162f]">{meta.title}</span>
        </div>

        {loading ? (
          <div className="py-32 text-center text-[#86162f]">Loading products...</div>
        ) : isEmpty ? (
          <div className="py-32 text-center">
            <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Coming Soon</p>
            <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl mb-4">
              {collection === 'special' ? 'Watch this space' : 'Nothing yet'}
            </h2>
            <p className="font-poppins text-gray-400 text-sm max-w-xs mx-auto">
              {collection === 'special'
                ? 'Our seasonal collection is being curated. Check back soon.'
                : 'No featured products at the moment.'}
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="py-5 border-b border-[#86162f]/10 flex flex-wrap items-center gap-3">
              {flavours.length  > 1 && <FilterDropdown label="Flavour"  options={flavours}  value={flavourFilter}  onChange={setFlavourFilter} />}
              {dietaries.length > 1 && <FilterDropdown label="Dietary"  options={dietaries} value={dietaryFilter}  onChange={setDietaryFilter} />}
              {formats.length   > 1 && <FilterDropdown label="Format"   options={formats}   value={formatFilter}   onChange={setFormatFilter}  />}
              {hasFilters && (
                <button
                  onClick={() => { setFlavourFilter(''); setDietaryFilter(''); setFormatFilter(''); }}
                  className="font-poppins text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#86162f] transition-colors px-2"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Count */}
            <p className="font-poppins text-[10px] uppercase tracking-widest text-gray-400 py-4">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              {hasFilters && ' — filtered'}
            </p>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 pb-24">
                {filtered.map(p => <ProductCard key={p.id} product={p} collectionSlug={collection} />)}
              </div>
            ) : (
              <div className="py-24 text-center font-poppins text-sm text-gray-400">
                No products match the selected filters.
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
