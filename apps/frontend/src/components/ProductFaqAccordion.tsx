'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Our In-House Process',
    body: 'Every cake is baked fresh to order in our Mumbai kitchen — no refined flour, no shortcuts, and no batch made ahead of time. From soaking almonds to hand-piping every finish, each order is made by the same small team from start to finish.',
  },
  {
    title: 'Delivery & Shipping',
    body: 'We currently deliver across Mumbai only. Orders placed before 4:00 PM are baked and dispatched the next day; after that, delivery moves to the day after. Delivery is charged at checkout and varies by area — you’ll choose your slot before confirming your order.',
  },
  {
    title: 'Returns & Cancellations',
    body: 'Because every cake is made fresh for your order, we’re unable to accept returns once baking has begun. If something arrives damaged or isn’t as described, reach out within 24 hours of delivery and we’ll make it right.',
  },
  {
    title: 'Reviews',
    body: 'No reviews yet for this product — be the first to share how it turned out.',
  },
];

export default function ProductFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="h-full">
      <div className="border-t border-[#86162f]/15">
        {SECTIONS.map((section, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={section.title} className="border-b border-[#86162f]/15">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-center gap-4 py-5 md:py-6"
              >
                <span className="font-poppins text-[11px] md:text-xs uppercase tracking-[0.3em] text-[#86162f]">
                  {section.title}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-[#86162f] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <p className="font-poppins text-sm text-gray-600 leading-relaxed pb-6 text-center">
                  {section.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
