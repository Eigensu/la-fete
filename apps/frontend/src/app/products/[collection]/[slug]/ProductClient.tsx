'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/products-api';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { toTitleCase } from '@/utils/format';

const CARD_BG = '#f8aeb2';

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

function SimilarCard({ product, collection }: { product: Product; collection: string }) {
  const { cart, updateQuantity } = useCart();
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map(w => Number(w.price)))
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
            {product.dietaryTags?.split(',').slice(0, 2).map(d => (
              <span key={d.trim()} className="text-[7px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                {d.trim()}
              </span>
            ))}
          </div>
          <div className="w-6 h-px bg-[#86162f]/25 mb-2" />
          <p className="font-poppins text-[8px] uppercase tracking-[0.25em] text-[#86162f]/55 mb-0.5">{product.format}</p>
          <h3 className="font-seasons text-[#86162f] text-lg leading-snug">{toTitleCase(product.name)}</h3>
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
          onClick={() => updateQuantity(product.name, 1, lowestPrice ?? 0, product.id, product.variants?.[0]?.id)}
          className="w-full py-2.5 bg-[#86162f] text-white font-poppins text-[9px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

export function ProductClient({ product, allProducts, collection }: { product: Product; allProducts: Product[]; collection: string }) {
  const [selectedWeight, setSelectedWeight] = useState(
    () => product?.variants?.[0]?.weight ?? '',
  );
  const [selectedSweetener, setSelectedSweetener] = useState(
    () => product?.sweetenerOptions?.[0] ?? '',
  );
  
  const [cakeTopper, setCakeTopper] = useState(false);
  const [topperText, setTopperText] = useState('');
  const [cakeMessage, setCakeMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  const [quantity, setQuantity] = useState(1);

  const { cart, updateQuantity } = useCart();

  const variantPrice = product.variants?.find(w => w.weight === selectedWeight)?.price ?? null;
  let currentPrice = variantPrice !== null ? Number(variantPrice) : null;

  if (currentPrice !== null) {
      if (cakeTopper) currentPrice += 100;
      if (cakeMessage) currentPrice += 100;
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
    cakeMessage ? 'Message' : null
  ].filter(Boolean).join(' · ');

  const cartItem = cart[cartKey];
  const inCartQty = cartItem?.quantity ?? 0;

  const similarProducts = allProducts.filter((p) => p.format === product.format && p.id !== product.id).slice(0, 4);
  const dietaryArray = product.dietaryTags ? product.dietaryTags.split(',').map(d => d.trim()) : [];
  const allBadges = [...new Set([...dietaryArray, ...UNIVERSAL_BADGES])];

  const isCelebrationCake = (product.category?.slug === 'les-gateaux' || (product.format || '').toLowerCase().includes('cake')) && !['tea cake', 'tub cake'].includes((product.format || '').toLowerCase());

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
            cakeMessage,
            messageText: cakeMessage ? messageText : undefined,
        }
    );
    setQuantity(1);
    setCakeTopper(false);
    setTopperText('');
    setCakeMessage(false);
    setMessageText('');
  }

  return (
    <>
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
          <span className="text-[#86162f]">{toTitleCase(product.name)}</span>
        </nav>
      </div>

      <section className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <div
              className="relative w-full flex items-center justify-center overflow-hidden"
              style={{ background: '#f8aeb2', aspectRatio: '4/5' }}
            >
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                <span className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-2 py-0.5">
                  {product.format}
                </span>
                {dietaryArray.map(d => (
                  <span
                    key={d}
                    className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-2 py-0.5"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="text-center px-8 select-none">
                <div className="w-10 h-px bg-[#86162f]/15 mx-auto mb-5" />
                <p className="font-poppins text-[9px] uppercase tracking-[0.35em] text-[#86162f]/30">
                  Photography Coming Soon
                </p>
                <div className="w-10 h-px bg-[#86162f]/15 mx-auto mt-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col pt-2 lg:pt-4">
            <p className="font-poppins text-[10px] uppercase tracking-[0.35em] text-[#f8aeb2] mb-3">
              {product.format}
            </p>
            <h1 className="font-seasons text-[#86162f] text-4xl md:text-5xl leading-tight mb-4">
              {toTitleCase(product.name)}
            </h1>
            <div className="flex items-baseline gap-2 mb-1">
              {currentPrice !== null ? (
                <>
                  <span className="font-poppins text-3xl font-light text-[#86162f]">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-poppins text-xs text-gray-400">for {selectedVariantName}</span>
                </>
              ) : (
                <span className="font-poppins text-sm text-gray-400">Price on request</span>
              )}
            </div>
            
            <p className="font-poppins text-xs text-gray-500 mt-3 mb-6 max-w-md line-clamp-2">
                {product.description}
            </p>

            <div className="w-full h-px bg-[#86162f]/10 mb-6" />

            {/* WEIGHT OPTIONS (First) */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-3">
                  Weight
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(w => (
                    <button
                      key={w.weight}
                      onClick={() => setSelectedWeight(w.weight)}
                      className={`px-4 py-2.5 font-poppins text-xs tracking-wide border transition-all duration-150 ${
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

            {/* SWEETENER OPTIONS */}
            {isCelebrationCake && product.sweetenerOptions && product.sweetenerOptions.length > 0 && (
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

            {/* DELIVERY INFO & SCHEDULE */}
            {isCelebrationCake && (
              <>
                <div className="bg-[#fdf5f6] border border-[#86162f]/15 p-4 mb-4">
                  <p className="font-poppins text-[11px] uppercase tracking-widest text-[#86162f] font-medium mb-1">
                    📍 Delivery Information
                  </p>
                  <p className="font-poppins text-xs text-[#86162f]/80 leading-relaxed">
                    This cake is available for delivery only within Mumbai.
                  </p>
                </div>
                <div className="mb-6">
                    <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">
                      Delivery Schedule
                    </p>
                    <ul className="space-y-1">
                        <li className="font-poppins text-xs text-gray-500">• Order before 4:00 PM &rarr; Delivery available the next day.</li>
                        <li className="font-poppins text-xs text-gray-500">• Order after 4:00 PM &rarr; Delivery available the day after tomorrow.</li>
                    </ul>
                </div>
              </>
            )}

            {/* QUANTITY */}
            <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">
              Quantity
            </p>
            <div className="flex items-center border border-[#86162f]/20 w-max mb-6">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-3.5 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="px-5 font-poppins text-sm text-[#86162f] min-w-[3rem] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-3.5 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* ADD-ONS */}
            {isCelebrationCake && (
              <div className="mb-6 space-y-4 border-t border-[#86162f]/10 pt-6">
                  <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-3">
                    Cake Add-ons
                  </p>
                  
                  <div className="flex flex-col gap-2 border border-[#86162f]/15 p-4 rounded-sm">
                      <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={cakeTopper}
                              onChange={(e) => setCakeTopper(e.target.checked)}
                              className="w-4 h-4 accent-[#86162f] cursor-pointer"
                          />
                          <span className="font-poppins text-sm text-[#86162f]">Cake Topper (+₹100)</span>
                      </label>
                      {cakeTopper && (
                          <div className="mt-2 pl-7">
                              <label className="block font-poppins text-[10px] uppercase tracking-wider text-gray-500 mb-1">Topper Text</label>
                              <input 
                                  type="text" 
                                  value={topperText}
                                  onChange={(e) => setTopperText(e.target.value)}
                                  placeholder="e.g. Happy Birthday"
                                  className="w-full border border-gray-200 px-3 py-2 font-poppins text-sm focus:outline-none focus:border-[#86162f]/50"
                                  maxLength={30}
                              />
                          </div>
                      )}
                  </div>

                  <div className="flex flex-col gap-2 border border-[#86162f]/15 p-4 rounded-sm">
                      <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={cakeMessage}
                              onChange={(e) => setCakeMessage(e.target.checked)}
                              className="w-4 h-4 accent-[#86162f] cursor-pointer"
                          />
                          <span className="font-poppins text-sm text-[#86162f]">Cake Message (+₹100)</span>
                      </label>
                      {cakeMessage && (
                          <div className="mt-2 pl-7">
                              <label className="block font-poppins text-[10px] uppercase tracking-wider text-gray-500 mb-1">Message on Cake</label>
                              <input 
                                  type="text" 
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  placeholder="e.g. Happy Birthday Aarav"
                                  className="w-full border border-gray-200 px-3 py-2 font-poppins text-sm focus:outline-none focus:border-[#86162f]/50"
                                  maxLength={50}
                              />
                          </div>
                      )}
                  </div>
              </div>
            )}

            {/* ADD TO CART */}
            <div className="flex items-stretch gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-[#86162f] text-white font-poppins text-xs uppercase tracking-widest hover:bg-[#a82043] transition-colors"
              >
                {inCartQty > 0 ? `In Cart (${inCartQty}) — Add More` : 'Add to Cart'}
              </button>
            </div>
            
            {/* PRODUCT INFORMATION */}
            <div className="space-y-6 pt-6 border-t border-[#86162f]/10">
                {product.description && (
                    <div>
                        <h4 className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">Description</h4>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                )}
                
                {product.ingredients && (
                    <div>
                        <h4 className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">Ingredients</h4>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.ingredients}</p>
                    </div>
                )}
                
                {product.nutritionalHighlight && (
                    <div>
                        <h4 className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">Nutritional Highlights</h4>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.nutritionalHighlight}</p>
                    </div>
                )}

                {product.allergyInformation && (
                    <div>
                        <h4 className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">Allergy Information</h4>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.allergyInformation}</p>
                    </div>
                )}
                
                {product.shelfLife && (
                    <div>
                        <h4 className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/55 mb-2">Shelf Life &amp; Serving Instructions</h4>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.shelfLife}</p>
                    </div>
                )}
            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE LA FETE */}
      <section className="py-16 bg-[#fdf5f6] border-y border-[#86162f]/8">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 text-center mb-10">
            Why Choose La Fête
          </p>
          <div className="flex items-stretch justify-center flex-wrap md:flex-nowrap gap-6 md:gap-10">
              <div className="flex-1 min-w-[200px] border border-[#86162f]/15 bg-white p-8 text-center flex flex-col items-center justify-center">
                  <span className="text-3xl mb-3">🔥</span>
                  <h4 className="font-poppins text-sm uppercase tracking-widest text-[#86162f] leading-snug">We Don't Use Microwaves</h4>
              </div>
              <div className="flex-1 min-w-[200px] border border-[#86162f]/15 bg-white p-8 text-center flex flex-col items-center justify-center">
                  <span className="text-3xl mb-3">🥜</span>
                  <h4 className="font-poppins text-sm uppercase tracking-widest text-[#86162f] leading-snug">Soaked Almonds</h4>
              </div>
              <div className="flex-1 min-w-[200px] border border-[#86162f]/15 bg-white p-8 text-center flex flex-col items-center justify-center">
                  <span className="text-3xl mb-3">🥚</span>
                  <h4 className="font-poppins text-sm uppercase tracking-widest text-[#86162f] leading-snug">100% Eggless Bakery</h4>
              </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 text-center mb-8">
            Badges of Honour
          </p>
          <div className="flex items-start justify-center flex-wrap gap-6 md:gap-10">
            {allBadges.map(tag => (
              <DietaryBadge key={tag} tag={tag} />
            ))}
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

            <div className="hidden md:grid grid-cols-4 gap-4">
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
