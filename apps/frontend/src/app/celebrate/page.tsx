import Link from 'next/link';
import Navigation from '@/components/Navigation';

const GALLERY_ITEMS = [
  { id: 1,  label: 'Dutch Truffle',      style: { gridColumn: '1 / span 2', gridRow: '1 / span 3'  } },
  { id: 2,  label: 'Rose Pistachio',     style: { gridColumn: '3 / span 2', gridRow: '1 / span 2'  } },
  { id: 3,  label: 'Hazelnut Dark Choc', style: { gridColumn: '5 / span 2', gridRow: '1 / span 6'  } },
  { id: 4,  label: 'Sea Salt Caramel',   style: { gridColumn: '3 / span 2', gridRow: '3 / span 3'  } },
  { id: 5,  label: 'Espresso Mousse',    style: { gridColumn: '1 / span 2', gridRow: '4 / span 5'  } },
  { id: 6,  label: 'Vegan Raspberry',    style: { gridColumn: '3 / span 2', gridRow: '6 / span 3'  } },
  { id: 7,  label: 'Whiskey Truffle',    style: { gridColumn: '5 / span 2', gridRow: '7 / span 4'  } },
  { id: 8,  label: 'Lotus Biscoff',      style: { gridColumn: '1 / span 3', gridRow: '9 / span 4'  } },
  { id: 9,  label: 'Almond Praline',     style: { gridColumn: '4 / span 1', gridRow: '9 / span 4'  } },
  { id: 10, label: 'Saffron Vanilla',    style: { gridColumn: '5 / span 2', gridRow: '11 / span 2' } },
];

function GalleryCell({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <div
      style={style}
      className="relative overflow-hidden bg-[#f8aeb2] group"
    >
      {/* placeholder tint — swap src in img tag once photos are ready */}
      <div className="absolute inset-0 bg-[#86162f]/5 group-hover:bg-[#86162f]/10 transition-colors duration-500" />
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <div className="w-6 h-px bg-[#86162f]/20 mb-3" />
        <p className="font-poppins text-[8px] uppercase tracking-[0.35em] text-[#86162f]/35 text-center px-2 leading-relaxed">
          {label}
        </p>
        <div className="w-6 h-px bg-[#86162f]/20 mt-3" />
      </div>
    </div>
  );
}

export default function CelebratePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-10 md:mt-20" />

      {/* Hero */}
      <section className="py-16 md:py-24 text-center px-6">
        <p className="font-poppins text-[10px] uppercase tracking-[0.45em] text-[#f8aeb2] mb-4">
          Every occasion deserves a cake
        </p>
        <h1 className="font-seasons text-[#86162f] text-5xl md:text-7xl leading-tight mb-6">
          Celebrate with Us
        </h1>
        <p className="font-poppins text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
          From intimate birthdays to grand weddings — we craft bespoke cakes that become the centrepiece of your most treasured moments.
        </p>
      </section>

      {/* Gallery */}
      <section className="w-full">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(12, 250px)',
            gap: '6px',
          }}
        >
          {GALLERY_ITEMS.map((item) => (
            <GalleryCell key={item.id} label={item.label} style={item.style} />
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
