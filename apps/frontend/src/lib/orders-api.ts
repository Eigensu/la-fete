export interface OrderVariant {
  id: string;
  name: string;
  product?: {
    name: string;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
  variant: OrderVariant;
  sweetener?: string;
  cakeTopper?: boolean;
  topperText?: string;
  cakeMessage?: boolean;
  messageText?: string;
}

export interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  subtotal: number;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: OrderAddress;
}

export interface CreateOrderPayload {
  deliverySlotId: string;
  deliveryAddressId: string;
  customMessage?: string;
  isGift?: boolean;
  specialInstructions?: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof globalThis !== 'undefined' ? globalThis.localStorage?.getItem('la-fete-access-token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401) {
    try {
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData.accessToken;
        if (typeof globalThis !== 'undefined') {
          globalThis.localStorage.setItem('la-fete-access-token', newToken);
        }
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers, credentials: 'include', cache: 'no-store' });
      } else {
        if (typeof globalThis !== 'undefined') {
          globalThis.localStorage.removeItem('la-fete-access-token');
          globalThis.localStorage.removeItem('la-fete-user');
          window.location.href = '/auth';
          throw new Error('Session expired');
        }
      }
    } catch (e) {
      if (typeof globalThis !== 'undefined') {
        globalThis.localStorage.removeItem('la-fete-access-token');
        globalThis.localStorage.removeItem('la-fete-user');
        window.location.href = '/auth';
        throw new Error('Session expired');
      }
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || 'Request failed');
  }

  return body;
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ order: Order; payment: any }> {
  return fetchWithAuth('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrders(): Promise<Order[]> {
  return fetchWithAuth('/api/orders');
}

export async function getOrder(id: string): Promise<Order> {
  return fetchWithAuth(`/api/orders/${id}`);
}

export async function getAdminOrder(id: string): Promise<Order> {
  return fetchWithAuth(`/api/admin/orders/${id}`);
}

export async function getAdminOrders(status?: string, search?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const url = `/api/admin/orders${params.toString() ? '?' + params.toString() : ''}`;
  return fetchWithAuth(url);
}

export async function updateAdminOrderStatus(id: string, status: string): Promise<Order> {
  return fetchWithAuth(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function trackOrder(orderId: string): Promise<any> {
  return fetchWithAuth(`/api/delivery/track/${orderId}`);
}

export async function getDeliverySlots(): Promise<any[]> {
  try {
    const res = await fetchWithAuth('/api/delivery/slots');
    return res;
  } catch (err) {
    console.error('Error fetching delivery slots:', err);
    return [];
  }
}
