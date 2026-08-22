"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Trash2, Plus, ChevronRight, ChevronDown, X } from "lucide-react";

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
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-black text-xs px-2 py-3 rounded-l-2xl shadow-2xl flex flex-col items-center gap-1.5 border-l border-t border-b border-[#f27a1a] animate-in slide-in-from-right duration-200"
          aria-label="Open mini cart"
        >
          <div className="relative">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="absolute -top-2 -right-2 bg-amber-300 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          </div>
          <span className="writing-mode-vertical text-[9px] uppercase tracking-widest font-extrabold pt-0.5">
            {isEn ? "Cart" : "Sepet"}
          </span>
        </button>
      )}

      {/* Ultra-Slim 130px Side Panel Cart Drawer */}
      {isOpen && !isCollapsed && (
        <div className="fixed right-0 top-0 bottom-0 w-[128px] sm:w-[136px] bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col justify-between p-2 animate-in slide-in-from-right duration-200 font-sans select-none">
          {/* Header & Subtotal Summary */}
          <div className="flex flex-col gap-1">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-[10px] text-slate-900 flex items-center gap-0.5">
                CADDE <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </span>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="p-0.5 text-slate-400 hover:text-slate-800 rounded-full"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Total Items & Price Display */}
            <div className="flex flex-col items-center justify-center pt-1">
              <span className="text-[10px] font-bold text-slate-600">
                {totalCount} {isEn ? "items" : "ürün"}
              </span>
              <span className="text-xs font-black text-rose-700 tracking-tight">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>

            {/* Rounded Pill CTA: Go to Cart */}
            <Link href="/cart" onClick={closeCartDrawer} className="w-full mt-0.5">
              <button
                type="button"
                className="w-full bg-white hover:bg-slate-50 border border-slate-700 text-slate-900 font-extrabold text-[10px] py-1 px-1.5 rounded-full transition-colors text-center shadow-2xs leading-tight"
              >
                <span>{isEn ? "Go to Cart" : "Sepete Git"}</span>
              </button>
            </Link>

            <div className="border-t border-slate-200/80 my-1" />
          </div>

          {/* Ultra-Slim Product Cards List */}
          <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-3 my-1 no-scrollbar divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex flex-col items-center gap-1.5 group">
                {/* Product Image */}
                <div className="w-full h-20 sm:h-22 rounded-lg overflow-hidden bg-white flex items-center justify-center p-0.5">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Price Label */}
                <span className="text-[11px] font-black text-slate-900 text-center tracking-tight">
                  {formatCurrency(item.product.price, currency)}
                </span>

                {/* Yellow Oval Stepper Pill Controls */}
                <div className="w-full border-2 border-amber-400 bg-white rounded-full flex items-center justify-between px-1.5 py-0.5 shadow-2xs">
                  {/* Trash Icon Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-700 hover:text-rose-600 transition-colors p-0.5"
                    title={isEn ? "Remove item" : "Sil"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Quantity Count */}
                  <span className="text-[11px] font-extrabold text-slate-900">{item.quantity}</span>

                  {/* Plus Increment Button */}
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-slate-700 hover:text-primary transition-colors p-0.5"
                    title={isEn ? "Add more" : "Arttır"}
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar: Minimize Toggle Button */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-full py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] rounded-md flex items-center justify-center gap-0.5 transition-colors"
            >
              <span>{isEn ? "Minimize" : "Küçült"}</span>
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
