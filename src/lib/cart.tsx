import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customText?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: number, customText?: string) => void;
  updateQuantity: (id: number, qty: number, customText?: string) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "phool_cart_v1";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id && p.customText === item.customText);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeItem = (id: number, customText?: string) => setItems((prev) => prev.filter((p) => !(p.id === id && p.customText === customText)));

  const updateQuantity = (id: number, qty: number, customText?: string) => {
    setItems((prev) => prev.map((p) => (p.id === id && p.customText === customText ? { ...p, quantity: Math.max(1, qty) } : p)));
  };

  const clear = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.quantity * i.price, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

export default CartContext;
