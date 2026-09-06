'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products-api';
import { toTitleCase } from '@/utils/format';
import { useCart } from '@/context/CartContext';
import { Plus, Minus } from 'lucide-react';
import { PRODUCT_CARD_IMAGES, pickImage } from '@/lib/gallery-images';

const CARD_BG = '#f8aeb2';

const MAX_TAGS = 2;

/** "gluten -free" / "Gluten-Free" / "gluten free" all collapse to "glutenfree". */
const canon = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Words in a product's own name that already convey a dietary tag, so the tag
 * would just repeat the title back to the reader.
 */
const NAME_IMPLIES: Record<string, RegExp> = {
  glutenfree: /\bgf\b|gluten[\s-]*free/i,
  vegan: /\bvegan\b/i,
  norefinedsugar: /\bsugar[\s-]*free\b/i,
  sweetenedwithnorefinedsugar: /\bsugar[\s-]*free\b/i,
  sugarfree: /\bsugar[\s-]*free\b|\bsf\b/i,
  flourless: /\bflourless\b/i,
  wholewheat: /\bwhole\s*wheat\b/i,
};

/**
 * Tags worth showing on a card: drop anything the surrounding page already
 * states (its heading, the format), anything the product name says itself, and
 * cap the rest so a card stays readable.
 */
function visibleTags(product: Product, redundantTags: string[]) {
  const suppressed = new Set(redundantTags.map(canon));
  const name = product.name ?? '';

  // The source sheet writes tags as both "a, b" and "a & b".
  return (product.dietaryTags ?? '')
    .split(/,|\s&\s/)
    .map(d => d.trim())
    .filter(Boolean)
    .filter(d => {
      const key = canon(d);
      if (suppressed.has(key)) return false;
      if (NAME_IMPLIES[key]?.test(name)) return false;
      return true;
    })
    .filter((d, i, all) => all.findIndex(o => canon(o) === canon(d)) === i)
    .slice(0, MAX_TAGS);
}

export function getLowestPrice(product: Product): number | null {
  if (!product.variants?.length) return null;
  return Math.min(...product.variants.map((w: any) => w.price));
}

export default function ProductCard({
  product,
  collectionSlug,
  redundantTags = [],
  fallbackImage,
}: {
  product: Product;
  collectionSlug: string;
  redundantTags?: string[];
  /** Image shown behind the tag overlays. Defaults to a deterministic pick
   * (keyed off the product id/name) from a small curated pool, so the same
   * product always renders the same image without relying on Math.random()
   * (which would cause server/client hydration mismatches). */
  fallbackImage?: string;
}) {
  const { cart, updateQuantity } = useCart();
  const cartItem = cart[product.name];

  const visibleDietary = visibleTags(product, redundantTags);
  const cardImage = fallbackImage ?? pickImage(String(product.id ?? product.name), PRODUCT_CARD_IMAGES);
  // Price is shown only on the individual product page, not on grid cards.
  const lowestPrice = getLowestPrice(product);

  return (
    <div className="flex flex-col group h-full">
      <Link href={`/products/${collectionSlug}/${product.slug}`} className="block mb-3 md:mb-4 flex-grow">
        {/* Taller than square so the cake styling has room to read, rather
            than feeling cropped into a generic e-commerce thumbnail. */}
        <div
          className="relative aspect-[4/5] overflow-hidden"
          style={{ background: CARD_BG }}
        >
          <Image
            src={cardImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Dietary tags — a single quiet line, not a stack of pills */}
          {visibleDietary.length > 0 && (
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
              {visibleDietary.map(d => (
                <span
                  key={d}
                  className="text-[7px] md:text-[8px] font-poppins uppercase tracking-widest text-white bg-black/35 backdrop-blur-[2px] px-2 py-1"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title sits on white, where it reads cleanly, rather than burgundy
            over the pink tile. */}
        <div className="pt-3 md:pt-4">
          <p className="font-poppins text-[7.5px] md:text-[9px] uppercase tracking-[0.25em] text-[#86162f]/40 mb-1 truncate">
            {toTitleCase(product.collections?.[0] || '') || product.subcategory || product.format}
          </p>
          <h3 className="font-poppins font-medium text-[#86162f] text-[13px] sm:text-sm md:text-[15px] leading-[1.25]">
            {toTitleCase(product.name)}
          </h3>
        </div>
      </Link>

      <div className="mt-auto">
        {cartItem && cartItem.quantity > 0 ? (
          <div className="flex items-center justify-between border border-[#86162f] h-[38px] md:h-[44px]">
            <button
              onClick={() => updateQuantity(product.name, -1)}
              className="px-3.5 h-full flex items-center justify-center text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
            >
              <Minus size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <span className="font-poppins text-xs md:text-sm text-[#86162f]">{cartItem.quantity}</span>
            <button
              onClick={() => updateQuantity(product.name, 1)}
              className="px-3.5 h-full flex items-center justify-center text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
            >
              <Plus size={12} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              const variantId = product.variants?.[0]?.id;
              updateQuantity(product.name, 1, lowestPrice ?? 0, product.id, variantId);
            }}
            className="w-full h-[38px] md:h-[44px] bg-[#86162f] text-white font-poppins text-[8.5px] md:text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors flex items-center justify-center"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
