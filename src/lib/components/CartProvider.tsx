'use client';

import { useState, useEffect, ReactNode } from 'react';
import { CartContext, CartItem } from '@/lib/hooks/useCart';

interface CartProviderProps {
  children: ReactNode;
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const savedCart = getCookie('cart');
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(savedCart));
        const normalizedItems = parsedItems.map((item: CartItem) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : Number(item.price),
        }));
        setItems(normalizedItems);
      } catch (error) {
        console.error('Помилка завантаження кошика з cookies:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      setCookie('cart', encodeURIComponent(JSON.stringify(items)));
    }
  }, [items, isHydrated]);
  const addItem = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      const normalizedProduct = {
        ...product,
        price: typeof product.price === 'number' ? product.price : Number(product.price),
      };

      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity || 999) } : item));
      }
      return [...prev, { ...normalizedProduct, quantity: Math.min(quantity, product.stockQuantity || 999) }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxQuantity = item.stockQuantity || 999;
          return { ...item, quantity: Math.min(quantity, maxQuantity) };
        }
        return item;
      })
    );
  };

  const increaseQuantity = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxQuantity = item.stockQuantity || 999;
          return { ...item, quantity: Math.min(item.quantity + 1, maxQuantity) };
        }
        return item;
      })
    );
  };
  const decreaseQuantity = (id: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity - 1;
            if (newQuantity <= 0) {
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.id !== id || item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : Number(item.price);
      return total + price * item.quantity;
    }, 0);
  };

  const isEmpty = () => {
    return items.length === 0;
  };
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isEmpty,
    increaseQuantity,
    decreaseQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
