'use client';

export default function BrandStory() {
    const values = [
        {
            icon: '✨',
            title: 'Integrity',
            subtitle: 'Honesty & Transparency',
            description: '100% transparency in ingredients and process — no refined flour, no hidden additives.',
        },
        {
            icon: '🎉',
            title: 'Celebration',
            subtitle: 'Every Day Matters',
            description: 'Every product is made to celebrate — not just occasions, but everyday life.',
        },
        {
            icon: '🎨',
            title: 'Craftsmanship',
            subtitle: 'Artful Creation',
            description: 'Every bake reflects skill, care, and aesthetic balance.',
        },
        {
            icon: '💚',
            title: 'Wellness',
            subtitle: 'Balance & Health',
            description: 'Prioritizing health, balance, and conscious living without compromise.',
        },
        {
            icon: '🌸',
            title: 'Elegance',
            subtitle: 'Refined Beauty',
            description: 'Refined, beautiful, and timeless in presentation and taste.',
        },
        {
            icon: '🌱',
            title: 'Sustainability',
            subtitle: 'Conscious Choice',
            description: 'Conscious sourcing and responsible packaging for a better tomorrow.',
        },
    ];

    return (
        <section id="story" className="section-padding bg-gradient-to-b from-white to-[#fef9f8]">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[#f8aeb2] font-poppins text-sm uppercase tracking-widest font-semibold">
                        Our Philosophy
                    </span>
                    <h2 className="font-seasons text-[#86162f] mt-4 mb-6">
                        Redefining Indulgence
                    </h2>
                    <p className="text-gray-700 font-poppins text-lg leading-relaxed">
                        We aim to redefine indulgence by offering healthier desserts that blend taste,
                        design, and mindfulness, becoming India's most loved conscious bakery brand.
                    </p>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f8aeb2] to-[#86162f] flex items-center justify-center mb-6">
                            <span className="text-3xl">🎯</span>
                        </div>
                        <h3 className="font-seasons text-[#86162f] mb-4">Our Vision</h3>
                        <p className="text-gray-700 font-poppins leading-relaxed">
                            To lead the new wave of modern luxury — where beauty, health, and emotion
                            coexist effortlessly. Becoming India's most loved conscious bakery brand.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#86162f] to-[#a82043] flex items-center justify-center mb-6">
                            <span className="text-3xl">💝</span>
                        </div>
                        <h3 className="font-seasons text-[#86162f] mb-4">Our Mission</h3>
                        <p className="text-gray-700 font-poppins leading-relaxed">
                            To bring guilt-free goodness to every celebration, empowering people to celebrate
                            themselves daily through premium ingredients, conscious recipes, and design-driven experiences.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="text-center mb-12">
                    <h3 className="font-seasons text-[#86162f] text-4xl mb-4">Our Values</h3>
                    <p className="text-gray-600 font-poppins">
                        The principles that guide everything we create
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {values.map((value, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#e8d8d4]"
                        >
                            <div className="text-5xl mb-4">{value.icon}</div>
                            <h4 className="font-seasons text-2xl text-[#86162f] mb-2">
                                {value.title}
                            </h4>
                            <p className="text-[#f8aeb2] font-poppins text-sm font-semibold mb-3 uppercase tracking-wider">
                                {value.subtitle}
                            </p>
                            <p className="text-gray-600 font-poppins text-sm leading-relaxed">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
