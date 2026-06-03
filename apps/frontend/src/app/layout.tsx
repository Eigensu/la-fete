import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'La Fête 365 | Premium Luxury Bakery',
  description: 'Celebrating balance, beauty, and guilt-free goodness every day. Where celebration meets consciousness.',
  keywords: ['bakery', 'conscious eating', 'healthy desserts', 'Mumbai bakery', 'luxury bakery', 'guilt-free'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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