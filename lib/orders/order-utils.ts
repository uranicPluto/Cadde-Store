import { OrderRecord } from "./order-types";

const ORDERS_STORAGE_KEY = "cadde-store-orders";

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CD-${year}-${randomNum}`;
}

export function saveOrderToHistory(order: OrderRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedOrders();
    const updated = [order, ...existing];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("cadde-store-last-order", JSON.stringify(order));
  } catch (e) {
    console.error("Failed to save order to localStorage", e);
  }
}

export function getSavedOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load orders from localStorage", e);
    return [];
  }
}

export function getLastOrder(): OrderRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("cadde-store-last-order");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load last order from localStorage", e);
    return null;
  }
}
