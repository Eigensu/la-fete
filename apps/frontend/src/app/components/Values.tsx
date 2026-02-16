'use client';

export default function Values() {
    const features = [
        {
            title: 'Premium Ingredients',
            description: 'Only the finest, consciously sourced ingredients make it into our creations.',
            emoji: '🌾',
        },
        {
            title: 'No Refined Flour',
            description: 'We use healthier alternatives without compromising on taste or texture.',
            emoji: '🚫',
        },
        {
            title: 'Handcrafted',
            description: 'Every dessert is lovingly made by hand with attention to detail.',
            emoji: '👨‍🍳',
        },
        {
            title: 'Beautiful Design',
            description: 'Aesthetically pleasing creations that are Instagram-worthy.',
            emoji: '📸',
        },
        {
            title: 'Guilt-Free',
            description: 'Indulge without compromise — wellness and pleasure beautifully balanced.',
            emoji: '💚',
        },
        {
            title: 'Sustainable',
            description: 'Eco-friendly packaging and responsible sourcing for our planet.',
            emoji: '🌍',
        },
    ];

    return (
        <section id="values" className="section-padding bg-white">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[#f8aeb2] font-poppins text-sm uppercase tracking-widest font-semibold">
                        What Makes Us Different
                    </span>
                    <h2 className="font-seasons text-[#86162f] mt-4 mb-6">
                        The La Fête Promise
                    </h2>
                    <p className="text-gray-700 font-poppins text-lg leading-relaxed">
                        Where flavor, modern design, and mindful living coexist — creating desserts that
                        celebrate balance and intention.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fef9f8] to-white p-8 border border-[#e8d8d4] hover:border-[#f8aeb2] transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">{feature.emoji}</div>
                                <h3 className="font-seasons text-2xl text-[#86162f] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 font-poppins text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#f8aeb2]/10 to-[#86162f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>

                {/* Quote Section */}
                <div className="mt-20 text-center max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-[#f8aeb2]/20 via-[#fce4e6]/30 to-[#f8aeb2]/20 rounded-3xl p-12 md:p-16">
                        <svg
                            className="w-12 h-12 mx-auto mb-6 text-[#86162f]/30"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <p className="font-seasons text-3xl md:text-4xl text-[#86162f] mb-6 leading-relaxed">
                            Artful. Aspirational. Authentic.
                        </p>
                        <p className="font-poppins text-gray-700 text-lg italic">
                            — The Creator + The Modern Muse
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
