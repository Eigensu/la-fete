'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id?: string;
    productId?: string;
    variantId?: string;
    name: string;
    quantity: number;
    price: number;
    sweetener?: string;
    cakeTopper?: boolean;
    topperText?: string;
    cakeMessage?: boolean;
    messageText?: string;
}

interface CartContextType {
    cart: Record<string, CartItem>;
    updateQuantity: (productIdentifier: string, delta: number, price?: number, productId?: string, variantId?: string, options?: any) => Promise<void>;
    cartTotalCount: number;
    cartTotalAmount: number;
    clearCart: () => Promise<void>;
    reloadCart: () => Promise<void>;
    isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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
                    throw new Error('Session expired');
                }
            }
        } catch (e) {
            if (typeof globalThis !== 'undefined') {
                globalThis.localStorage.removeItem('la-fete-access-token');
                globalThis.localStorage.removeItem('la-fete-user');
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

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Record<string, CartItem>>({});
    const [cartTotalCount, setCartTotalCount] = useState(0);
    const [cartTotalAmount, setCartTotalAmount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(true);

    const initCart = async () => {
        const token = globalThis.localStorage.getItem('la-fete-access-token');
        setIsAuthenticated(!!token);
        
        if (token) {
            // Merge guest cart if it exists
            try {
                const guestCartRaw = globalThis.localStorage.getItem('la-fete-cart');
                if (guestCartRaw) {
                    const guestCart = JSON.parse(guestCartRaw);
                    const itemsToMerge = Object.values(guestCart).map((item: any) => ({
                        productId: item.productId || item.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        sweetener: item.sweetener,
                        cakeTopper: item.cakeTopper,
                        topperText: item.topperText,
                        cakeMessage: item.cakeMessage,
                        messageText: item.messageText,
                    }));
                    if (itemsToMerge.length > 0) {
                        const mergeResponse = await fetchWithAuth('/api/cart/merge', {
                            method: 'POST',
                            body: JSON.stringify({ items: itemsToMerge })
                        });
                        if (mergeResponse) {
                            globalThis.localStorage.removeItem('la-fete-cart');
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to merge guest cart', err);
            }

            // Fetch from backend
            try {
                const data = await fetchWithAuth('/api/cart');
                const backendCart: Record<string, CartItem> = {};
                if (data && data.cart && data.cart.items) {
                    data.cart.items.forEach((item: any) => {
                        const productIdentifier = [
                            item.product.name,
                            item.variant?.name,
                            item.sweetener,
                            item.cakeTopper ? 'Topper' : null,
                            item.cakeMessage ? 'Message' : null
                        ].filter(Boolean).join(' · ');

                        backendCart[productIdentifier] = {
                            id: item.id,
                            productId: item.product.id,
                            variantId: item.variant?.id,
                            name: item.product.name,
                            quantity: item.quantity,
                            price: parseFloat(item.unitPrice),
                            sweetener: item.sweetener,
                            cakeTopper: item.cakeTopper,
                            topperText: item.topperText,
                            cakeMessage: item.cakeMessage,
                            messageText: item.messageText,
                        };
                    });
                }
                setCart(backendCart);
            } catch (err) {
                console.error('Failed to fetch backend cart', err);
            }
        } else {
            // Guest cart
            try {
                const savedCart = globalThis.localStorage.getItem('la-fete-cart');
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }
            } catch (error) {
                console.error('Failed to parse cart from localStorage', error);
            }
        }
        setIsCartLoading(false);
    };

    useEffect(() => {
        setIsMounted(true);
        initCart();
    }, []);

    useEffect(() => {
        if (isMounted && !isAuthenticated) {
            globalThis.localStorage.setItem('la-fete-cart', JSON.stringify(cart));
        }

        const items = Object.values(cart);
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

        setCartTotalCount(count);
        setCartTotalAmount(amount);
    }, [cart, isMounted, isAuthenticated]);

    const updateQuantity = async (productIdentifier: string, delta: number, price?: number, productId?: string, variantId?: string, customizations?: any) => {
        const currentItem = cart[productIdentifier];
        const currentQty = currentItem ? currentItem.quantity : 0;
        const newQty = Math.max(0, currentQty + delta);

        if (isAuthenticated) {
            try {
                let responseData;
                // If resolving to delete
                if (newQty === 0 && currentItem?.id) {
                    responseData = await fetchWithAuth(`/api/cart/items/${currentItem.id}`, { method: 'DELETE' });
                } 
                // If adding new item
                else if (!currentItem && newQty > 0) {
                    responseData = await fetchWithAuth('/api/cart/items', {
                        method: 'POST',
                        body: JSON.stringify({ 
                            productId: productId || productIdentifier,
                            variantId: variantId,
                            quantity: newQty,
                            sweetener: customizations?.sweetener,
                            cakeTopper: customizations?.cakeTopper,
                            topperText: customizations?.topperText,
                            cakeMessage: customizations?.cakeMessage,
                            messageText: customizations?.messageText,
                        })
                    });
                }
                // If updating existing item
                else if (currentItem?.id) {
                    responseData = await fetchWithAuth(`/api/cart/items/${currentItem.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ 
                            quantity: newQty,
                            sweetener: customizations?.sweetener,
                            cakeTopper: customizations?.cakeTopper,
                            topperText: customizations?.topperText,
                            cakeMessage: customizations?.cakeMessage,
                            messageText: customizations?.messageText,
                        })
                    });
                }
                
                // Sync UI entirely with Backend state
                if (responseData) {
                    const backendCart: Record<string, CartItem> = {};
                    const itemsToMap = responseData.cart ? responseData.cart.items : responseData.items;
                    if (itemsToMap) {
                        itemsToMap.forEach((item: any) => {
                            const pIdentifier = [
                                item.product.name,
                                item.variant?.name,
                                item.sweetener,
                                item.cakeTopper ? 'Topper' : null,
                                item.cakeMessage ? 'Message' : null
                            ].filter(Boolean).join(' · ');

                            backendCart[pIdentifier] = {
                                id: item.id,
                                productId: item.product.id,
                                variantId: item.variant?.id,
                                name: item.product.name,
                                quantity: item.quantity,
                                price: parseFloat(item.unitPrice),
                                sweetener: item.sweetener,
                                cakeTopper: item.cakeTopper,
                                topperText: item.topperText,
                                cakeMessage: item.cakeMessage,
                                messageText: item.messageText,
                            };
                        });
                    }
                    setCart(backendCart);
                }
            } catch (err) {
                console.error('Backend cart update failed', err);
            }
        } else {
            updateLocalState(productIdentifier, newQty, price, productId, variantId, customizations);
        }
    };

    const updateLocalState = (productIdentifier: string, newQty: number, price?: number, productId?: string, variantId?: string, customizations?: any) => {
        setCart((prev) => {
            if (newQty === 0) {
                const newCart = { ...prev };
                delete newCart[productIdentifier];
                return newCart;
            }

            const newCart = { ...prev };
            if (!newCart[productIdentifier]) {
                newCart[productIdentifier] = {
                    productId: productId || productIdentifier,
                    variantId: variantId,
                    name: productIdentifier.split(' · ')[0],
                    quantity: newQty,
                    price: price || 0,
                    sweetener: customizations?.sweetener,
                    cakeTopper: customizations?.cakeTopper,
                    topperText: customizations?.topperText,
                    cakeMessage: customizations?.cakeMessage,
                    messageText: customizations?.messageText,
                };
            } else {
                newCart[productIdentifier].quantity = newQty;
            }
            return newCart;
        });
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await fetchWithAuth('/api/cart', { method: 'DELETE' });
            } catch (err) {
                console.error('Failed to clear backend cart', err);
            }
        } else {
            globalThis.localStorage.removeItem('la-fete-cart');
        }
        setCart({});
    };

    return (
        <CartContext.Provider value={{ cart, updateQuantity, cartTotalCount, cartTotalAmount, clearCart, reloadCart: initCart, isCartLoading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
