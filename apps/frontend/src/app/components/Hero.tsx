'use client';

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/wallpaper.jpg)' }}
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#fce4e6]/40 via-[#fef9f8]/50 to-white/60"></div>
            </div>

            {/* Decorative background effects */}
            <div className="absolute inset-0 z-[1]">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#f8aeb2]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#86162f]/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-8">
                {/* Title with glow */}
                <div className="relative inline-block">
                    {/* Glow effect behind */}
                    <div className="absolute inset-0 text-[#f8aeb2] blur-2xl opacity-60">
                        <h1 className="font-seasons text-7xl md:text-8xl lg:text-9xl">
                            La Fête
                        </h1>
                    </div>
                    {/* Actual title */}
                    <h1 className="relative font-seasons text-[#86162f] text-7xl md:text-8xl lg:text-9xl mb-6">
                        La Fête
                    </h1>
                </div>

                <p className="text-[#86162f] text-sm md:text-base uppercase tracking-[0.4em] font-poppins font-light">
                    Premium Luxury Bakery
                </p>
            </div>
        </section>
    );
}
