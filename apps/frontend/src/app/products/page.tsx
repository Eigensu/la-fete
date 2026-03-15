'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
    name: string;
    description: string;
    category: string;
    tag?: string;
    price: number;
}

export default function ProductsPage() {
    const [filter, setFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { cart, updateQuantity } = useCart();

    const lesGateauxProducts: Product[] = [
        { name: 'Classic Red Velvet', description: 'Our signature recipe with cream cheese frosting', category: 'lafete', tag: 'Bestseller', price: 520 },
        { name: 'Spring Blossom Cupcake', description: 'Light floral notes with a creamy center', category: 'lafete', price: 180 },
        { name: 'Ultimate Chocolate Dream', description: 'Triple layers of cocoa for the serious lover', category: 'lafete', price: 650 },
    ];

    const petitIndulgencesProducts: Product[] = [
        { name: 'Mango Passion Delight', description: 'Tropical summer flavors in every bite', category: 'lafete', tag: 'Seasonal', price: 420 },
        { name: 'Midnight Brownie', description: 'Intense dark chocolate with a gooey molten center', category: 'lafete', price: 250 },
    ];

    const byDietProducts: Product[] = [
        { name: 'Gluten-Free Vanilla', description: 'Light and airy vanilla cake made without gluten', category: 'lafete', price: 450 },
        { name: 'Vegan Chocolate Fudge', description: 'Rich chocolate cake completely plant-based', category: 'lafete', price: 550 },
    ];

    const granolaProducts: Product[] = [
        { name: 'Oatmeal Raisin Energy', description: 'Perfect bite-sized snack for on the go', category: 'snackfest', price: 120 },
        { name: 'Keto Berry Tart', description: 'Low-carb tart packed with fresh seasonal berries', category: 'snackfest', price: 380 },
    ];

    const spreadsProducts: Product[] = [
        { name: 'Peanut Butter Blast', description: 'Crunchy peanut butter with chocolate drizzle', category: 'snackfest', tag: 'Bestseller', price: 350 },
        { name: 'Salted Caramel Crunch', description: 'Perfect balance of sweet and salty', category: 'snackfest', price: 480 },
    ];

    const cakeMixesProducts: Product[] = [
        { name: 'Sugar-Free Delight', description: 'Naturally sweetened treats for the healthy heart', category: 'snackfest', price: 320 },
        { name: 'Pumpkin Spice Mini', description: 'Warm autumn spices for cozy evenings', category: 'snackfest', price: 290 },
    ];

    const filteredLesGateaux = filter === 'all' || filter === 'lafete' ? lesGateauxProducts : [];
    const filteredPetitIndulgences = filter === 'all' || filter === 'lafete' ? petitIndulgencesProducts : [];
    const filteredByDiet = filter === 'all' || filter === 'lafete' ? byDietProducts : [];

    const filteredGranola = filter === 'all' || filter === 'snackfest' ? granolaProducts : [];
    const filteredSpreads = filter === 'all' || filter === 'snackfest' ? spreadsProducts : [];
    const filteredCakeMixes = filter === 'all' || filter === 'snackfest' ? cakeMixesProducts : [];

    const renderProductCard = (product: Product, index: number, sectionId: string) => (
        <div key={`${sectionId}-${index}`} className="group flex flex-col h-full">
            <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                <div className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10 pointer-events-none">
                    <Image src="/bow.png" alt="" width={128} height={128} className="w-full h-full object-contain" />
                </div>
                {product.tag && (
                    <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                        {product.tag}
                    </div>
                )}
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
            <div className="mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-poppins font-semibold text-[#86162f]">₹{product.price}</span>
                </div>
                {cart[product.name] && cart[product.name].quantity > 0 ? (
                    <div className="flex items-center justify-between bg-white border border-[#86162f]/20 rounded-sm overflow-hidden shadow-sm">
                        <button
                            onClick={() => updateQuantity(product.name, -1)}
                            className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="font-poppins font-medium text-[#86162f]">{cart[product.name].quantity}</span>
                        <button
                            onClick={() => updateQuantity(product.name, 1)}
                            className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        className="w-full py-3 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-xs uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-md"
                        onClick={() => updateQuantity(product.name, 1, product.price)}
                    >
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );

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
            <div className="bg-white border-b border-[#f8aeb2]/30 relative z-30 shadow-sm">
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


            {/* La Fête Sections */}
            {filteredLesGateaux.length > 0 && (
                <section id="les-gateaux" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                            <h2 className="font-seasons text-[#86162f] text-3xl">Les Gateaux</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredLesGateaux.map((product, index) => renderProductCard(product, index, 'gateaux'))}
                        </div>
                    </div>
                </section>
            )}

            {filteredPetitIndulgences.length > 0 && (
                <section id="petit-indulgences" className="relative py-16 bg-[#fcf9f8]">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                            <h2 className="font-seasons text-[#86162f] text-3xl">Petit Indulgences</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredPetitIndulgences.map((product, index) => renderProductCard(product, index, 'petit'))}
                        </div>
                    </div>
                </section>
            )}

            {filteredByDiet.length > 0 && (
                <section id="by-diet" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                            <h2 className="font-seasons text-[#86162f] text-3xl">By Diet</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredByDiet.map((product, index) => renderProductCard(product, index, 'diet'))}
                        </div>
                    </div>
                </section>
            )}

            {/* Snackfest Sections */}
            {filteredGranola.length > 0 && (
                <section id="granola" className="relative py-16 bg-[#fcf9f8]">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                            <h2 className="font-seasons text-[#86162f] text-3xl">Granola</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredGranola.map((product, index) => renderProductCard(product, index, 'granola'))}
                        </div>
                    </div>
                </section>
            )}

            {filteredSpreads.length > 0 && (
                <section id="spreads" className="relative py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                            <h2 className="font-seasons text-[#86162f] text-3xl">Spreads</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredSpreads.map((product, index) => renderProductCard(product, index, 'spreads'))}
                        </div>
                    </div>
                </section>
            )}

            {filteredCakeMixes.length > 0 && (
                <section id="cake-mixes" className="relative py-16 bg-[#fcf9f8]">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                            <h2 className="font-seasons text-[#86162f] text-3xl">Cake Mixes</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {filteredCakeMixes.map((product, index) => renderProductCard(product, index, 'mixes'))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}
