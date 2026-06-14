'use client';

/* global HTMLInputElement, HTMLFormElement */

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, User, Apple, Chrome as Google } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGoogleAuthUrl, login, register } from '@/lib/auth-api';

type FormState = {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
};

const initialFormState: FormState = {
  email: '',
  password: '',
  phone: '',
  firstName: '',
  lastName: '',
};

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = isLogin
        ? await login({ email: form.email, password: form.password })
        : await register({
            email: form.email,
            password: form.password,
            phone: form.phone,
            firstName: form.firstName,
            lastName: form.lastName,
          });

      globalThis.localStorage.setItem('la-fete-access-token', payload.accessToken);
      globalThis.localStorage.setItem('la-fete-user', JSON.stringify(payload.user));

      // Attempt Cart Merge if guest cart exists
      const guestCartStr = globalThis.localStorage.getItem('la-fete-cart');
      if (guestCartStr) {
        try {
          const guestCart = JSON.parse(guestCartStr);
          const itemsToMerge = Object.values(guestCart).map((item: any) => ({
            productId: item.productId || item.name, // Fallback if old format
            quantity: item.quantity,
          }));
          
          if (itemsToMerge.length > 0) {
            const mergeResponse = await fetch('/api/cart/merge', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${payload.accessToken}`,
              },
              body: JSON.stringify({ items: itemsToMerge })
            });
            if (mergeResponse.ok) {
              globalThis.localStorage.removeItem('la-fete-cart');
            }
          }
        } catch (e) {
          console.error('Cart merge failed', e);
        }
      }

      toast.success(isLogin ? 'Signed in successfully' : 'Account created successfully');
      // Adding a small delay to ensure cookies are processed and context refreshes
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 300);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete authentication';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    globalThis.window.location.href = getGoogleAuthUrl();
  };

  return (
    <main className="min-h-screen bg-[#fcf9f8] flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#86162f] via-[#a82043] to-[#f8aeb2] p-12 flex-col justify-between text-white relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05)_0%,transparent_60%)]"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-poppins text-xs uppercase tracking-widest font-light">Back to Home</span>
          </Link>

          <h1 className="font-seasons text-5xl lg:text-7xl mb-4">La Fête 365</h1>
          <p className="font-poppins text-base lg:text-lg font-light tracking-wide max-w-sm leading-relaxed border-l-2 border-white/20 pl-4 text-white/90">
            Join our circle of conscious celebration. Experience balance, beauty, and guilt-free goodness every day.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-8 py-10 bg-white overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="md:hidden text-center mb-6">
            <h1 className="font-seasons text-[#86162f] text-3xl mb-1">La Fête 365</h1>
            <p className="font-poppins text-gray-500 text-[10px] tracking-widest uppercase">Conscious Celebration</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-seasons text-[#86162f] text-2xl mb-1">
              {isLogin ? 'Welcome Back' : 'Join the Circle'}
            </h2>
            <p className="font-poppins text-gray-400 text-xs">
              {isLogin ? 'Sign in to your account' : 'Create an account to continue'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-poppins text-[9px] uppercase tracking-[0.2em] text-gray-400 pl-1">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86162f]/40">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={handleChange('firstName')}
                      placeholder="Aanshuvi"
                      className="w-full pl-10 pr-4 py-3 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-poppins text-[9px] uppercase tracking-[0.2em] text-gray-400 pl-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86162f]/40">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={handleChange('lastName')}
                      placeholder="Shah"
                      className="w-full pl-10 pr-4 py-3 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-xs outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-poppins text-[9px] uppercase tracking-[0.2em] text-gray-400 pl-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86162f]/40">
                  <User size={16} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-xs outline-none"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="block font-poppins text-[9px] uppercase tracking-[0.2em] text-gray-400 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86162f]/40">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+91 99999 99999"
                    className="w-full pl-10 pr-4 py-3 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-xs outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-poppins text-[9px] uppercase tracking-[0.2em] text-gray-400 pl-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-xs outline-none"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-lg mt-2 disabled:opacity-60"
            >
              {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase text-gray-400 tracking-widest font-poppins">
                <span className="bg-white px-3">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors"
              >
                <Google size={14} className="text-[#86162f]" />
                <span className="font-poppins text-[10px] tracking-wider uppercase text-gray-600">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors"
              >
                <Apple size={14} className="text-[#86162f]" />
                <span className="font-poppins text-[10px] tracking-wider uppercase text-gray-600">Apple</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin((current) => !current)}
              className="font-poppins text-[10px] text-gray-400 uppercase tracking-widest hover:text-[#86162f] transition-colors"
            >
              {isLogin ? 'New here? Create account' : 'Member? Sign In'}
            </button>
          </div>

          <div className="mt-10 text-center opacity-40">
            <Link
              href="/"
              className="font-poppins text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              Privacy & Terms
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
