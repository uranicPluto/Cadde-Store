import { OrderRecord, OrderStatusType, StatusHistoryStep } from "./order-types";
import { getFullCatalog } from "../catalog/product-repository";

const ORDERS_STORAGE_KEY = "cadde-store-orders";

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CD-${year}-${randomNum}`;
}

export function buildMockStatusHistory(status: OrderStatusType, createdAt: string): StatusHistoryStep[] {
  const createdDate = new Date(createdAt);

  const formatDate = (daysOffset: number) => {
    const d = new Date(createdDate);
    d.setDate(d.getDate() + daysOffset);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  };

  const isCompleted = (target: OrderStatusType) => {
    const orderRank: Record<OrderStatusType, number> = {
      confirmed: 1,
      processing: 2,
      shipped: 3,
      out_for_delivery: 4,
      delivered: 5,
      cancelled: 0,
    };
    return orderRank[status] >= orderRank[target];
  };

  return [
    {
      status: "confirmed",
      title: { tr: "Sipariş Verildi", en: "Order Placed" },
      description: { tr: "Siparişiniz başarıyla alındı ve onaylandı.", en: "Your order was successfully received and confirmed." },
      date: formatDate(0),
      completed: isCompleted("confirmed"),
      active: status === "confirmed",
    },
    {
      status: "processing",
      title: { tr: "Hazırlanıyor", en: "Processing" },
      description: { tr: "Satıcı tarafından paketleme ve fatura işlemleri yapılıyor.", en: "The seller is packaging and preparing your items." },
      date: isCompleted("processing") ? formatDate(1) : undefined,
      completed: isCompleted("processing"),
      active: status === "processing",
    },
    {
      status: "shipped",
      title: { tr: "Kargoya Verildi", en: "Shipped" },
      description: { tr: "Paketiniz kargo firmasına teslim edildi.", en: "Your package has been handed over to the carrier." },
      date: isCompleted("shipped") ? formatDate(2) : undefined,
      completed: isCompleted("shipped"),
      active: status === "shipped",
    },
    {
      status: "out_for_delivery",
      title: { tr: "Dağıtımda", en: "Out for Delivery" },
      description: { tr: "Kurye paketinizi adresinize getirmek üzere yola çıktı.", en: "The courier is on the way to deliver your parcel." },
      date: isCompleted("out_for_delivery") ? formatDate(3) : undefined,
      completed: isCompleted("out_for_delivery"),
      active: status === "out_for_delivery",
    },
    {
      status: "delivered",
      title: { tr: "Teslim Edildi", en: "Delivered" },
      description: { tr: "Paketiniz başarıyla alıcıya teslim edilmiştir.", en: "Your order has been successfully delivered." },
      date: isCompleted("delivered") ? formatDate(3) : undefined,
      completed: isCompleted("delivered"),
      active: status === "delivered",
    },
  ];
}

export const DEFAULT_MOCK_ORDERS: OrderRecord[] = [
  {
    orderId: "ord-101",
    orderNumber: "CD-2026-981245",
    createdAt: "2026-08-18T10:30:00Z",
    customerInfo: {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet.yilmaz@example.com",
      phone: "0532 123 4567",
    },
    shippingAddress: {
      id: "addr-1",
      title: "Ev Adresi",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      phone: "0532 123 4567",
      email: "ahmet.yilmaz@example.com",
      city: "İstanbul",
      district: "Kadıköy",
      addressLine: "Bağdat Caddesi No: 142 Daire: 8",
      country: "Türkiye",
    },
    shippingMethod: {
      id: "std-shipping",
      name: { tr: "Standart Teslimat", en: "Standard Delivery" },
      deliveryDays: { tr: "2–4 İş Günü", en: "2–4 Business Days" },
      price: 0,
    },
    sellerGroups: [
      {
        storeName: "Trend Fashion Mağazası",
        items: [
          {
            id: "p1-default",
            product: getFullCatalog("tr")[0],
            quantity: 1,
            selectedColor: "Siyah",
            selectedSize: "M",
          },
        ],
        subtotal: 349.99,
        freeShippingThreshold: 300,
        shippingFee: 0,
        isFreeShipping: true,
      },
    ],
    appliedCoupon: null,
    paymentMethod: "credit_card",
    cardMaskedNumber: "**** **** **** 5400",
    calculation: {
      sellerGroups: [],
      subtotal: 349.99,
      productDiscount: 150,
      couponDiscount: 0,
      totalShipping: 0,
      grandTotal: 349.99,
    },
    status: "shipped",
    trackingNumber: "YRT-748392019",
    estimatedDelivery: "23 Ağustos 2026",
  },
  {
    orderId: "ord-102",
    orderNumber: "CD-2026-654123",
    createdAt: "2026-08-12T14:15:00Z",
    customerInfo: {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet.yilmaz@example.com",
      phone: "0532 123 4567",
    },
    shippingAddress: {
      id: "addr-1",
      title: "Ev Adresi",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      phone: "0532 123 4567",
      email: "ahmet.yilmaz@example.com",
      city: "İstanbul",
      district: "Kadıköy",
      addressLine: "Bağdat Caddesi No: 142 Daire: 8",
      country: "Türkiye",
    },
    shippingMethod: {
      id: "std-shipping",
      name: { tr: "Standart Teslimat", en: "Standard Delivery" },
      deliveryDays: { tr: "2–4 İş Günü", en: "2–4 Business Days" },
      price: 0,
    },
    sellerGroups: [
      {
        storeName: "Spor Market Türkiye",
        items: [
          {
            id: "p2-default",
            product: getFullCatalog("tr")[1],
            quantity: 1,
            selectedColor: "Kırmızı",
            selectedSize: "42",
          },
        ],
        subtotal: 2199.0,
        freeShippingThreshold: 300,
        shippingFee: 0,
        isFreeShipping: true,
      },
    ],
    appliedCoupon: null,
    paymentMethod: "credit_card",
    cardMaskedNumber: "**** **** **** 5400",
    calculation: {
      sellerGroups: [],
      subtotal: 2199.0,
      productDiscount: 700,
      couponDiscount: 0,
      totalShipping: 0,
      grandTotal: 2199.0,
    },
    status: "delivered",
    trackingNumber: "ARS-883920194",
    estimatedDelivery: "15 Ağustos 2026",
  },
];

export function getSavedOrders(): OrderRecord[] {
  if (typeof window === "undefined") return DEFAULT_MOCK_ORDERS;
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
      return DEFAULT_MOCK_ORDERS;
    }
    const parsed: OrderRecord[] = JSON.parse(saved);
    return parsed.map((order) => ({
      ...order,
      status: order.status || "processing",
      trackingNumber: order.trackingNumber || `YRT-${Math.floor(100000000 + Math.random() * 900000000)}`,
      statusHistory: order.statusHistory || buildMockStatusHistory(order.status || "processing", order.createdAt),
    }));
  } catch (e) {
    console.error("Failed to load orders from localStorage", e);
    return DEFAULT_MOCK_ORDERS;
  }
}

export function saveOrderToHistory(order: OrderRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedOrders();
    const updated = [
      {
        ...order,
        statusHistory: buildMockStatusHistory(order.status, order.createdAt),
        trackingNumber: order.trackingNumber || `YRT-${Math.floor(100000000 + Math.random() * 900000000)}`,
      },
      ...existing,
    ];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("cadde-store-last-order", JSON.stringify(updated[0]));
  } catch (e) {
    console.error("Failed to save order to localStorage", e);
  }
}

export function getLastOrder(): OrderRecord | null {
  const orders = getSavedOrders();
  return orders.length > 0 ? orders[0] : null;
}
