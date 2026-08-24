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
  TrendingUp,
  Activity,
  PlusCircle,
  Ticket,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { language, currency, t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [overviewMetrics, setOverviewMetrics] = useState({
    totalRevenue: 184500,
    totalOrders: 382,
    activeSellers: 15,
    pendingSellers: 2,
    totalCustomers: 1243,
    totalProducts: 45,
    outOfStockProducts: 2,
    publishedPages: 8,
  });

  useEffect(() => {
    setOrders(getSavedOrders());
    async function loadOverview() {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.metrics) setOverviewMetrics(data.metrics);
        }
      } catch (e) {
        console.error("Failed to load overview metrics:", e);
      }
    }
    loadOverview();
  }, []);

  const isEn = language === "en";
  const totalRevenue = overviewMetrics.totalRevenue;
  const fullCatalog = getFullCatalog(language);

  // Monthly revenue trends for chart visualizer
  const monthlyTrends = [
    { month: isEn ? "Jan" : "Oca", val: 42 },
    { month: isEn ? "Feb" : "Şub", val: 58 },
    { month: isEn ? "Mar" : "Mar", val: 65 },
    { month: isEn ? "Apr" : "Nis", val: 80 },
    { month: isEn ? "May" : "May", val: 95 },
    { month: isEn ? "Jun" : "Haz", val: 110 },
    { month: isEn ? "Jul" : "Tem", val: 145 },
    { month: isEn ? "Aug" : "Ağu", val: 184 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Executive Command Center Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                    {isEn ? "Executive Control Center" : "Yönetici Kontrol Merkezi"}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEn ? "All Systems Operational" : "Tüm Sistemler Aktif"}</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t("admin.dashboard.title")}</h1>
                <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
                  {isEn
                    ? "Monitor live platform GMV sales, merchant approvals, active orders, and system health in real-time."
                    : "Platform genelindeki canlı satış verilerini, mağaza onaylarını, aktif siparişleri ve sistem sağlığını buradan yönetin."}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 relative z-10 shrink-0">
                <Link
                  href="/admin/sellers"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isEn ? "Approve Stores" : "Mağaza Onayla"}</span>
                </Link>

                <Link
                  href="/admin/coupons"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
                >
                  <Ticket className="w-4 h-4 text-amber-300" />
                  <span>{isEn ? "Create Coupon" : "Kupon Oluştur"}</span>
                </Link>
              </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AdminStatCard
                title={t("admin.dashboard.totalRevenue")}
                value={formatCurrency(totalRevenue, currency)}
                change="+18.4%"
                isPositive={true}
                icon={DollarSign}
                iconBgColor="bg-emerald-100 text-emerald-600"
              />
              <AdminStatCard
                title={t("admin.dashboard.totalOrders")}
                value={overviewMetrics.totalOrders}
                change="+12.5%"
                isPositive={true}
                icon={ShoppingCart}
                iconBgColor="bg-indigo-100 text-indigo-600"
              />
              <AdminStatCard
                title={t("admin.dashboard.activeSellers")}
                value={overviewMetrics.activeSellers}
                change={isEn ? `+${overviewMetrics.pendingSellers} Pending` : `+${overviewMetrics.pendingSellers} Bekleyen`}
                isPositive={true}
                icon={Store}
                iconBgColor="bg-amber-100 text-amber-600"
              />
              <AdminStatCard
                title={t("admin.dashboard.totalCustomers")}
                value={overviewMetrics.totalCustomers}
                change="+24.8%"
                isPositive={true}
                icon={Users}
                iconBgColor="bg-purple-100 text-purple-600"
              />
            </div>

            {/* Platform Revenue Chart & System Performance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-col">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span>{isEn ? "Monthly Platform GMV Revenue (2026)" : "Aylık Platform Ciro Trendi (2026)"}</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    {isEn ? "Total transaction volume and sales growth" : "Toplam İşlem Hacmi ve Satış Büyümesi"}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {isEn ? "+34% Record Growth" : "+34% Rekor Büyüme"}
                </span>
              </div>

              {/* Custom CSS Bar Chart Visualizer */}
              <div className="flex items-end justify-between gap-3 h-44 pt-6 px-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                {monthlyTrends.map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {currency === "USD" ? `$${t.val}k` : `₺${t.val}k`}
                    </div>
                    <div
                      style={{ height: `${(t.val / 184) * 100}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg group-hover:from-indigo-700 group-hover:to-indigo-500 transition-all shadow-xs"
                    />
                    <span className="text-[11px] font-extrabold text-slate-600">{t.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Alerts & Recent Orders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Orders Overview */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
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
                        <span className="font-extrabold text-slate-900">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-500">{ord.customerInfo.firstName} {ord.customerInfo.lastName}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{formatCurrency(ord.calculation.grandTotal, currency)}</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical System Notifications */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{t("admin.dashboard.criticalAlertsTitle")}</span>
                </h2>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-1">
                    <span className="font-bold text-amber-900">{t("admin.dashboard.alertPendingSellerMsg").replace("{count}", "2")}</span>
                    <Link href="/admin/sellers" className="text-[11px] font-black text-indigo-600 underline mt-1">
                      {t("admin.sellers.title")} &rarr;
                    </Link>
                  </div>

                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col gap-1">
                    <span className="font-bold text-indigo-900">{t("admin.dashboard.alertPendingProductMsg").replace("{count}", "4")}</span>
                    <Link href="/admin/products" className="text-[11px] font-black text-indigo-600 underline mt-1">
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
