'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus } from 'lucide-react';
import { toTitleCase } from '@/utils/format';
import Link from 'next/link';
import { getAddresses, Address, createAddress } from '@/lib/addresses-api';
import { getDeliverySlots, createOrder } from '@/lib/orders-api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotalAmount, clearCart, isCartLoading } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? globalThis.localStorage.getItem('la-fete-access-token') : null;
    if (!token) {
      router.replace('/auth');
    } else {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [addrs, deliverySlots] = await Promise.all([
        getAddresses(),
        getDeliverySlots()
      ]);
      setAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find(a => a.isDefault);
        setSelectedAddressId(def ? def.id : addrs[0].id);
      }
      setSlots(deliverySlots);
      if (deliverySlots.length > 0) {
        setSelectedSlotId(deliverySlots[0].id);
      }
    } catch (err) {
      toast.error('Failed to load checkout details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const created = await createAddress(newAddress);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      toast.success('Address added successfully');
    } catch (err) {
      toast.error('Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedAddressId) {
      return toast.error('Please select a delivery address');
    }
    if (!selectedSlotId) {
      return toast.error('Please select a delivery slot');
    }

    try {
      setIsPlacingOrder(true);
      const result = await createOrder({
        deliveryAddressId: selectedAddressId,
        deliverySlotId: selectedSlotId,
      });
      
      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/orders/${result.order.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading || isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8]">
        <div className="animate-spin w-8 h-8 border-4 border-[#86162f] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (Object.keys(cart).length === 0 && !isPlacingOrder) {
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
          <div className="space-y-8">
            {/* Address Selection */}
            <div className="bg-white p-6 shadow-sm rounded-sm border border-[#86162f]/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-seasons text-[#86162f] text-2xl">Delivery Address</h2>
                <button 
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-sm font-poppins text-[#86162f] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> {showNewAddressForm ? 'Cancel' : 'New Address'}
                </button>
              </div>

              {showNewAddressForm ? (
                <form onSubmit={handleAddNewAddress} className="space-y-4 font-poppins">
                  <input required placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full p-3 border border-[#86162f]/20 rounded-sm text-sm outline-none focus:border-[#86162f]" />
                  <input required placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full p-3 border border-[#86162f]/20 rounded-sm text-sm outline-none focus:border-[#86162f]" />
                  <input required placeholder="Address Line 1" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} className="w-full p-3 border border-[#86162f]/20 rounded-sm text-sm outline-none focus:border-[#86162f]" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-3 border border-[#86162f]/20 rounded-sm text-sm outline-none focus:border-[#86162f]" />
                    <input required placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full p-3 border border-[#86162f]/20 rounded-sm text-sm outline-none focus:border-[#86162f]" />
                  </div>
                  <input required placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full p-3 border border-[#86162f]/20 rounded-sm text-sm outline-none focus:border-[#86162f]" />
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#86162f] text-white text-sm tracking-widest uppercase hover:bg-opacity-90 transition">
                    {isLoading ? 'Saving...' : 'Save & Select Address'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-sm text-gray-500 font-poppins">No saved addresses found. Please add a new one.</p>
                  ) : (
                    addresses.map(addr => (
                      <button 
                        key={addr.id} 
                        type="button"
                        role="radio"
                        aria-checked={selectedAddressId === addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`w-full text-left p-4 border rounded cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[#86162f] bg-[#86162f]/5' : 'border-gray-200 hover:border-[#86162f]/50'}`}
                      >
                        <p className="font-semibold text-sm">{addr.fullName} <span className="text-gray-400 font-normal">({addr.label})</span></p>
                        <p className="text-xs text-gray-600 mt-1">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-xs text-gray-600">{addr.phone}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Delivery Slots */}
            <div className="bg-white p-6 shadow-sm rounded-sm border border-[#86162f]/10">
              <h2 className="font-seasons text-[#86162f] text-2xl mb-6">Delivery Slot</h2>
              <div className="space-y-3 font-poppins">
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-500">No delivery slots available at the moment.</p>
                ) : (
                  slots.map(slot => {
                    const d = new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    return (
                      <button 
                        key={slot.id} 
                        type="button"
                        role="radio"
                        aria-checked={selectedSlotId === slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`w-full text-left p-4 border rounded cursor-pointer transition-colors ${selectedSlotId === slot.id ? 'border-[#86162f] bg-[#86162f]/5' : 'border-gray-200 hover:border-[#86162f]/50'}`}
                      >
                        <p className="font-semibold text-sm">{d}</p>
                        <p className="text-xs text-gray-600">{slot.startTime} - {slot.endTime}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 shadow-xl rounded-sm h-fit sticky top-8">
            <h2 className="font-seasons text-[#86162f] text-2xl mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {Object.entries(cart).map(([variantId, item]) => (
                <div key={variantId} className="flex justify-between font-poppins text-sm">
                  <span className="font-poppins text-xs text-gray-700 w-2/3 truncate">
                    {toTitleCase(item.name)} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#86162f]/20 pt-4 flex justify-between font-poppins text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotalAmount}</span>
            </div>
            <div className="flex justify-between font-poppins text-sm text-gray-600 mt-2">
              <span>Delivery Fee</span>
              <span>₹150</span>
            </div>

            <div className="border-t border-[#86162f]/20 mt-4 pt-4 flex justify-between font-poppins font-bold text-lg text-[#86162f]">
              <span>Total</span>
              <span>₹{cartTotalAmount + 150}</span>
            </div>

            <button 
              onClick={handleCompletePayment}
              disabled={isPlacingOrder || addresses.length === 0 || slots.length === 0}
              className="w-full mt-8 py-4 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-sm uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-xl flex items-center justify-center disabled:opacity-50"
            >
              {isPlacingOrder ? 'Processing...' : 'Complete Payment'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4 font-poppins">Secure Mock Payment Gateway</p>
          </div>
        </div>
      </div>
    </main>
  );
}
