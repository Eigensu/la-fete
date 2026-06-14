'use client';

import { useEffect, useState } from 'react';
import { getAdminProducts, getAdminCategories } from '@/lib/admin-api';
import { Package, Tags, Layers, Star } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        variants: 0,
        featured: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getAdminProducts(),
                    getAdminCategories()
                ]);
                
                let variantCount = 0;
                let featuredCount = 0;
                
                productsData.forEach((p: any) => {
                    if (p.isFeatured) featuredCount++;
                    if (p.variants) variantCount += p.variants.length;
                });

                setStats({
                    products: productsData.length,
                    categories: categoriesData.length,
                    variants: variantCount,
                    featured: featuredCount
                });
            } catch (err) {
                console.error('Failed to load dashboard stats', err);
            } finally {
                setIsLoading(false);
            }
        }
        loadStats();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-[#86162f] font-poppins">Loading dashboard...</div>;
    }

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-seasons text-3xl text-[#86162f]">Dashboard Overview</h1>
                    <p className="font-poppins text-gray-500 text-sm mt-1">Manage your catalog and store settings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-sm shadow-sm border border-[#86162f]/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-[#86162f]/5 rounded-sm flex items-center justify-center text-[#86162f]">
                            <Package size={20} />
                        </div>
                        <span className="font-seasons text-3xl text-[#86162f]">{stats.products}</span>
                    </div>
                    <p className="font-poppins text-gray-500 text-sm uppercase tracking-wider">Total Products</p>
                </div>

                <div className="bg-white p-6 rounded-sm shadow-sm border border-[#86162f]/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-[#86162f]/5 rounded-sm flex items-center justify-center text-[#86162f]">
                            <Tags size={20} />
                        </div>
                        <span className="font-seasons text-3xl text-[#86162f]">{stats.categories}</span>
                    </div>
                    <p className="font-poppins text-gray-500 text-sm uppercase tracking-wider">Categories</p>
                </div>

                <div className="bg-white p-6 rounded-sm shadow-sm border border-[#86162f]/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-[#86162f]/5 rounded-sm flex items-center justify-center text-[#86162f]">
                            <Layers size={20} />
                        </div>
                        <span className="font-seasons text-3xl text-[#86162f]">{stats.variants}</span>
                    </div>
                    <p className="font-poppins text-gray-500 text-sm uppercase tracking-wider">Total Variants</p>
                </div>

                <div className="bg-white p-6 rounded-sm shadow-sm border border-[#86162f]/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-[#86162f]/5 rounded-sm flex items-center justify-center text-[#86162f]">
                            <Star size={20} />
                        </div>
                        <span className="font-seasons text-3xl text-[#86162f]">{stats.featured}</span>
                    </div>
                    <p className="font-poppins text-gray-500 text-sm uppercase tracking-wider">Featured Products</p>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                    <h3 className="font-seasons text-xl text-[#86162f] mb-4">Quick Actions</h3>
                    <div className="flex flex-col gap-3">
                        <Link href="/admin/products/create" className="p-4 border border-gray-100 rounded-sm hover:border-[#86162f]/30 hover:bg-[#86162f]/5 transition-all flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#86162f] shadow-sm">
                                <Package size={16} />
                            </div>
                            <div>
                                <h4 className="font-poppins text-sm font-medium text-gray-800">Add New Product</h4>
                                <p className="font-poppins text-xs text-gray-500 mt-0.5">Create a new product with variants</p>
                            </div>
                        </Link>
                        <Link href="/admin/categories" className="p-4 border border-gray-100 rounded-sm hover:border-[#86162f]/30 hover:bg-[#86162f]/5 transition-all flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#86162f] shadow-sm">
                                <Tags size={16} />
                            </div>
                            <div>
                                <h4 className="font-poppins text-sm font-medium text-gray-800">Manage Categories</h4>
                                <p className="font-poppins text-xs text-gray-500 mt-0.5">Organize your store structure</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
