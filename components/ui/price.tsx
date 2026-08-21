import React from "react";
import { formatCurrency, calculateDiscount, cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface PriceProps {
  price: number;
  originalPrice?: number;
  showDiscountBadge?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  installmentText?: string;
  campaignPrice?: number;
  couponPrice?: number;
  className?: string;
}

export const Price: React.FC<PriceProps> = ({
  price,
  originalPrice,
  showDiscountBadge = true,
  size = "md",
  installmentText,
  campaignPrice,
  couponPrice,
  className,
}) => {
  const { t, currency } = useLanguage();
  const discountPercent = originalPrice ? calculateDiscount(originalPrice, price) : 0;

  const sizeClasses = {
    sm: {
      current: "text-sm font-bold text-primary",
      original: "text-xs text-text-subtle line-through",
      discount: "text-[10px] px-1 py-0.5 font-bold bg-discount text-white rounded",
    },
    md: {
      current: "text-base font-bold text-primary",
      original: "text-xs text-text-subtle line-through",
      discount: "text-xs px-1.5 py-0.5 font-bold bg-discount text-white rounded",
    },
    lg: {
      current: "text-xl font-extrabold text-primary",
      original: "text-sm text-text-subtle line-through",
      discount: "text-sm px-2 py-0.5 font-bold bg-discount text-white rounded",
    },
    xl: {
      current: "text-3xl font-black text-primary tracking-tight",
      original: "text-base text-text-subtle line-through",
      discount: "text-base px-2.5 py-1 font-extrabold bg-discount text-white rounded",
    },
  };

  // Convert installment text if in USD
  const formattedInstallment = installmentText && currency === "USD"
    ? installmentText.replace(/(\d+(?:\.\d+)?)\s*TL/g, (_, p1) => {
        const val = parseFloat(p1.replace(/\./g, "").replace(",", "."));
        return formatCurrency(val, "USD");
      })
    : installmentText;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {/* Upper line: Original price & Discount badge */}
      {originalPrice && originalPrice > price && (
        <div className="flex items-center gap-2">
          <span className={sizeClasses[size].original}>
            {formatCurrency(originalPrice, currency)}
          </span>
          {showDiscountBadge && discountPercent > 0 && (
            <span className={sizeClasses[size].discount}>
              {t("badges.discountPercent", { percent: discountPercent })}
            </span>
          )}
        </div>
      )}

      {/* Main Current Price */}
      <div className="flex items-baseline gap-2">
        <span className={sizeClasses[size].current}>
          {formatCurrency(price, currency)}
        </span>
      </div>

      {/* Optional Campaign or Coupon Price */}
      {campaignPrice && (
        <div className="text-xs text-purple-700 font-semibold flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded w-fit">
          <span>{t("price.campaignCartPrice")}</span>
          <span className="font-bold">{formatCurrency(campaignPrice, currency)}</span>
        </div>
      )}

      {couponPrice && (
        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
          <span>{t("price.couponPrice")}</span>
          <span className="font-bold">{formatCurrency(couponPrice, currency)}</span>
        </div>
      )}

      {/* Optional Installment info */}
      {formattedInstallment && (
        <span className="text-[11px] text-text-muted font-medium mt-0.5">
          {formattedInstallment}
        </span>
      )}
    </div>
  );
};
