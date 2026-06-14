'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, Tags, Layers } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const userStr = globalThis.localStorage.getItem('la-fete-user');
                if (!userStr) {
                    router.replace('/auth');
                    return;
                }
                const user = JSON.parse(userStr);
                if (user.role !== 'ADMIN') {
                    router.replace('/');
                    return;
                }
                setIsAuthorized(true);
            } catch (error) {
                router.replace('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8]">
                <div className="font-poppins text-[#86162f]">Verifying Access...</div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-[#fcf9f8]">
            <Navigation />
            
            <div className="pt-24 pb-12 px-6 sm:px-8 md:px-10 lg:px-12 max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Admin Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 sticky top-28">
                        <h2 className="font-seasons text-[#86162f] text-2xl mb-6">Admin Panel</h2>
                        <nav className="flex flex-col gap-2">
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-sm transition-colors font-poppins text-sm">
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-sm transition-colors font-poppins text-sm">
                                <Package size={18} />
                                Products
                            </Link>
                            <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-sm transition-colors font-poppins text-sm">
                                <Tags size={18} />
                                Categories
                            </Link>
                            <Link href="/admin/variants" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-sm transition-colors font-poppins text-sm">
                                <Layers size={18} />
                                Variants
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Admin Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
