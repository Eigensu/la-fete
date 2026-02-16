'use client';

export default function Contact() {
    return (
        <section id="contact" className="py-12 md:py-16 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-white">
            <div className="max-w-3xl mx-auto px-8 md:px-12 text-center">
                <h2 className="font-seasons text-3xl md:text-4xl mb-8">
                    Get in Touch
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-75 font-poppins">Email</p>
                        <a href="mailto:hello@lafete365.com" className="font-poppins text-sm hover:text-white/80 transition-colors">
                            hello@lafete365.com
                        </a>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-75 font-poppins">Phone</p>
                        <a href="tel:+919867281799" className="font-poppins text-sm hover:text-white/80 transition-colors">
                            +91 98672 81799
                        </a>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-75 font-poppins">Location</p>
                        <p className="font-poppins text-sm">Mumbai, India</p>
                    </div>
                </div>

                <a
                    href="tel:+919867281799"
                    className="inline-block px-10 py-3 bg-white text-[#86162f] font-poppins text-sm uppercase tracking-wider hover:bg-white/90 transition-colors"
                >
                    Place an Order
                </a>
            </div>
        </section>
    );
}
