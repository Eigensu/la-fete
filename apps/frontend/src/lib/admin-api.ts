export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = globalThis.localStorage.getItem('la-fete-access-token');
    
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

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return response.json();
}

// Products
export const getAdminProducts = async () => {
    const res = await fetchWithAuth('/api/admin/products?limit=1000');
    return res?.data ? res.data : (Array.isArray(res) ? res : []);
};
export const createAdminProduct = (data: any) => fetchWithAuth('/api/admin/products', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminProduct = (id: string, data: any) => fetchWithAuth(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminProduct = (id: string) => fetchWithAuth(`/api/admin/products/${id}`, { method: 'DELETE' });

// Categories
export const getAdminCategories = async () => {
    const res = await fetchWithAuth('/api/categories');
    return res?.data ? res.data : (Array.isArray(res) ? res : []);
};
export const createAdminCategory = (data: any) => fetchWithAuth('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminCategory = (id: string, data: any) => fetchWithAuth(`/api/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminCategory = (id: string) => fetchWithAuth(`/api/admin/categories/${id}`, { method: 'DELETE' });

// Variants
export const createAdminVariant = (productId: string, data: any) => fetchWithAuth(`/api/admin/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(data) });
export const updateAdminVariant = (id: string, data: any) => fetchWithAuth(`/api/admin/variants/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminVariant = (id: string) => fetchWithAuth(`/api/admin/variants/${id}`, { method: 'DELETE' });
