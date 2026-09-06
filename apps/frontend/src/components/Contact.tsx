'use client';

export default function Contact() {
    return (
        <section id="contact" className="py-16 md:py-20 bg-[#86162f] text-white">
            <div className="max-w-screen-xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-24">
                    {/* Left side: Heading, Text, and Button */}
                    <div className="flex-1 text-left">
                        <p className="text-[#f8aeb2] text-[11px] uppercase tracking-[0.4em] font-poppins font-light mb-4">
                            Get in Touch
                        </p>
                        <h2 className="font-seasons text-3xl md:text-5xl mb-6 leading-tight">
                            Conscious indulgence, made to order
                        </h2>

                        <p className="font-poppins text-sm md:text-base text-white/75 leading-relaxed mb-8 max-w-xl">
                            Every creation is handcrafted with premium ingredients, so each bite is a celebration
                            of flavor and mindfulness. Reach out for your next occasion, or your everyday luxury.
                        </p>

                        <a
                            href="tel:+919867281799"
                            className="inline-block px-10 py-3.5 bg-white text-[#86162f] font-poppins text-sm uppercase tracking-wider hover:bg-[#f8aeb2] transition-colors"
                        >
                            Place an Order
                        </a>
                    </div>

                    {/* Right side: Stacked Contact Info */}
                    <div className="flex flex-col gap-6 md:min-w-[280px] md:border-l md:border-white/15 md:pl-12">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 text-white/50 font-poppins">Email</p>
                            <a href="mailto:hello@lafete365.com" className="font-poppins text-sm hover:text-[#f8aeb2] transition-colors">
                                hello@lafete365.com
                            </a>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 text-white/50 font-poppins">Phone</p>
                            <a href="tel:+919867281799" className="font-poppins text-sm hover:text-[#f8aeb2] transition-colors">
                                +91 98672 81799
                            </a>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 text-white/50 font-poppins">Location</p>
                            <p className="font-poppins text-sm">Mumbai, India</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-white/15 w-full flex flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-start gap-1">
                        <p className="font-seasons text-lg text-white/90">La Fête 365</p>
                        <p className="font-poppins text-[10px] uppercase tracking-widest text-white/50">
                            © 2026 La Fête 365. Premium-Luxury Bakery.
                        </p>
                    </div>

                    <a
                        href="mailto:work.eigensu@gmail.com"
                        className="font-poppins text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors underline decoration-white/20 underline-offset-4"
                    >
                        Powered by Eigensu
                    </a>
                </div>
            </div>
        </section>
    );
}
