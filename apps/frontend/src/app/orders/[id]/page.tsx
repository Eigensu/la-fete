'use client';

import { useEffect, useState } from 'react';
import { getOrder, Order } from '@/lib/orders-api';
import { toTitleCase } from '@/utils/format';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, MapPin, Package, Truck } from 'lucide-react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrder(id);
        setOrder(data);
      } catch (err) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto py-8 px-4 animate-pulse">
      <div className="h-8 bg-gray-200 w-1/4 rounded mb-8"></div>
      <div className="h-64 bg-gray-100 rounded-lg"></div>
    </div>;
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found</div>;
  }

  return (
    <>
      <Navigation />
      <div className="max-w-5xl mx-auto py-8 px-4">
        <Link href="/orders" className="flex items-center gap-2 text-gray-600 hover:text-black mt-8 mb-6">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex justify-between items-end mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
          <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Link href={`/orders/${order.id}/track`} className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
          <Truck size={16} /> Track Order
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Package size={20} /> Items</h2>
            <div className="divide-y">
              {order.items?.map(item => (
                <div key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {toTitleCase(item.variant.product?.name)} 
                      {item.variant.name !== 'Default' && ` - ${item.variant.name}`}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">Qty: {item.quantity}</p>
                    {(item.sweetener || item.cakeTopper || item.cakeMessage) && (
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {item.sweetener && <p>Sweetener: {item.sweetener}</p>}
                        {item.cakeTopper && <p>Topper: {item.topperText || 'Yes'}</p>}
                        {item.cakeMessage && <p>Message: {item.messageText || 'Yes'}</p>}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">₹{Number(item.subtotal).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{Number(order.deliveryFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total Amount</span>
                <span>₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 border rounded-lg p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">Order Status</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.status.replace(/_/g, ' ')}
            </span>
            <p className="text-sm text-gray-500 mt-4">Payment Status: <span className="font-semibold text-green-600">PAID</span></p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={18} /> Delivery Address</h2>
            {order.deliveryAddress ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-black">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.phone}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Address details unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
