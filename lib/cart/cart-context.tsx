"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CartContextType } from "./cart-types";
import { DetailedProductMock } from "../catalog/product-repository";
import { Coupon } from "./coupon-utils";

const CART_STORAGE_KEY = "cadde-store-cart";
const COUPON_STORAGE_KEY = "cadde-store-coupon";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCouponState] = useState<Coupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setAppliedCouponState(JSON.parse(savedCoupon));
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

  const openCartDrawer = () => setIsOpen(true);
  const closeCartDrawer = () => setIsOpen(false);

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
    // Auto-open right slide-out cart drawer on product add (Matches User Request)
    setIsOpen(true);
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

  const setAppliedCoupon = (coupon: Coupon | null) => {
    setAppliedCouponState(coupon);
    if (typeof window !== "undefined") {
      try {
        if (coupon) {
          localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
        } else {
          localStorage.removeItem(COUPON_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to persist coupon in localStorage", e);
      }
    }
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
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
        appliedCoupon,
        setAppliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        openCartDrawer,
        closeCartDrawer,
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
