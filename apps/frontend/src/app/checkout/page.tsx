'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotalAmount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? globalThis.localStorage.getItem('la-fete-access-token') : null;
    if (!token) {
      router.replace('/auth');
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8]">
        <div className="animate-spin w-8 h-8 border-4 border-[#86162f] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (Object.keys(cart).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f8] px-6">
        <h2 className="font-seasons text-[#86162f] text-3xl mb-4">Your Basket is Empty</h2>
        <Link href="/products" className="text-[#86162f] hover:underline font-poppins">
          Return to Products
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf9f8] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#86162f] mb-8 hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} />
          <span className="font-poppins text-xs uppercase tracking-widest">Back to Home</span>
        </Link>
        
        <h1 className="font-seasons text-[#86162f] text-4xl mb-12">Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-seasons text-[#86162f] text-2xl mb-6">Delivery Details</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-3 border border-[#86162f]/20 rounded-sm font-poppins text-sm outline-none focus:border-[#86162f]" />
              <input type="text" placeholder="Address" className="w-full p-3 border border-[#86162f]/20 rounded-sm font-poppins text-sm outline-none focus:border-[#86162f]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="City" className="w-full p-3 border border-[#86162f]/20 rounded-sm font-poppins text-sm outline-none focus:border-[#86162f]" />
                <input type="text" placeholder="Pincode" className="w-full p-3 border border-[#86162f]/20 rounded-sm font-poppins text-sm outline-none focus:border-[#86162f]" />
              </div>
            </form>
          </div>
          
          <div className="bg-white p-8 shadow-xl rounded-sm">
            <h2 className="font-seasons text-[#86162f] text-2xl mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {Object.values(cart).map((item) => (
                <div key={item.name} className="flex justify-between font-poppins text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#86162f]/20 pt-4 flex justify-between font-poppins font-bold text-lg text-[#86162f]">
              <span>Total</span>
              <span>₹{cartTotalAmount}</span>
            </div>
            
            <button className="w-full mt-8 py-4 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-sm uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-xl flex items-center justify-center">
              Complete Payment
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
