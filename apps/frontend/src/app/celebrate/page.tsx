import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface GalleryItem {
  id: number;
  label: string;
  mobileOrder: number;
  style: CSSProperties;
  image: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1,  label: 'Dutch Truffle',      mobileOrder: 1,  style: { gridColumn: '1 / span 2', gridRow: '1 / span 3'  }, image: '/Gemini_Generated_Image_aehl2jaehl2jaehl.png' },
  { id: 2,  label: 'Rose Pistachio',     mobileOrder: 2,  style: { gridColumn: '3 / span 2', gridRow: '1 / span 2'  }, image: '/Gemini_Generated_Image_2vg3ls2vg3ls2vg3.png' },
  { id: 3,  label: 'Hazelnut Dark Choc', mobileOrder: 3,  style: { gridColumn: '5 / span 2', gridRow: '1 / span 6'  }, image: '/Gemini_Generated_Image_dtpdfrdtpdfrdtpd.png' },
  { id: 4,  label: 'Sea Salt Caramel',   mobileOrder: 4,  style: { gridColumn: '3 / span 2', gridRow: '3 / span 3'  }, image: '/WhatsApp Image 2026-08-29 at 17.31.27.jpeg' },
  { id: 5,  label: 'Espresso Mousse',    mobileOrder: 5,  style: { gridColumn: '1 / span 2', gridRow: '4 / span 5'  }, image: '/Gemini_Generated_Image_cedge8cedge8cedg.png' },
  { id: 6,  label: 'Vegan Raspberry',    mobileOrder: 6,  style: { gridColumn: '3 / span 2', gridRow: '6 / span 3'  }, image: '/WhatsApp Image 2026-08-29 at 17.31.28.jpeg' },
  { id: 7,  label: 'Whiskey Truffle',    mobileOrder: 7,  style: { gridColumn: '5 / span 2', gridRow: '7 / span 4'  }, image: '/Gemini_Generated_Image_vighyovighyovigh.png' },
  { id: 8,  label: 'Lotus Biscoff',      mobileOrder: 8,  style: { gridColumn: '1 / span 3', gridRow: '9 / span 4'  }, image: '/Gemini_Generated_Image_8lekx78lekx78lek.png' },
  { id: 9,  label: 'Almond Praline',     mobileOrder: 9,  style: { gridColumn: '4 / span 1', gridRow: '9 / span 4'  }, image: '/WhatsApp Image 2026-08-29 at 17.31.29.jpeg' },
  { id: 10, label: 'Saffron Vanilla',    mobileOrder: 10, style: { gridColumn: '5 / span 2', gridRow: '11 / span 2' }, image: '/Gemini_Generated_Image_pyxs6npyxs6npyxs.png' },
];

function GalleryCell({ label, style, mobileOrder, image }: { label: string; style: CSSProperties; mobileOrder: number; image: string }) {
  return (
    <>
      {/* Mobile: simple 2-col stack */}
      <div
        className="md:hidden relative overflow-hidden bg-[#f8aeb2] group"
        style={{ order: mobileOrder, minHeight: 160 }}
      >
        <Image src={image} alt={label} fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-3 pt-8 bg-gradient-to-t from-black/55 to-transparent select-none">
          <p className="font-poppins text-[8px] uppercase tracking-[0.35em] text-white text-center px-2 leading-relaxed">
            {label}
          </p>
        </div>
      </div>
      {/* Desktop: mosaic placement */}
      <div
        style={style}
        className="hidden md:block relative overflow-hidden bg-[#f8aeb2] group"
      >
        <Image src={image} alt={label} fill sizes="33vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-3 pt-8 bg-gradient-to-t from-black/55 to-transparent select-none">
          <p className="font-poppins text-[8px] uppercase tracking-[0.35em] text-white text-center px-2 leading-relaxed">
            {label}
          </p>
        </div>
      </div>
    </>
  );
}

export default function CelebratePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-16 md:mt-20" />

      {/* Hero */}
      <section className="py-16 md:py-24 text-center px-6">
        <p className="font-poppins text-[10px] uppercase tracking-[0.45em] text-[#f8aeb2] mb-4">
          Every occasion deserves a cake
        </p>
        <h1 className="font-seasons text-[#86162f] text-3xl md:text-5xl leading-tight mb-6">
          Celebrate with Us
        </h1>
        <p className="font-poppins text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
          From intimate birthdays to grand weddings — we craft bespoke cakes that become the centrepiece of your most treasured moments.
        </p>
      </section>

      {/* Gallery — mobile: 2-col flex wrap, desktop: 6-col mosaic */}
      <section className="w-full">
        {/* Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-1.5">
          {GALLERY_ITEMS.map((item) => (
            <GalleryCell key={item.id} label={item.label} style={item.style} mobileOrder={item.mobileOrder} image={item.image} />
          ))}
        </div>
        {/* Desktop mosaic */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(12, 250px)',
            gap: '6px',
          }}
        >
          {GALLERY_ITEMS.map((item) => (
            <GalleryCell key={item.id} label={item.label} style={item.style} mobileOrder={item.mobileOrder} image={item.image} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 text-center px-6">
        <p className="font-poppins text-[10px] uppercase tracking-[0.45em] text-[#f8aeb2] mb-5">
          Ready to celebrate?
        </p>
        <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl mb-4">
          Plan Your Celebration
        </h2>
        <p className="font-poppins text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-10">
          Tell us about your event and we'll create something truly special, just for you.
        </p>
        <Link
          href="/contact"
          className="inline-block px-12 py-4 bg-[#86162f] text-white font-poppins text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors"
        >
          Order a Custom Cake →
        </Link>
      </section>

      {/* Footer strip */}
      <div className="py-6 border-t border-[#86162f]/10 text-center">
        <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/30">
          © 2026 La Fête 365 · Mumbai
        </p>
      </div>
    </main>
  );
}
