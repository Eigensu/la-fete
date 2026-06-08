'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    description: string;
    category?: { slug: string; name: string };
    isFeatured?: boolean;
    variants?: { price: number; discountPrice?: number }[];
    price?: number; // fallback
}

export default function ProductsPage() {
    const [filter, setFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { cart, updateQuantity } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                setProducts(data.data || []);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product => {
        if (filter === 'all') return true;
        return product.category?.slug === filter;
    });

    const getPrice = (product: Product) => {
        if (product.variants && product.variants.length > 0) {
            return product.variants[0].discountPrice || product.variants[0].price;
        }
        return product.price || 0;
    };

    const renderProductCard = (product: Product, index: number, sectionId: string) => {
        const price = getPrice(product);
        // Temporary mapping: CartContext still uses name. 
        // A full refactor to productId is recommended for backend cart sync.
        const cartItem = cart[product.name];

        return (
            <div key={`${sectionId}-${index}`} className="group flex flex-col h-full">
                <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                    <div className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10 pointer-events-none">
                        <Image src="/bow.png" alt="" width={128} height={128} className="w-full h-full object-contain" />
                    </div>
                    {product.isFeatured && (
                        <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                            Featured
                        </div>
                    )}
                    <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                </div>
                <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3 min-h-[3.5rem] md:min-h-[4rem] flex items-center">
                    {product.name}
                </h3>
                <p className="font-poppins text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        {product.variants && product.variants.length > 0 && product.variants[0].discountPrice ? (
                            <div className="flex items-center gap-2">
                                <span className="font-poppins font-semibold text-[#86162f]">₹{product.variants[0].discountPrice}</span>
                                <span className="font-poppins text-xs text-gray-400 line-through">₹{product.variants[0].price}</span>
                            </div>
                        ) : (
                            <span className="font-poppins font-semibold text-[#86162f]">₹{price}</span>
                        )}
                    </div>
                    {cartItem && cartItem.quantity > 0 ? (
                        <div className="flex items-center justify-between bg-white border border-[#86162f]/20 rounded-sm overflow-hidden shadow-sm">
                            <button
                                onClick={() => updateQuantity(product.name, -1)}
                                className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="font-poppins font-medium text-[#86162f]">{cartItem.quantity}</span>
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
                            onClick={() => updateQuantity(product.name, 1, price)}
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const productsByCategory = filteredProducts.reduce((acc, product) => {
        const slug = product.category?.slug || 'other';
        if (!acc[slug]) acc[slug] = [];
        acc[slug].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const categoryNames: Record<string, string> = {
        'les-gateaux': 'Les Gâteaux',
        'petit-indulgences': 'Petit Indulgences',
        'by-diet': 'By Diet',
        'granola': 'Granola',
        'spreads': 'Spreads',
        'cake-mixes': 'Cake Mixes'
    };

    return (
        <main className="relative min-h-screen bg-white">
            <Navigation />

            <div className="mt-10 md:mt-20 py-6 md:py-8 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-white text-center shadow-md">
                <div className="max-w-screen-xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                    <p className="text-white/80 text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-poppins font-light">
                        Full Menu
                    </p>
                    <h1 className="font-seasons text-white text-4xl md:text-6xl mb-0">Our Products</h1>
                </div>
            </div>

            <div className="bg-white border-b border-[#f8aeb2]/30 relative z-30 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-4 flex justify-end items-center">
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-6 py-2 border border-[#86162f]/20 text-[#86162f] font-poppins text-xs md:text-sm uppercase tracking-wider hover:bg-[#86162f]/5 transition-all"
                        >
                            Filter Products By:{' '}
                            <span className="font-semibold">
                                {filter === 'all' ? 'All' : categoryNames[filter] || filter}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}
                            />
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
                                    {Object.entries(categoryNames).map(([slug, name]) => (
                                        <button
                                            key={slug}
                                            onClick={() => { setFilter(slug); setIsFilterOpen(false); }}
                                            className={`px-6 py-2 text-left font-poppins text-sm hover:bg-[#86162f]/5 transition-colors ${filter === slug ? 'text-[#86162f] font-semibold bg-[#86162f]/5' : 'text-gray-600'}`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-16 bg-white">
                    <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="w-full aspect-square bg-gray-200 rounded-sm mb-6"></div>
                                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded-sm"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : filteredProducts.length > 0 ? (
                Object.entries(productsByCategory).map(([categorySlug, catProducts], i) => (
                    <section key={categorySlug} id={categorySlug} className={`relative py-16 ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcf9f8]'}`}>
                        <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                            <div className="mb-12 flex justify-between items-end pb-4 border-b border-[#86162f]/10">
                                <h2 className="font-seasons text-[#86162f] text-3xl">{categoryNames[categorySlug] || categorySlug}</h2>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
                                {catProducts.map((product, index) => renderProductCard(product, index, categorySlug))}
                            </div>
                        </div>
                    </section>
                ))
            ) : (
                <div className="py-16 text-center text-gray-500 font-poppins">No products found. Please add products via the Admin dashboard.</div>
            )}

            <Footer />
        </main>
    );
}
