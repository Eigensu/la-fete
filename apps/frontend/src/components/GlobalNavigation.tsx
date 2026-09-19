'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function GlobalNavigation() {
    const pathname = usePathname();
    
    // Exclude navigation from specific app-like routes that handle their own header
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/checkout')) {
        return null;
    }

    return <Navigation />;
}
