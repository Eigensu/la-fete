'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { splitTagList } from '@/utils/format';

/** The site-wide fallback, phrased from the product's own lead time so it can
 *  never contradict the "Earliest delivery" date shown higher up the page —
 *  Tea/Tub Cakes go out next-day, everything else needs the full 48 hours. */
function defaultDeliveryText(leadDays: number) {
  const window =
    leadDays <= 1
      ? 'Orders are baked to order and delivered from the next day onwards'
      : `Orders are baked to order and delivered from ${leadDays} days after you order onwards`;

  return `We currently deliver across Mumbai only. ${window}. Delivery is charged at checkout and varies by area — you’ll choose your slot before confirming your order.`;
}

const STATIC_SECTIONS: { title: string; body: string }[] = [];

export default function ProductFaqAccordion({
  shelfLife,
  deliveryInstructions,
  ingredients,
  nutritionalHighlight,
  allergyInformation,
  leadDays = 2,
}: {
  /** Product-specific shelf life & serving instructions, when the catalogue provides one. */
  shelfLife?: string;
  /** Product-specific delivery & shipping note; falls back to the site-wide default. */
  deliveryInstructions?: string;
  ingredients?: string;
  nutritionalHighlight?: string;
  allergyInformation?: string;
  /** Days between ordering and the earliest delivery for this product's
   *  format, so the fallback copy matches the date shown on the page. */
  leadDays?: number;
}) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const sections = [
    ...(ingredients ? [{ title: 'Ingredients', body: ingredients }] : []),
    ...(nutritionalHighlight ? [{ title: 'Nutritional Highlights', body: nutritionalHighlight }] : []),
    ...(allergyInformation
      ? [{
          title: 'Allergen Information',
          body: (
            <>
              Contains{' '}
              {splitTagList(allergyInformation).map((allergen, i, arr) => (
                <span key={allergen}>
                  <span className="font-medium text-[#86162f]">{allergen}</span>
                  {i < arr.length - 1 ? (i === arr.length - 2 ? ' and ' : ', ') : ''}
                </span>
              ))}
              .
            </>
          ),
        }]
      : []),
    ...(shelfLife ? [{ title: 'Shelf Life & Serving Instructions', body: shelfLife }] : []),
    { title: 'Delivery & Shipping', body: deliveryInstructions || defaultDeliveryText(leadDays) },
    ...STATIC_SECTIONS,
  ];

  return (
    <div className="h-full">
      <div className="border-t border-[#86162f]/15">
        {sections.map((section, i) => {
          const isOpen = openIndices.has(i);
          return (
            <div key={section.title} className="border-b border-[#86162f]/15">
              <button
                type="button"
                onClick={() => toggle(i)}
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
