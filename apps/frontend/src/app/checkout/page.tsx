'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Plus, Check } from 'lucide-react';
import { toTitleCase } from '@/utils/format';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getAddresses, Address, createAddress } from '@/lib/addresses-api';
import { getDeliverySlots, createOrder } from '@/lib/orders-api';
import toast from 'react-hot-toast';

const inputClasses =
  'w-full px-4 py-3 border border-[#86162f]/20 font-poppins text-sm text-[#86162f] outline-none focus:border-[#86162f] transition-colors placeholder:text-gray-400';

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
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#86162f] border-t-transparent rounded-full" />
        </div>
      </main>
    );
  }

  if (Object.keys(cart).length === 0 && !isPlacingOrder) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <p className="font-poppins text-[10px] uppercase tracking-[0.45em] text-[#f8aeb2] mb-4">Nothing to order yet</p>
          <h1 className="font-seasons text-[#86162f] text-3xl md:text-4xl mb-6">Your basket is empty</h1>
          <Link
            href="/products/bakes"
            className="px-8 py-3.5 bg-[#86162f] text-white font-poppins text-xs uppercase tracking-widest hover:bg-[#a82043] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const itemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = 150;

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-16 md:mt-20 pt-6 md:pt-8 pb-4 md:pb-6 text-center border-b border-[#86162f]/10">
        <p className="text-[#86162f]/40 text-[10px] uppercase tracking-[0.45em] mb-2 font-poppins">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your basket
        </p>
        <h1 className="font-seasons text-[#86162f] text-3xl md:text-5xl">Checkout</h1>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-10 md:py-14">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-start">

          {/* LEFT: delivery details */}
          <div className="space-y-10">

            {/* Address */}
            <section>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#86162f]/10">
                <div>
                  <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 mb-1">Step 1</p>
                  <h2 className="font-seasons text-[#86162f] text-xl md:text-2xl">Delivery address</h2>
                </div>
                <button
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="flex items-center gap-1.5 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5 shrink-0"
                >
                  {showNewAddressForm ? 'Cancel' : (<><Plus size={12} /> New address</>)}
                </button>
              </div>

              {showNewAddressForm ? (
                <form onSubmit={handleAddNewAddress} className="space-y-3">
                  <input required placeholder="Full name" value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} className={inputClasses} />
                  <input required placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className={inputClasses} />
                  <input required placeholder="Address line 1" value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} className={inputClasses} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className={inputClasses} />
                    <input required placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className={inputClasses} />
                  </div>
                  <input required placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} className={inputClasses} />
                  <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#86162f] text-white font-poppins text-xs uppercase tracking-widest hover:bg-[#a82043] transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving…' : 'Save and select this address'}
                  </button>
                </form>
              ) : addresses.length === 0 ? (
                <p className="font-poppins text-sm text-gray-500">No saved addresses yet — add one to continue.</p>
              ) : (
                <div className="space-y-2.5">
                  {addresses.map(addr => {
                    const selected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`w-full text-left p-4 border flex items-start gap-3 transition-colors ${
                          selected ? 'border-[#86162f] bg-[#f8aeb2]/10' : 'border-[#86162f]/15 hover:border-[#86162f]/40'
                        }`}
                      >
                        <span
                          className={`shrink-0 mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected ? 'border-[#86162f] bg-[#86162f]' : 'border-[#86162f]/30'
                          }`}
                        >
                          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-baseline gap-2 font-poppins text-sm text-[#86162f]">
                            <span className="font-medium">{addr.fullName}</span>
                            <span className="text-[10px] uppercase tracking-wider text-[#86162f]/45">{addr.label}</span>
                          </span>
                          <span className="block font-poppins text-xs text-gray-500 mt-1 leading-relaxed">
                            {addr.addressLine1}, {addr.city}, {addr.state} – {addr.pincode}
                          </span>
                          <span className="block font-poppins text-xs text-gray-500">{addr.phone}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Delivery slot */}
            <section>
              <div className="mb-5 pb-3 border-b border-[#86162f]/10">
                <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 mb-1">Step 2</p>
                <h2 className="font-seasons text-[#86162f] text-xl md:text-2xl">Delivery slot</h2>
              </div>

              {slots.length === 0 ? (
                <p className="font-poppins text-sm text-gray-500">No delivery slots available right now.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {slots.map(slot => {
                    const selected = selectedSlotId === slot.id;
                    const d = new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`text-left p-4 border flex items-start gap-3 transition-colors ${
                          selected ? 'border-[#86162f] bg-[#f8aeb2]/10' : 'border-[#86162f]/15 hover:border-[#86162f]/40'
                        }`}
                      >
                        <span
                          className={`shrink-0 mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected ? 'border-[#86162f] bg-[#86162f]' : 'border-[#86162f]/30'
                          }`}
                        >
                          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </span>
                        <span>
                          <span className="block font-poppins text-sm text-[#86162f] font-medium">{d}</span>
                          <span className="block font-poppins text-xs text-gray-500">{slot.startTime} – {slot.endTime}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: order summary */}
          <div className="lg:sticky lg:top-24 border border-[#86162f]/12 bg-[#fdf5f6] p-6 md:p-8">
            <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/35 mb-1">Step 3</p>
            <h2 className="font-seasons text-[#86162f] text-xl md:text-2xl mb-6">Order summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-dashed border-[#86162f]/20">
              {Object.entries(cart).map(([variantId, item]) => (
                <div key={variantId} className="flex justify-between gap-4 font-poppins text-sm">
                  <div className="min-w-0">
                    <p className="text-[#86162f] truncate">
                      {toTitleCase(item.name)} <span className="text-[#86162f]/50">× {item.quantity}</span>
                    </p>
                    {(item.sweetener || item.cakeTopper || item.cakeMessage) && (
                      <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                        {item.sweetener && <p>Sweetener: {item.sweetener}</p>}
                        {item.cakeTopper && <p>Topper: {item.topperText || 'Yes'}</p>}
                        {item.cakeMessage && <p>Message: {item.messageText || 'Yes'}</p>}
                      </div>
                    )}
                  </div>
                  <span className="text-[#86162f] shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 font-poppins text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{deliveryFee}</span>
              </div>
            </div>
            <p className="font-poppins text-[11px] text-gray-400 mt-2 leading-relaxed">
              Standard Mumbai delivery. Outlying areas may cost more — we&rsquo;ll confirm before dispatch.
            </p>

            <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-[#86162f]/20">
              <span className="font-poppins text-sm text-[#86162f]">Total</span>
              <span className="font-poppins font-semibold text-2xl text-[#86162f]">₹{cartTotalAmount + deliveryFee}</span>
            </div>

            <button
              onClick={handleCompletePayment}
              disabled={isPlacingOrder || addresses.length === 0 || slots.length === 0}
              className="w-full mt-6 py-4 bg-[#86162f] text-white font-poppins text-xs uppercase tracking-widest hover:bg-[#a82043] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? 'Processing…' : 'Complete payment'}
            </button>
            <p className="font-poppins text-[11px] text-center text-gray-400 mt-3">Secure mock payment gateway</p>
          </div>
        </div>
      </div>

      <div className="py-6 border-t border-[#86162f]/10 text-center">
        <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/30">
          © 2026 La Fête 365 · Mumbai
        </p>
      </div>
    </main>
  );
}
