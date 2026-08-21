"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { OrderTracking } from "@/components/account/order-tracking";
import { getSavedOrders, buildMockStatusHistory } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, MapPin, CreditCard, RefreshCw, ShoppingBag, Printer, ArrowLeft, Store } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, currency, t } = useLanguage();
  const { addToCart } = useCart();
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const orders = getSavedOrders();
    const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
    if (found) setOrder(found);
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <MarketplaceHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 text-center text-xs text-text-muted flex-1">
          Sipariş bilgisi yükleniyor...
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    language === "en" ? "en-US" : "tr-TR",
    { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  const statusHistory = order.statusHistory || buildMockStatusHistory(order.status, order.createdAt);

  const handleReorder = () => {
    order.sellerGroups.forEach((g) => {
      g.items.forEach((item) => {
        addToCart(item.product, item.quantity, item.selectedColor, item.selectedSize);
      });
    });
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: language === "en" ? "My Account" : "Hesabım", href: "/account" },
            { label: language === "en" ? "My Orders" : "Siparişlerim", href: "/account/orders" },
            { label: order.orderNumber },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Title Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/account/orders" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-subtle">{formattedDate}</span>
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>Sipariş No: {order.orderNumber}</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold text-xs">
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  <span>Fatura Görüntüle</span>
                </Button>
                <Button variant="primary" size="sm" onClick={handleReorder} className="font-bold text-xs bg-slate-900 hover:bg-slate-800">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Tekrar Sipariş Et</span>
                </Button>
              </div>
            </div>

            {/* Visual Tracking Timeline */}
            <OrderTracking
              statusHistory={statusHistory}
              trackingNumber={order.trackingNumber}
              estimatedDelivery={order.estimatedDelivery}
            />

            {/* Delivery & Customer Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Teslimat Adresi
                </span>
                <span className="font-bold text-text-main">{order.shippingAddress.title}</span>
                <span className="text-text-muted">{order.customerInfo.firstName} {order.customerInfo.lastName} ({order.customerInfo.phone})</span>
                <p className="text-slate-700 font-medium leading-relaxed">{order.shippingAddress.addressLine}</p>
                <span className="font-bold text-text-main">{order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  Ödeme & Kargo Bilgileri
                </span>
                <div className="flex items-center justify-between text-text-muted pt-1">
                  <span>Ödeme Yöntemi:</span>
                  <span className="font-bold text-text-main">{order.paymentMethod === "credit_card" ? `Kredi Kartı (${order.cardMaskedNumber})` : "Kapıda Ödeme"}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Kargo Firması:</span>
                  <span className="font-bold text-emerald-700">Yurtiçi Kargo (Express)</span>
                </div>
                <div className="flex items-center justify-between text-text-muted pt-2 border-t border-slate-100">
                  <span className="font-bold">Toplam Tutar:</span>
                  <span className="text-base font-black text-primary">{formatCurrency(order.calculation.grandTotal, currency)}</span>
                </div>
              </div>
            </div>

            {/* Ordered Products Breakdown */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-text-main uppercase tracking-wider">Sipariş İçeriği</h2>

              {order.sellerGroups.map((g) => (
                <div key={g.storeName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-primary flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      Satıcı: {g.storeName}
                    </span>
                    <span className="font-bold text-slate-600">
                      {g.isFreeShipping ? "Ücretsiz Kargo" : `Kargo: ${formatCurrency(g.shippingFee, currency)}`}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 p-4 flex flex-col gap-3">
                    {g.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 text-xs">
                        <img src={item.product.imageUrl} alt="" className="w-16 h-20 object-cover rounded-lg border border-slate-200 shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-extrabold text-primary uppercase text-[11px]">{item.product.brand}</span>
                          <span className="font-bold text-text-main text-sm truncate">{item.product.name}</span>
                          <div className="flex items-center gap-2 text-text-muted mt-1">
                            {item.selectedColor && <span>Renk: {item.selectedColor}</span>}
                            {item.selectedSize && <span>Beden: {item.selectedSize}</span>}
                            <span>Adet: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-black text-text-main text-sm shrink-0">
                          {formatCurrency(item.product.price * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
