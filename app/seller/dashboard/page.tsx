"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { SellerStatCard } from "@/components/seller/seller-stat-card";
import { Footer } from "@/components/layout/footer";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowRight,
  Star,
  TrendingUp,
  PlusCircle,
  Truck,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SellerDashboardOverviewPage() {
  const { currency, t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + o.calculation.grandTotal, 48450);

  // Mock daily sales performance trends
  const dailySalesTrends = [
    { day: "Pzt", val: 34 },
    { day: "Sal", val: 52 },
    { day: "Çar", val: 48 },
    { day: "Per", val: 78 },
    { day: "Cum", val: 92 },
    { day: "Cmt", val: 115 },
    { day: "Paz", val: 84 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Merchant Growth Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/30">
                    {t("seller.dashboard.bannerTag")}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Süper Mağaza Onaylı</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Trend Fashion Mağazası</h1>
                <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
                  Mağazanızın haftalık satış performansını, kritik stok uyarılarını ve müşteri siparişlerini buradan yönetin.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 relative z-10 shrink-0">
                <Link
                  href="/seller/dashboard/products/new"
                  className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t("seller.dashboard.addProductCta")}</span>
                </Link>
              </div>
            </div>

            {/* Metric Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SellerStatCard
                title={t("seller.dashboard.statTotalSales")}
                value={formatCurrency(totalSales, currency)}
                change="+18.4%"
                isPositive={true}
                icon={DollarSign}
                iconBgColor="bg-emerald-100 text-emerald-600"
              />
              <SellerStatCard
                title={t("seller.dashboard.statOrders")}
                value={orders.length + 140}
                change="+12.2%"
                isPositive={true}
                icon={ShoppingCart}
                iconBgColor="bg-indigo-100 text-indigo-600"
              />
              <SellerStatCard
                title={t("seller.dashboard.statActiveProducts")}
                value={32}
                change="+4 Yeni"
                isPositive={true}
                icon={Package}
                iconBgColor="bg-amber-100 text-amber-600"
              />
              <SellerStatCard
                title={t("seller.dashboard.statStoreRating")}
                value="4.9 ★"
                change={t("seller.dashboard.satisfactionRate")}
                isPositive={true}
                icon={Star}
                iconBgColor="bg-purple-100 text-purple-600"
              />
            </div>

            {/* Weekly Sales Performance Visualizer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-col">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Haftalık Satış İvmesi</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">Son 7 Günlük Mağaza Sipariş Hacmi</span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  %98.4 Başarılı Teslimat
                </span>
              </div>

              {/* Custom CSS Bar Chart Visualizer */}
              <div className="flex items-end justify-between gap-4 h-40 pt-6 px-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                {dailySalesTrends.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      ₺{d.val}k
                    </div>
                    <div
                      style={{ height: `${(d.val / 115) * 100}%` }}
                      className="w-full bg-gradient-to-t from-primary to-orange-400 rounded-t-lg group-hover:from-primary/90 group-hover:to-orange-500 transition-all shadow-xs"
                    />
                    <span className="text-[11px] font-extrabold text-slate-600">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts & Recent Orders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span>{t("seller.dashboard.recentOrdersTitle")}</span>
                  </h2>
                  <Link href="/seller/dashboard/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    <span>{t("seller.dashboard.seeAll")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 text-xs flex flex-col gap-2">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.orderId} className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-500">{ord.customerInfo.firstName} {ord.customerInfo.lastName}</span>
                      </div>
                      <span className="font-extrabold text-primary">{formatCurrency(ord.calculation.grandTotal, currency)}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{t("seller.dashboard.criticalStockTitle")}</span>
                </h2>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-amber-900">Siyah Oversize Tişört</span>
                      <span className="text-[10px] text-amber-700">{t("seller.dashboard.lastItemsLeft")}</span>
                    </div>
                    <Link href="/seller/dashboard/products" className="text-[11px] font-black text-primary underline">
                      {t("seller.dashboard.addStock")}
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
