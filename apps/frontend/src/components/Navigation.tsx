'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ChevronDown, ShoppingCart, Plus, Minus, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { logout as apiLogout } from '@/lib/auth-api';

function getStoredUserRole(): string | undefined {
    try {
        return JSON.parse(globalThis.localStorage?.getItem('la-fete-user') || '{}')?.role;
    } catch {
        return undefined;
    }
}

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPastHero, setIsPastHero] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [snackfestOpen, setSnackfestOpen] = useState(false);
    const [laFeteAllProductsOpen, setLaFeteAllProductsOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart, cartTotalCount, cartTotalAmount, updateQuantity, clearCart } = useCart();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = globalThis.localStorage.getItem('la-fete-access-token');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = async () => {
        try { await apiLogout(); } catch { /* session may already be expired */ }
        await clearCart();
        globalThis.localStorage.removeItem('la-fete-access-token');
        globalThis.localStorage.removeItem('la-fete-user');
        setIsAuthenticated(false);
        router.push('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const heroHeight = window.innerHeight;

            setIsScrolled(currentScrollY > 50);
            setIsPastHero(currentScrollY >= heroHeight - 80);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => {
        setIsMenuOpen(false);
        setSnackfestOpen(false);
        setLaFeteAllProductsOpen(false);
        setProfileMenuOpen(false);
    };

    const laFeteLinks = [
        { name: 'About Us', href: '/#about' },
        { name: 'Contact Us', href: '/#contact' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-[60] transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white py-3 shadow-sm' : 'py-4'}`}
            >
                <div className="relative w-full px-6 sm:px-8 md:px-10 lg:px-12">
                    <div
                        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isPastHero ? 'opacity-100 translate-y-[-50%]' : 'opacity-0 translate-y-[-35%]'}`}
                        aria-hidden="true"
                    >
                        <span className="font-poppins text-[11px] md:text-xs tracking-[0.35em] uppercase text-[#86162f] whitespace-nowrap">
                            La Fête 365
                        </span>
                    </div>

                    {/* Mobile Header: hamburger left, cart right */}
                    <div className="flex md:hidden items-center justify-between">
                        <button
                            onClick={toggleMenu}
                            className="relative p-2 text-[#86162f] hover:opacity-70 transition-opacity focus:outline-none"
                            aria-label="Toggle Menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="relative block w-6 h-5">
                                <span
                                    className={`absolute left-0 top-1/2 h-0.5 w-6 bg-[#86162f] transition-all duration-300 ${isMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'}`}
                                />
                                <span
                                    className={`absolute left-0 top-1/2 h-0.5 w-6 bg-[#86162f] transition-all duration-300 ${isMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5 rotate-0'}`}
                                />
                            </span>
                        </button>

                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="relative p-2 text-[#86162f] hover:opacity-70 transition-opacity"
                                    aria-label="Profile Menu"
                                >
                                    <User size={22} />
                                </button>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="relative p-2 text-[#86162f] hover:opacity-70 transition-opacity"
                                    aria-label="Sign In"
                                >
                                    <User size={22} />
                                </Link>
                            )}

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-[#86162f] hover:opacity-70 transition-opacity"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingCart size={24} />
                                <span className="absolute -top-1 -right-1 bg-[#86162f] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-poppins">
                                    {cartTotalCount}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link
                                href="/#home"
                                className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                            >
                                Home
                            </Link>
                            <Link
                                href="/#about"
                                className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                            >
                                About Us
                            </Link>
                            <Link
                                href="/products"
                                className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                            >
                                Products
                            </Link>
                            <Link
                                href="/#contact"
                                className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                            >
                                Contact
                            </Link>
                            {isAuthenticated && typeof window !== 'undefined' && getStoredUserRole() === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity font-bold"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity flex items-center gap-2"
                                    >
                                        <User size={18} />
                                        Profile
                                    </button>
                                    <AnimatePresence>
                                        {profileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-4 w-48 bg-white shadow-xl border border-[#86162f]/10 rounded-sm overflow-hidden flex flex-col py-2"
                                            >
                                                <Link href="/profile" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 text-left">My Profile</Link>
                                                <Link href="/orders" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 text-left">Order History</Link>
                                                <Link href="/orders" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 text-left">Track Orders</Link>
                                                <Link href="/profile/addresses" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 text-left">Saved Addresses</Link>
                                                {typeof window !== 'undefined' && getStoredUserRole() === 'ADMIN' && (
                                                    <>
                                                        <div className="border-t border-[#86162f]/10 my-1"></div>
                                                        <Link href="/admin" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 font-semibold text-left">Admin Dashboard</Link>
                                                        <Link href="/admin/orders" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 text-left">Orders Management</Link>
                                                        <Link href="/admin/products" onClick={closeMenu} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 text-left">Products & Categories</Link>
                                                    </>
                                                )}
                                                <div className="border-t border-[#86162f]/10 my-1"></div>
                                                <button onClick={handleLogout} className="px-4 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 flex items-center gap-2 text-left">
                                                    <LogOut size={14} /> Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity flex items-center gap-2"
                                >
                                    <User size={18} />
                                    Sign In
                                </Link>
                            )}

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-[#86162f] hover:opacity-70 transition-opacity"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingCart size={24} />
                                <span className="absolute -top-1 -right-1 bg-[#86162f] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-poppins">
                                    {cartTotalCount}
                                </span>
                            </button>

                            <button
                                onClick={toggleMenu}
                                className="relative p-2 text-[#86162f] hover:opacity-70 transition-opacity focus:outline-none"
                                aria-label="Toggle Menu"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="relative block w-6 h-5">
                                    <span
                                        className={`absolute left-0 top-1/2 h-0.5 w-6 bg-[#86162f] transition-all duration-300 ${isMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'}`}
                                    />
                                    <span
                                        className={`absolute left-0 top-1/2 h-0.5 w-6 bg-[#86162f] transition-all duration-300 ${isMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5 rotate-0'}`}
                                    />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hamburger Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full z-[55] bg-[#fcf9f8] w-full md:w-1/2 flex flex-col pt-24 pb-12 px-8 overflow-y-auto shadow-2xl"
                    >
                        {/* Backdrop for desktop */}
                        <div
                            className="hidden md:block fixed inset-0 bg-black/20 -z-10 cursor-pointer"
                            onClick={closeMenu}
                        />
                        <div className="max-w-screen-xl mx-auto w-full flex flex-col gap-12">
                            {/* La Fête Section */}
                            <div>
                                <h3 className="font-seasons text-[#86162f] text-3xl mb-6">La Fête</h3>
                                <div className="flex flex-col gap-4 pl-4 border-l border-[#86162f]/20">
                                    <Link
                                        href={laFeteLinks[0].href}
                                        onClick={closeMenu}
                                        className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform"
                                    >
                                        {laFeteLinks[0].name}
                                    </Link>

                                    {/* La Fete All Products Dropdown */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href="/products"
                                                onClick={closeMenu}
                                                className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform"
                                            >
                                                All Products
                                            </Link>
                                            <button
                                                onClick={() => setLaFeteAllProductsOpen(!laFeteAllProductsOpen)}
                                                className="p-1 text-[#86162f] focus:outline-none"
                                            >
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform duration-300 ${laFeteAllProductsOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {laFeteAllProductsOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex flex-col gap-3 pl-6">
                                                        <Link href="/products#les-gateaux" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">Les Gateaux</Link>
                                                        <Link href="/products#petit-indulgences" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">Petit Indulgences</Link>
                                                        <Link href="/products#by-diet" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">By Diet</Link>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <Link
                                        href={laFeteLinks[1].href}
                                        onClick={closeMenu}
                                        className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform"
                                    >
                                        {laFeteLinks[1].name}
                                    </Link>
                                </div>
                            </div>

                            {/* Snackfest Section */}
                            <div>
                                <h3 className="font-seasons text-[#86162f] text-3xl mb-6">Snackfest</h3>
                                <div className="flex flex-col gap-4 pl-4 border-l border-[#86162f]/20">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href="/products"
                                                onClick={closeMenu}
                                                className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform"
                                            >
                                                All Products
                                            </Link>
                                            <button
                                                onClick={() => setSnackfestOpen(!snackfestOpen)}
                                                className="p-1 text-[#86162f] focus:outline-none"
                                            >
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform duration-300 ${snackfestOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {snackfestOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex flex-col gap-3 pl-6">
                                                        <Link href="/products#granola" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">Granola</Link>
                                                        <Link href="/products#spreads" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">Spreads</Link>
                                                        <Link href="/products#cake-mixes" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">Cake Mixes</Link>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile User Profile Menu */}
                            {isAuthenticated && (
                                <div>
                                    <h3 className="font-seasons text-[#86162f] text-3xl mb-6">My Account</h3>
                                    <div className="flex flex-col gap-4 pl-4 border-l border-[#86162f]/20">
                                        <Link href="/profile" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform">My Profile</Link>
                                        <Link href="/orders" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform">Order History</Link>
                                        <Link href="/orders" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform">Track Orders</Link>
                                        <Link href="/profile/addresses" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform">Saved Addresses</Link>
                                        {typeof window !== 'undefined' && getStoredUserRole() === 'ADMIN' && (
                                            <>
                                                <div className="h-px bg-[#86162f]/20 w-8 my-2"></div>
                                                <Link href="/admin" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform font-bold">Admin Dashboard</Link>
                                                <Link href="/admin/orders" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform">Orders Management</Link>
                                                <Link href="/admin/products" onClick={closeMenu} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform">Products & Categories</Link>
                                            </>
                                        )}
                                        <div className="h-px bg-[#86162f]/20 w-8 my-2"></div>
                                        <button onClick={handleLogout} className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform flex items-center gap-2 text-left">
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Brand Info */}
                            <div className="mt-auto pt-10 border-t border-[#86162f]/10">
                                <p className="font-poppins text-[#86162f]/60 text-xs uppercase tracking-widest">
                                    EST. 2019 · MUMBAI
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer Overlay */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-[#86162f]/10">
                                <h2 className="font-seasons text-[#86162f] text-2xl">Your Basket</h2>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-2 text-[#86162f] hover:bg-[#86162f]/5 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                                {Object.values(cart).length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                        <ShoppingCart size={48} className="mb-4" />
                                        <p className="font-poppins text-lg">Your basket is empty</p>
                                        <button
                                            onClick={() => setIsCartOpen(false)}
                                            className="mt-4 text-[#86162f] font-poppins font-semibold uppercase text-xs tracking-widest border-b border-[#86162f]"
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    Object.values(cart).map((item) => (
                                        <div key={item.name} className="flex gap-4 items-start">
                                            <div className="w-20 h-20 bg-[#f5f0ed] rounded-sm flex items-center justify-center shrink-0">
                                                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-seasons text-[#86162f] text-lg leading-tight mb-1">{item.name}</h4>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-3 bg-[#f5f0ed] px-2 py-1 rounded-sm">
                                                        <button
                                                            onClick={() => updateQuantity(item.name, -1)}
                                                            className="text-[#86162f] hover:opacity-70"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="font-poppins text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.name, 1)}
                                                            className="text-[#86162f] hover:opacity-70"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <span className="font-poppins font-semibold text-[#86162f]">₹{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {Object.values(cart).length > 0 && (
                                <div className="p-8 border-t border-[#86162f]/10 bg-[#fcf9f8]">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="font-poppins text-gray-600 uppercase tracking-widest text-xs">Subtotal</span>
                                        <span className="font-poppins font-bold text-[#86162f] text-xl">₹{cartTotalAmount}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            const authenticated =
                                                typeof window !== 'undefined' &&
                                                !!globalThis.localStorage.getItem('la-fete-access-token');
                                            if (authenticated) {
                                                router.push('/checkout');
                                            } else {
                                                router.push('/auth');
                                            }
                                        }}
                                        className="w-full py-4 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-sm uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-xl flex items-center justify-center"
                                    >
                                        Checkout
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
