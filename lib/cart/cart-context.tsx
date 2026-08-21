"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CartContextType } from "./cart-types";
import { DetailedProductMock } from "../catalog/product-repository";

const CART_STORAGE_KEY = "cadde-store-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  };

  const addToCart = (
    product: DetailedProductMock,
    quantity: number = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const itemKey = `${product.id}-${selectedColor || "default"}-${selectedSize || "default"}`;
    const existingIndex = items.findIndex((i) => i.id === itemKey);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [
        ...items,
        {
          id: itemKey,
          product,
          quantity,
          selectedColor,
          selectedSize,
        },
      ];
    }
    saveCart(updated);
  };

  const removeFromCart = (id: string) => {
    saveCart(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = items.reduce((sum, item) => {
    if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
      return sum + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
