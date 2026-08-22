import { AdminCustomer, AdminCategory, AdminPlatformSettings } from "./admin-types";

export const MOCK_ADMIN_CUSTOMERS: AdminCustomer[] = [
  {
    id: "cust-1",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: "0532 123 4567",
    ordersCount: 5,
    totalSpent: 3890.5,
    lastOrderDate: "2026-08-21",
    status: "active",
    joinedDate: "2025-11-10",
    savedAddressesCount: 2,
  },
  {
    id: "cust-2",
    name: "Zeynep Kaya",
    email: "zeynep.kaya@example.com",
    phone: "0533 987 6543",
    ordersCount: 8,
    totalSpent: 7450.0,
    lastOrderDate: "2026-08-19",
    status: "active",
    joinedDate: "2025-08-04",
    savedAddressesCount: 3,
  },
  {
    id: "cust-3",
    name: "Caner Demir",
    email: "caner.demir@example.com",
    phone: "0542 555 1234",
    ordersCount: 1,
    totalSpent: 499.0,
    lastOrderDate: "2026-07-30",
    status: "inactive",
    joinedDate: "2026-02-14",
    savedAddressesCount: 1,
  },
];

export const MOCK_ADMIN_CATEGORIES: AdminCategory[] = [
  {
    id: "cat-1",
    slug: "men",
    name: { tr: "Erkek Giyim", en: "Men's Fashion" },
    description: { tr: "Tişört, gömlek, pantolon ve dış giyim ürünleri.", en: "T-shirts, shirts, trousers, and outerwear." },
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    productCount: 142,
    subcategories: ["Tişört & Atlet", "Gömlek", "Pantolon", "Ceket & Mont"],
    status: "active",
  },
  {
    id: "cat-2",
    slug: "women",
    name: { tr: "Kadın Giyim", en: "Women's Fashion" },
    description: { tr: "Elbise, bluz, etek ve aksesuar serisi.", en: "Dresses, blouses, skirts, and accessory collections." },
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
    productCount: 198,
    subcategories: ["Elbise", "Bluz & Gömlek", "Etek", "Kaban"],
    status: "active",
  },
  {
    id: "cat-3",
    slug: "electronics",
    name: { tr: "Elektronik", en: "Electronics" },
    description: { tr: "Akıllı telefonlar, kulaklıklar ve bilgisayarlar.", en: "Smartphones, headphones, and laptops." },
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    productCount: 88,
    subcategories: ["Kulaklık", "Akıllı Saat", "Telefon Aksesuar"],
    status: "active",
  },
];

export const DEFAULT_PLATFORM_SETTINGS: AdminPlatformSettings = {
  marketplaceName: "Cadde Store Türkiye",
  supportEmail: "destek@cadde.store",
  defaultCommissionRate: 10,
  orderCancellationWindowDays: 2,
  returnWindowDays: 14,
  defaultShippingFee: 34.9,
  freeShippingThreshold: 200,
};
