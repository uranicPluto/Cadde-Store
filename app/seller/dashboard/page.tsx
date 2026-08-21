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
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, AlertTriangle, ArrowRight, Star } from "lucide-react";

export default function SellerDashboardOverviewPage() {
  const { language, currency } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + o.calculation.grandTotal, 48450);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Top Dashboard Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Satıcı Yönetim Paneli
                </span>
                <h1 className="text-xl sm:text-2xl font-black">Trend Fashion Mağazası</h1>
                <span className="text-xs text-slate-300">
                  Bugünün sipariş ve performans özetini buradan takip edin.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/seller/dashboard/products/new"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-lg shadow-xs transition-colors"
                >
                  + Yeni Ürün Ekle
                </Link>
              </div>
            </div>

            {/* Metric Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SellerStatCard
                title="Toplam Ciro"
                value={formatCurrency(totalSales, currency)}
                change="+18.4%"
                isPositive={true}
                icon={DollarSign}
                iconBgColor="bg-emerald-100 text-emerald-600"
              />
              <SellerStatCard
                title="Siparişler"
                value={orders.length + 140}
                change="+12.2%"
                isPositive={true}
                icon={ShoppingCart}
                iconBgColor="bg-indigo-100 text-indigo-600"
              />
              <SellerStatCard
                title="Aktif Ürünler"
                value={32}
                change="+4 Yeni"
                isPositive={true}
                icon={Package}
                iconBgColor="bg-amber-100 text-amber-600"
              />
              <SellerStatCard
                title="Mağaza Puanı"
                value="4.9 ★"
                change="99% Memnuniyet"
                isPositive={true}
                icon={Star}
                iconBgColor="bg-purple-100 text-purple-600"
              />
            </div>

            {/* Low Stock Alerts & Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span>Son Mağaza Siparişleri</span>
                  </h2>
                  <Link href="/seller/dashboard/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    <span>Tümünü Gör</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 text-xs flex flex-col gap-2">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.orderId} className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-text-main">{ord.orderNumber}</span>
                        <span className="text-[11px] text-text-muted">{ord.customerInfo.firstName} {ord.customerInfo.lastName}</span>
                      </div>
                      <span className="font-extrabold text-primary">{formatCurrency(ord.calculation.grandTotal, currency)}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-extrabold">
                        {ord.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Widget */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Kritik Stok Uyarısı</span>
                </h2>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-amber-900">Siyah Oversize Tişört</span>
                      <span className="text-[10px] text-amber-700">Son 5 adet kaldı</span>
                    </div>
                    <Link href="/seller/dashboard/products" className="text-[11px] font-extrabold text-primary underline">Stok Ekle</Link>
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
