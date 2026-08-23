import React, { useState } from "react";
import { Coupon, validateCoupon } from "@/lib/cart/coupon-utils";
import { Button } from "@/components/ui/button";
import { Tag, CheckCircle2, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface CouponBoxProps {
  subtotal: number;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

export const CouponBox: React.FC<CouponBoxProps> = ({
  subtotal,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const { language, t } = useLanguage();
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, subtotal }),
      });

      const data = await res.json();

      if (res.ok && data.valid && data.coupon) {
        const couponObj: Coupon = {
          code: data.coupon.code,
          discountType: data.coupon.type === "PERCENTAGE" ? "percentage" : "fixed",
          value: data.coupon.value,
          description: {
            tr: data.coupon.type === "PERCENTAGE"
              ? `%${data.coupon.value} İndirim Kuponu`
              : `${data.coupon.value} TL İndirim Kuponu`,
            en: data.coupon.type === "PERCENTAGE"
              ? `${data.coupon.value}% Discount Coupon`
              : `${data.coupon.value} TL Discount Coupon`,
          },
        };
        onApplyCoupon(couponObj);
        setCode("");
      } else {
        setErrorMsg(data.error || (language === "en" ? "Invalid coupon code." : "Geçersiz kupon kodu."));
      }
    } catch (err) {
      // Local fallback in case of connection drop
      const localRes = validateCoupon(cleanCode, subtotal);
      if (localRes.valid && localRes.coupon) {
        onApplyCoupon(localRes.coupon);
        setCode("");
      } else if (localRes.errorMsg) {
        setErrorMsg(language === "en" ? localRes.errorMsg.en : localRes.errorMsg.tr);
      } else {
        setErrorMsg(language === "en" ? "Failed to validate coupon." : "Kupon doğrulanırken hata oluştu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onApplyCoupon(null);
    setErrorMsg(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-extrabold text-text-main">
        <Tag className="w-4 h-4 text-primary" />
        <span>Kupon Kodu / Discount Coupon</span>
      </div>

      {appliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="bg-white border border-emerald-300 px-2 py-0.5 rounded uppercase font-black">
              {appliedCoupon.code}
            </span>
            <span>{appliedCoupon.description[language]}</span>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="text-emerald-700 hover:text-rose-600 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Örn: CADDE10"
              className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white uppercase font-bold text-text-main placeholder:normal-case placeholder:font-normal"
            />
            <Button variant="primary" size="sm" type="submit" disabled={isLoading} className="h-9 font-bold px-4">
              {isLoading ? (language === "en" ? "Applying..." : "Uygulanıyor...") : (language === "en" ? "Apply" : "Uygula")}
            </Button>
          </div>

          {errorMsg && <span className="text-[11px] text-rose-600 font-semibold">{errorMsg}</span>}

          <div className="flex items-center gap-2 mt-1 text-[11px] text-text-subtle">
            <span>Deneyebileceğiniz Kuponlar:</span>
            <button
              type="button"
              onClick={() => setCode("CADDE10")}
              className="text-primary font-bold hover:underline"
            >
              CADDE10
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCode("WELCOME150")}
              className="text-primary font-bold hover:underline"
            >
              WELCOME150
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
