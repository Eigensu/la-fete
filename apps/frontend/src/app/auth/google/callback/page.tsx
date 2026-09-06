'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { refreshSession, fetchUserProfile } from '@/lib/auth-api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    let active = true;

    const finalizeLogin = async () => {
      try {
        const result = await refreshSession();
        globalThis.localStorage.setItem('la-fete-access-token', result.accessToken);
        
        // Fetch user profile to ensure `la-fete-user` has correct role
        const userProfile = await fetchUserProfile(result.accessToken);
        globalThis.localStorage.setItem('la-fete-user', JSON.stringify(userProfile));

        setStatus('Signed in successfully');
        toast.success('Signed in successfully');
        router.replace('/');
      } catch (error) {
        if (!active) {
          return;
        }

        globalThis.localStorage.removeItem('la-fete-access-token');
        globalThis.localStorage.removeItem('la-fete-user');
        const message = error instanceof Error ? error.message : 'Google sign-in failed';
        setStatus(message);
        toast.error(message);
        router.replace('/auth');
      }
    };

    finalizeLogin();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fcf9f8] px-6">
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#86162f] text-white shadow-lg mb-6">
          <span className="text-xl font-poppins font-semibold">LF</span>
        </div>
        <h1 className="font-seasons text-[#86162f] text-3xl mb-2">La Fête 365</h1>
        <p className="font-poppins text-sm text-gray-600">{status}</p>
      </div>
    </main>
  );
}
