'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Product, fetchProducts } from '@/lib/products-api';
import { ChevronDown, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toTitleCase } from '@/utils/format';
import ProductCard from '@/components/ProductCard';

const CARD_BG = '#f8aeb2';

export default function BakesCategoryPage({ 
  title, 
  subtitle, 
  description, 
  query,
  limitDisplay = false,
  showAllLink = ''
}: { 
  title: string;
  subtitle: string;
  description: string;
  query: string;
  limitDisplay?: boolean;
  showAllLink?: string;
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
  const displayProducts = limitDisplay ? products.slice(0, 3) : products;

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-2 font-poppins">{subtitle}</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">{title}</h1>
        <p className="font-poppins text-white/60 text-xs mt-4 max-w-sm mx-auto">{description}</p>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
        <div className="py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/40">
            <Link href="/products" className="hover:text-[#86162f] transition-colors">Shop All</Link>
            <span>/</span>
            <span className="text-[#86162f]">{title}</span>
          </div>
          {limitDisplay && showAllLink && products.length > 3 && (
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 pb-24 pt-4">
            {displayProducts.map(p => <ProductCard key={p.id} product={p} collectionSlug="bakes" />)}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
