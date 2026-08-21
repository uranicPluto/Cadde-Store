import React from "react";
import Link from "next/link";
import { OrderCalculationResult } from "@/lib/orders/order-types";
import { Coupon } from "@/lib/cart/coupon-utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export interface CartSummaryProps {
  calculation: OrderCalculationResult;
  appliedCoupon: Coupon | null;
  onProceedToCheckout: () => void;
  disabled?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  calculation,
  appliedCoupon,
  onProceedToCheckout,
  disabled = false,
}) => {
  const { currency, t } = useLanguage();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4 sticky top-24">
      <h2 className="text-base font-extrabold text-text-main pb-3 border-b border-slate-100 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-primary" />
        <span>Sipariş Özeti / Order Summary</span>
      </h2>

      {/* Breakdown List */}
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between text-text-muted">
          <span>Ürünlerin Toplamı (Subtotal):</span>
          <span className="font-bold text-text-main">{formatCurrency(calculation.subtotal, currency)}</span>
        </div>

        {calculation.productDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold">
            <span>Ürün İndirimleri:</span>
            <span>-{formatCurrency(calculation.productDiscount, currency)}</span>
          </div>
        )}

        {calculation.couponDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
            <span>Kupon İndirimi ({appliedCoupon?.code}):</span>
            <span>-{formatCurrency(calculation.couponDiscount, currency)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-text-muted">
          <span>Kargo Toplamı (Shipping):</span>
          <span className="font-bold text-text-main">
            {calculation.totalShipping === 0 ? (
              <span className="text-emerald-600 font-extrabold">{t("header.freeShippingBadge")}</span>
            ) : (
              formatCurrency(calculation.totalShipping, currency)
            )}
          </span>
        </div>
      </div>

      {/* Grand Total */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm font-bold text-text-main">Toplam (Total):</span>
        <span className="text-xl font-black text-primary">
          {formatCurrency(calculation.grandTotal, currency)}
        </span>
      </div>

      {/* Checkout CTA */}
      <Button
        variant="primary"
        size="lg"
        onClick={onProceedToCheckout}
        disabled={disabled}
        className="w-full font-black py-3 bg-primary hover:bg-primary-hover shadow-md text-sm justify-center"
      >
        <span>{t("cart.checkoutCta") || "Ödemeye Geç"}</span>
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>

      {/* Security Info Footnote */}
      <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-text-subtle font-semibold">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Koruma</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-primary" />
          <span>Hızlı Teslimat</span>
        </div>
      </div>
    </div>
  );
};
