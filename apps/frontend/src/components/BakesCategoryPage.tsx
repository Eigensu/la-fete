'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Product, fetchProducts } from '@/lib/products-api';
import { ChevronDown, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toTitleCase } from '@/utils/format';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CARD_IMAGES, assignDistinctImages } from '@/lib/gallery-images';

const CARD_BG = '#f8aeb2';

export default function BakesCategoryPage({
  title,
  subtitle,
  description,
  query,
  limitDisplay = false,
  showAllLink = '',
  backHref = '/products/bakes',
  backLabel = 'Back to Bakes',
}: {
  title: string;
  subtitle: string;
  description: string;
  query: string;
  limitDisplay?: boolean;
  showAllLink?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts(query).then((data) => {
      setProducts(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    });
  }, [query]);

  const isEmpty = products.length === 0;
  const displayProducts = limitDisplay ? products.slice(0, 4) : products;
  const cardImages = assignDistinctImages(
    displayProducts.map(p => String(p.id ?? p.name)),
    PRODUCT_CARD_IMAGES,
  );

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-16 md:mt-20 px-4 sm:px-5 md:px-6 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 pt-4 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/60 hover:text-[#86162f] transition-colors"
        >
          <ArrowLeft size={12} /> {backLabel}
        </Link>
      </div>

      <div className="text-center">
        <p className="text-[#86162f]/40 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">{subtitle}</p>
        <h1 className="font-seasons text-[#86162f] text-4xl md:text-6xl">{title}</h1>
        <p className="font-poppins text-gray-500 text-sm mt-4 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/40">
            <Link href="/products/bakes" className="hover:text-[#86162f] transition-colors">Shop All</Link>
            <span>/</span>
            <span className="text-[#86162f]">{title}</span>
          </div>
          {limitDisplay && showAllLink && products.length > 4 && (
            <Link href={showAllLink} className="flex items-center gap-1 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] hover:opacity-70 transition-opacity">
              Show All Products <ArrowRight size={12} />
            </Link>
          )}
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
              Nothing yet
            </h2>
            <p className="font-poppins text-gray-400 text-sm max-w-xs mx-auto">
              No products found for this category at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 pb-24 pt-4">
            {/* The page title already says what these are, so cards don't repeat it. */}
            {displayProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                collectionSlug="bakes"
                redundantTags={[title, title.replace(/s$/, '')]}
                fallbackImage={cardImages[String(p.id ?? p.name)]}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
