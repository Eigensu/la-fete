'use client';

import Image from 'next/image';

export default function About() {
    return (
        <section id="about" className="relative min-h-screen grid md:grid-cols-5 items-center bg-white">
            {/* Left: Image - takes 2 columns */}
            <div className="relative h-[60vh] md:h-screen overflow-hidden bg-[#f5f0ed] md:col-span-2">
                <Image
                    src="/Gemini_Generated_Image_wp5afjwp5afjwp5a.png"
                    alt="A signature La Fête 365 cake"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                    priority
                />
            </div>

            {/* Right: Content - takes 3 columns */}
            <div className="px-8 md:px-16 lg:px-20 xl:px-24 py-16 md:py-24 md:col-span-3">
                <div>
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
                            className="px-8 py-4 bg-[#86162f] text-white text-center font-poppins text-sm uppercase tracking-wider hover:bg-[#a82043] transition-colors"
                        >
                            Order Now
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
