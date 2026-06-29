'use client';

import { useState, use, ReactNode } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getProductBySlug, getSimilarProducts, Product } from '@/lib/products-data';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';

const CARD_BG = '#f8aeb2';

// ── Dietary icon registry ────────────────────────────────────────────────────
const DIETARY_META: Record<string, { code: string; label: string }> = {
  'Whole Wheat':      { code: 'WW', label: 'Whole Wheat'      },
  'Vegan':            { code: 'V',  label: 'Vegan'            },
  'Gluten Free':      { code: 'GF', label: 'Gluten Free'      },
  'Sugar Free':       { code: 'SF', label: 'Sugar Free'       },
  'Flourless':        { code: 'FL', label: 'Flourless'        },
  'High Protein':     { code: 'HP', label: 'High Protein'     },
  'Liquor Infused':   { code: 'LI', label: 'Liquor Infused'   },
  'Eggless':          { code: 'EG', label: 'Eggless'          },
  'No Preservatives': { code: 'NP', label: 'No Preservatives' },
  'Palm Oil Free':    { code: 'PO', label: 'Palm Oil Free'    },
};

const UNIVERSAL_BADGES = ['No Preservatives', 'Palm Oil Free'];

const ACCORDION_COPY = [
  {
    id: 'process',
    title: 'OUR IN-HOUSE PROCESS',
    body: 'Every La Fête cake is baked fresh to order in our Mumbai kitchen. We use whole wheat flour, cold-pressed oils, and natural sweeteners across our entire range — no maida, no refined oils, no compromise. Your order is prepared only after it is placed, ensuring maximum freshness for every occasion.',
  },
  {
    id: 'shipping',
    title: 'DELIVERY & SHIPPING',
    body: 'We currently deliver across Mumbai. Orders placed before 2 PM are typically delivered within 24–48 hours; custom orders may require additional lead time. We package every cake in temperature-safe boxes to ensure it arrives in perfect condition. Delivery charges apply based on your location.',
  },
  {
    id: 'returns',
    title: 'RETURNS & CANCELLATIONS',
    body: 'We accept cancellations up to 48 hours before the scheduled delivery date. Once baking has begun, cancellations are not possible. If your order arrives damaged or incorrect, please contact us within 2 hours of delivery with photographs and we will make it right promptly.',
  },
];

// ── Health benefits derived from dietary tags ────────────────────────────────
function deriveHealthBenefits(product: Product): string[] {
  const b: string[] = [];
  const d = product.dietary;
  if (d.includes('Whole Wheat')) {
    b.push('Made with 100% whole wheat flour — richer in fibre than refined flour');
    b.push('No maida — gentler on digestion and blood sugar');
    b.push('Naturally dense and satisfying');
  }
  if (d.includes('Vegan')) {
    b.push('Completely plant-based — no dairy, no eggs');
    b.push('Cruelty-free from ingredients to process');
  }
  if (d.includes('Sugar Free')) {
    b.push('Free from refined cane sugar');
    b.push('Sweetened naturally — a lower glycaemic impact');
  }
  if (d.includes('Gluten Free')) {
    b.push('Made without gluten-containing grains');
    b.push('Suitable for those with gluten sensitivity');
  }
  if (d.includes('Flourless')) {
    b.push('Flourless recipe — naturally denser and protein-rich');
    b.push('A nourishing alternative to conventional bakes');
  }
  if (d.includes('High Protein')) {
    b.push('Higher protein content from ground nut flours');
  }
  b.push('No artificial preservatives — baked fresh to order');
  b.push('Cold-pressed oils only — no palm oil');
  return b;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function DietaryBadge({ tag }: { tag: string }) {
  const meta = DIETARY_META[tag];
  if (!meta) return null;
  return (
    <div className="flex flex-col items-center gap-2" style={{ minWidth: 60 }}>
      <div className="w-12 h-12 rounded-full border border-[#86162f]/20 flex items-center justify-center bg-white">
        <span className="font-poppins text-[9px] font-semibold text-[#86162f] tracking-wide">{meta.code}</span>
      </div>
      <span className="font-poppins text-[8px] uppercase tracking-wider text-gray-500 text-center leading-tight" style={{ maxWidth: 56 }}>
        {meta.label}
      </span>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#86162f]/15 mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center px-6 py-5"
      >
        <span className="flex-1 text-center font-poppins text-[10px] uppercase tracking-[0.25em] text-[#86162f]">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-[#86162f]/35 transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-8 pb-6 pt-1 font-poppins text-sm text-gray-600 leading-relaxed border-t border-[#86162f]/8 text-center">
          {children}
        </div>
      )}
    </div>
  );
}

