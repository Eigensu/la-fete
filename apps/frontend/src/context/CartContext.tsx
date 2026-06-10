'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id?: string;
    productId?: string;
    name: string;
    quantity: number;
    price: number;
}

interface CartContextType {
    cart: Record<string, CartItem>;
    updateQuantity: (productIdentifier: string, delta: number, price?: number) => Promise<void>;
    cartTotalCount: number;
    cartTotalAmount: number;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Record<string, CartItem>>({});
    const [cartTotalCount, setCartTotalCount] = useState(0);
    const [cartTotalAmount, setCartTotalAmount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const user = globalThis.localStorage.getItem('la-fete-user');
        setIsAuthenticated(!!user);

        const initCart = async () => {
            if (user) {
                // Fetch from backend
                try {
                    const res = await fetch('/api/cart');
                    if (res.ok) {
                        const data = await res.json();
                        const backendCart: Record<string, CartItem> = {};
                        if (data && data.items) {
                            data.items.forEach((item: any) => {
                                // Maps using product name as key for frontend compatibility
                                backendCart[item.product.name] = {
                                    id: item.id,
                                    productId: item.product.id,
                                    name: item.product.name,
                                    quantity: item.quantity,
                                    price: parseFloat(item.unitPrice),
                                };
                            });
                        }
                        setCart(backendCart);
                    }
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
        };

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

    const updateQuantity = async (productIdentifier: string, delta: number, price?: number) => {
        const currentItem = cart[productIdentifier];
        const currentQty = currentItem ? currentItem.quantity : 0;
        const newQty = Math.max(0, currentQty + delta);

        if (isAuthenticated) {
            try {
                // If resolving to delete
                if (newQty === 0 && currentItem?.id) {
                    await fetch(`/api/cart/items/${currentItem.id}`, { method: 'DELETE' });
                } 
                // If adding new item
                else if (!currentItem) {
                    // For backend APIs we technically need the productId. 
                    // This assumes the API or a frontend hook has mapped productIdentifier correctly.
                    await fetch('/api/cart/items', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            productId: productIdentifier, // Frontend must pass productId instead of name if authenticated
                            quantity: newQty 
                        })
                    });
                }
                // If updating existing item
                else if (currentItem?.id) {
                    await fetch(`/api/cart/items/${currentItem.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: newQty })
                    });
                }
                
                // Optimistic UI update
                updateLocalState(productIdentifier, newQty, price);
            } catch (err) {
                console.error('Backend cart update failed', err);
            }
        } else {
            updateLocalState(productIdentifier, newQty, price);
        }
    };

    const updateLocalState = (productIdentifier: string, newQty: number, price?: number) => {
        setCart((prev) => {
            if (newQty === 0) {
                const newCart = { ...prev };
                delete newCart[productIdentifier];
                return newCart;
            }
            return {
                ...prev,
                [productIdentifier]: {
                    ...prev[productIdentifier],
                    name: productIdentifier,
                    quantity: newQty,
                    price: price || (prev[productIdentifier] ? prev[productIdentifier].price : 0),
                },
            };
        });
    }

    const clearCart = async () => {
        if (isAuthenticated) {
            await fetch('/api/cart', { method: 'DELETE' });
        } else {
            globalThis.localStorage.removeItem('la-fete-cart');
        }
        setCart({});
    };

    return (
        <CartContext.Provider value={{ cart, updateQuantity, cartTotalCount, cartTotalAmount, clearCart }}>
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
