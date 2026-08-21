"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountSummaryCard } from "@/components/account/account-summary-card";
import { OrderCard } from "@/components/account/order-card";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { getSavedAddresses } from "@/lib/checkout/address-utils";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { OrderRecord } from "@/lib/orders/order-types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Package, MapPin, Tag, Heart, ArrowRight, User } from "lucide-react";
import { MOCK_COUPONS } from "@/lib/cart/coupon-utils";

export default function AccountDashboardPage() {
  const { language, t } = useLanguage();
  const { favoriteCount } = useFavorites();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [addressCount, setAddressCount] = useState(2);

  useEffect(() => {
    setOrders(getSavedOrders());
    setAddressCount(getSavedAddresses().length);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/" },
            { label: language === "en" ? "My Account" : "Hesabım" },
          ]}
        />

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Navigation Sidebar (3 Cols) */}
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          {/* Main Dashboard Content (9 Cols) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Welcome Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  AY
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    {language === "en" ? "VIP Marketplace Customer" : "VIP Pazaryeri Müşterisi"}
                  </span>
                  <h1 className="text-2xl font-black tracking-tight">Hoş Geldiniz, Ahmet Yılmaz</h1>
                  <span className="text-xs text-slate-300">
                    Hesabınız ve siparişlerinizi buradan kolayca yönetebilirsiniz.
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Summary Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AccountSummaryCard
                title="Siparişler"
                value={orders.length}
                subtitle="Tüm Siparişleri Gör"
                icon={Package}
                href="/account/orders"
                iconBgColor="bg-indigo-100 text-indigo-600"
              />
              <AccountSummaryCard
                title="Favoriler"
                value={favoriteCount}
                subtitle="Favori Listesine Git"
                icon={Heart}
                href="/favorites"
                iconBgColor="bg-rose-100 text-rose-600"
              />
              <AccountSummaryCard
                title="Adresler"
                value={addressCount}
                subtitle="Adreslerimi Yönet"
                icon={MapPin}
                href="/account/addresses"
                iconBgColor="bg-emerald-100 text-emerald-600"
              />
              <AccountSummaryCard
                title="Kuponlar"
                value={MOCK_COUPONS.length}
                subtitle="Kupon Cüzdanı"
                icon={Tag}
                href="/account/coupons"
                iconBgColor="bg-amber-100 text-amber-600"
              />
            </div>

            {/* Recent Orders Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-text-main flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Son Siparişleriniz</span>
                </h2>

                <Link
                  href="/account/orders"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Tümünü Gör</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-text-muted">
                  Henüz verilmiş siparişiniz bulunmuyor.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.slice(0, 2).map((order) => (
                    <OrderCard key={order.orderId} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
