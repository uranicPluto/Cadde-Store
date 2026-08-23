import React from "react";
import { OrderCalculationResult, Address, ShippingMethod } from "@/lib/orders/order-types";
import { Coupon } from "@/lib/cart/coupon-utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShieldCheck, ArrowRight, Loader2, Store } from "lucide-react";

export interface CheckoutSummaryProps {
  calculation: OrderCalculationResult;
  appliedCoupon: Coupon | null;
  selectedAddress?: Address;
  selectedShippingMethod?: ShippingMethod;
  isSubmitting?: boolean;
  onPlaceOrder: () => void;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  calculation,
  appliedCoupon,
  selectedAddress,
  selectedShippingMethod,
  isSubmitting = false,
  onPlaceOrder,
}) => {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4 sticky top-24">
      <h2 className="text-base font-extrabold text-text-main pb-3 border-b border-slate-100 flex items-center justify-between">
        <span>{isEn ? "Order Summary" : "Sipariş Özeti"}</span>
        <span className="text-xs text-text-subtle font-semibold">
          {calculation.sellerGroups.reduce((sum, g) => sum + g.items.length, 0)} {isEn ? "Items" : "Ürün"}
        </span>
      </h2>

      {/* Seller Groups Item List */}
      <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
        {calculation.sellerGroups.map((g) => (
          <div key={g.storeName} className="flex flex-col gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-extrabold text-primary flex items-center gap-1">
              <Store className="w-3 h-3" />
              {g.storeName}
            </span>
            {g.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <img src={item.product.imageUrl} alt="" className="w-9 h-9 object-cover rounded border border-slate-200 shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-text-main truncate">{item.product.name}</span>
                  <span className="text-[10px] text-text-muted">{item.quantity} {isEn ? "Qty" : "Adet"}</span>
                </div>
                <span className="font-bold text-text-main text-xs">{formatCurrency(item.product.price * item.quantity, currency)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Financial Totals */}
      <div className="flex flex-col gap-2 text-xs pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-text-muted">
          <span>{isEn ? "Subtotal:" : "Ara Toplam:"}</span>
          <span className="font-bold text-text-main">{formatCurrency(calculation.subtotal, currency)}</span>
        </div>

        {calculation.productDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold">
            <span>{isEn ? "Discounts:" : "İndirimler:"}</span>
            <span>-{formatCurrency(calculation.productDiscount, currency)}</span>
          </div>
        )}

        {calculation.couponDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            <span>{isEn ? `Coupon (${appliedCoupon?.code}):` : `Kupon (${appliedCoupon?.code}):`}</span>
            <span>-{formatCurrency(calculation.couponDiscount, currency)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-text-muted">
          <span>{isEn ? "Shipping Fee:" : "Kargo Ücreti:"}</span>
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
        <span className="text-sm font-bold text-text-main">{isEn ? "Total Payable:" : "Ödenecek Tutar:"}</span>
        <span className="text-xl font-black text-primary">
          {formatCurrency(calculation.grandTotal, currency)}
        </span>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onPlaceOrder}
        disabled={isSubmitting}
        className="w-full font-black py-3.5 bg-emerald-600 hover:bg-emerald-700 shadow-md text-sm justify-center"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isEn ? "Processing Order..." : "Sipariş İşleniyor..."}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <span>{isEn ? "Complete Order" : "Siparişi Tamamla"}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      {/* Security Terms Disclaimer */}
      <p className="text-[10px] text-text-subtle text-center leading-tight">
        {isEn
          ? 'By clicking "Complete Order", you agree to the Distance Sales Agreement and Terms of Service.'
          : '"Siparişi Tamamla" butonuna basarak Mesafeli Satış Sözleşmesi\'ni ve Ön Bilgilendirme Formu\'nu kabul etmiş olursunuz.'}
      </p>
    </div>
  );
};
