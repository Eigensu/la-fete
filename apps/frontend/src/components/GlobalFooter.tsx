'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function GlobalFooter() {
    const pathname = usePathname();
    
    // Exclude footer from specific non-public or app-like routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/checkout')) {
        return null;
    }

    return <Footer />;
}
