'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    name: string;
    quantity: number;
    price: number;
}

interface CartContextType {
    cart: Record<string, CartItem>;
    updateQuantity: (productName: string, delta: number, price?: number) => void;
    cartTotalCount: number;
    cartTotalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Record<string, CartItem>>({});
    const [cartTotalCount, setCartTotalCount] = useState(0);
    const [cartTotalAmount, setCartTotalAmount] = useState(0);

    useEffect(() => {
        const items = Object.values(cart);
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        const amount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        setCartTotalCount(count);
        setCartTotalAmount(amount);
    }, [cart]);

    const updateQuantity = (productName: string, delta: number, price?: number) => {
        setCart(prev => {
            const currentItem = prev[productName];
            const currentQty = currentItem ? currentItem.quantity : 0;
            const newQty = Math.max(0, currentQty + delta);

            if (newQty === 0) {
                const newCart = { ...prev };
                delete newCart[productName];
                return newCart;
            }

            return {
                ...prev,
                [productName]: {
                    name: productName,
                    quantity: newQty,
                    price: price || (currentItem ? currentItem.price : 0)
                }
            };
        });
    };

    return (
        <CartContext.Provider value={{ cart, updateQuantity, cartTotalCount, cartTotalAmount }}>
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
