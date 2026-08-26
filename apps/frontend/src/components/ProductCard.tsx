'use client';

import Link from 'next/link';
import { Product } from '@/lib/products-api';
import { toTitleCase } from '@/utils/format';
import { useCart } from '@/context/CartContext';
import { Plus, Minus } from 'lucide-react';

const CARD_BG = '#f8aeb2';

export function getLowestPrice(product: Product): number | null {
  if (!product.variants?.length) return null;
  return Math.min(...product.variants.map((w: any) => w.price));
}

export default function ProductCard({ 
  product, 
  collectionSlug, 
  redundantTags = [] 
}: { 
  product: Product; 
  collectionSlug: string;
  redundantTags?: string[];
}) {
  const { cart, updateQuantity } = useCart();
  const cartItem = cart[product.name];

  const dietaryList = product.dietaryTags ? product.dietaryTags.split(',').map(d => d.trim()) : [];
  const visibleDietary = dietaryList.filter(d => !redundantTags.includes(d));
  const showFormat = product.format && !redundantTags.includes(product.format);

  return (
    <div className="flex flex-col group h-full">
      <Link href={`/products/${collectionSlug}/${product.slug}`} className="block mb-2 md:mb-3 flex-grow">
        <div
          className="relative aspect-[5/6] flex flex-col justify-end p-3 md:p-5 overflow-hidden"
          style={{ background: CARD_BG }}
        >
          {/* Subtle Tags overlay top-right */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col items-end gap-0.5 md:gap-1 z-10 max-w-[50%]">
            {showFormat && (
              <span className="text-[6.5px] md:text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/80 bg-white/70 px-1 py-0.5 md:px-1.5 md:py-0.5 text-center leading-tight shadow-sm backdrop-blur-sm">
                {product.format}
              </span>
            )}
            {visibleDietary.map(d => (
              <span key={d} className="text-[6.5px] md:text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/80 bg-white/70 px-1 py-0.5 md:px-1.5 md:py-0.5 text-center leading-tight shadow-sm backdrop-blur-sm">
                {d}
              </span>
            ))}
          </div>

          {/* Text overlay bottom */}
          <div className="relative z-10">
            <div className="w-5 md:w-8 h-px bg-[#86162f]/30 mb-1.5 md:mb-3" />
            <p className="font-poppins text-[7.5px] md:text-[9px] uppercase tracking-[0.25em] text-[#86162f]/70 mb-0.5 md:mb-1 truncate">
               {product.subcategory || product.format} 
            </p>
            <h3 className="font-seasons text-[#86162f] text-[15px] sm:text-[17px] md:text-xl lg:text-2xl leading-[1.15] md:leading-snug line-clamp-2 drop-shadow-sm">
              {toTitleCase(product.name)}
            </h3>
          </div>
        </div>
      </Link>
      
      <div className="mt-auto">
        {cartItem && cartItem.quantity > 0 ? (
          <div className="flex items-center justify-between border border-[#86162f]/20 h-[36px] md:h-[44px]">
            <button
              onClick={() => updateQuantity(product.name, -1)}
              className="px-3 h-full flex items-center justify-center text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
            >
              <Minus size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <span className="font-poppins text-xs md:text-sm text-[#86162f]">{cartItem.quantity}</span>
            <button
              onClick={() => updateQuantity(product.name, 1)}
              className="px-3 h-full flex items-center justify-center text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
            >
              <Plus size={12} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              const variantId = product.variants?.[0]?.id;
              updateQuantity(product.name, 1, getLowestPrice(product) ?? 0, product.id, variantId);
            }}
            className="w-full h-[36px] md:h-[44px] bg-[#86162f] text-white font-poppins text-[8.5px] md:text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors flex items-center justify-center"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