function SimilarCard({ product, collection }: { product: Product; collection: string }) {
  const { cart, updateQuantity } = useCart();
  const lowestPrice = product.availableWeights
    ? Math.min(...product.availableWeights.map(w => w.price))
    : null;
  const cartItem = cart[product.name];

  return (
    <div className="flex flex-col" style={{ minWidth: 220 }}>
      <Link href={`/products/${collection}/${product.slug}`}>
        <div
          className="relative flex flex-col justify-end p-4 overflow-hidden mb-3"
          style={{ background: CARD_BG, aspectRatio: '5/6' }}
        >
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            {product.dietary.slice(0, 2).map(d => (
              <span key={d} className="text-[7px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                {d}
              </span>
            ))}
          </div>
          <div className="w-6 h-px bg-[#86162f]/25 mb-2" />
          <p className="font-poppins text-[8px] uppercase tracking-[0.25em] text-[#86162f]/55 mb-0.5">{product.flavour}</p>
          <h3 className="font-seasons text-[#86162f] text-lg leading-snug">{product.name}</h3>
          {lowestPrice !== null && (
            <p className="font-poppins text-[9px] text-[#86162f]/50 mt-1">
              from ₹{lowestPrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </Link>

      {cartItem && cartItem.quantity > 0 ? (
        <div className="flex items-center justify-between border border-[#86162f]/20">
          <button onClick={() => updateQuantity(product.name, -1)} className="p-2.5 text-[#86162f]">
            <Minus size={12} />
          </button>
          <span className="font-poppins text-xs text-[#86162f]">{cartItem.quantity}</span>
          <button onClick={() => updateQuantity(product.name, 1)} className="p-2.5 text-[#86162f]">
            <Plus size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => updateQuantity(product.name, 1, lowestPrice ?? 0)}
          className="w-full py-2.5 bg-[#86162f] text-white font-poppins text-[9px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ProductPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = use(params);
  const product = getProductBySlug(slug);

  const [selectedWeight, setSelectedWeight] = useState(
    () => product?.availableWeights?.[0]?.weight ?? '',
  );
  const [selectedSweetener, setSelectedSweetener] = useState(
    () => product?.sweetenerOptions?.[0] ?? '',
  );
  const [quantity, setQuantity] = useState(1);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const { cart, updateQuantity } = useCart();

  // ── Not found ───────────────────────────────────────────────────────────
  if (!product || !product.collections.includes(collection)) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-4">Not Found</p>
          <h2 className="font-seasons text-[#86162f] text-4xl mb-6">Product not found</h2>
          <Link
            href="/products"
            className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
          >
            ← Back to All Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const currentPrice =
    product.availableWeights?.find(w => w.weight === selectedWeight)?.price ?? null;

  const cartKey = [
    product.name,
    selectedWeight,
    selectedSweetener,
  ]
    .filter(Boolean)
    .join(' · ');

  const cartItem = cart[cartKey];
  const inCartQty = cartItem?.quantity ?? 0;

  const similarProducts = getSimilarProducts(product, 4);
  const allBadges = [...new Set([...product.dietary, ...UNIVERSAL_BADGES])];
  const healthBenefits = deriveHealthBenefits(product);

  function handleAddToCart() {
    updateQuantity(cartKey, quantity, currentPrice ?? 0);
    setQuantity(1);
  }

  // ────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-10 md:mt-20" />

      {/* Breadcrumb */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 pt-8 pb-4">
        <nav className="flex items-center gap-2 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/40 flex-wrap">
          <Link href="/products" className="hover:text-[#86162f] transition-colors">
            Shop All
          </Link>
          <ChevronRight size={10} className="shrink-0" />
          <Link
            href={`/products/${collection}`}
            className="hover:text-[#86162f] transition-colors"
          >
            {collection.replace(/-/g, ' ')}
          </Link>
          <ChevronRight size={10} className="shrink-0" />
          <span className="text-[#86162f]">{product.name}</span>
        </nav>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: image */}
          <div className="lg:sticky lg:top-24">
            {/* Main image placeholder */}
            <div
              className="relative w-full flex items-center justify-center overflow-hidden"
              style={{ background: '#f8aeb2', aspectRatio: '4/5' }}
            >
              {/* Format + dietary tags */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                <span className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-2 py-0.5">
                  {product.format}
                </span>
                {product.dietary.map(d => (
                  <span
                    key={d}
                    className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-2 py-0.5"
                  >
                    {d}
                  </span>
                ))}
              </div>
              {/* Subtle placeholder text */}
              <div className="text-center px-8 select-none">
                <div className="w-10 h-px bg-[#86162f]/15 mx-auto mb-5" />
                <p className="font-poppins text-[9px] uppercase tracking-[0.35em] text-[#86162f]/30">
                  Photography Coming Soon
                </p>
                <div className="w-10 h-px bg-[#86162f]/15 mx-auto mt-5" />
              </div>
            </div>
          </div>

          {/* Right: buy box */}
          <div className="flex flex-col pt-2 lg:pt-4">
            {/* Eyebrow */}
            <p className="font-poppins text-[10px] uppercase tracking-[0.35em] text-[#f8aeb2] mb-3">
              {product.format} · {product.flavour}
            </p>

            {/* Name */}
            <h1 className="font-seasons text-[#86162f] text-4xl md:text-5xl leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-1">
              {currentPrice !== null ? (
                <>
                  <span className="font-poppins text-3xl font-light text-[#86162f]">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-poppins text-xs text-gray-400">for {selectedWeight}</span>
                </>
              ) : (
                <span className="font-poppins text-sm text-gray-400">Price on request</span>
              )}
            </div>

            {product.serves && (
              <p className="font-poppins text-xs text-gray-400 mb-4">{product.serves}</p>
            )}

            {/* Short description */}
            {product.shortDescription && (
              <p className="font-poppins text-sm text-gray-600 leading-relaxed mb-6 max-w-md">
                {product.shortDescription}
              </p>
            )}

            <div className="w-full h-px bg-[#86162f]/10 mb-6" />

            {/* Sweetener selector */}
            {product.sweetenerOptions && product.sweetenerOptions.length > 0 && (
              <div className="mb-6">
                <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-3">
                  Sweetener Base
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sweetenerOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSweetener(s)}
                      className={`px-4 py-2 font-poppins text-xs tracking-wide border transition-all duration-150 ${
                        selectedSweetener === s
                          ? 'bg-[#86162f] text-white border-[#86162f]'
                          : 'bg-white text-[#86162f] border-[#86162f]/25 hover:border-[#86162f]/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight selector */}
            {product.availableWeights && product.availableWeights.length > 0 && (
              <div className="mb-6">
                <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-3">
                  Weight
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.availableWeights.map(w => (
                    <button
                      key={w.weight}
                      onClick={() => setSelectedWeight(w.weight)}
                      className={`px-4 py-2.5 font-poppins text-xs tracking-wide border transition-all duration-150 ${
                        selectedWeight === w.weight
                          ? 'bg-[#86162f] text-white border-[#86162f]'
                          : 'bg-white text-[#86162f] border-[#86162f]/25 hover:border-[#86162f]/60'
                      }`}
                    >
                      {w.weight}
                      <span
                        className={`ml-1.5 text-[10px] ${
                          selectedWeight === w.weight ? 'text-white/65' : 'text-gray-400'
                        }`}
                      >
                        ₹{w.price.toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-stretch gap-3 mb-4">
              {/* Quantity stepper */}
              <div className="flex items-center border border-[#86162f]/20">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-3.5 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="px-4 font-poppins text-sm text-[#86162f] min-w-[2.5rem] text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-3.5 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-[#86162f] text-white font-poppins text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
              >
                {inCartQty > 0 ? `In Cart (${inCartQty}) — Add More` : 'Add to Cart'}
              </button>
            </div>

            {/* Allergens */}
            {product.allergens && (
              <p className="font-poppins text-[10px] text-gray-400 leading-relaxed mt-1 max-w-sm">
                {product.allergens}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Dietary Icons Strip ──────────────────────────────────────── */}
      <section className="py-12 bg-[#fdf5f6] border-y border-[#86162f]/8">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 text-center mb-8">
            What makes it La Fête
          </p>
          <div className="flex items-start justify-center flex-wrap gap-6 md:gap-10">
            {allBadges.map(tag => (
              <DietaryBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Long description ─────────────────────────────────────────── */}
      {product.longDescription && (
        <section className="py-16 max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <div className="max-w-2xl">
            <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-3">
              About this cake
            </p>
            <p className="font-poppins text-base text-gray-600 leading-relaxed">
              {product.longDescription}
            </p>
            {product.tasteProfile && (
              <p className="font-poppins text-sm text-gray-500 leading-relaxed mt-4 italic">
                {product.tasteProfile}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Health Benefits ──────────────────────────────────────────── */}
      <section className="py-16 max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
        <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-3">
          Good for you
        </p>
        <h2 className="font-seasons text-[#86162f] text-3xl md:text-4xl mb-8">Health Benefits</h2>
        <ul className="space-y-3 max-w-2xl">
          {healthBenefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="shrink-0 mt-[7px] rounded-full bg-[#f8aeb2]"
                style={{ width: 5, height: 5 }}
              />
              <p className="font-poppins text-sm text-gray-600 leading-relaxed">{benefit}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Accordions ───────────────────────────────────────────────── */}
      <section className="py-12 max-w-screen-lg mx-auto px-6 sm:px-10 md:px-16">

        {/* Storage — non-collapsible info box */}
        {product.storage && (
          <div className="border border-[#86162f]/15 mb-3 px-6 py-5 text-center">
            <p className="font-poppins text-[10px] uppercase tracking-[0.25em] text-[#86162f] mb-2">
              STORAGE &amp; SHELF LIFE
            </p>
            <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.storage}</p>
          </div>
        )}

        {ACCORDION_COPY.map(item => (
          <Accordion key={item.id} title={item.title}>
            {item.body}
          </Accordion>
        ))}

        {/* Reviews */}
        <div className="border border-[#86162f]/15 mb-3">
          <button
            onClick={() => setReviewsOpen(o => !o)}
            className="w-full flex items-center px-6 py-5"
          >
            <span className="flex-1 text-center font-poppins text-[10px] uppercase tracking-[0.25em] text-[#86162f]">
              REVIEWS
            </span>
            <ChevronDown
              size={13}
              className={`text-[#86162f]/35 transition-transform duration-300 shrink-0 ${
                reviewsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {reviewsOpen && (
            <div className="px-8 pb-6 pt-1 border-t border-[#86162f]/8 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <div
                    key={s}
                    className="border border-[#86162f]/15 rounded-sm"
                    style={{ width: 13, height: 13 }}
                  />
                ))}
                <span className="font-poppins text-xs text-gray-400 ml-1">No reviews yet</span>
              </div>
              <p className="font-poppins text-sm text-gray-400">
                Be the first to share your experience with this cake.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Similar Products ─────────────────────────────────────────── */}
      {similarProducts.length > 0 && (
        <section className="py-16 bg-[#fdf5f6] border-t border-[#86162f]/8">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-2">
                  More to Love
                </p>
                <h2 className="font-seasons text-[#86162f] text-3xl md:text-4xl">
                  Similar Products
                </h2>
              </div>
              <Link
                href={`/products/${collection}`}
                className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5 shrink-0 mb-1 ml-6"
              >
                See All →
              </Link>
            </div>

            {/* Desktop: 4-col grid */}
            <div className="hidden md:grid grid-cols-4 gap-4">
              {similarProducts.map(p => (
                <SimilarCard key={p.id} product={p} collection={collection} />
              ))}
            </div>
            {/* Mobile: horizontal scroll */}
            <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-6 px-6">
              {similarProducts.map(p => (
                <SimilarCard key={p.id} product={p} collection={collection} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
