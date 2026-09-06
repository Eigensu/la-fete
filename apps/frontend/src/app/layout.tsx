import type { Metadata } from 'next';
import { Poppins, Fraunces } from 'next/font/google';
import React from 'react';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

// Self-hosted via next/font instead of a CSS @import — Turbopack was silently
// dropping the remote @import from globals.css, so Poppins/Fraunces were
// never actually loading and every "font-poppins"/"font-seasons" reference
// was silently falling back to the browser default the whole time.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'La Fête 365 | Premium Luxury Bakery',
  description:
    'Celebrating balance, beauty, and guilt-free goodness every day. Where celebration meets consciousness.',
  keywords: ['bakery', 'conscious eating', 'healthy desserts', 'Mumbai bakery', 'luxury bakery', 'guilt-free'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <CartProvider>
          {children}
          <Toaster position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
