"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShoppingCart, Search, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function AdminOrdersPage() {
  const { currency, t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  const filtered = orders.filter((o) => {
    return o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerInfo.firstName.toLowerCase().includes(search.toLowerCase());
  });

  const countBadgeText = t("admin.orders.countBadge").replace("{count}", String(filtered.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.orders.title")}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("admin.orders.subtitle")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("admin.orders.searchPlaceholder")}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.orders.thOrderNo")}</th>
                      <th className="p-3">{t("admin.orders.thCustomer")}</th>
                      <th className="p-3">{t("admin.orders.thDate")}</th>
                      <th className="p-3">{t("admin.orders.thAmount")}</th>
                      <th className="p-3">{t("admin.orders.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.orders.thAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {t("admin.orders.noOrdersFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-indigo-600">{ord.orderNumber}</td>
                          <td className="p-3 font-bold text-text-main">
                            {ord.customerInfo.firstName} {ord.customerInfo.lastName}
                          </td>
                          <td className="p-3 text-text-muted">
                            {new Date(ord.createdAt).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="p-3 font-black text-text-main">
                            {formatCurrency(ord.calculation.grandTotal, currency)}
                          </td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/admin/orders/${ord.orderNumber}`}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-text-main font-bold text-xs inline-flex items-center gap-1"
                            >
                              <span>{t("admin.orders.thAction")}</span>
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
