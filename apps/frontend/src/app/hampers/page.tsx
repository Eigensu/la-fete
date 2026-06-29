'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const OCCASIONS = ['All', 'Diwali', 'Corporate', 'Birthday', 'Everyday'] as const;
type Occasion = (typeof OCCASIONS)[number];

interface Hamper {
  id: string;
  num: string;
  name: string;
  occasion: string;
  tagline: string;
  includes: string[];
  serves: string;
  price: string;
  featured: boolean;
}

const HAMPERS: Hamper[] = [
  {
    id: 'h1', num: '01',
    name: 'The Grand Diwali Hamper',
    occasion: 'Diwali',
    tagline: 'Gold-standard gifting for the festival of lights — our most indulgent combination, boxed and ribbon-tied.',
    includes: ['46.5% Dutch Truffle Cake (500g)', 'Rose Pistachio Vanilla Tub', 'Date & Walnut Tea Cake', 'Almond Cake'],
    serves: 'Serves 8–12',
    price: 'From ₹3,800',
    featured: true,
  },
  {
    id: 'h2', num: '02',
    name: 'The Diwali Tub Trio',
    occasion: 'Diwali',
    tagline: 'Three tub cakes, ribbon-tied and ready to gift.',
    includes: ['Saffron Vanilla Milk Cake Tub', 'Lotus Biscoff Cream Cheese Tub', 'Filter Coffee Tiramisu Tub'],
    serves: 'Serves 6–9',
    price: 'From ₹2,100',
    featured: false,
  },
  {
    id: 'h3', num: '03',
    name: 'The Conscious Diwali Box',
    occasion: 'Diwali',
    tagline: 'Vegan & gluten-free — thoughtful gifting with zero compromise on flavour.',
    includes: ['Vegan Dark Chocolate Cake (500g)', 'Classic Gooey GF Dark Choc', 'Caramelized Orange Vanilla Tea Cake', 'Date & Walnut Tea Cake'],
    serves: 'Serves 6–10',
    price: 'From ₹4,200',
    featured: false,
  },
  {
    id: 'h4', num: '04',
    name: 'The Corporate Gift Box',
    occasion: 'Corporate',
    tagline: 'Elegant, brandable gifting for teams and clients — delivered fresh and presentation-ready.',
    includes: ['Lotus Biscoff Cream Cheese Tub', 'Saffron Vanilla Milk Cake Tub', 'Banana Bread Tea Cake', 'Almond Cake Tea Cake'],
    serves: 'Serves 4–6 per recipient',
    price: 'From ₹2,400',
    featured: true,
  },
  {
    id: 'h5', num: '05',
    name: 'The Premium Corporate Hamper',
    occasion: 'Corporate',
    tagline: 'A full celebration cake flanked by curated petit indulgences — for the client who deserves the best.',
    includes: ['Sea Salt Caramel Hazelnut Praline (1kg)', 'Filter Coffee Tiramisu Tub', 'Date & Walnut Tea Cake'],
    serves: 'Serves 12–16',
    price: 'From ₹5,500',
    featured: false,
  },
  {
    id: 'h6', num: '06',
    name: 'The Birthday Duo',
    occasion: 'Birthday',
    tagline: 'Two showstopper cakes, one very unforgettable celebration.',
    includes: ['46.5% Dutch Truffle Cake (500g)', 'Rose Pistachio Vanilla Cake (500g)'],
    serves: 'Serves 8–12',
    price: 'From ₹2,699',
    featured: false,
  },
  {
    id: 'h7', num: '07',
    name: 'The Boozy Birthday Box',
    occasion: 'Birthday',
    tagline: 'For birthdays that deserve a spirited celebration — adults only, and absolutely worth it.',
    includes: ["Bailey's Coffee Crave (500g)", 'Whiskey Dutch Truffle Tub', 'Lotus Biscoff Cream Cheese Tub'],
    serves: 'Serves 6–10',
    price: 'From ₹3,800',
    featured: true,
  },
  {
    id: 'h8', num: '08',
    name: 'The Tea Time Collection',
    occasion: 'Everyday',
    tagline: 'Five tea cakes, five flavours — one very happy household and zero sharing required.',
    includes: ['Date & Walnut', 'Banana Bread', 'Carrot Cake', 'Almond Cake', 'Caramelized Orange Vanilla'],
    serves: 'Serves 20–25',
    price: 'From ₹1,699',
    featured: false,
  },
  {
    id: 'h9', num: '09',
    name: 'The Wellness Hamper',
    occasion: 'Everyday',
    tagline: 'Wholesome cakes that nourish and indulge in equal measure — for the health-conscious sweet tooth.',
    includes: ['Banana Bread', 'Almond Cake', 'Vegan Mocha Cake (500g)', 'Classic GF Dark Chocolate (500g)'],
    serves: 'Serves 10–14',
    price: 'From ₹4,400',
    featured: false,
  },
];

