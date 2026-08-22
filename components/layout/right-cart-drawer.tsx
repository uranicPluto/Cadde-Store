"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Trash2, Zap, ChevronRight, CheckSquare } from "lucide-react";

export const RightCartDrawer: React.FC = () => {
  const { items, removeFromCart, updateQuantity, subtotal, totalCount, isOpen, closeCartDrawer, openCartDrawer } = useCart();
  const { language, currency } = useLanguage();
  const isEn = language === "en";

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Minimized Toggle Button when Collapsed or Closed */}
      {(!isOpen || isCollapsed) && (
        <button
          type="button"
          onClick={() => {
            setIsCollapsed(false);
            openCartDrawer();
          }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-black text-xs px-2.5 py-4 rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 border-l border-t border-b border-[#f27a1a] animate-in slide-in-from-right duration-200"
          aria-label="Open mini cart"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4" />
            <span className="absolute -top-2 -right-2 bg-amber-300 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          </div>
          <span className="writing-mode-vertical text-[9px] uppercase tracking-widest font-extrabold pt-1">
            {isEn ? "Cart" : "Sepetim"}
          </span>
        </button>
      )}

      {/* Main Slim Compact Right Cart Drawer (Matches Reference Image 2) */}
      {isOpen && !isCollapsed && (
        <div className="fixed right-0 top-0 bottom-0 w-[210px] sm:w-[225px] bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col justify-between p-3 animate-in slide-in-from-right duration-200 font-sans select-none">
          {/* Top CTAs & Subtotal Container */}
          <div className="flex flex-col gap-2">
            {/* Primary CTA: Go to payment (2 products) */}
            <Link href="/checkout" onClick={closeCartDrawer} className="w-full">
              <button
                type="button"
                className="w-full bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs py-2.5 px-2 rounded-xl shadow-xs transition-colors flex flex-col items-center justify-center leading-tight"
              >
                <span className="text-xs">{isEn ? "Go to payment" : "Ödemeye Git"}</span>
                <span className="text-[11px] font-bold opacity-90">({totalCount} {isEn ? "products" : "ürün"})</span>
              </button>
            </Link>

            {/* Secondary CTA: Go to cart */}
            <Link href="/cart" onClick={closeCartDrawer} className="w-full">
              <button
                type="button"
                className="w-full bg-white hover:bg-orange-50/50 border border-[#f27a1a] text-[#f27a1a] font-bold text-xs py-2 rounded-xl transition-colors text-center"
              >
                <span>{isEn ? "Go to cart" : "Sepete Git"}</span>
              </button>
            </Link>

            {/* Subtotal Display (Matches Reference Image 2) */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-xs font-black text-slate-800">{isEn ? "Subtotal" : "Ara Toplam"}</span>
              <div className="mt-1 bg-[#fff8f2] border border-[#ffe0c2] text-[#f27a1a] font-black text-sm px-4 py-1.5 rounded-lg text-center shadow-2xs">
                {formatCurrency(subtotal, currency)}
              </div>
            </div>

            <div className="border-t border-slate-200/80 my-1" />
          </div>

          {/* Vertical Stack Product List (Matches Reference Image 2) */}
          <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-3 my-2 no-scrollbar">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200/90 rounded-xl p-2 flex flex-col gap-2 relative bg-white shadow-2xs group"
              >
                {/* Product Image Box with Overlay Checkbox & Flash Badge */}
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-100">
                  {/* Top-Left Checkbox Icon */}
                  <div className="absolute top-1.5 left-1.5 z-10 w-4 h-4 rounded bg-[#f27a1a] text-white flex items-center justify-center shadow-xs">
                    <CheckSquare className="w-3 h-3" />
                  </div>

                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Hot Pink Flash Product Badge (Matches Reference Image 2) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[9px] font-black py-0.5 px-1 text-center flex items-center justify-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span>{isEn ? "Flash product!" : "Flaş ürün!"}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-center font-extrabold text-[#f27a1a] text-sm">
                  {formatCurrency(item.product.price, currency)}
                </div>

                {/* Quantity Select & Trash Delete Controls */}
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-14 h-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-bold px-1 outline-none text-center"
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
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 hover:border-rose-300 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title={isEn ? "Remove item" : "Ürünü Sil"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar: Minimize >| Button (Matches Reference Image 2) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="px-2.5 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span>{isEn ? "Minimize" : "Küçült"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
