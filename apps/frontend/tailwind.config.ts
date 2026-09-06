import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'light-pink': '#f8aeb2',
        'burgundy': '#86162f',
        'soft-pink': '#fce4e6',
        'deep-rose': '#a82043',
        'cream': '#fef9f8',
        'ivory': '#faf6f5',
        'gold': '#d4af37',
        'warm-gray': '#f5f0ed',
      },
      fontFamily: {
        // Both fonts are loaded via next/font/google in layout.tsx (a CSS
        // @import was silently dropped by Turpoback, so the fonts never
        // actually loaded) and exposed as CSS variables here. Fraunces
        // carries h1/h2 and other deliberate display moments; Poppins is
        // the default UI voice everywhere else.
        seasons: ['var(--font-fraunces)', 'serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;