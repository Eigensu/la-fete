'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, User, Apple, Chrome as Google } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(false);

    return (
        <main className="h-screen bg-[#fcf9f8] flex flex-col md:flex-row overflow-hidden">
            {/* Branding Sidebar - Visible on Desktop */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#86162f] via-[#a82043] to-[#f8aeb2] p-8 flex-col justify-between text-white relative">
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

            {/* Auth Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 py-6 bg-white overflow-hidden h-full">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile Branding */}
                    <div className="md:hidden text-center mb-6">
                        <h1 className="font-seasons text-[#86162f] text-3xl mb-1">La Fête 365</h1>
                        <p className="font-poppins text-gray-500 text-[10px] tracking-widest uppercase">Conscious Celebration</p>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="font-seasons text-[#86162f] text-3xl mb-2">
                            {isLogin ? 'Welcome Back' : 'Join the Circle'}
                        </h2>
                        <p className="font-poppins text-gray-400 text-sm">
                            {isLogin ? 'Sign in to your account' : 'Create an account to continue'}
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="block font-poppins text-[10px] uppercase tracking-[0.2em] text-gray-400 pl-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86162f]/40">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Aanshuvi Shah"
                                        className="w-full pl-12 pr-4 py-3.5 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-sm outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[10px] uppercase tracking-[0.2em] text-gray-400 pl-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86162f]/40">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="+91 99999 99999"
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#fcf9f8] border border-transparent focus:border-[#86162f]/20 focus:bg-white transition-all rounded-sm font-poppins text-sm outline-none"
                                />
                            </div>
                        </div>

                        <button className="w-full py-4 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-xs uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-lg mt-2">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-100"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase text-gray-400 tracking-widest font-poppins">
                                <span className="bg-white px-3">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors">
                                <Google size={16} className="text-[#86162f]" />
                                <span className="font-poppins text-xs tracking-wider uppercase text-gray-600">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors">
                                <Apple size={16} className="text-[#86162f]" />
                                <span className="font-poppins text-xs tracking-wider uppercase text-gray-600">Apple</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-poppins text-[11px] text-gray-400 uppercase tracking-widest hover:text-[#86162f] transition-colors"
                        >
                            {isLogin ? "New here? Create account" : "Member? Sign In"}
                        </button>
                    </div>

                    <div className="mt-8 text-center opacity-40">
                        <Link href="/" className="font-poppins text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                            Privacy & Terms
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
