import Link from 'next/link';
import { Product } from '@/lib/products-api';
import { toTitleCase } from '@/utils/format';

const CARD_BG = '#f8aeb2';

export default function ProductCard({ product, collectionSlug }: { product: Product; collectionSlug: string }) {
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => Number(v.price)))
    : null;

  const dietaryList = product.dietaryTags ? product.dietaryTags.split(',').map(d => d.trim()) : [];

  return (
    <div className="flex flex-col group">
      <Link href={`/products/${collectionSlug}/${product.slug}`} className="block">
        <div
          className="relative aspect-[5/6] flex flex-col justify-end p-5 overflow-hidden"
          style={{ background: CARD_BG }}
        >
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            {product.format && (
              <span className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                {product.format}
              </span>
            )}
            {dietaryList.map(d => (
              <span key={d} className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                {d}
              </span>
            ))}
          </div>

          <div className="w-8 h-px bg-[#86162f]/25 mb-3" />
          <p className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[#86162f]/55 mb-1">
             {product.format} 
          </p>
          <h3 className="font-seasons text-[#86162f] text-xl md:text-2xl leading-snug">
            {toTitleCase(product.name)}
          </h3>
        </div>
      </Link>
      
      <div className="mt-4 flex items-center justify-between px-1">
        <span className="font-poppins text-xs text-[#86162f]">
          {lowestPrice ? `From ₹${lowestPrice.toLocaleString('en-IN')}` : 'Price not set'}
        </span>
      </div>
    </div>
  );
}
