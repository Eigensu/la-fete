'use client';

export default function Philosophy() {
    return (
        <section className="py-24 md:py-32 bg-[#fef9f8]">
            <div className="max-w-4xl mx-auto px-8 md:px-16 text-center">
                <p className="text-[#f8aeb2] text-xs md:text-sm uppercase tracking-[0.3em] mb-8 font-poppins font-light">
                    Our Philosophy
                </p>

                <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl lg:text-6xl mb-12 leading-tight">
                    Balance. Beauty. Consciousness.
                </h2>

                <div className="grid md:grid-cols-3 gap-12 md:gap-16 mt-16">
                    <div>
                        <div className="text-4xl mb-4">🌾</div>
                        <h3 className="font-seasons text-xl text-[#86162f] mb-3">Premium Ingredients</h3>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">
                            Only the finest, consciously sourced ingredients
                        </p>
                    </div>

                    <div>
                        <div className="text-4xl mb-4">🚫</div>
                        <h3 className="font-seasons text-xl text-[#86162f] mb-3">No Refined Flour</h3>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">
                            Healthier alternatives without compromising taste
                        </p>
                    </div>

                    <div>
                        <div className="text-4xl mb-4">💚</div>
                        <h3 className="font-seasons text-xl text-[#86162f] mb-3">Guilt-Free Goodness</h3>
                        <p className="font-poppins text-sm text-gray-600 leading-relaxed">
                            Wellness and pleasure beautifully balanced
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
