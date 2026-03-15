'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Products() {
    const { cart, updateQuantity } = useCart();

    const products = [
        {
            name: 'Signature Cakes',
            description: 'Handcrafted layer cakes made with premium ingredients',
            price: 1200,
            tag: 'Popular'
        },
        {
            name: 'Artisan Brownies',
            description: 'Rich, fudgy brownies without the guilt',
            price: 450,
            tag: 'Top Rated'
        },
        {
            name: 'Gourmet Tarts',
            description: 'Elegant tarts with seasonal fruits and cream',
            price: 850,
            tag: 'Seasonal'
        },
        {
            name: 'Artisan Breads',
            description: 'Freshly baked sourdough and rustic loaves',
            price: 320
        },
    ];

    return (
        <section id="products" className="relative pt-32 md:pt-40 pb-24 md:pb-32 bg-white">
            <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                <div className="text-center mb-20">
                    <p className="text-[#f8aeb2] text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-poppins font-light">
                        Our Collection
                    </p>
                    <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">
                        Crafted with Care
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                    {products.map((product, index) => (
                        <div key={index} className="group flex flex-col h-full">
                            <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                                {/* Bow decoration at top-left corner */}
                                <img
                                    src="/bow.png"
                                    alt=""
                                    className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10"
                                />
                                {product.tag && (
                                    <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                                        {product.tag}
                                    </div>
                                )}

                                {/* Placeholder */}
                                <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                </svg>
                            </div>
                            <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3 min-h-[3.5rem] md:min-h-[4rem] flex items-center">
                                {product.name}
                            </h3>
                            <p className="font-poppins text-sm text-gray-600 leading-relaxed mb-6">
                                {product.description}
                            </p>

                            {/* Hidden on homepage per request */}
                        </div>
                    ))}
                </div>
                {/* Explore More Button */}
                <div className="mt-16 text-center">
                    <Link
                        href="/products"
                        className="inline-block px-10 py-4 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Explore More
                    </Link>
                </div>
            </div>
        </section>
    );
}
