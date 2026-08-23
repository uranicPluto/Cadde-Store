import { CartItem } from "../cart/cart-types";
import { Coupon } from "../cart/coupon-utils";

export interface Address {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressLine: string;
  buildingNo?: string;
  apartmentNo?: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface ShippingMethod {
  id: string;
  name: { tr: string; en: string };
  deliveryDays: { tr: string; en: string };
  price: number;
}

export interface SellerGroup {
  storeName: string;
  items: CartItem[];
  subtotal: number;
  freeShippingThreshold: number;
  shippingFee: number;
  isFreeShipping: boolean;
}

export interface OrderCalculationResult {
  sellerGroups: SellerGroup[];
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  totalShipping: number;
  grandTotal: number;
}

export type OrderStatusType =
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface StatusHistoryStep {
  status: OrderStatusType;
  title: { tr: string; en: string };
  description: { tr: string; en: string };
  date?: string;
  completed: boolean;
  active?: boolean;
}

export interface OrderRecord {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  sellerGroups: SellerGroup[];
  appliedCoupon: Coupon | null;
  paymentMethod: "credit_card" | "cash_on_delivery";
  cardMaskedNumber?: string;
  calculation: OrderCalculationResult;
  status: OrderStatusType;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  statusHistory?: StatusHistoryStep[];
}

