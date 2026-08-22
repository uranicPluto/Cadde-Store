"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency, cn } from "@/lib/utils";
import { ShoppingCart, Trash2, Zap, ChevronRight, Minimize2, Maximize2, X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RightCartDrawer: React.FC = () => {
  const { items, removeFromCart, updateQuantity, subtotal, totalCount, isOpen, closeCartDrawer, openCartDrawer } = useCart();
  const { language, currency } = useLanguage();
  const isEn = language === "en";

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Minimized Floating Toggle Button when Drawer is Collapsed or Closed */}
      {(!isOpen || isCollapsed) && (
        <button
          type="button"
          onClick={() => {
            setIsCollapsed(false);
            openCartDrawer();
          }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary hover:bg-primary/90 text-white font-black text-xs px-3 py-4 rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 border-l border-t border-b border-primary-hover animate-in slide-in-from-right duration-200"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          </div>
          <span className="writing-mode-vertical text-[10px] uppercase tracking-widest font-extrabold pt-1">
            {isEn ? "Cart" : "Sepetim"}
          </span>
        </button>
      )}

      {/* Main Slide-out Right Cart Drawer (Matches Competitor Screenshot 3) */}
      {isOpen && !isCollapsed && (
        <div className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200 font-sans">
          {/* Header Controls & Action CTAs */}
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span>{isEn ? "Shopping Cart" : "Alışveriş Sepetim"} ({totalCount})</span>
              </span>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Primary CTA: Go to Payment (2 products) */}
            <Link href="/checkout" onClick={closeCartDrawer} className="w-full">
              <button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{isEn ? `Go to payment (${totalCount} products)` : `Ödemeye Git (${totalCount} Ürün)`}</span>
              </button>
            </Link>

            {/* Secondary CTA: Go to Cart */}
            <Link href="/cart" onClick={closeCartDrawer} className="w-full">
              <button
                type="button"
                className="w-full bg-white hover:bg-slate-50 border-2 border-primary text-primary font-black text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center"
              >
                <span>{isEn ? "Go to cart" : "Sepete Git"}</span>
              </button>
            </Link>

            {/* Subtotal Pill Box (Matches Screenshot 3) */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-xs font-black text-slate-900">{isEn ? "Subtotal" : "Ara Toplam"}</span>
              <div className="mt-1 bg-amber-50/80 border border-amber-200/80 px-5 py-1.5 rounded-lg text-primary font-black text-base shadow-2xs">
                {formatCurrency(subtotal, currency)}
              </div>
            </div>
          </div>

          {/* Cart Products List (Matches Screenshot 3 Cards) */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3 relative group">
                {/* Checkbox Icon */}
                <div className="pt-1">
                  <div className="w-4 h-4 rounded bg-primary text-white flex items-center justify-center shadow-2xs">
                    <CheckSquare className="w-3 h-3" />
                  </div>
                </div>

                {/* Product Card Image with Flash Badge */}
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hot Pink Flash Product Badge (Matches Screenshot 3) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[8px] font-black py-0.5 px-1 text-center flex items-center justify-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span>{isEn ? "Flash product!" : "Flaş ürün!"}</span>
                  </div>
                </div>

                {/* Info & Quantity Selector */}
                <div className="flex flex-col justify-between flex-1 min-h-[96px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black text-slate-900 line-clamp-1">{item.product.brand}</span>
                    <span className="text-[11px] text-slate-500 font-medium line-clamp-1">{item.product.name}</span>
                    <span className="text-xs font-black text-primary mt-1">
                      {formatCurrency(item.product.price, currency)}
                    </span>
                  </div>

                  {/* Quantity Dropdown & Trash Delete Button */}
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-black outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                      title={isEn ? "Remove item" : "Ürünü Sil"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Minimize Bar (Matches Screenshot 3) */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>{isEn ? "Minimize" : "Küçült"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-[10px] text-slate-500 font-bold">
              {isEn ? "Free Shipping Applied!" : "Kargo Bedava Fırsatı!"}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
