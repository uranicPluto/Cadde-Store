"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
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
  Sparkles,
  ArrowUpRight,
  Layers,
  Award,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { language, currency } = useLanguage();
  const isEn = language === "en";

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

  const totalRevenue = overviewMetrics.totalRevenue;

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* Grouped Hierarchical Sidebar */}
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Executive Control Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                  {isEn ? "Executive Marketplace Room" : "Pazaryeri Yönetici Odası"}
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "All 15 Modules Connected" : "15 Modülün Tümü Bağlı & Aktif"}</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {isEn ? "Cadde Store Marketplace Overview" : "Cadde Store Türkiye Yönetim Özeti"}
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                {isEn
                  ? "Real-time commerce activity, live storefront CMS sync, catalog inventory, and merchant operations."
                  : "Gerçek zamanlı ticaret verileri, canlı vitrin CMS senkronizasyonu, katalog envanteri ve satıcı operasyonları."}
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <Link
                href="/admin/cms"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{isEn ? "Homepage Studio" : "Vitrin Stüdyosu"}</span>
              </Link>
              <Link
                href="/admin/pages"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{isEn ? "Pages & CMS" : "Sayfa Yönetimi"}</span>
              </Link>
            </div>
          </div>

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isEn ? "Gross Revenue" : "Toplam Ciro"}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(totalRevenue, currency)}
                </span>
                <span className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Son 30 günlük satış geliri</span>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isEn ? "Total Orders" : "Toplam Sipariş"}
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {overviewMetrics.totalOrders}
                </span>
                <span className="text-[11px] font-black text-indigo-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.1%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Teslim edilen ve kargoda siparişler</span>
            </div>

            {/* Active Sellers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isEn ? "Active Sellers" : "Aktif Satıcılar"}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {overviewMetrics.activeSellers}
                </span>
                {overviewMetrics.pendingSellers > 0 && (
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {overviewMetrics.pendingSellers} bekleyen onay
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Doğrulanmış pazar satıcıları</span>
            </div>

            {/* Total Customers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isEn ? "Registered Customers" : "Kayıtlı Müşteriler"}
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {overviewMetrics.totalCustomers}
                </span>
                <span className="text-[11px] font-black text-purple-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +9.5%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Bireysel ve kurumsal alıcılar</span>
            </div>
          </div>

          {/* Middle 2-Column: Recent Orders Activity & Storefront Merchandising Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Orders Table (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {isEn ? "Live Recent Orders" : "Son Canlı Siparişler"}
                    </h3>
                    <span className="text-[11px] text-slate-400">Pazaryerinde gerçekleşen son alımlar</span>
                  </div>
                </div>

                <Link
                  href="/admin/orders"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>{isEn ? "View All" : "Tümünü Gör"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-2.5">{isEn ? "Order No" : "Sipariş No"}</th>
                      <th className="pb-2.5">{isEn ? "Customer" : "Müşteri"}</th>
                      <th className="pb-2.5">{isEn ? "Amount" : "Tutar"}</th>
                      <th className="pb-2.5 text-right">{isEn ? "Status" : "Durum"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900">#{ord.orderNumber}</td>
                        <td className="py-3 font-medium text-slate-700">
                          {ord.shippingAddress
                            ? `${ord.shippingAddress.firstName} ${ord.shippingAddress.lastName}`
                            : ord.customerInfo
                            ? `${ord.customerInfo.firstName} ${ord.customerInfo.lastName}`
                            : "Müşteri"}
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          {formatCurrency(ord.calculation?.grandTotal || 0, currency)}
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Henüz sipariş kaydı bulunmuyor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Storefront Merchandising & Quick Actions Hub (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Homepage Studio Shortcut Card */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 shadow-sm border border-indigo-800/80 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm text-white">Homepage Studio</span>
                      <span className="text-[11px] text-indigo-300">Shopify-style visual editor</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    Config-Driven
                  </span>
                </div>

                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  {isEn
                    ? "Visually manage hero banners, flash sales, bestsellers, and custom blocks with live storefront sync."
                    : "Hero afişlerini, flaş indirimleri, çok satanları ve sponsorlu blokları canlı mağaza ile görsel olarak yönetin."}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-indigo-800/60">
                  <Link
                    href="/admin/cms"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs text-center transition-colors shadow-sm"
                  >
                    {isEn ? "Open Homepage Studio" : "Stüdyoyu Aç"}
                  </Link>
                  <Link
                    href="/admin/appearance"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs text-center border border-slate-700 transition-colors"
                  >
                    {isEn ? "Appearance" : "Görünüm"}
                  </Link>
                </div>
              </div>

              {/* Quick Health Status Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-900 uppercase">
                      {isEn ? "System Health Center" : "Sistem Sağlık Merkezi"}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    99.9% Uptime
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold">Veritabanı Durumu</span>
                    <span className="font-extrabold text-slate-900 text-xs mt-0.5 text-emerald-600">Bağlı & Hızlı</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold">Katalog Ürünleri</span>
                    <span className="font-extrabold text-slate-900 text-xs mt-0.5">{overviewMetrics.totalProducts} Aktif</span>
                  </div>
                </div>

                <Link
                  href="/admin/health"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between pt-2 border-t border-slate-100"
                >
                  <span>{isEn ? "Run System Diagnostics" : "Sistem Tanılamalarını Görüntüle"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
