'use client';

export default function Contact() {
    return (
        <section id="contact" className="py-8 md:py-10 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-white">
            <div className="max-w-screen-xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-24">
                    {/* Left side: Heading, Text, and Button */}
                    <div className="flex-1 text-left">
                        <h2 className="font-seasons text-3xl md:text-4xl mb-6">
                            Get in Touch
                        </h2>

                        <p className="font-poppins text-sm md:text-base opacity-90 leading-relaxed mb-6 max-w-xl">
                            Experience the art of conscious indulgence. Our handcrafted creations are made to order with the finest premium ingredients, ensuring every bite is a celebration of both flavor and mindfulness. Reach out to us for your next celebration or daily luxury.
                        </p>

                        <a
                            href="tel:+919867281799"
                            className="inline-block px-10 py-3 bg-white text-[#86162f] font-poppins text-sm uppercase tracking-wider hover:bg-white/90 transition-colors shadow-lg"
                        >
                            Place an Order
                        </a>
                    </div>

                    {/* Right side: Stacked Contact Info - Center aligned in its column */}
                    <div className="flex flex-col md:items-center text-center md:text-center gap-6 md:min-w-[300px]">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 opacity-75 font-poppins">Email</p>
                            <a href="mailto:hello@lafete365.com" className="font-poppins text-sm hover:text-white/80 transition-colors">
                                hello@lafete365.com
                            </a>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 opacity-75 font-poppins">Phone</p>
                            <a href="tel:+919867281799" className="font-poppins text-sm hover:text-white/80 transition-colors">
                                +91 98672 81799
                            </a>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 opacity-75 font-poppins">Location</p>
                            <p className="font-poppins text-sm">Mumbai, India</p>
                        </div>
                    </div>
                </div>

                {/* Footer rearranging to extreme edges */}
                <div className="mt-10 pt-6 border-t border-white/10 w-full flex flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-start gap-1">
                        <p className="font-seasons text-lg opacity-90">La Fête 365</p>
                        <p className="font-poppins text-[10px] uppercase tracking-widest opacity-60">
                            © 2026 La Fête 365. Premium-Luxury Bakery.
                        </p>
                    </div>

                    <a
                        href="mailto:work.eigensu@gmail.com"
                        className="font-poppins text-[10px] uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity underline decoration-white/30 underline-offset-4"
                    >
                        Powered by Eigensu
                    </a>
                </div>
            </div>
        </section>
    );
}
