'use client';

export default function Footer() {
    return (
        <section id="contact" className="py-10 md:py-20 bg-[#86162f] text-white">
            <div className="max-w-screen-xl mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-24">
                    {/* Left side: Heading, Text, and Button */}
                    <div className="flex-1 text-left">
                        <p className="text-[#f8aeb2] text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-poppins font-light mb-2 md:mb-4">
                            Get in Touch
                        </p>
                        <h2 className="font-seasons text-2xl md:text-5xl mb-3 md:mb-6 leading-tight">
                            Conscious indulgence, made to order
                        </h2>

                        <p className="font-poppins text-xs md:text-base text-white/75 leading-relaxed mb-5 md:mb-8 max-w-xl">
                            Every creation is handcrafted with premium ingredients, so each bite is a celebration
                            of flavor and mindfulness. Reach out for your next occasion, or your everyday luxury.
                        </p>

                        <a
                            href="tel:+919867281799"
                            className="inline-block px-8 py-2.5 md:px-10 md:py-3.5 bg-white text-[#86162f] font-poppins text-xs md:text-sm uppercase tracking-wider hover:bg-[#f8aeb2] transition-colors"
                        >
                            Place an Order
                        </a>
                    </div>

                    {/* Right side: Contact Info — side by side on mobile, stacked on desktop */}
                    <div className="grid grid-cols-3 md:flex md:flex-col gap-5 md:gap-6 w-full md:w-auto md:min-w-[280px] md:border-l md:border-white/15 md:pl-12">
                        <div>
                            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] mb-1 md:mb-2 text-white/50 font-poppins">Email</p>
                            <a href="mailto:hello@lafete365.com" className="block font-poppins text-xs md:text-sm leading-normal hover:text-[#f8aeb2] transition-colors">
                                hello@lafete365.com
                            </a>
                        </div>

                        <div>
                            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] mb-1 md:mb-2 text-white/50 font-poppins">Phone</p>
                            <a href="tel:+919867281799" className="block font-poppins text-xs md:text-sm leading-normal hover:text-[#f8aeb2] transition-colors">
                                +91 98672 81799
                            </a>
                        </div>

                        <div>
                            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] mb-1 md:mb-2 text-white/50 font-poppins">Location</p>
                            <p className="block font-poppins text-xs md:text-sm leading-normal">Mumbai, India</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 md:mt-12 pt-4 md:pt-6 border-t border-white/15 w-full flex flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-start gap-1">
                        <p className="font-seasons text-base md:text-lg text-white/90">La Fête 365</p>
                        <p className="font-poppins text-[8px] md:text-[10px] uppercase tracking-widest text-white/50">
                            © 2026 La Fête 365. Premium-Luxury Bakery.
                        </p>
                    </div>

                    <a
                        href="mailto:work.eigensu@gmail.com"
                        className="font-poppins text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors underline decoration-white/20 underline-offset-4"
                    >
                        Powered by Eigensu
                    </a>
                </div>
            </div>
        </section>
    );
}
