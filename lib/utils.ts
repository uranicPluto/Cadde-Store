import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency } from "./i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numeric values to selected currency format (TRY: e.g. 1.299,99 TL, USD: e.g. $39.39)
 */
export function formatCurrency(
  amountInTRY: number,
  currency: Currency = "TRY",
  showDecimals: boolean = true
): string {
  if (currency === "USD") {
    // Convert TRY to USD (1 USD ≈ 33 TRY)
    const amountInUSD = amountInTRY / 33;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amountInUSD);
  }

  // Default TRY (Turkish Lira)
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amountInTRY);

  return `${formatted} TL`;
}

/**
 * Legacy formatTL alias supporting active currency preference
 */
export function formatTL(
  amount: number,
  showDecimals: boolean = true,
  currency: Currency = "TRY"
): string {
  return formatCurrency(amount, currency, showDecimals);
}

/**
 * Calculates discount percentage between original and current price
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