function FeaturedHamper({ hamper }: { hamper: Hamper }) {
  return (
    <div className="md:col-span-2 flex flex-col md:flex-row border border-[#86162f]/12 overflow-hidden hover:border-[#86162f]/35 transition-colors duration-300">
      {/* Left accent panel */}
      <div className="relative md:w-5/12 bg-[#f8aeb2] flex flex-col justify-between p-8 md:p-12 min-h-[220px] md:min-h-0 overflow-hidden shrink-0">
        {/* Giant background number */}
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 font-seasons text-white/20 select-none pointer-events-none leading-none"
          style={{ fontSize: 'clamp(100px, 14vw, 180px)', lineHeight: 0.82 }}
        >
          {hamper.num}
        </span>
        {/* Occasion badge */}
        <span className="self-start font-poppins text-[9px] uppercase tracking-[0.35em] text-[#86162f]/65 border border-[#86162f]/20 px-3 py-1">
          {hamper.occasion}
        </span>
        {/* Bottom: serves + price */}
        <div>
          <p className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50 mb-1.5">{hamper.serves}</p>
          <p className="font-seasons text-[#86162f] text-3xl">{hamper.price}</p>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex flex-col justify-between flex-1 p-8 md:p-12 bg-white">
        <div>
          <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 mb-4">
            {hamper.occasion} · Curated Hamper
          </p>
          <h2 className="font-seasons text-[#86162f] text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
            {hamper.name}
          </h2>
          <p className="font-poppins text-sm text-gray-500 leading-relaxed mb-7 max-w-lg">
            {hamper.tagline}
          </p>

          {/* What's inside */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 border-t border-dashed border-[#86162f]/15" />
            <span className="font-poppins text-[8px] uppercase tracking-[0.35em] text-[#86162f]/30 shrink-0">What&apos;s Inside</span>
            <div className="h-px flex-1 border-t border-dashed border-[#86162f]/15" />
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {hamper.includes.map((item, i) => (
              <span
                key={i}
                className="font-poppins text-[8px] uppercase tracking-wider text-[#86162f] bg-[#f8aeb2]/25 border border-[#86162f]/12 px-3 py-1.5"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/contact"
          className="self-start px-8 py-3.5 bg-[#86162f] text-white font-poppins text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors duration-200"
        >
          Enquire About This Hamper →
        </Link>
      </div>
    </div>
  );
}

function SmallHamper({ hamper }: { hamper: Hamper }) {
  return (
    <div className="flex flex-col border border-[#86162f]/12 overflow-hidden hover:border-[#86162f]/35 transition-colors duration-300">
      {/* Top accent panel */}
      <div className="relative bg-[#f8aeb2] flex flex-col justify-between p-6 min-h-[170px] overflow-hidden shrink-0">
        <span
          className="absolute right-0 bottom-0 font-seasons text-white/25 select-none pointer-events-none leading-none"
          style={{ fontSize: 110, lineHeight: 0.82 }}
        >
          {hamper.num}
        </span>
        <span className="self-start font-poppins text-[8px] uppercase tracking-[0.3em] text-[#86162f]/65 border border-[#86162f]/20 px-2.5 py-1">
          {hamper.occasion}
        </span>
        <p className="font-poppins text-[8px] uppercase tracking-widest text-[#86162f]/50 mt-auto">
          {hamper.serves}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 bg-white">
        <h3 className="font-seasons text-[#86162f] text-2xl leading-tight mb-2">
          {hamper.name}
        </h3>
        <p className="font-poppins text-xs text-gray-400 leading-relaxed mb-4">
          {hamper.tagline}
        </p>

        <div className="border-t border-dashed border-[#86162f]/12 mb-4" />

        <div className="flex flex-wrap gap-1.5 mb-5">
          {hamper.includes.map((item, i) => (
            <span
              key={i}
              className="font-poppins text-[7px] uppercase tracking-wider text-[#86162f] bg-[#f8aeb2]/25 border border-[#86162f]/12 px-2 py-1"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-seasons text-[#86162f] text-xl">{hamper.price}</span>
          <Link
            href="/contact"
            className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/25 hover:border-[#86162f] transition-colors pb-0.5"
          >
            Enquire →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HampersPage() {
  const [activeOccasion, setActiveOccasion] = useState<Occasion>('All');

  const filtered =
    activeOccasion === 'All'
      ? HAMPERS
      : HAMPERS.filter(h => h.occasion === activeOccasion);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <div className="mt-10 md:mt-20 relative overflow-hidden bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md py-14 md:py-20">
        <div className="relative z-10">
          <p className="text-white/55 text-[10px] uppercase tracking-[0.5em] mb-3 font-poppins">
            La Fête — Gift Hampers
          </p>
          <h1 className="font-seasons text-white text-5xl md:text-7xl mb-4">
            The Gift Edit
          </h1>
          <div className="flex items-center justify-center gap-3 text-white/40 font-poppins text-[9px] uppercase tracking-widest">
            <span>Diwali</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Corporate</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Birthday</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Everyday</span>
          </div>
        </div>
      </div>

      {/* Sticky occasion filter */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#86162f]/10 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <div className="flex items-center gap-2 py-3.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <span className="shrink-0 font-poppins text-[8px] uppercase tracking-[0.35em] text-[#86162f]/30 mr-2 hidden sm:block">
              Occasion
            </span>
            {OCCASIONS.map(occ => (
              <button
                key={occ}
                onClick={() => setActiveOccasion(occ)}
                aria-pressed={activeOccasion === occ}
                className={`shrink-0 px-5 py-2 font-poppins text-[10px] uppercase tracking-widest border transition-all duration-200 ${
                  activeOccasion === occ
                    ? 'bg-[#86162f] text-white border-[#86162f]'
                    : 'bg-white text-[#86162f] border-[#86162f]/20 hover:border-[#86162f]/50'
                }`}
              >
                {occ}
              </button>
            ))}
            <span className="shrink-0 ml-auto font-poppins text-[8px] uppercase tracking-widest text-[#86162f]/30 hidden sm:block">
              {filtered.length} {filtered.length === 1 ? 'Hamper' : 'Hampers'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-12">
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-poppins text-xs uppercase tracking-widest text-[#f8aeb2] mb-3">Nothing here yet</p>
            <h2 className="font-seasons text-[#86162f] text-4xl mb-4">No hampers found</h2>
            <button
              onClick={() => setActiveOccasion('All')}
              className="font-poppins text-xs uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
            >
              ← View All Hampers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filtered.map(hamper =>
              hamper.featured ? (
                <FeaturedHamper key={hamper.id} hamper={hamper} />
              ) : (
                <SmallHamper key={hamper.id} hamper={hamper} />
              ),
            )}
          </div>
        )}
      </div>

      {/* Custom hamper CTA */}
      <section className="bg-[#86162f] py-20 md:py-28 text-center relative overflow-hidden">
        {/* Decorative watermark */}
        <span
          className="absolute inset-0 flex items-center justify-center font-seasons text-white/5 select-none pointer-events-none leading-none"
          style={{ fontSize: 'clamp(60px, 15vw, 180px)' }}
        >
          Yours
        </span>
        <div className="relative z-10 max-w-xl mx-auto px-6">
          <p className="font-poppins text-[9px] uppercase tracking-[0.5em] text-white/40 mb-5">
            Can&apos;t find the right combination?
          </p>
          <h2 className="font-seasons text-white text-4xl md:text-6xl leading-tight mb-5">
            Build Your Own Hamper
          </h2>
          <div className="w-12 h-px bg-white/20 mx-auto mb-5" />
          <p className="font-poppins text-white/55 text-sm leading-relaxed mb-10">
            Tell us the occasion, your budget, and any dietary needs — we&apos;ll compose something truly one-of-a-kind.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 border border-white/60 text-white font-poppins text-xs uppercase tracking-widest hover:bg-white hover:text-[#86162f] transition-all duration-300"
          >
            Start Composing →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
