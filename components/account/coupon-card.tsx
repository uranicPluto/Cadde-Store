import React, { useState } from "react";
import { Coupon } from "@/lib/cart/coupon-utils";
import { Tag, Copy, Check, Scissors } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";

export interface CouponCardProps {
  coupon: Coupon;
  isUsed?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, isUsed = false }) => {
  const { language, currency } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white border-2 border-dashed rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
        isUsed ? "border-slate-300 opacity-60 bg-slate-50" : "border-primary/40 hover:border-primary bg-primary-light/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black shrink-0 shadow-xs">
          <Tag className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-text-main uppercase tracking-wider">{coupon.code}</span>
            {coupon.minSubtotal && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Min {formatCurrency(coupon.minSubtotal, currency)}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-700">{coupon.description[language]}</span>
          <span className="text-[11px] text-text-subtle font-medium">Son Kullanma: 31 Aralık 2026</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isUsed}
          className="px-4 py-2 bg-white border border-slate-300 hover:border-primary text-text-main font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Kopyalandı</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Kodu Kopyala</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
