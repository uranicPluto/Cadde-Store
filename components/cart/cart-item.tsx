import React from "react";
import Link from "next/link";
import { CartItem } from "@/lib/cart/cart-types";
import { Price } from "@/components/ui/price";
import { Trash2, Heart, Store } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (item: CartItem) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
}) => {
  const { currency, t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-2xs">
      {/* Product Image & Info */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <Link href={`/product/${item.product.slug}`} className="shrink-0">
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-lg border border-slate-200"
          />
        </Link>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-primary uppercase">{item.product.brand}</span>
            <span className="text-slate-300">|</span>
            <span className="text-text-subtle font-medium text-[11px] flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" />
              {item.product.storeName}
            </span>
          </div>

          <Link href={`/product/${item.product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-text-main hover:text-primary transition-colors line-clamp-2">
              {item.product.name}
            </h3>
          </Link>

          {/* Variants */}
          {(item.selectedColor || item.selectedSize) && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted mt-0.5">
              {item.selectedColor && (
                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Renk: {item.selectedColor}
                </span>
              )}
              {item.selectedSize && (
                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Beden: {item.selectedSize}
                </span>
              )}
            </div>
          )}

          {/* Item Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <button
              type="button"
              onClick={() => onSaveForLater(item)}
              className="text-slate-500 hover:text-rose-500 font-semibold flex items-center gap-1 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorilere Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t("common.close")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Quantity & Price */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <Price price={item.product.price * item.quantity} originalPrice={item.product.originalPrice ? item.product.originalPrice * item.quantity : undefined} size="md" />

        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-extrabold text-xs"
          >
            -
          </button>
          <span className="px-3 py-1 text-xs font-bold text-text-main bg-white">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-extrabold text-xs"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
