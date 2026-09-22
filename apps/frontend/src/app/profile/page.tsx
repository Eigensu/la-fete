'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchUserProfile, logout as apiLogout } from '@/lib/auth-api';
import { getOrders, Order } from '@/lib/orders-api';
import { getAddresses, Address } from '@/lib/addresses-api';
import { useCart } from '@/context/CartContext';
import { MapPin, Package, Clock, ChevronRight, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ id: string; email: string; firstName?: string; lastName?: string; phone?: string; role: string } | null>(null);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? globalThis.localStorage?.getItem('la-fete-access-token') : null;
    if (!token) {
      router.push('/auth');
      return;
    }

    const loadProfileData = async () => {
      try {
        const [profileData, ordersData, addressesData] = await Promise.all([
          fetchUserProfile(token),
          getOrders().catch(() => []),
          getAddresses().catch(() => [])
        ]);

        setUserProfile(profileData as any);
        
        if (ordersData && ordersData.length > 0) {
          // Sort by date descending
          const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrder(sortedOrders[0]);
        }

        if (addressesData && addressesData.length > 0) {
          const defaultAddr = addressesData.find(a => a.isDefault) || addressesData[0];
          setDefaultAddress(defaultAddr);
        }
      } catch (err) {
        toast.error('Session expired or failed to load profile');
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore
    }
    await clearCart();
    globalThis.localStorage.removeItem('la-fete-access-token');
    globalThis.localStorage.removeItem('la-fete-user');
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pt-24 md:pt-28 pb-12 px-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse space-y-8 w-full max-w-2xl">
          <div className="h-10 bg-gray-100 rounded w-1/3"></div>
          <div className="h-40 bg-gray-100 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-gray-100 rounded-lg"></div>
            <div className="h-40 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="max-w-5xl mx-auto pt-24 md:pt-28 pb-12 px-4 md:px-6">
      <div className="mb-10">
        <h1 className="font-seasons text-4xl text-[#86162f] mb-2">My Profile</h1>
        <p className="font-poppins text-gray-500 text-sm md:text-base">Manage your account details, orders and saved addresses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Information Card */}
          <div className="bg-white border border-[#86162f]/10 rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-seasons text-2xl text-[#86162f] flex items-center gap-2">
                <User size={22} /> Personal Information
              </h2>
              {/* <button className="font-poppins text-xs font-semibold uppercase tracking-widest text-[#86162f] border-b border-[#86162f] hover:opacity-70 transition-opacity">
                Edit Profile
              </button> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-poppins text-sm">
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Full Name</p>
                <p className="font-medium text-gray-800">
                  {userProfile.firstName || userProfile.lastName 
                    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() 
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Email Address</p>
                <p className="font-medium text-gray-800">{userProfile.email}</p>
              </div>
              {userProfile.phone && (
                <div>
                  <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Phone Number</p>
                  <p className="font-medium text-gray-800">{userProfile.phone}</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-[#86162f]/10">
               <p className="text-xs text-gray-500 italic">
                 To update your personal information, please contact our support team. Profile editing will be available soon.
               </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/orders" className="bg-[#fcf9f8] border border-[#86162f]/10 p-5 rounded-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3 group">
              <div className="bg-white p-3 rounded-full text-[#86162f] group-hover:scale-110 transition-transform">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-poppins font-medium text-sm text-[#86162f] mb-1">Order History</h3>
                <p className="text-xs text-gray-500">View previous orders</p>
              </div>
            </Link>

            <Link href="/orders" className="bg-[#fcf9f8] border border-[#86162f]/10 p-5 rounded-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3 group">
              <div className="bg-white p-3 rounded-full text-[#86162f] group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-poppins font-medium text-sm text-[#86162f] mb-1">Track Orders</h3>
                <p className="text-xs text-gray-500">Track current orders</p>
              </div>
            </Link>

            <Link href="/profile/addresses" className="bg-[#fcf9f8] border border-[#86162f]/10 p-5 rounded-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3 group">
              <div className="bg-white p-3 rounded-full text-[#86162f] group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-poppins font-medium text-sm text-[#86162f] mb-1">Saved Addresses</h3>
                <p className="text-xs text-gray-500">Manage delivery addresses</p>
              </div>
            </Link>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Recent Order Preview */}
          <div className="bg-white border border-[#86162f]/10 rounded-sm p-6 shadow-sm">
            <h3 className="font-seasons text-xl text-[#86162f] mb-4">Recent Order</h3>
            
            {recentOrder ? (
              <div>
                <div className="mb-4">
                  <p className="font-poppins font-medium text-sm">Order #{recentOrder.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(recentOrder.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex justify-between items-center text-sm font-poppins mb-5">
                  <span className={`inline-block px-2 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-wider ${
                      recentOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      recentOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {recentOrder.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold">₹{Number(recentOrder.totalAmount).toLocaleString()}</span>
                </div>
                
                <Link href={`/orders/${recentOrder.id}`} className="w-full block text-center border border-[#86162f] text-[#86162f] py-2 font-poppins text-xs font-semibold uppercase tracking-widest hover:bg-[#86162f] hover:text-white transition-colors">
                  View Order
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="font-poppins text-sm mb-4">No orders yet</p>
                <Link href="/products/bakes" className="inline-block border border-[#86162f] text-[#86162f] px-4 py-2 font-poppins text-xs font-semibold uppercase tracking-widest hover:bg-[#86162f] hover:text-white transition-colors">
                  Explore Collection
                </Link>
              </div>
            )}
          </div>

          {/* Saved Address Preview */}
          <div className="bg-white border border-[#86162f]/10 rounded-sm p-6 shadow-sm">
            <h3 className="font-seasons text-xl text-[#86162f] mb-4">Default Address</h3>
            
            {defaultAddress ? (
              <div>
                <div className="font-poppins text-sm text-gray-700 mb-5 space-y-1">
                  <p className="font-medium text-black">{defaultAddress.fullName}</p>
                  <p className="text-xs text-gray-500 mb-2">{defaultAddress.phone}</p>
                  <p className="text-xs">{defaultAddress.addressLine1}</p>
                  {defaultAddress.addressLine2 && <p className="text-xs">{defaultAddress.addressLine2}</p>}
                  <p className="text-xs">{defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}</p>
                </div>
                
                <Link href="/profile/addresses" className="w-full block text-center border border-[#86162f] text-[#86162f] py-2 font-poppins text-xs font-semibold uppercase tracking-widest hover:bg-[#86162f] hover:text-white transition-colors">
                  Manage Addresses
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="font-poppins text-sm mb-4">No saved addresses</p>
                <Link href="/profile/addresses" className="inline-block border border-[#86162f] text-[#86162f] px-4 py-2 font-poppins text-xs font-semibold uppercase tracking-widest hover:bg-[#86162f] hover:text-white transition-colors">
                  Add Address
                </Link>
              </div>
            )}
          </div>
          
          {/* Logout Action */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#fcf9f8] border border-[#86162f]/10 text-[#86162f] py-3 font-poppins text-xs font-semibold uppercase tracking-widest hover:bg-[#86162f]/5 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>

        </div>
      </div>
    </div>
  );
}
