import { CartItem } from "../cart/cart-types";
import { Coupon, calculateCouponDiscount } from "../cart/coupon-utils";
import { SellerGroup, OrderCalculationResult, ShippingMethod } from "./order-types";

export function groupCartBySeller(items: CartItem[]): SellerGroup[] {
  const map: Record<string, CartItem[]> = {};

  items.forEach((item) => {
    const store = item.product.storeName || "Cadde Store Direct";
    if (!map[store]) map[store] = [];
    map[store].push(item);
  });

  return Object.entries(map).map(([storeName, storeItems]) => {
    const subtotal = storeItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const freeShippingThreshold = 300;
    const isFreeShipping = subtotal >= freeShippingThreshold || storeItems.some((i) => i.product.badges?.freeShipping);
    const shippingFee = isFreeShipping ? 0 : 39.9;

    return {
      storeName,
      items: storeItems,
      subtotal,
      freeShippingThreshold,
      shippingFee,
      isFreeShipping,
    };
  });
}

export function calculateOrderTotals(
  items: CartItem[],
  coupon: Coupon | null = null,
  selectedShippingMethod?: ShippingMethod
): OrderCalculationResult {
  const sellerGroups = groupCartBySeller(items);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const productDiscount = items.reduce((sum, i) => {
    if (i.product.originalPrice && i.product.originalPrice > i.product.price) {
      return sum + (i.product.originalPrice - i.product.price) * i.quantity;
    }
    return sum;
  }, 0);

  const couponDiscount = calculateCouponDiscount(coupon, subtotal);

  const baseShipping = sellerGroups.reduce((sum, g) => sum + g.shippingFee, 0);
  const extraMethodShipping = selectedShippingMethod ? selectedShippingMethod.price : 0;
  const totalShipping = baseShipping + extraMethodShipping;

  const grandTotal = Math.max(0, subtotal - couponDiscount + totalShipping);

  return {
    sellerGroups,
    subtotal,
    productDiscount,
    couponDiscount,
    totalShipping,
    grandTotal,
  };
}
