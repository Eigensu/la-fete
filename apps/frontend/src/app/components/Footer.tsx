'use client';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-8 md:px-16 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-seasons text-xl text-[#86162f]">
                        La Fête 365
                    </div>

                    <p className="font-poppins text-xs text-gray-500 text-center md:text-left">
                        © 2026 La Fête 365. Premium-Luxury Bakery for the Conscious Generation.
                    </p>
                </div>
            </div>
        </footer>
    );
}
