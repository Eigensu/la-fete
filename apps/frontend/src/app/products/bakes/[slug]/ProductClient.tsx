'use client';

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products-api';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { toTitleCase, sortByWeightAsc, visibleDietaryTags } from '@/utils/format';
import { PRODUCT_CARD_IMAGES, pickImage } from '@/lib/gallery-images';
import WhyChooseLaFete from '@/components/WhyChooseLaFete';
import ProductFaqAccordion from '@/components/ProductFaqAccordion';

const CARD_BG = '#f8aeb2';

const CELEBRATION_TOPPER_OPTIONS = ['Happy Birthday', 'Anniversary', 'Congratulations'];

/**
 * Tea Cakes and Tub Cakes ship next-day; everything else (signature gateaux
 * and other celebration cakes) needs the full 48 hours to make.
 */
function leadDays(format: string | undefined) {
  return ['tea cake', 'tub cake'].includes((format || '').toLowerCase()) ? 1 : 2;
}

/**
 * The earliest date an order placed right now can arrive, given the
 * product's lead time. The exact slot is still chosen at checkout.
 */
function earliestDelivery(now: Date, format: string | undefined) {
  const date = new Date(now);
  date.setDate(date.getDate() + leadDays(format));

  return {
    date,
    label: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
  };
}

