'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ChevronDown } from 'lucide-react';

export default function ProductsPage() {
    const [filter, setFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const byDietProducts = [
        {
            name: 'Gluten-Free Vanilla',
            description: 'Light and airy vanilla cake made without gluten',
            category: 'lafete'
        },
        {
            name: 'Vegan Chocolate Fudge',
            description: 'Rich chocolate cake completely plant-based',
            category: 'lafete'
        },
        {
            name: 'Keto Berry Tart',
            description: 'Low-carb tart packed with fresh seasonal berries',
            category: 'snackfest'
        },
        {
            name: 'Sugar-Free Delight',
            description: 'Naturally sweetened treats for the healthy heart',
            category: 'snackfest'
        },
    ];

    const byCravingsProducts = [
        {
            name: 'Ultimate Chocolate Dream',
            description: 'For the serious chocolate lover, triple layers of cocoa',
            category: 'lafete'
        },
        {
            name: 'Citrus Burst Delight',
            description: 'Zesty lemon and orange flavors for a refreshing bite',
            category: 'snackfest'
        },
        {
            name: 'Salted Caramel Crunch',
            description: 'Perfect balance of sweet and salty with a crispy texture',
            category: 'lafete'
        },
        {
            name: 'Midnight Brownie',
            description: 'Intense dark chocolate with a gooey molten center',
            category: 'snackfest'
        },
    ];

    const newArrivalsProducts = [
        { name: 'Spring Blossom Cupcake', description: 'Light floral notes with a creamy center', category: 'lafete' },
        { name: 'Oatmeal Raisin Energy', description: 'Perfect bite-sized snack for on the go', category: 'snackfest' },
    ];

    const bestSellersProducts = [
        { name: 'Classic Red Velvet', description: 'Our signature recipe with cream cheese frosting', category: 'lafete', tag: 'Bestseller' },
        { name: 'Peanut Butter Blast', description: 'Crunchy peanut butter with chocolate drizzle', category: 'snackfest', tag: 'Bestseller' },
    ];

    const seasonalSpecialsProducts = [
        { name: 'Mango Passion Delight', description: 'Tropical summer flavors in every bite', category: 'lafete', tag: 'Seasonal' },
        { name: 'Pumpkin Spice Mini', description: 'Warm autumn spices for cozy evenings', category: 'snackfest' },
    ];

    const filteredByDiet = filter === 'all' ? byDietProducts : byDietProducts.filter(p => p.category === filter);
    const filteredByCravings = filter === 'all' ? byCravingsProducts : byCravingsProducts.filter(p => p.category === filter);
    const filteredNewArrivals = filter === 'all' ? newArrivalsProducts : newArrivalsProducts.filter(p => p.category === filter);
    const filteredBestSellers = filter === 'all' ? bestSellersProducts : bestSellersProducts.filter(p => p.category === filter);
    const filteredSeasonal = filter === 'all' ? seasonalSpecialsProducts : seasonalSpecialsProducts.filter(p => p.category === filter);

    return (
        <main className="relative min-h-screen bg-white">
            <Navigation />

            {/* Header Section */}
            <div className="mt-10 md:mt-20 py-6 md:py-8 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-white text-center shadow-md">
                <div className="max-w-screen-xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                    <p className="text-white/80 text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-poppins font-light">
                        Full Menu
                    </p>
                    <h1 className="font-seasons text-white text-4xl md:text-6xl mb-0">
                        Our Products
                    </h1>
                </div>
            </div>

            {/* Persistent Filter Bar */}
            <div className="bg-white border-b border-[#f8aeb2]/30 sticky top-16 md:top-20 z-30 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-4 flex justify-end items-center">
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-6 py-2 border border-[#86162f]/20 text-[#86162f] font-poppins text-xs md:text-sm uppercase tracking-wider hover:bg-[#86162f]/5 transition-all"
                        >
                            Filter Products By: <span className="font-semibold">{filter === 'all' ? 'All' : filter === 'snackfest' ? 'Snackfest' : 'La Fête'}</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#86162f]/20 shadow-xl z-20">
                                <div className="flex flex-col py-1">
                                    <button
                                        onClick={() => { setFilter('all'); setIsFilterOpen(false); }}
                                        className={`px-6 py-2 text-left font-poppins text-sm hover:bg-[#86162f]/5 transition-colors ${filter === 'all' ? 'text-[#86162f] font-semibold bg-[#86162f]/5' : 'text-gray-600'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => { setFilter('snackfest'); setIsFilterOpen(false); }}
                                        className={`px-6 py-2 text-left font-poppins text-sm hover:bg-[#86162f]/5 transition-colors ${filter === 'snackfest' ? 'text-[#86162f] font-semibold bg-[#86162f]/5' : 'text-gray-600'}`}
                                    >
                                        Snackfest
                                    </button>
                                    <button
                                        onClick={() => { setFilter('lafete'); setIsFilterOpen(false); }}
                                        className={`px-6 py-2 text-left font-poppins text-sm hover:bg-[#86162f]/5 transition-colors ${filter === 'lafete' ? 'text-[#86162f] font-semibold bg-[#86162f]/5' : 'text-gray-600'}`}
                                    >
                                        La Fête
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* By Diet Section - Only for Snackfest and All */}
            {(filter === 'all' || filter === 'snackfest') && filteredByDiet.length > 0 && (
                <section id="diet" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4">
                            <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl">
                                By Diet
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredByDiet.map((product, index) => (
                                <div key={`diet-${index}`} className="group">
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
                                    <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3">
                                        {product.name}
                                    </h3>
                                    <p className="font-poppins text-sm text-gray-600 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* By Cravings Section - Only for La Fête and All */}
            {(filter === 'all' || filter === 'lafete') && filteredByCravings.length > 0 && (
                <section id="cravings" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12">
                            <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl pb-4">
                                By Cravings
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredByCravings.map((product, index) => (
                                <div key={`craving-${index}`} className="group">
                                    <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                                        <img src="/bow.png" alt="" className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10" />
                                        {product.tag && (
                                            <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                                                {product.tag}
                                            </div>
                                        )}
                                        <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3">{product.name}</h3>
                                    <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* New Arrivals Section - Only for Snackfest and All */}
            {(filter === 'all' || filter === 'snackfest') && filteredNewArrivals.length > 0 && (
                <section id="arrivals" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12">
                            <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl border-b border-[#f8aeb2] pb-4 inline-block">
                                New Arrivals
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredNewArrivals.map((product, index) => (
                                <div key={`arrival-${index}`} className="group">
                                    <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                                        <img src="/bow.png" alt="" className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10" />
                                        {product.tag && (
                                            <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                                                {product.tag}
                                            </div>
                                        )}
                                        <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3">{product.name}</h3>
                                    <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Best Sellers Section - For Both */}
            {filteredBestSellers.length > 0 && (
                <section id="sellers" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12">
                            <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl border-b border-[#f8aeb2] pb-4 inline-block">
                                Best Sellers
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredBestSellers.map((product, index) => (
                                <div key={`seller-${index}`} className="group">
                                    <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                                        <img src="/bow.png" alt="" className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10" />
                                        {product.tag && (
                                            <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                                                {product.tag}
                                            </div>
                                        )}
                                        <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3">{product.name}</h3>
                                    <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Seasonal Specials Section - Only for La Fête and All */}
            {(filter === 'all' || filter === 'lafete') && filteredSeasonal.length > 0 && (
                <section id="seasonal" className="relative py-16 md:pb-32 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12">
                            <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl border-b border-[#f8aeb2] pb-4 inline-block">
                                Seasonal Specials
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredSeasonal.map((product, index) => (
                                <div key={`seasonal-${index}`} className="group">
                                    <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                                        <img src="/bow.png" alt="" className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10" />
                                        {product.tag && (
                                            <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                                                {product.tag}
                                            </div>
                                        )}
                                        <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3">{product.name}</h3>
                                    <p className="font-poppins text-sm text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}
