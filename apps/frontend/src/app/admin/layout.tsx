'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, Tags, Layers, ClipboardList } from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';

// The admin panel's own sections. Orders was reachable only from the
// storefront menu before, which is why that menu carried admin links at all.
const ADMIN_SECTIONS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Variants', href: '/admin/variants', icon: Layers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname() || '';
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
            <AdminNavigation />
            
            <div className="pt-24 pb-12 px-6 sm:px-8 md:px-10 lg:px-12 max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Admin Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 sticky top-28">
                        <h2 className="font-seasons text-[#86162f] text-2xl mb-6">Admin Panel</h2>
                        <nav aria-label="Admin sections" className="flex flex-col gap-1">
                            {ADMIN_SECTIONS.map(({ label, href, icon: Icon }) => {
                                const isActive =
                                    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors font-poppins text-sm ${
                                            isActive
                                                ? 'bg-[#86162f]/[0.08] text-[#86162f] font-medium'
                                                : 'text-gray-600 hover:text-[#86162f] hover:bg-[#86162f]/5'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </Link>
                                );
                            })}
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
