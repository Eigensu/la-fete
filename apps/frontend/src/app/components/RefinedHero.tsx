'use client';

export default function RefinedHero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef9f8] via-white to-[#fce4e6]/20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-[#f8aeb2]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#86162f]/5 rounded-full blur-3xl"></div>

            <div className="max-w-6xl mx-auto px-8 md:px-16 py-32 md:py-40 relative z-10">
                <div className="text-center">
                    {/* Tagline */}
                    <p className="text-[#86162f] text-xs md:text-sm uppercase tracking-[0.3em] mb-12 font-poppins font-light">
                        EST. 2019 · MUMBAI, INDIA
                    </p>

                    {/* HERO - Main brand name */}
                    <h1 className="font-seasons text-[#86162f] text-6xl md:text-8xl lg:text-9xl mb-8 leading-[1.1]">
                        La Fête 365
                    </h1>

                    {/* Tagline */}
                    <h2 className="font-seasons text-[#86162f] text-2xl md:text-3xl lg:text-4xl mb-8 leading-tight">
                        Where Celebration Meets Consciousness
                    </h2>

                    {/* Body text */}
                    <p className="font-poppins text-base md:text-lg text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
                        A modern luxury bakery redefining indulgence for the conscious generation.
                        Clean, handmade desserts that deliver pleasure with purpose.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                        <a
                            href="tel:+919867281799"
                            className="px-10 py-4 bg-[#86162f] text-white font-poppins text-sm uppercase tracking-wider hover:bg-[#a82043] transition-colors min-w-[200px] text-center"
                        >
                            Order Now
                        </a>
                        <a
                            href="#products"
                            className="px-10 py-4 border-2 border-[#86162f] text-[#86162f] font-poppins text-sm uppercase tracking-wider hover:bg-[#86162f] hover:text-white transition-colors min-w-[200px] text-center"
                        >
                            Explore
                        </a>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto pt-12 border-t border-[#e8d8d4]">
                        <div className="text-center">
                            <p className="font-seasons text-[#86162f] text-2xl mb-2">No Refined Flour</p>
                            <p className="font-poppins text-xs text-gray-500 uppercase tracking-wider">Healthier alternatives</p>
                        </div>
                        <div className="text-center">
                            <p className="font-seasons text-[#86162f] text-2xl mb-2">Premium Ingredients</p>
                            <p className="font-poppins text-xs text-gray-500 uppercase tracking-wider">Consciously sourced</p>
                        </div>
                        <div className="text-center">
                            <p className="font-seasons text-[#86162f] text-2xl mb-2">Handcrafted Daily</p>
                            <p className="font-poppins text-xs text-gray-500 uppercase tracking-wider">Made with care</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg
                    className="w-6 h-6 text-[#86162f]/50"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
            </div>
        </section>
    );
}
