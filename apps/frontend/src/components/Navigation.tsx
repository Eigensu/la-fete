'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { toTitleCase } from '@/utils/format';
import { X, ChevronDown, ShoppingCart, Plus, Minus, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { logout as apiLogout } from '@/lib/auth-api';
import Image from 'next/image';
import { PRODUCT_CARD_IMAGES, pickImage } from '@/lib/gallery-images';

function getStoredUserRole(): string | undefined {
    try {
        return JSON.parse(globalThis.localStorage?.getItem('la-fete-user') || '{}')?.role;
    } catch {
        return undefined;
    }
}

/** One entry in the drawer menu. An entry with `children` is a collapsible
 *  section: the row itself opens and closes it rather than navigating, so a
 *  thumb never lands on a link when it meant to expand. The section's own page
 *  is always reachable as the first child ("Shop All", "All Signature
 *  Gateaux"). Nesting is arbitrary depth, which is what lets Signature Gateaux
 *  collapse inside Bakes. */
type MenuNode = {
    label: string;
    href: string;
    /** Stable id for the open/closed map. Defaults to `href`, and is only
     *  needed where two entries point at the same page (Bakes / Shop All). */
    key?: string;
    children?: MenuNode[];
};

const SIGNATURE_GATEAUX: MenuNode[] = [
    { label: 'All Signature Gateaux', href: '/products/bakes/signature-gateaux', key: 'gateaux-all' },
    { label: 'Dark Chocolate', href: '/products/bakes/signature-gateaux/dark-chocolate' },
    { label: 'White Chocolate', href: '/products/bakes/signature-gateaux/white-chocolate' },
    { label: 'Coffee', href: '/products/bakes/signature-gateaux/coffee' },
    { label: 'Praline', href: '/products/bakes/signature-gateaux/praline' },
    { label: 'Pistachio', href: '/products/bakes/signature-gateaux/pistachio' },
    { label: 'Citrus', href: '/products/bakes/signature-gateaux/citrus' },
    { label: 'Liquor Infused', href: '/products/bakes/signature-gateaux/liquor-infused' },
];

const MAIN_MENU: MenuNode[] = [
    { label: 'Home', href: '/' },
    {
        label: 'Bakes',
        href: '/products/bakes',
        key: 'bakes',
        children: [
            { label: 'Shop All', href: '/products/bakes', key: 'bakes-all' },
            {
                label: 'Signature Gateaux',
                href: '/products/bakes/signature-gateaux',
                key: 'signature-gateaux',
                children: SIGNATURE_GATEAUX,
            },
            { label: 'Tea Cakes', href: '/products/bakes/tea-cakes' },
            { label: 'Tub Cakes', href: '/products/bakes/tub-cakes' },
            { label: 'Bestsellers', href: '/products/bakes/bestsellers' },
            { label: 'Seasonal Special', href: '/products/bakes/seasonal-special' },
        ],
    },
    { label: 'Hampers', href: '/hampers' },
    { label: 'Celebrate with Us', href: '/celebrate' },
];

/** Type scale per nesting level — larger on touch, tighter from md up, so the
 *  hierarchy reads without extra chrome and every row stays thumb-sized. */
const LEVEL_STYLES = [
    'text-[19px] md:text-[17px] font-medium',
    'text-[16px] md:text-[14px]',
    'text-[15px] md:text-[13px]',
] as const;

const ROW_BASE =
    'w-full flex items-center rounded-lg transition-colors duration-200 font-poppins leading-snug text-left';

function MenuTree({
    nodes,
    depth,
    pathname,
    openSections,
    onToggle,
    onNavigate,
}: {
    nodes: MenuNode[];
    depth: number;
    pathname: string;
    openSections: Record<string, boolean>;
    onToggle: (key: string) => void;
    onNavigate: () => void;
}) {
    return (
        <ul
            className={
                depth === 0
                    ? 'flex flex-col gap-0.5'
                    : 'flex flex-col gap-0.5 ml-2 pl-2 md:ml-3 md:pl-3 border-l border-[#86162f]/15'
            }
        >
            {nodes.map((node) => {
                const key = node.key ?? node.href;
                const children = node.children ?? [];
                const isOpen = !!openSections[key];
                const isActive = pathname === node.href;
                const size = LEVEL_STYLES[Math.min(depth, LEVEL_STYLES.length - 1)];
                const tone = isActive
                    ? 'bg-[#86162f]/[0.08] text-[#86162f] font-semibold'
                    : 'text-[#86162f]/80 hover:bg-[#86162f]/[0.05] hover:text-[#86162f]';
                const focus =
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30';

                return (
                    <li key={key} className="flex flex-col">
                        {children.length > 0 ? (
                            // The whole row toggles: on a phone the chevron alone
                            // is far too small a target to be the only way in.
                            <button
                                type="button"
                                onClick={() => onToggle(key)}
                                aria-expanded={isOpen}
                                aria-controls={`submenu-${key}`}
                                className={`${ROW_BASE} ${size} ${tone} ${focus} justify-between gap-2 px-3 py-2.5`}
                            >
                                <span className="min-w-0 truncate">{node.label}</span>
                                <ChevronDown
                                    size={depth === 0 ? 18 : 16}
                                    className={`shrink-0 text-[#86162f]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                        ) : (
                            <Link
                                href={node.href}
                                onClick={onNavigate}
                                aria-current={isActive ? 'page' : undefined}
                                className={`${ROW_BASE} ${size} ${tone} ${focus} px-3 py-2.5`}
                            >
                                {node.label}
                            </Link>
                        )}

                        <AnimatePresence initial={false}>
                            {children.length > 0 && isOpen && (
                                <motion.div
                                    id={`submenu-${key}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="py-1">
                                        <MenuTree
                                            nodes={children}
                                            depth={depth + 1}
                                            pathname={pathname}
                                            openSections={openSections}
                                            onToggle={onToggle}
                                            onNavigate={onNavigate}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                );
            })}
        </ul>
    );
}

export default function Navigation() {
    const pathname = usePathname() || '/';
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart, cartTotalCount, cartTotalAmount, updateQuantity, clearCart } = useCart();
    const router = useRouter();
    const profileRef = useRef<HTMLDivElement>(null);
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
            setIsScrolled(window.scrollY > 50);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen((open) => !open);
    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
    }, []);

    const toggleSection = useCallback((key: string) => {
        setOpenSections((sections) => ({ ...sections, [key]: !sections[key] }));
    }, []);

    // Opening the drawer reveals the branch you are already browsing, so the
    // current page is never buried behind two collapsed levels.
    useEffect(() => {
        if (!isMenuOpen) return;
        setOpenSections({
            bakes: pathname.startsWith('/products/bakes'),
            'signature-gateaux': pathname.startsWith('/products/bakes/signature-gateaux'),
        });
    }, [isMenuOpen, pathname]);

    // Escape closes whatever is open, innermost layer first.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (isCartOpen) setIsCartOpen(false);
            else if (profileMenuOpen) setProfileMenuOpen(false);
            else if (isMenuOpen) closeMenu();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isCartOpen, isMenuOpen, profileMenuOpen, closeMenu]);

    // The profile dropdown is not a drawer — a click anywhere else dismisses it.
    useEffect(() => {
        if (!profileMenuOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!profileRef.current?.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [profileMenuOpen]);

    // Keep the page behind an open drawer still instead of scrolling under it.
    // Hiding the scrollbar widens the viewport, so pad by exactly its width or
    // the whole page visibly jumps sideways as a drawer opens.
    useEffect(() => {
        if (!isMenuOpen && !isCartOpen) return;
        const { overflow, paddingRight } = document.body.style;
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
        return () => {
            document.body.style.overflow = overflow;
            document.body.style.paddingRight = paddingRight;
        };
    }, [isMenuOpen, isCartOpen]);

    const iconButton =
        'relative p-2 rounded-full text-[#86162f] hover:bg-[#86162f]/[0.07] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30';

    const cartButton = (size: number) => (
        <button
            onClick={() => setIsCartOpen(true)}
            className={iconButton}
            aria-label={`Shopping cart, ${cartTotalCount} item${cartTotalCount === 1 ? '' : 's'}`}
        >
            <ShoppingCart size={size} />
            {cartTotalCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#86162f] text-white text-[10px] leading-none min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full font-poppins font-medium">
                    {cartTotalCount > 9 ? '9+' : cartTotalCount}
                </span>
            )}
        </button>
    );

    const hamburger = (
        <button
            onClick={toggleMenu}
            className="group flex items-center gap-3 p-2 rounded-full text-[#86162f] hover:bg-[#86162f]/[0.07] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
        >
            <span className="relative block w-6 h-5">
                <span
                    className={`absolute left-0 top-1/2 h-0.5 w-6 bg-[#86162f] rounded-full transition-all duration-300 ${isMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'}`}
                />
                <span
                    className={`absolute left-0 top-1/2 h-0.5 bg-[#86162f] rounded-full transition-all duration-300 ${isMenuOpen ? 'w-6 translate-y-0 -rotate-45' : 'w-4 translate-y-1.5 rotate-0 group-hover:w-6'}`}
                />
            </span>
            <span className="hidden lg:inline font-poppins text-[11px] uppercase tracking-[0.25em]">
                {isMenuOpen ? 'Close' : 'Menu'}
            </span>
        </button>
    );

    const wordmark = (sizeClass: string) => (
        <Link
            href="/"
            onClick={closeMenu}
            aria-label="La Fête 365, home"
            className={`font-seasons text-[#86162f] ${sizeClass} tracking-tight whitespace-nowrap px-2 rounded-sm hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30`}
        >
            La Fête 365
        </Link>
    );

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-[60] transition-all duration-300 ${
                    isMenuOpen
                        ? 'bg-transparent'
                        : (pathname === '/'
                            ? (isScrolled
                                ? 'bg-[#fcf9f8]/95 backdrop-blur-md border-b border-[#86162f]/10 shadow-[0_1px_16px_rgba(134,22,47,0.06)] md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none'
                                : 'bg-gradient-to-b from-[#fcf9f8]/80 via-[#fcf9f8]/30 to-transparent')
                            : 'bg-[#fcf9f8]/95 backdrop-blur-md border-b border-[#86162f]/10 shadow-[0_1px_16px_rgba(134,22,47,0.06)]')
                }`}
            >
                <div className="relative w-full px-4 sm:px-8 md:px-10 lg:px-12">
                    {/* Mobile bar — hamburger left, wordmark centred, account + cart right */}
                    <div className="flex md:hidden items-center justify-between h-16">
                        {hamburger}

                        <div className="absolute left-1/2 -translate-x-1/2">
                            {wordmark('text-lg')}
                        </div>

                        <div className="flex items-center gap-1">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className={iconButton}
                                    aria-label="Profile menu"
                                    aria-expanded={profileMenuOpen}
                                >
                                    <User size={22} />
                                </button>
                            ) : (
                                <Link href="/auth" className={iconButton} aria-label="Sign in">
                                    <User size={22} />
                                </Link>
                            )}

                            {cartButton(22)}
                        </div>
                    </div>

                    {/* Desktop bar — hamburger left, wordmark centred, account controls right */}
                    <div className="hidden md:flex items-center justify-between h-[72px] relative">
                        {hamburger}

                        <div className="absolute left-1/2 -translate-x-1/2">
                            {wordmark('text-2xl')}
                        </div>

                        <div className="flex items-center gap-2">
                            {isAuthenticated ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        aria-expanded={profileMenuOpen}
                                        aria-haspopup="menu"
                                        className="font-poppins text-[11px] uppercase tracking-[0.2em] text-[#86162f] px-3 py-2 rounded-full hover:bg-[#86162f]/[0.07] transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30"
                                    >
                                        <User size={18} />
                                        Profile
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {profileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.18 }}
                                                role="menu"
                                                className="absolute right-0 top-full mt-3 w-56 bg-white shadow-xl shadow-[#86162f]/10 border border-[#86162f]/10 rounded-xl overflow-hidden flex flex-col p-1.5"
                                            >
                                                <Link href="/profile" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">My Profile</Link>
                                                <Link href="/orders" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">Order History</Link>
                                                <Link href="/orders" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">Track Orders</Link>
                                                <Link href="/profile/addresses" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">Saved Addresses</Link>
                                                {typeof window !== 'undefined' && getStoredUserRole() === 'ADMIN' && (
                                                    <>
                                                        <div className="border-t border-[#86162f]/10 my-1.5"></div>
                                                        <p className="px-3 pb-1 font-poppins text-[10px] uppercase tracking-[0.2em] text-[#86162f]/40">Admin</p>
                                                        <Link href="/admin" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f] hover:bg-[#86162f]/5 rounded-lg font-semibold text-left transition-colors">Admin Dashboard</Link>
                                                        <Link href="/admin/orders" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">Orders Management</Link>
                                                        <Link href="/admin/products" onClick={closeMenu} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg text-left transition-colors">Products &amp; Categories</Link>
                                                    </>
                                                )}
                                                <div className="border-t border-[#86162f]/10 my-1.5"></div>
                                                <button onClick={handleLogout} className="px-3 py-2 text-sm font-poppins text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-lg flex items-center gap-2 text-left transition-colors">
                                                    <LogOut size={14} /> Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="font-poppins text-[11px] uppercase tracking-[0.2em] text-[#86162f] px-3 py-2 rounded-full hover:bg-[#86162f]/[0.07] transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86162f]/30"
                                >
                                    <User size={18} />
                                    Sign In
                                </Link>
                            )}

                            {cartButton(24)}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Menu drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            key="menu-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMenu}
                            aria-hidden="true"
                            className="fixed inset-0 z-[50] bg-black/25 backdrop-blur-[2px] cursor-pointer"
                        />
                        <motion.div
                            key="menu-panel"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            className="fixed top-0 left-0 h-full z-[55] bg-[#fcf9f8] w-full sm:w-[360px] flex flex-col pt-20 md:pt-24 pb-10 overflow-y-auto shadow-2xl"
                        >
                            <nav aria-label="Main menu" className="w-full flex flex-col gap-7 px-4 sm:px-5">
                                <div>
                                    <p className="px-3 pb-2 font-poppins text-[10px] uppercase tracking-[0.28em] text-[#86162f]/40">
                                        Browse
                                    </p>
                                    <MenuTree
                                        nodes={MAIN_MENU}
                                        depth={0}
                                        pathname={pathname}
                                        openSections={openSections}
                                        onToggle={toggleSection}
                                        onNavigate={closeMenu}
                                    />

                                    {isAuthenticated && typeof window !== 'undefined' && getStoredUserRole() === 'ADMIN' && (
                                        <Link
                                            href="/admin"
                                            onClick={closeMenu}
                                            className="mt-1 block px-3 py-2.5 rounded-lg font-poppins text-[19px] md:text-[17px] leading-snug font-semibold text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                </div>

                                {isAuthenticated ? (
                                    <div>
                                        <p className="px-3 pb-2 font-poppins text-[10px] uppercase tracking-[0.28em] text-[#86162f]/40">
                                            My Account
                                        </p>
                                        <div className="flex flex-col gap-0.5">
                                            <Link href="/profile" onClick={closeMenu} className="px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors">My Profile</Link>
                                            <Link href="/orders" onClick={closeMenu} className="px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors">Order History</Link>
                                            <Link href="/orders" onClick={closeMenu} className="px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors">Track Orders</Link>
                                            <Link href="/profile/addresses" onClick={closeMenu} className="px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors">Saved Addresses</Link>
                                            {typeof window !== 'undefined' && getStoredUserRole() === 'ADMIN' && (
                                                <>
                                                    <Link href="/admin/orders" onClick={closeMenu} className="px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors">Orders Management</Link>
                                                    <Link href="/admin/products" onClick={closeMenu} className="px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] transition-colors">Products &amp; Categories</Link>
                                                </>
                                            )}
                                            <button onClick={handleLogout} className="mt-1 px-3 py-2.5 rounded-lg font-poppins text-[16px] md:text-[14px] leading-snug text-[#86162f]/80 hover:text-[#86162f] hover:bg-[#86162f]/[0.05] flex items-center gap-2 text-left transition-colors">
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href="/auth"
                                        onClick={closeMenu}
                                        className="mx-3 py-3 text-center border border-[#86162f]/25 rounded-full font-poppins text-[11px] uppercase tracking-[0.2em] text-[#86162f] hover:bg-[#86162f] hover:text-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </nav>
                        </motion.div>
                    </>
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
                                    aria-label="Close basket"
                                    className="p-2 text-[#86162f] hover:bg-[#86162f]/5 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 md:gap-6">
                                {Object.entries(cart).length === 0 ? (
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
                                    Object.entries(cart).map(([cartKey, item]) => (
                                        <div key={cartKey} className="flex gap-4 items-start">
                                            <div className="w-20 h-20 bg-[#f5f0ed] rounded-sm flex items-center justify-center shrink-0 relative overflow-hidden">
                                                {item.productId || item.name ? (
                                                    <Image 
                                                        src={pickImage(String(item.productId ?? item.name), PRODUCT_CARD_IMAGES)} 
                                                        alt={item.name} 
                                                        fill 
                                                        sizes="80px" 
                                                        className="object-cover" 
                                                    />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-poppins font-medium text-[#86162f] text-sm leading-tight mb-1">{toTitleCase(item.name)}</h4>
                                                {(item.sweetener || item.cakeTopper || item.numberTopper || item.celebrationTopper) && (
                                                    <div className="text-xs text-gray-500 mb-2 font-poppins space-y-0.5">
                                                        {item.sweetener && <p>Sweetener: {item.sweetener}</p>}
                                                        {item.cakeTopper && <p>Topper: {item.topperText || 'Yes'}</p>}
                                                        {item.numberTopper && <p>Number Topper: {item.numberTopperText || 'Yes'}</p>}
                                                        {item.celebrationTopper && <p>Celebration Topper: {item.celebrationTopperType || 'Yes'}</p>}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-3 bg-[#f5f0ed] px-2 py-1 rounded-sm">
                                                        <button
                                                            onClick={() => updateQuantity(cartKey, -1)}
                                                            className="text-[#86162f] hover:opacity-70"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="font-poppins text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(cartKey, 1)}
                                                            className="text-[#86162f] hover:opacity-70"
                                                            aria-label="Increase quantity"
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
                                        className="w-full py-4 bg-[#86162f] text-white font-poppins text-sm uppercase tracking-widest hover:bg-[#a82043] transition-colors flex items-center justify-center"
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
