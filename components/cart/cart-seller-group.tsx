import React from "react";
import { SellerGroup } from "@/lib/orders/order-types";
import { CartItemRow } from "./cart-item";
import { CartItem } from "@/lib/cart/cart-types";
import { Store, Truck, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface CartSellerGroupProps {
  group: SellerGroup;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (item: CartItem) => void;
}

export const CartSellerGroup: React.FC<CartSellerGroupProps> = ({
  group,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
}) => {
  const { currency, t } = useLanguage();

  const remainingForFreeShipping = Math.max(0, group.freeShippingThreshold - group.subtotal);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col gap-3 p-4 sm:p-5">
      {/* Seller Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-subtle uppercase">Satıcı / Store</span>
            <span className="text-sm font-extrabold text-text-main">{group.storeName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {group.isFreeShipping ? (
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              {t("header.freeShippingBadge")}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Kargo: {formatCurrency(group.shippingFee, currency)}
            </span>
          )}
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      {!group.isFreeShipping && remainingForFreeShipping > 0 && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-900 font-medium flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {formatCurrency(remainingForFreeShipping, currency)} daha ürün ekleyin, <strong>kargo bedava</strong> olsun!
          </span>
        </div>
      )}

      {/* Cart Items in Store Group */}
      <div className="flex flex-col gap-3 mt-1">
        {group.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            onSaveForLater={onSaveForLater}
          />
        ))}
      </div>

      {/* Seller Subtotal Summary Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-text-muted">
        <span>Mağaza Ara Toplamı:</span>
        <span className="text-sm font-extrabold text-text-main">
          {formatCurrency(group.subtotal, currency)}
        </span>
      </div>
    </div>
  );
};