function SimilarCard({ product, collection }: { product: Product; collection: string }) {
  const { cart, updateQuantity } = useCart();
  const lowestPrice = product.variants?.length
    ? Math.min(...(product.variants || []).map(w => Number(w.price)))
    : null;
  const cartItem = cart[product.name];
  const cardImage = pickImage(String(product.id ?? product.name), PRODUCT_CARD_IMAGES);

  return (
    <div className="flex flex-col h-full" style={{ minWidth: 220 }}>
      <Link href={`/products/${collection}/${product.slug}`} className="flex flex-col flex-1">
        <div
          className="relative overflow-hidden mb-3 shrink-0"
          style={{ background: CARD_BG, aspectRatio: '4/5', width: '100%' }}
        >
          <Image src={cardImage} alt={product.name} fill sizes="220px" className="object-cover" />
          {product.dietaryTags && (
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
              {product.dietaryTags.split(',').slice(0, 2).map(d => (
                <span key={d.trim()} className="text-[7px] font-poppins uppercase tracking-widest text-white bg-black/35 backdrop-blur-[2px] px-2 py-1">
                  {d.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-h-[52px]">
          <p className="font-poppins text-[8px] uppercase tracking-[0.25em] text-[#86162f]/40 mb-0.5">{product.format}</p>
          <h3 className="font-poppins font-medium text-[#86162f] text-sm leading-snug">{toTitleCase(product.name)}</h3>
        </div>
      </Link>

      <div className="mt-3">
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
          onClick={() => updateQuantity(product.name, 1, lowestPrice ?? 0, product.id, product.variants?.[0]?.id)}
          className="w-full py-2.5 bg-[#86162f] text-white font-poppins text-[9px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
        >
          Add to Cart
        </button>
      )}
      </div>
    </div>
  );
}

export function ProductClient({ product, allProducts, collection }: { product: Product; allProducts: Product[]; collection: string }) {
  const sortedVariants = sortByWeightAsc(product.variants ?? []);

  const [selectedWeight, setSelectedWeight] = useState(
    () => sortedVariants[0]?.weight ?? '',
  );
  const [selectedSweetener, setSelectedSweetener] = useState(
    () => product?.sweetenerOptions?.[0] ?? '',
  );

  const [cakeTopper, setCakeTopper] = useState(false);
  const [topperText, setTopperText] = useState('');
  const [numberTopper, setNumberTopper] = useState(false);
  const [numberTopperText, setNumberTopperText] = useState('');
  const [celebrationTopper, setCelebrationTopper] = useState(false);
  const [celebrationTopperType, setCelebrationTopperType] = useState(CELEBRATION_TOPPER_OPTIONS[0]);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [whyChooseOpen, setWhyChooseOpen] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const [delivery, setDelivery] = useState<ReturnType<typeof earliestDelivery> | null>(null);
  useEffect(() => {
    setDelivery(earliestDelivery(new Date(), product.format));
  }, [product.format]);

  const { cart, updateQuantity } = useCart();

  const variantPrice = product.variants?.find(w => w.weight === selectedWeight)?.price ?? null;
  let currentPrice = variantPrice !== null ? Number(variantPrice) : null;

  if (currentPrice !== null) {
      if (selectedSweetener) {
          const match = selectedSweetener.match(/\(\+\D*(\d+)\)/);
          if (match) currentPrice += parseInt(match[1], 10);
      }
  }

  const selectedVariantName = product.variants?.find(w => w.weight === selectedWeight)?.name ?? selectedWeight;

  const cartKey = [
    product.name,
    selectedVariantName,
    selectedSweetener,
    cakeTopper ? 'Topper' : null,
    numberTopper ? 'Number Topper' : null,
    celebrationTopper ? 'Celebration Topper' : null
  ].filter(Boolean).join(' · ');

  const cartItem = cart[cartKey];
  const inCartQty = cartItem?.quantity ?? 0;

  const similarProducts = allProducts.filter((p) => p.format === product.format && p.id !== product.id).slice(0, 4);
  const dietaryArray = visibleDietaryTags(product.dietaryTags, `${product.format ?? ''} ${product.name ?? ''}`);
  const otherTagsArray = product.otherTags ? product.otherTags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const isCelebrationCake = (product.category?.slug === 'les-gateaux' || (product.format || '').toLowerCase().includes('cake')) && !['tea cake', 'tub cake'].includes((product.format || '').toLowerCase());

  const showNutrition =
    ['tea cake', 'tub cake'].includes((product.format || '').toLowerCase()) ||
    /sugar[- ]?free/i.test(`${product.dietaryTags ?? ''} ${product.name}`);

  function handleAddToCart() {
    updateQuantity(
        cartKey,
        quantity,
        currentPrice ?? 0,
        product.id,
        product.variants?.find(w => w.weight === selectedWeight)?.id,
        {
            sweetener: selectedSweetener || undefined,
            cakeTopper,
            topperText: cakeTopper ? topperText : undefined,
            numberTopper,
            numberTopperText: numberTopper ? numberTopperText : undefined,
            celebrationTopper,
            celebrationTopperType: celebrationTopper ? celebrationTopperType : undefined,
        }
    );
    setQuantity(1);
    setCakeTopper(false);
    setTopperText('');
    setNumberTopper(false);
    setNumberTopperText('');
    setCelebrationTopper(false);
    setCelebrationTopperType(CELEBRATION_TOPPER_OPTIONS[0]);
  }

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 pt-8 pb-4">
        <nav className="flex items-center gap-2 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/40 flex-wrap">
          <Link href="/products/bakes" className="hover:text-[#86162f] transition-colors">
            Shop All
          </Link>
          {product.category?.slug && (
            <>
              <ChevronRight size={10} className="shrink-0" />
              <Link
                href={`/products/bakes/${product.category.slug}`}
                className="hover:text-[#86162f] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {product.category?.slug === 'signature-gateaux' && (product.collections?.[0] || product.subcategory) && (
            <>
              <ChevronRight size={10} className="shrink-0" />
              <Link
                href={`/products/bakes/signature-gateaux/${(product.collections?.[0] || product.subcategory || '').toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-[#86162f] transition-colors"
              >
                {toTitleCase(product.collections?.[0] || product.subcategory || '')}
              </Link>
            </>
          )}
          <ChevronRight size={10} className="shrink-0" />
          <span className="text-[#86162f]">{toTitleCase(product.name)}</span>
        </nav>
      </div>

      <section className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 pb-16">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* LEFT: IMAGE + DELIVERY */}
          <div className="contents lg:flex lg:flex-col lg:gap-8">
            <div
              className="order-1 lg:order-none relative w-full flex items-center justify-center overflow-hidden"
              style={{ background: '#f8aeb2', aspectRatio: '4/5' }}
            >
              <Image
                src={pickImage(String(product.id ?? product.name), PRODUCT_CARD_IMAGES)}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5 z-10">
                <span className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/70 bg-white/85 px-2 py-0.5">
                  {product.format}
                </span>
                {dietaryArray.map(d => (
                  <span
                    key={d}
                    className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/70 bg-white/85 px-2 py-0.5"
                  >
                    {d}
                  </span>
                ))}
                {otherTagsArray.map(t => (
                  <span
                    key={t}
                    className="text-[8px] font-poppins uppercase tracking-widest text-white bg-[#86162f]/80 px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT DETAILS + DROPDOWNS */}
          <div className="order-2 lg:order-none flex flex-col pt-2 lg:pt-4 w-full">
            <p className="font-poppins text-[10px] uppercase tracking-[0.35em] text-[#f8aeb2] mb-3">
              {product.format}
            </p>
            <h1 className="font-seasons text-[#86162f] text-4xl md:text-5xl leading-tight mb-4">
              {toTitleCase(product.name)}
            </h1>
            <div className="flex items-baseline gap-2 mb-1">
              {currentPrice !== null ? (
                <>
                  <span className="font-poppins text-2xl font-light text-[#86162f]">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-poppins text-xs text-gray-400">for {selectedVariantName}</span>
                </>
              ) : (
                <span className="font-poppins text-sm text-gray-400">Price on request</span>
              )}
            </div>

            <p className="font-poppins text-xs text-gray-600 leading-relaxed mt-2 mb-4 max-w-[54ch]">
                {product.description}
            </p>

            <div className="w-full h-px bg-[#86162f]/10 mb-4" />

            {/* WEIGHT OPTIONS - RIGHT */}
            {sortedVariants.length > 0 && (
              <div className="mb-4">
                <p className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/55 mb-2">
                  Weight
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sortedVariants.map(w => (
                    <button
                      key={w.weight}
                      onClick={() => setSelectedWeight(w.weight)}
                      className={`px-3 py-1.5 font-poppins text-[11px] tracking-wide border transition-all duration-150 ${
                        selectedWeight === w.weight
                          ? 'bg-[#86162f] text-white border-[#86162f]'
                          : 'bg-white text-[#86162f] border-[#86162f]/25 hover:border-[#86162f]/60'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SWEETENER OPTIONS - RIGHT */}
            {isCelebrationCake && product.sweetenerOptions && product.sweetenerOptions.length > 0 && (
              <div className="mb-4">
                <p className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/55 mb-2">
                  Sweetener Base
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(product.sweetenerOptions || []).map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSweetener(s)}
                      className={`px-3 py-1.5 font-poppins text-[11px] tracking-wide border transition-all duration-150 ${
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

            {/* QUANTITY */}
            <p className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/55 mb-1.5">
              Quantity
            </p>
            <div className="flex items-center border border-[#86162f]/20 w-max mb-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="px-4 font-poppins text-xs text-[#86162f] min-w-[2.5rem] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-2 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* MAKE IT PERSONAL */}
            {isCelebrationCake && (
              <div className="mb-4 border-t border-[#86162f]/10 pt-4">
                <button
                  type="button"
                  onClick={() => setPersonalizeOpen((open) => !open)}
                  aria-expanded={personalizeOpen}
                  className="w-full flex items-center justify-between gap-2 border border-[#86162f]/15 px-3 py-2 rounded-sm"
                >
                  <span className="font-poppins text-[11px] uppercase tracking-widest text-[#86162f]">
                    Make It Personal
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-[#86162f]/60 transition-transform duration-300 ${personalizeOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {personalizeOpen && (
                  <div className="space-y-3 mt-3">
                    <div className="flex flex-col gap-2 border border-[#86162f]/15 p-3 rounded-sm">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cakeTopper}
                                onChange={(e) => setCakeTopper(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#86162f] cursor-pointer"
                            />
                            <span className="font-poppins text-xs text-[#86162f]">Message on Cake</span>
                        </label>
                        {cakeTopper && (
                            <div className="mt-1.5 pl-6">
                                <label className="block font-poppins text-[9px] uppercase tracking-wider text-gray-500 mb-1">Message Text</label>
                                <input
                                    type="text"
                                    value={topperText}
                                    onChange={(e) => setTopperText(e.target.value)}
                                    placeholder="e.g. Happy Birthday"
                                    className="w-full border border-gray-200 px-2.5 py-1.5 font-poppins text-xs focus:outline-none focus:border-[#86162f]/50"
                                    maxLength={30}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 border border-[#86162f]/15 p-3 rounded-sm">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={celebrationTopper}
                                onChange={(e) => setCelebrationTopper(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#86162f] cursor-pointer"
                            />
                            <span className="font-poppins text-xs text-[#86162f]">Celebration Topper</span>
                        </label>
                        {celebrationTopper && (
                            <div className="mt-1.5 pl-6">
                                <label className="block font-poppins text-[9px] uppercase tracking-wider text-gray-500 mb-1">Occasion</label>
                                <select
                                    value={celebrationTopperType}
                                    onChange={(e) => setCelebrationTopperType(e.target.value)}
                                    className="w-full border border-gray-200 px-2.5 py-1.5 font-poppins text-xs focus:outline-none focus:border-[#86162f]/50 bg-white"
                                >
                                    {CELEBRATION_TOPPER_OPTIONS.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 border border-[#86162f]/15 p-3 rounded-sm">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={numberTopper}
                                onChange={(e) => setNumberTopper(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#86162f] cursor-pointer"
                            />
                            <span className="font-poppins text-xs text-[#86162f]">Number Topper</span>
                        </label>
                        {numberTopper && (
                            <div className="mt-1.5 pl-6">
                                <label className="block font-poppins text-[9px] uppercase tracking-wider text-gray-500 mb-1">Number</label>
                                <input
                                    type="text"
                                    value={numberTopperText}
                                    onChange={(e) => setNumberTopperText(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full border border-gray-200 px-2.5 py-1.5 font-poppins text-xs focus:outline-none focus:border-[#86162f]/50"
                                    maxLength={10}
                                />
                            </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADD TO CART */}
            <div className="flex items-stretch gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-[#86162f] text-white font-poppins text-[11px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
              >
                {inCartQty > 0 ? `In Cart (${inCartQty}) — Add More` : 'Add to Cart'}
              </button>
            </div>

            {/* EARLIEST DELIVERY */}
            <div className="border-t border-[#86162f]/10 pt-4 w-full">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55">
                  Earliest delivery
                </p>
                <p className="font-poppins text-[11px] text-[#86162f]/50">Mumbai only</p>
              </div>

              <p className="font-poppins font-semibold text-[#86162f] text-lg md:text-xl leading-tight mt-2 min-h-[1.6em]">
                {delivery ? delivery.label : ' '}
              </p>

              <p className="font-poppins text-xs text-gray-500 mt-2 leading-relaxed">
                Baked to order. Choose your slot at checkout.
              </p>

              <p className="font-poppins text-xs text-gray-500 mt-2 leading-relaxed">
                Delivery is charged at checkout and varies by area.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <ProductFaqAccordion
            shelfLife={product.shelfLife}
            deliveryInstructions={product.deliveryInstructions}
            ingredients={product.ingredients}
            nutritionalHighlight={showNutrition ? product.nutritionalHighlight : undefined}
            allergyInformation={product.allergyInformation}
            leadDays={leadDays(product.format)}
          />
          <div className="border-b border-[#86162f]/15">
            <button
              type="button"
              onClick={() => setWhyChooseOpen((open) => !open)}
              aria-expanded={whyChooseOpen}
              className="w-full flex items-center justify-center gap-4 py-5 md:py-6"
            >
              <span className="font-poppins text-[11px] md:text-xs uppercase tracking-[0.3em] text-[#86162f]">
                Why Choose La Fête
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-[#86162f] transition-transform duration-200 ${whyChooseOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {whyChooseOpen && (
              <div className="pb-6">
                <WhyChooseLaFete />
              </div>
            )}
          </div>
        </div>
      </section>

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

            <div className="hidden md:grid grid-cols-4 gap-4 items-stretch">
              {similarProducts.map(p => (
                <SimilarCard key={p.id} product={p} collection={collection} />
              ))}
            </div>
            <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-6 px-6">
              {similarProducts.map(p => (
                <SimilarCard key={p.id} product={p} collection={collection} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
