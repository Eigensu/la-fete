'use client';

import Image from 'next/image';

export default function Hero() {
    return (
        <section id="home" className="relative h-screen flex items-end overflow-hidden">
            {/* Background photograph */}
            <div className="absolute inset-0">
                <Image
                    src="/wallpaper1.jpg"
                    alt="La Fête Bakery"
                    fill
                    priority
                    className="object-cover object-center"
                />
                {/* A quiet scrim, only where the type sits, not a wash over the whole photo */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full px-8 sm:px-12 md:px-16 lg:px-20 pb-16 md:pb-20">
                <p className="text-white/70 text-[11px] md:text-xs uppercase tracking-[0.5em] font-poppins font-light mb-5">
                    Premium Luxury Bakery · Mumbai
                </p>
                <h1 className="font-seasons text-white text-6xl md:text-8xl lg:text-9xl leading-[0.95]">
                    La Fête 365
                </h1>
            </div>
        </section>
    );
}
