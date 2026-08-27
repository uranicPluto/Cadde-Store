"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  Package,
} from "lucide-react";

export default function AdminOrdersPage() {
  const { language, currency } = useLanguage();
  const isEn = language === "en";

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      !searchQuery.trim() ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.customerInfo && ord.customerInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Orders & Shipments" : "Sipariş & Gönderi Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Track marketplace orders, manage carrier dispatch, status workflows, and fulfillment."
                    : "Pazaryeri siparişlerini, kargo takip numaralarını ve teslimat durumlarını yönetin."}
                </p>
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search order number or customer..." : "Sipariş no veya müşteri ara..."}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["ALL", "confirmed", "processing", "shipped", "delivered"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors uppercase ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "ALL" ? (isEn ? "All" : "Tümü") : st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Sipariş No</th>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4">Müşteri</th>
                    <th className="py-3 px-4">Tutar</th>
                    <th className="py-3 px-4">Ödeme</th>
                    <th className="py-3 px-4">Durum</th>
                    <th className="py-3 px-4 text-right">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{ord.orderNumber}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(ord.createdAt).toLocaleDateString("tr-TR")}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {ord.shippingAddress
                          ? `${ord.shippingAddress.firstName} ${ord.shippingAddress.lastName}`
                          : ord.customerInfo
                          ? `${ord.customerInfo.firstName} ${ord.customerInfo.lastName}`
                          : "Müşteri"}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatCurrency(ord.calculation?.grandTotal || 0, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 uppercase text-[10px] font-bold">
                        {ord.paymentMethod === "credit_card" ? "Kredi Kartı" : "Kapıda Ödeme"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${ord.orderId}`}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          İncele &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Henüz sipariş kaydı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
