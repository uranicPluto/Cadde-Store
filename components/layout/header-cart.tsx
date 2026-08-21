import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, ArrowRight, Trash2, ShoppingBag } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import Link from "next/link";

export interface HeaderCartProps {
  cartCount?: number;
  onClick?: () => void;
  className?: string;
}

export const HeaderCart: React.FC<HeaderCartProps> = ({
  cartCount,
  onClick,
  className,
}) => {
  const { t, currency } = useLanguage();
  const { items, removeFromCart, totalCount: liveCount, subtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount = cartCount !== undefined ? cartCount : liveCount;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Cart Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-label={`${t("common.cart")} (${activeCount})`}
        className="flex items-center gap-2 p-2 rounded-lg text-text-main hover:text-primary hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-primary/20 group"
      >
        <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary-light transition-colors">
          <ShoppingCart className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />

          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs border border-white">
              {activeCount}
            </span>
          )}
        </div>

        <div className="hidden xl:flex flex-col text-left leading-tight">
          <span className="text-[10px] text-text-subtle font-semibold uppercase">{t("common.cart")}</span>
          <span className="text-xs font-bold text-text-main group-hover:text-primary">
            {formatCurrency(subtotal, currency, false)}
          </span>
        </div>
      </button>

      {/* Quick Dropdown Mini-Cart Preview */}
      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 text-xs flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-text-main flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-primary" />
              {t("header.cartSummary", { count: activeCount })}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              {t("header.freeShippingBadge")}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-6 text-center text-text-muted flex flex-col items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
              <span>{t("header.emptyCartMessage")}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-slate-50/80 rounded border border-slate-100 hover:border-slate-200"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-11 h-11 object-cover rounded border border-slate-200 shrink-0"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-text-main truncate">{item.product.brand}</span>
                    <span className="text-[11px] text-text-muted truncate">{item.product.name}</span>
                    <span className="font-bold text-primary text-xs mt-0.5">
                      {item.quantity} x {formatCurrency(item.product.price, currency)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                    title={t("common.close")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{t("header.cartTotal")}:</span>
                <span className="text-sm font-extrabold text-primary">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onClick}
                className="w-full font-bold justify-center"
              >
                <span>{t("header.goToCart")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
