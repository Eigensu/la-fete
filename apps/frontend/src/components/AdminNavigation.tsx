'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { logout as apiLogout } from '@/lib/auth-api';

type StoredUser = {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
};

function getStoredUser(): StoredUser {
    try {
        return JSON.parse(globalThis.localStorage?.getItem('la-fete-user') || '{}');
    } catch {
        return {};
    }
}

/**
 * The bar for the admin panel, deliberately separate from the storefront
 * `Navigation`: no basket, no Bakes/Hampers/Celebrate, nothing a customer
 * browses. Section links (Dashboard, Orders, Products…) live in the admin
 * sidebar, so this bar only carries what the sidebar cannot — which panel you
 * are in, the way back to the shop, and the account you are signed in as.
 */
export default function AdminNavigation() {
    const router = useRouter();
    const { clearCart } = useCart();
    const [accountOpen, setAccountOpen] = useState(false);
    const [user, setUser] = useState<StoredUser>({});
    const accountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUser(getStoredUser());
    }, []);

    const closeAccount = useCallback(() => setAccountOpen(false), []);

    useEffect(() => {
        if (!accountOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!accountRef.current?.contains(event.target as Node)) closeAccount();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeAccount();
        };
        document.addEventListener('mousedown', onPointerDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [accountOpen, closeAccount]);

    const handleLogout = async () => {
        try { await apiLogout(); } catch { /* session may already be expired */ }
        await clearCart();
        globalThis.localStorage.removeItem('la-fete-access-token');
        globalThis.localStorage.removeItem('la-fete-user');
        router.push('/');
    };

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Account';

    return (
        <nav className="fixed top-0 w-full z-[60] bg-[#fcf9f8]/95 backdrop-blur-md border-b border-[#86162f]/10 shadow-[0_1px_16px_rgba(134,22,47,0.06)]">
            <div className="w-full px-4 sm:px-8 md:px-10 lg:px-12">
                <div className="flex items-center justify-between h-16 md:h-[72px] gap-3">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2.5 min-w-0 rounded-sm px-1 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30"
                    >
                        <span className="font-seasons text-[#86162f] text-lg sm:text-xl md:text-2xl tracking-tight whitespace-nowrap">
                            La Fête 365
                        </span>
                        <span className="shrink-0 border border-[#86162f]/25 text-[#86162f] rounded-full px-2 py-0.5 font-poppins text-[9px] sm:text-[10px] uppercase tracking-[0.18em]">
                            Admin
                        </span>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-[#86162f] hover:bg-[#86162f]/[0.07] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30"
                            aria-label="View store"
                        >
                            <Store size={18} />
                            <span className="hidden sm:inline font-poppins text-[11px] uppercase tracking-[0.2em]">
                                View Store
                            </span>
                        </Link>

                        <div className="relative" ref={accountRef}>
                            <button
                                onClick={() => setAccountOpen(!accountOpen)}
                                aria-expanded={accountOpen}
                                aria-haspopup="menu"
                                aria-label="Account menu"
                                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-[#86162f] hover:bg-[#86162f]/[0.07] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30"
                            >
                                <User size={18} />
                                <span className="hidden md:inline font-poppins text-[11px] uppercase tracking-[0.2em] max-w-[160px] truncate">
                                    {displayName}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {accountOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.18 }}
                                        role="menu"
                                        className="absolute right-0 top-full mt-3 w-60 bg-white shadow-xl shadow-[#86162f]/10 border border-[#86162f]/10 rounded-xl overflow-hidden flex flex-col p-1.5"
                                    >
                                        {user.email && (
                                            <p className="px-3 pt-1 pb-2 font-poppins text-[11px] text-[#86162f]/50 truncate">
                                                {user.email}
                                            </p>
                                        )}
                                        <Link href="/profile" onClick={closeAccount} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">My Profile</Link>
                                        <Link href="/orders" onClick={closeAccount} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">My Orders</Link>
                                        <div className="border-t border-[#86162f]/10 my-1.5"></div>
                                        <button onClick={handleLogout} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg flex items-center gap-2 text-left transition-colors">
                                            <LogOut size={14} /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
