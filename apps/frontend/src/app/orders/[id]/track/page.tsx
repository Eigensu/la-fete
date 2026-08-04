'use client';

import { useEffect, useState } from 'react';
import { trackOrder } from '@/lib/orders-api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, Truck, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params.id as string;
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const data = await trackOrder(id);
        setTracking(data);
      } catch (err) {
        toast.error('Failed to load tracking details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTracking();
  }, [id]);

  if (loading) {
    return <div className="max-w-3xl mx-auto py-8 px-4 animate-pulse">
      <div className="h-8 bg-gray-200 w-1/4 rounded mb-8"></div>
      <div className="h-64 bg-gray-100 rounded-lg"></div>
    </div>;
  }

  if (!tracking) {
    return <div className="text-center py-20 text-gray-500">Tracking not available</div>;
  }

  const { trackingInfo, delivery } = tracking;

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: Package },
    { key: 'PREPARING', label: 'Preparing', icon: Package },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: MapPin },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  // We are mapping DeliveryStatus / OrderStatus loosely for mock UI
  const foundIndex = steps.findIndex(s => s.key === trackingInfo.status);
  const currentStepIndex = foundIndex !== -1 ? foundIndex : 0;

  return (
    <>
      <Navigation />
      <div className="max-w-3xl mx-auto py-8 mt-8 px-4">
        <Link href={`/orders/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
        <ArrowLeft size={16} /> Back to Order Details
      </Link>

      <h1 className="text-3xl font-bold mb-8">Track Order</h1>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Delivery Partner</p>
            <p className="font-semibold">{trackingInfo.courierName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
            <p className="font-semibold">{delivery?.borzoOrderId || 'N/A'}</p>
          </div>
        </div>
        
        {trackingInfo.courierPhone && (
          <div className="bg-gray-50 p-4 rounded mb-8">
            <p className="text-sm text-gray-600">Courier Phone: <span className="font-medium">{trackingInfo.courierPhone}</span></p>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
          <div className="space-y-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className={`flex items-center relative z-10 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white
                    ${isCompleted ? 'border-black text-black' : 'border-gray-300 text-gray-300'}
                    ${isCurrent ? 'ring-4 ring-gray-100' : ''}
                  `}>
                    <Icon size={18} />
                  </div>
                  <div className="ml-4">
                    <p className={`font-semibold ${isCompleted ? 'text-black' : 'text-gray-500'}`}>{step.label}</p>
                    {isCurrent && <p className="text-sm text-gray-500 mt-1">Your order is currently {step.label.toLowerCase()}.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
