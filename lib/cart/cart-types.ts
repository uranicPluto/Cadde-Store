import { DetailedProductMock } from "../catalog/product-repository";

export interface CartItem {
  id: string; // product id + color + size key
  product: DetailedProductMock;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: DetailedProductMock, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  discount: number;
  total: number;
}
