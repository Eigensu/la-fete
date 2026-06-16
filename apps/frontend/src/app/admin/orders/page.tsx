'use client';

import { useEffect, useState } from 'react';
import { getAdminOrders, updateAdminOrderStatus, Order } from '@/lib/orders-api';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const statuses = ['PENDING', 'CONFIRMED', 'BAKING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    let ignore = false;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getAdminOrders(statusFilter, search);
        if (!ignore) {
          setOrders(data);
        }
      } catch (err) {
        if (!ignore) toast.error('Failed to load admin orders');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOrders();
    return () => { ignore = true; };
  }, [search, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      const data = await getAdminOrders(statusFilter, search);
      setOrders(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by order number, name, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Order Info</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Customer</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Amount</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{(order as any).user?.firstName} {(order as any).user?.lastName}</p>
                      <p className="text-sm text-gray-500">{(order as any).user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">₹{Number(order.totalAmount).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-sm font-semibold px-2 py-1 rounded border-none cursor-pointer ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
