/**
 * One consolidated trust-badge row for product pages — line-art circle icons
 * in the site's brand style, replacing the old mixed emoji cards + separate
 * "Badges of Honour" section so every product page shows the same five
 * standard claims the same way.
 */

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function NoMicrowaveIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <rect x="6" y="8" width="9" height="8" rx="0.5" />
      <circle cx="18" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="14" r="1" fill="currentColor" stroke="none" />
      <line x1="2" y1="21" x2="22" y2="3" strokeWidth="1.2" />
    </svg>
  );
}

function AlmondIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3c2.5 2 4 5.5 4 9s-1.8 7-4 9c-2.2-2-4-5.5-4-9s1.5-7 4-9z" />
      <path d="M12 8.5c1 .8 1.6 2.2 1.6 3.5S13 14.7 12 15.5" />
    </svg>
  );
}

function EgglessIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3.5c3 3.8 5 7.6 5 10.7a5 5 0 0 1-10 0c0-3.1 2-6.9 5-10.7z" />
      <line x1="4" y1="20" x2="20" y2="4" strokeWidth="1.2" />
    </svg>
  );
}

function NoPreservativesIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 3h6" />
      <path d="M10 3v4.2c0 .5-.15.9-.45 1.3L6.8 12c-.5.6-.8 1.4-.8 2.2V18a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-3.8c0-.8-.3-1.6-.8-2.2l-2.75-3.5A2.1 2.1 0 0 1 14 7.2V3" />
      <line x1="7" y1="15" x2="17" y2="15" />
    </svg>
  );
}

function PalmOilFreeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4 -3-6-7-6.5C6 10.5 8.5 13 12 13z" />
      <path d="M12 13c0-4 3-6 7-6.5C18 10.5 15.5 13 12 13z" />
      <line x1="4" y1="21" x2="20" y2="5" strokeWidth="1.2" />
    </svg>
  );
}

const CLAIMS = [
  { icon: NoMicrowaveIcon, label: "We Don't Use Microwaves" },
  { icon: AlmondIcon, label: 'Soaked Almonds' },
  { icon: EgglessIcon, label: '100% Eggless Bakery' },
  { icon: NoPreservativesIcon, label: 'No Preservatives' },
  { icon: PalmOilFreeIcon, label: 'Palm Oil Free' },
];

function ClaimBadge({ icon: Icon, label }: { icon: () => JSX.Element; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2" style={{ width: 100 }}>
      <div className="w-12 h-12 rounded-full border border-[#86162f]/25 flex items-center justify-center text-[#86162f] bg-white">
        <Icon />
      </div>
      <span className="font-poppins text-[9px] uppercase tracking-wider text-[#86162f]/70 text-center leading-snug">
        {label}
      </span>
    </div>
  );
}

export default function WhyChooseLaFete() {
  const row1 = CLAIMS.slice(0, 3);
  const row2 = CLAIMS.slice(3);

  return (
    <div className="h-full text-center">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center gap-6">
          {row1.map(claim => (
            <ClaimBadge key={claim.label} {...claim} />
          ))}
        </div>
        <div className="flex justify-center gap-6">
          {row2.map(claim => (
            <ClaimBadge key={claim.label} {...claim} />
          ))}
        </div>
      </div>
    </div>
  );
}
