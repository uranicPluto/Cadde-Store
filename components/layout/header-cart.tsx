import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, ArrowRight, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { currency, t } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalCount: liveCount, subtotal } = useCart();
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
        className="flex items-center gap-2 p-2 rounded-lg text-slate-800 hover:text-primary hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-primary/20 group"
      >
        <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary-light transition-colors">
          <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />

          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs border border-white">
              {activeCount}
            </span>
          )}
        </div>

        <div className="hidden xl:flex flex-col text-left leading-tight">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{t("common.cart")}</span>
          <span className="text-xs font-bold text-slate-900 group-hover:text-primary">
            {formatCurrency(subtotal, currency)}
          </span>
        </div>
      </button>

      {/* Trendyol-Style Quick Slide-Out / Dropdown Mini-Cart Preview */}
      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 top-full mt-1.5 w-84 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 text-xs flex flex-col gap-3"
        >
          {/* Trendyol Top Action Bar: Go to Payment Direct Button */}
          {items.length > 0 && (
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/checkout");
                }}
                className="w-full font-black bg-primary hover:bg-primary/90 text-white shadow-md justify-center py-2.5 rounded-lg text-xs"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                <span>{`Ödemeye Git (${activeCount} Ürün)`}</span>
              </Button>

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="w-full text-center border border-primary text-primary hover:bg-primary-light font-bold py-1.5 rounded-lg text-xs transition-colors"
              >
                Sepete Git
              </Link>
            </div>
          )}

          {/* Subtotal Banner Box */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
            <span className="font-extrabold text-slate-700">Ara Toplam:</span>
            <span className="text-sm font-black text-rose-600">{formatCurrency(subtotal, currency)}</span>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
              <span className="font-bold">{t("header.emptyCartMessage")}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-black text-slate-900 truncate text-[11px]">{item.product.brand}</span>
                    <span className="text-[10px] text-slate-500 truncate leading-tight">{item.product.name}</span>
                    <span className="font-extrabold text-rose-600 text-xs mt-0.5">
                      {formatCurrency(item.product.price, currency)}
                    </span>
                  </div>

                  {/* Quantity Controller & Trash Button */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-bold text-[10px]"
                      >
                        -
                      </button>
                      <span className="px-1.5 font-bold text-[11px] text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-bold text-[10px]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title={t("common.close")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
