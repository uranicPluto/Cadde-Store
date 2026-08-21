export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minSubtotal?: number;
  description: { tr: string; en: string };
}

export const MOCK_COUPONS: Coupon[] = [
  {
    code: "CADDE10",
    discountType: "percentage",
    value: 10,
    minSubtotal: 200,
    description: { tr: "%10 Hoş Geldin İndirimi", en: "10% Welcome Discount" },
  },
  {
    code: "WELCOME150",
    discountType: "fixed",
    value: 150,
    minSubtotal: 500,
    description: { tr: "150 TL Anında İndirim", en: "150 TL Instant Discount" },
  },
  {
    code: "FREESHIP",
    discountType: "fixed",
    value: 49.9,
    minSubtotal: 100,
    description: { tr: "Ücretsiz Kargo Fırsatı", en: "Free Shipping Offer" },
  },
];

export function validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; errorMsg?: { tr: string; en: string } } {
  const normalized = code.trim().toUpperCase();
  const found = MOCK_COUPONS.find((c) => c.code === normalized);

  if (!found) {
    return {
      valid: false,
      errorMsg: { tr: "Geçersiz kupon kodu.", en: "Invalid coupon code." },
    };
  }

  if (found.minSubtotal && subtotal < found.minSubtotal) {
    return {
      valid: false,
      errorMsg: {
        tr: `Bu kupon en az ${found.minSubtotal} TL altındaki sepetlerde kullanılamaz.`,
        en: `This coupon requires a minimum subtotal of ${found.minSubtotal} TL.`,
      },
    };
  }

  return { valid: true, coupon: found };
}

export function calculateCouponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (coupon.discountType === "percentage") {
    return (subtotal * coupon.value) / 100;
  }
  return Math.min(coupon.value, subtotal);
}
