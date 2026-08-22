"use client";

import React, { useState, useEffect } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { OrderCard } from "@/components/account/order-card";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Search, Package, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "in_progress" | "cancelled" | "returned">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => {
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          const dbMapped: OrderRecord[] = data.orders.map((o: any) => ({
            orderId: o.id,
            orderNumber: o.orderNumber,
            createdAt: o.createdAt,
            customerInfo: {
              firstName: o.customer?.firstName || "Müşteri",
              lastName: o.customer?.lastName || "",
              email: o.customer?.email || "",
              phone: o.customer?.phone || "",
            },
            shippingAddress: JSON.parse(o.shippingAddressSnapshot || "{}"),
            shippingMethod: { id: "std", name: { tr: "Standart Kargo", en: "Standard Shipping" }, deliveryDays: { tr: "2-3 Gün", en: "2-3 Days" }, price: o.shippingFee },
            sellerGroups: Array.isArray(o.orderGroups)
              ? o.orderGroups.map((g: any) => ({
                  sellerId: g.sellerId,
                  storeName: g.seller?.storeName || "Cadde Store Mağazası",
                  items: Array.isArray(o.orderItems)
                    ? o.orderItems
                        .filter((item: any) => item.orderGroupId === g.id || !item.orderGroupId)
                        .map((item: any) => ({
                          id: item.id,
                          product: {
                            id: item.product?.id || item.productId,
                            slug: item.product?.slug || item.productId,
                            name: item.product?.name || "Ürün",
                            brand: item.product?.brand || "Cadde Store",
                            categorySlug: "general",
                            categoryName: "Genel",
                            storeName: g.seller?.storeName || "Mağaza",
                            price: item.price,
                            rating: 4.8,
                            reviewCount: 10,
                            imageUrl: item.product?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
                            galleryImages: [],
                            description: "",
                            specifications: {},
                            stock: 10,
                            reviews: [],
                          },
                          quantity: item.quantity,
                          selectedColor: item.selectedColor,
                          selectedSize: item.selectedSize,
                        }))
                    : [],
                  subtotal: g.subtotal,
                  freeShippingThreshold: 500,
                  shippingFee: 0,
                  isFreeShipping: true,
                  status: g.status.toLowerCase(),
                }))
              : [],
            appliedCoupon: null,
            paymentMethod: o.paymentMethod || "credit_card",
            calculation: {
              subtotal: o.subtotal,
              productDiscount: o.productDiscount,
              couponDiscount: o.couponDiscount,
              totalShipping: o.shippingFee,
              grandTotal: o.grandTotal,
              sellerGroups: [],
            },
            status: o.status.toLowerCase() as any,
          }));
          setOrders(dbMapped);
        } else {
          setOrders(getSavedOrders());
        }
      })
      .catch(() => setOrders(getSavedOrders()));
  }, []);

  const filteredOrders = orders.filter((o) => {
    const statusStr = String(o.status);
    if (activeFilter === "in_progress" && statusStr === "delivered") return false;
    if (activeFilter === "cancelled" && statusStr !== "cancelled") return false;
    if (activeFilter === "returned" && statusStr !== "returned") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.sellerGroups.some((sg) => sg.items.some((it) => it.product.name.toLowerCase().includes(q) || it.product.brand.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "My Orders" : "Siparişlerim" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box (Matches User Screenshots 1 & 2) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-black text-slate-900">{isEn ? "My Orders" : "Siparişlerim"}</h1>
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={isEn ? "Search by item or brand name..." : "Ürün veya marka ismiyle ara..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Status Filter Pills & Date Select (User Screenshots 1 & 2) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                      activeFilter === "all" ? "bg-primary text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {isEn ? "All" : "Tüm Siparişler"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("in_progress")}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                      activeFilter === "in_progress" ? "bg-primary text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {isEn ? "In progress" : "Devam Edenler"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("cancelled")}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                      activeFilter === "cancelled" ? "bg-primary text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {isEn ? "Cancelled" : "İptaller"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("returned")}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                      activeFilter === "returned" ? "bg-primary text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {isEn ? "Returned" : "İadeler"}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold outline-none">
                    <option>{isEn ? "All dates" : "Tüm Tarihler"}</option>
                    <option>Son 30 Gün</option>
                    <option>Son 3 Ay</option>
                    <option>2026 Sezonu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders List or Competitor Screenshot 1 Empty State */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs my-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                  <Package className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h2 className="text-xl font-black text-slate-900">
                    {isEn ? "There are currently no orders to display here." : "Henüz görüntülenecek bir siparişiniz yok."}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {isEn
                      ? "Discover thousands of products from top brands and start shopping now."
                      : "Binlerce marka ve ürünü keşfedin, fırsat dolu dünyamıza hemen adım atın."}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push("/")}
                  className="font-black bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl shadow-md mt-2"
                >
                  {isEn ? "Start shopping" : "Alışverişe Başla"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
