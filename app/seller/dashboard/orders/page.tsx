"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getSavedOrders, mapSellerOrderGroupsToRecords } from "@/lib/orders/order-utils";
import { OrderRecord, OrderStatusType } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function SellerOrdersPage() {
  const { language, currency, t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/orders/seller")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch seller orders");
        return res.json();
      })
      .then((data) => {
        if (data.orderGroups && Array.isArray(data.orderGroups)) {
          const mapped = mapSellerOrderGroupsToRecords(data.orderGroups);
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      })
      .catch(() => setOrders(getSavedOrders()));
  }, []);

  const handleUpdateStatus = async (orderGroupId: string, newStatus: OrderStatusType) => {
    try {
      const res = await fetch("/api/orders/seller", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderGroupId, status: newStatus.toUpperCase() }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.orderId === orderGroupId ? { ...o, status: newStatus } : o)));
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const countBadgeText = t("seller.orders.countBadge").replace("{count}", String(filteredOrders.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("seller.orders.title")}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("seller.orders.subtitle")}
                  </span>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    statusFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                  }`}
                >
                  {t("seller.orders.filterAll")}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("processing")}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    statusFilter === "processing" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                  }`}
                >
                  {t("seller.orders.filterProcessing")}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("shipped")}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    statusFilter === "shipped" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                  }`}
                >
                  {t("seller.orders.filterShipped")}
                </button>
              </div>
            </div>

            {/* Orders Table Area */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("seller.orders.thOrderNo")}</th>
                      <th className="p-3">{t("seller.orders.thCustomer")}</th>
                      <th className="p-3">{t("seller.orders.thDate")}</th>
                      <th className="p-3">{t("seller.orders.thAmount")}</th>
                      <th className="p-3">{t("seller.orders.thStatus")}</th>
                      <th className="p-3 text-right">{t("seller.orders.thAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {t("seller.orders.noOrdersFound")}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-primary">{ord.orderNumber}</td>
                          <td className="p-3 font-bold text-text-main">
                            {ord.customerInfo.firstName} {ord.customerInfo.lastName}
                          </td>
                          <td className="p-3 text-text-muted">
                            {new Date(ord.createdAt).toLocaleDateString(language === "en" ? "en-US" : "tr-TR")}
                          </td>
                          <td className="p-3 font-black text-text-main">
                            {formatCurrency(ord.calculation.grandTotal, currency)}
                          </td>
                          <td className="p-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateStatus(ord.orderId, e.target.value as OrderStatusType)}
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold outline-none text-slate-800"
                            >
                              <option value="confirmed">{t("seller.orders.statusConfirmed")}</option>
                              <option value="processing">{t("seller.orders.statusProcessing")}</option>
                              <option value="shipped">{t("seller.orders.statusShipped")}</option>
                              <option value="delivered">{t("seller.orders.statusDelivered")}</option>
                              <option value="cancelled">{t("seller.orders.statusCancelled")}</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/seller/dashboard/orders/${ord.orderNumber}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-text-main font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <span>{t("seller.orders.details")}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
