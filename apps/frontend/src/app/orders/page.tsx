'use client';

import { useEffect, useState } from 'react';
import { getOrders, Order } from '@/lib/orders-api';
import toast from 'react-hot-toast';
import { Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border rounded-lg border-dashed">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg">You haven't placed any orders yet.</p>
          <Link href="/products" className="inline-block mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border rounded-lg hover:shadow-md transition bg-white gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order #{order.orderNumber}</p>
                  <p className="font-semibold text-lg">₹{Number(order.totalAmount).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{order.items?.length || 0} items</p>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
