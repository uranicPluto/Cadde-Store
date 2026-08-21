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
import { EmptyState } from "@/components/marketplace/empty-state";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: language === "en" ? "My Account" : "Hesabım", href: "/account" },
            { label: language === "en" ? "My Orders" : "Siparişlerim" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{language === "en" ? "My Orders" : "Siparişlerim"}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {orders.length} Sipariş
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    Geçmiş ve aktif tüm siparişlerinizin durumunu buradan takip edebilirsiniz.
                  </span>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <EmptyState
                type="no-orders"
                title={language === "en" ? "No Orders Yet" : "Henüz Siparişiniz Bulunmuyor"}
                description={
                  language === "en"
                    ? "Start shopping to place your first order on Cadde Store."
                    : "Cadde Store'dan ilk siparişinizi vermek için hemen alışverişe başlayın."
                }
                actionText={language === "en" ? "Start Shopping" : "Alışverişe Başla"}
                onActionClick={() => router.push("/")}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
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
