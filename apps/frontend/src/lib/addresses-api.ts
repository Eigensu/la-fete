export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean };

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof globalThis !== 'undefined' ? globalThis.localStorage?.getItem('la-fete-access-token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || 'Request failed');
  }

  return body;
}

export async function getAddresses(): Promise<Address[]> {
  return fetchWithAuth('/api/addresses');
}

export async function createAddress(input: AddressInput): Promise<Address> {
  return fetchWithAuth('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address> {
  return fetchWithAuth(`/api/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAddress(id: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`/api/addresses/${id}`, {
    method: 'DELETE',
  });
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return fetchWithAuth(`/api/addresses/${id}/default`, {
    method: 'PATCH',
  });
}
