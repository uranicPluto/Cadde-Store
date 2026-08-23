import { DetailedProductMock } from "../catalog/product-repository";
import { Coupon } from "./coupon-utils";

export interface CartItem {
  id: string; // product id + color + size key
  product: DetailedProductMock;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CartContextType {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  addToCart: (product: DetailedProductMock, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  totalCount: number;
  subtotal: number;
  discount: number;
  total: number;
}
