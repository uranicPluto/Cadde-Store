export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "active" | "inactive" | "blocked";
  joinedDate: string;
  savedAddressesCount: number;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  imageUrl: string;
  productCount: number;
  subcategories: string[];
  status: "active" | "disabled";
}

export interface AdminPlatformSettings {
  marketplaceName: string;
  supportEmail: string;
  defaultCommissionRate: number; // e.g. 10%
  orderCancellationWindowDays: number;
  returnWindowDays: number;
  defaultShippingFee: number;
  freeShippingThreshold: number;
}
