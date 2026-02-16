'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const heroHeight = window.innerHeight; // Hero is full viewport height

            // Update scrolled state (for styling)
            setIsScrolled(currentScrollY > 50);

            // Only hide/show navbar after scrolling past hero
            if (currentScrollY > heroHeight) {
                // Scrolling down - hide navbar
                if (currentScrollY > lastScrollY) {
                    setIsVisible(false);
                }
                // Scrolling up - show navbar
                else {
                    setIsVisible(true);
                }
            } else {
                // Always show navbar in hero section
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4'
                } ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="max-w-7xl mx-auto px-8 md:px-16">
                <div className="flex items-center justify-end gap-10">
                    {/* Desktop Navigation - Right aligned */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link
                            href="#products"
                            className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                        >
                            Products
                        </Link>
                        <Link
                            href="#contact"
                            className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                        >
                            Contact
                        </Link>
                        <a
                            href="tel:+919867281799"
                            className="font-poppins text-sm uppercase tracking-wider text-[#86162f] hover:opacity-70 transition-opacity"
                        >
                            Order Now
                        </a>
                    </div>

                    {/* Mobile Order Button */}
                    <a
                        href="tel:+919867281799"
                        className="md:hidden px-5 py-2 text-[#86162f] border-2 border-[#86162f] font-poppins text-xs uppercase tracking-wider"
                    >
                        Order
                    </a>
                </div>
            </div>
        </nav>
    );
}
