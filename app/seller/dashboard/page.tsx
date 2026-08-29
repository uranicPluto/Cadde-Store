"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { SellerStatCard } from "@/components/seller/seller-stat-card";
import { Footer } from "@/components/layout/footer";
import { getSavedOrders, mapSellerOrderGroupsToRecords } from "@/lib/orders/order-utils";
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
  CheckCircle2,
} from "lucide-react";

export default function SellerDashboardOverviewPage() {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeProductsCount, setActiveProductsCount] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [storeName, setStoreName] = useState<string>("Trend Fashion Mağazası");

  useEffect(() => {
    // 1. Fetch real seller orders
    fetch("/api/orders/seller")
      .then((res) => {
        if (!res.ok) throw new Error("Orders fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.orderGroups && Array.isArray(data.orderGroups)) {
          const mapped = mapSellerOrderGroupsToRecords(data.orderGroups);
          setOrders(mapped);
          if (data.orderGroups.length > 0 && data.orderGroups[0].seller?.storeName) {
            setStoreName(data.orderGroups[0].seller.storeName);
          }
        } else {
          setOrders([]);
        }
      })
      .catch(() => {
        setOrders(getSavedOrders());
      });

    // 2. Fetch products for active products count & low stock alerts
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setActiveProductsCount(data.products.length);
          const lowStock = data.products.filter((p: any) => Number(p.stock) < 5);
          setLowStockProducts(lowStock);
        }
      })
      .catch(() => {
        setActiveProductsCount(0);
      });
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + (o.calculation?.grandTotal || 0), 0);

  // Compute past 7 days daily sales trends dynamically from real orders
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayNamesTr = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  const dailySalesTrends = last7Days.map((dateObj) => {
    const dayOfWeek = dateObj.getDay();
    const dayLabel = isEn ? dayNamesEn[dayOfWeek] : dayNamesTr[dayOfWeek];
    const dateStr = dateObj.toISOString().slice(0, 10);

    const dayOrders = orders.filter((o) => {
      if (!o.createdAt) return false;
      const orderDateStr = new Date(o.createdAt).toISOString().slice(0, 10);
      return orderDateStr === dateStr;
    });

    const dayTotal = dayOrders.reduce((sum, o) => sum + (o.calculation?.grandTotal || 0), 0);

    return {
      day: dayLabel,
      date: dateStr,
      val: dayTotal,
      orderCount: dayOrders.length,
    };
  });

  const maxVal = Math.max(...dailySalesTrends.map((d) => d.val), 1);

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
                    <span>{isEn ? "Verified Super Store" : "Süper Mağaza Onaylı"}</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{storeName}</h1>
                <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
                  {isEn
                    ? "Manage your weekly sales performance, critical inventory alerts, and customer fulfillment here."
                    : "Mağazanızın haftalık satış performansını, kritik stok uyarılarını ve müşteri siparişlerini buradan yönetin."}
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
                value={orders.length}
                change="+12.2%"
                isPositive={true}
                icon={ShoppingCart}
                iconBgColor="bg-indigo-100 text-indigo-600"
              />
              <SellerStatCard
                title={t("seller.dashboard.statActiveProducts")}
                value={activeProductsCount}
                change={isEn ? "+4 New" : "+4 Yeni"}
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
                    <span>{isEn ? "Weekly Sales Momentum" : "Haftalık Satış İvmesi"}</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    {isEn ? "Past 7-day store order volume" : "Son 7 Günlük Mağaza Sipariş Hacmi"}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {isEn ? "98.4% Fulfillment Rate" : "%98.4 Başarılı Teslimat"}
                </span>
              </div>

              {/* Custom CSS Bar Chart Visualizer */}
              <div className="flex items-end justify-between gap-4 h-40 pt-6 px-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                {dailySalesTrends.map((d, idx) => {
                  const heightPercent = maxVal > 0 && d.val > 0 ? Math.max(6, (d.val / maxVal) * 100) : 4;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(d.val, currency)}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-primary to-orange-400 rounded-t-lg group-hover:from-primary/90 group-hover:to-orange-500 transition-all shadow-xs"
                      />
                      <span className="text-[11px] font-extrabold text-slate-600">{d.day}</span>
                    </div>
                  );
                })}
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

                {orders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-medium">
                    {isEn ? "No orders found yet." : "Henüz sipariş bulunmuyor."}
                  </div>
                ) : (
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
                )}
              </div>

              {/* Low Stock Widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{t("seller.dashboard.criticalStockTitle")}</span>
                </h2>

                <div className="flex flex-col gap-3 text-xs">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">
                        {isEn ? "All product inventory levels are healthy." : "Tüm ürünlerin stok durumu iyi."}
                      </span>
                    </div>
                  ) : (
                    lowStockProducts.slice(0, 2).map((p) => (
                      <div key={p.id} className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-amber-900">{p.name}</span>
                          <span className="text-[10px] text-amber-700">
                            {isEn ? `Only ${p.stock} items left in stock` : `Son ${p.stock} ürün kaldı`}
                          </span>
                        </div>
                        <Link href={`/seller/dashboard/products/${p.id}/edit`} className="text-[11px] font-black text-primary underline">
                          {t("seller.dashboard.addStock")}
                        </Link>
                      </div>
                    ))
                  )}
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

