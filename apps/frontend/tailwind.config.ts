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
        seasons: ['The Seasons', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;