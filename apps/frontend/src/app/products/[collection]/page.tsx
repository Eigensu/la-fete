'use client';

import { useState, use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { COLLECTION_META } from '@/lib/products-data';
import { fetchProducts, Product } from '@/lib/products-api';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { toTitleCase } from '@/utils/format';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CARD_IMAGES, assignDistinctImages } from '@/lib/gallery-images';

const CARD_BG = '#f8aeb2';

function uniqueValues(products: Product[], key: keyof Product): string[] {
  const values = products.map(p => p[key]).flat().filter(Boolean) as string[];
  return Array.from(new Set(values)).sort();
}

const REDUNDANT_TAGS: Record<string, string[]> = {
  'whole-wheat':      ['Whole Wheat'],
  'vegan-sugar-free': ['Vegan', 'Sugar Free'],
  'gf-sugar-free':    ['Gluten Free', 'Sugar Free'],
  'boozy-whole-wheat': ['Whole Wheat'],
  'tea-cakes':        ['Tea Cake'],
  'tub-cakes':        ['Whole Wheat', 'Tub Cake'],
};

function FilterDropdown({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-transparent border border-[#86162f]/20 pl-3 pr-8 py-1.5 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] outline-none focus:border-[#86162f]/50 transition-colors cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86162f]/50 pointer-events-none" />
    </div>
  );
}

export default function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = use(params);
  const meta = COLLECTION_META[collection];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts(`category=${collection}`).then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    });
  }, [collection]);

  const [flavourFilter, setFlavourFilter]   = useState('');
  const [dietaryFilter, setDietaryFilter]   = useState('');
  const [formatFilter,  setFormatFilter]    = useState('');

  const flavours  = uniqueValues(products, 'collections').length > 0
    ? uniqueValues(products, 'collections')
    : uniqueValues(products, 'subcategory');
  const dietaries = uniqueValues(products, 'dietaryTags');
  const formats   = uniqueValues(products, 'format');

  const filtered = products.filter(p => {
    if (flavourFilter && !(p.collections?.includes(flavourFilter) || p.subcategory === flavourFilter)) return false;
    if (dietaryFilter  && !(p.dietaryTags || '').includes(dietaryFilter))   return false;
    if (formatFilter   && p.format  !== formatFilter)           return false;
    return true;
  });

  const hasFilters = flavourFilter || dietaryFilter || formatFilter;

  const cardImages = useMemo(
    () => assignDistinctImages(filtered.map(p => String(p.id ?? p.name)), PRODUCT_CARD_IMAGES),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered.map(p => p.id ?? p.name).join(',')],
  );

  if (!meta) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
          <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Not Found</p>
          <h2 className="font-seasons text-[#86162f] text-4xl mb-6">This collection doesn&apos;t exist</h2>
          <Link href="/products/bakes" className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5">
            ← Back to All Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const isEmpty = products.length === 0;

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <div className="mt-16 md:mt-20 text-center">
        <p className="text-[#86162f]/40 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">{meta.subtitle}</p>
        <h1 className="font-seasons text-[#86162f] text-4xl md:text-6xl">{meta.title}</h1>
        <p className="font-poppins text-gray-500 text-sm mt-4 max-w-md mx-auto leading-relaxed">{meta.description}</p>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="py-3 flex items-center gap-2 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/40">
          <Link href="/products/bakes" className="hover:text-[#86162f] transition-colors">Shop All</Link>
          <span>/</span>
          <span className="text-[#86162f]">{meta.title}</span>
        </div>

        {loading ? (
          <div className="py-32 text-center text-[#86162f]">Loading products...</div>
        ) : error ? (
          <div className="py-32 text-center">
            <h2 className="font-seasons text-[#86162f] text-3xl md:text-4xl mb-4">
              Unable to load products
            </h2>
            <p className="font-poppins text-gray-400 text-sm max-w-sm mx-auto">
              {error}
            </p>
          </div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 pb-24">
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    collectionSlug={collection}
                    redundantTags={REDUNDANT_TAGS[collection]}
                    fallbackImage={cardImages[String(p.id ?? p.name)]}
                  />
                ))}
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
