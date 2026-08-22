"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Footer } from "@/components/layout/footer";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { MOCK_SELLERS } from "@/lib/sellers/seller-repository";
import { MOCK_ADMIN_CUSTOMERS } from "@/lib/admin/admin-repository";
import { getFullCatalog } from "@/lib/catalog/product-repository";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  DollarSign,
  ShoppingCart,
  Store,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { language, currency, t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.calculation.grandTotal, 184500);
  const fullCatalog = getFullCatalog(language);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Top Dashboard Banner */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Cadde Store Platform Administration
                </span>
                <h1 className="text-xl sm:text-2xl font-black">{t("admin.dashboard.title")}</h1>
                <span className="text-xs text-slate-400">
                  {t("admin.dashboard.subtitle")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/sellers"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg shadow-xs transition-colors"
                >
                  {t("admin.navigation.sellers")}
                </Link>
              </div>
            </div>

            {/* Metric Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AdminStatCard
                title={t("admin.dashboard.totalRevenue")}
                value={formatCurrency(totalRevenue, currency)}
                change="+14.2%"
                isPositive={true}
                icon={DollarSign}
                iconBgColor="bg-emerald-100 text-emerald-600"
              />
              <AdminStatCard
                title={t("admin.dashboard.totalOrders")}
                value={orders.length + 380}
                change="+9.5%"
                isPositive={true}
                icon={ShoppingCart}
                iconBgColor="bg-indigo-100 text-indigo-600"
              />
              <AdminStatCard
                title={t("admin.dashboard.activeSellers")}
                value={MOCK_SELLERS.length + 12}
                change="+3"
                isPositive={true}
                icon={Store}
                iconBgColor="bg-amber-100 text-amber-600"
              />
              <AdminStatCard
                title={t("admin.dashboard.totalCustomers")}
                value={MOCK_ADMIN_CUSTOMERS.length + 1240}
                change="+18.4%"
                isPositive={true}
                icon={Users}
                iconBgColor="bg-purple-100 text-purple-600"
              />
            </div>

            {/* System Alerts & Recent Orders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Orders Overview */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    <span>{t("admin.dashboard.recentOrdersTitle")}</span>
                  </h2>
                  <Link href="/admin/orders" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <span>{t("admin.dashboard.seeAll")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 text-xs flex flex-col gap-2">
                  {orders.slice(0, 4).map((ord) => (
                    <div key={ord.orderId} className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-text-main">{ord.orderNumber}</span>
                        <span className="text-[11px] text-text-muted">{ord.customerInfo.firstName} {ord.customerInfo.lastName}</span>
                      </div>
                      <span className="font-extrabold text-text-main">{formatCurrency(ord.calculation.grandTotal, currency)}</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical System Notifications */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{t("admin.dashboard.criticalAlertsTitle")}</span>
                </h2>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-1">
                    <span className="font-bold text-amber-900">{t("admin.dashboard.alertPendingSellerMsg").replace("{count}", "2")}</span>
                    <Link href="/admin/sellers" className="text-[11px] font-extrabold text-indigo-600 underline">
                      {t("admin.sellers.title")} &rarr;
                    </Link>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col gap-1">
                    <span className="font-bold text-indigo-900">{t("admin.dashboard.alertPendingProductMsg").replace("{count}", "4")}</span>
                    <Link href="/admin/products" className="text-[11px] font-extrabold text-indigo-600 underline">
                      {t("admin.products.title")} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
