'use client';

export default function About() {
    return (
        <section className="min-h-screen grid md:grid-cols-5 items-center bg-white">
            {/* Left: Image - takes 2 columns */}
            <div className="relative h-[60vh] md:h-screen overflow-hidden bg-[#f5f0ed] md:col-span-2">
                <div className="absolute inset-0 flex items-center justify-center p-12 md:p-16">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {/* Placeholder for product image */}
                        <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right: Content - takes 3 columns */}
            <div className="px-8 md:px-16 lg:px-20 py-16 md:py-24 md:col-span-3">
                <div className="max-w-xl">
                    <p className="text-[#86162f] text-xs md:text-sm uppercase tracking-[0.3em] mb-6 font-poppins font-light">
                        EST. 2019 · MUMBAI, INDIA
                    </p>

                    <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl mb-8 leading-tight">
                        Where Celebration Meets Consciousness
                    </h2>

                    <div className="space-y-6 text-gray-700 font-poppins text-sm md:text-base leading-relaxed">
                        <p>
                            La Fête 365 is a modern luxury bakery redefining indulgence for the conscious generation.
                            We craft clean, handmade desserts that deliver pleasure with purpose — where flavor,
                            modern design, and mindful living coexist beautifully.
                        </p>

                        <p>
                            Every bake reflects skill, care, and aesthetic balance. No refined flour, no hidden additives —
                            just premium ingredients and conscious recipes that leave you feeling satisfied and inspired.
                        </p>
                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row gap-4">
                        <a
                            href="tel:+919867281799"
                            className="px-8 py-4 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white text-center font-poppins text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                            Order Now
                        </a>
                        <a
                            href="#products"
                            className="px-8 py-4 border-2 border-[#86162f] text-[#86162f] text-center font-poppins text-sm uppercase tracking-wider hover:bg-gradient-to-r hover:from-[#86162f] hover:via-[#a82043] hover:to-[#f8aeb2] hover:text-white hover:border-transparent transition-all"
                        >
                            View Products
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
