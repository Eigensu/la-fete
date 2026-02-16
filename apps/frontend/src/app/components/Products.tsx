'use client';

export default function Products() {
    const products = [
        {
            name: 'Signature Cakes',
            description: 'Handcrafted layer cakes made with premium ingredients',
        },
        {
            name: 'Artisan Brownies',
            description: 'Rich, fudgy brownies without the guilt',
        },
        {
            name: 'Gourmet Tarts',
            description: 'Elegant tarts with seasonal fruits and cream',
        },
    ];

    return (
        <section id="products" className="py-24 md:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-8 md:px-16">
                <div className="text-center mb-20">
                    <p className="text-[#f8aeb2] text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-poppins font-light">
                        Our Collection
                    </p>
                    <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">
                        Crafted with Care
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12 md:gap-16">
                    {products.map((product, index) => (
                        <div key={index} className="group">
                            <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                                {/* Bow decoration at top-left corner */}
                                <img
                                    src="/bow.png"
                                    alt=""
                                    className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10"
                                />

                                {/* Placeholder */}
                                <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                </svg>
                            </div>
                            <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3">
                                {product.name}
                            </h3>
                            <p className="font-poppins text-sm text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
