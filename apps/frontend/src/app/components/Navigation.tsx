'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [snackfestOpen, setSnackfestOpen] = useState(false);
    const [laFeteAllProductsOpen, setLaFeteAllProductsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const heroHeight = window.innerHeight;

            setIsScrolled(currentScrollY > 50);

            if (currentScrollY > heroHeight) {
                if (currentScrollY > lastScrollY && !isMenuOpen) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => {
        setIsMenuOpen(false);
        setSnackfestOpen(false);
        setLaFeteAllProductsOpen(false);
    };

    const laFeteLinks = [
        { name: 'About Us', href: '/#about' },
        { name: 'Contact', href: '/#contact' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-[60] transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white py-3 shadow-sm' : 'py-4'
                    } ${isVisible ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="w-full px-6 sm:px-8 md:px-10 lg:px-12">
                    <div className="flex items-center justify-between">
                        {/* Desktop Navigation - Left aligned links */}
                        <div className="hidden md:flex items-center gap-8">
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
                                href="/#contact"
                                className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Order Now Button (Mobile/Tablet scale) */}
                        <div className="flex items-center gap-6">
                            <a
                                href="tel:+919867281799"
                                className="font-poppins text-sm uppercase tracking-wider text-[#86162f] border-2 border-[#86162f] px-4 py-1.5 hover:bg-[#86162f] hover:text-white transition-all"
                            >
                                Order Now
                            </a>

                            {/* Hamburger Menu Toggle */}
                            <button
                                onClick={toggleMenu}
                                className="p-2 text-[#86162f] hover:opacity-70 transition-opacity focus:outline-none"
                                aria-label="Toggle Menu"
                            >
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
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
                        className="fixed top-0 right-0 h-full z-[55] bg-white w-full md:w-1/2 flex flex-col pt-24 pb-12 px-8 overflow-y-auto shadow-2xl"
                    >
                        {/* Backdrop for desktop */}
                        <div
                            className="hidden md:block fixed inset-0 bg-black/20 -z-10 cursor-pointer"
                            onClick={closeMenu}
                        />
                        <div className="max-w-screen-xl mx-auto w-full flex flex-col gap-12">
                            {/* La Fête Section */}
                            <div>
                                <h3 className="font-seasons text-[#86162f] text-3xl mb-6">
                                    La Fête
                                </h3>
                                <div className="flex flex-col gap-4 pl-4 border-l border-[#86162f]/20">
                                    {laFeteLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={closeMenu}
                                            className="font-poppins text-lg text-[#86162f] hover:translate-x-2 transition-transform"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}

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
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${laFeteAllProductsOpen ? 'rotate-180' : ''}`} />
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
                                                        <Link href="/products#diet" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">By Diet</Link>
                                                        <Link href="/products#cravings" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">By Cravings</Link>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Snackfest Section */}
                            <div>
                                <h3 className="font-seasons text-[#86162f] text-3xl mb-6">
                                    Snackfest
                                </h3>
                                <div className="flex flex-col gap-4 pl-4 border-l border-[#86162f]/20">
                                    {/* Snackfest All Products Collapsible */}
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
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${snackfestOpen ? 'rotate-180' : ''}`} />
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
                                                        <Link href="/products" onClick={closeMenu} className="font-poppins text-base text-[#86162f] font-medium border-b border-[#86162f]/10 pb-1">By Diet</Link>

                                                        <div className="mt-2 flex flex-col gap-2">
                                                            <Link href="/products" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">New Arrivals</Link>
                                                            <Link href="/products" onClick={closeMenu} className="font-poppins text-base text-[#86162f]/70 hover:text-[#86162f]">Best Sellers</Link>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

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
        </>
    );
}
