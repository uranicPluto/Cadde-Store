"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShoppingCart, Search, ArrowRight, Package, Truck, Clock, CheckCircle2, User } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export interface DbOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  grandTotal: number;
  currency: string;
  carrierName?: string | null;
  trackingNumber?: string | null;
  shippingAddressSnapshot: string;
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems?: {
    id: string;
    quantity: number;
    price: number;
    product?: {
      id: string;
      name: string;
      brand: string;
      imageUrl: string;
    };
  }[];
}

export default function AdminOrdersPage() {
  const { currency, language, t } = useLanguage();
  const isEn = language === "en";

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.error("Failed to load orders from API:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCustomerName = (ord: DbOrder) => {
    if (ord.customer) {
      return `${ord.customer.firstName} ${ord.customer.lastName}`;
    }
    try {
      const snap = JSON.parse(ord.shippingAddressSnapshot);
      if (snap.firstName && snap.lastName) {
        return `${snap.firstName} ${snap.lastName}`;
      }
    } catch (e) {}
    return "Müşteri";
  };

  const filtered = orders.filter((o) => {
    const custName = getCustomerName(o).toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      custName.includes(search.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

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
                      {filtered.length} {isEn ? "Orders" : "Sipariş"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {isEn
                      ? "Track, moderate, and manage multi-vendor carrier fulfillment across all orders."
                      : "Tüm pazaryeri siparişlerini, kargo takip numaralarını ve teslimat durumlarını yönetin."}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isEn ? "Search by Order No, Customer, Tracking..." : "Sipariş No, Müşteri, Takip No ara..."}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="ALL">{isEn ? "All Order Statuses" : "Tüm Sipariş Durumları"}</option>
                    <option value="CONFIRMED">{isEn ? "CONFIRMED (Received)" : "CONFIRMED (Alındı)"}</option>
                    <option value="PROCESSING">{isEn ? "PROCESSING (In Prep)" : "PROCESSING (Hazırlanıyor)"}</option>
                    <option value="SHIPPED">{isEn ? "SHIPPED (In Cargo)" : "SHIPPED (Kargoda)"}</option>
                    <option value="DELIVERED">{isEn ? "DELIVERED (Completed)" : "DELIVERED (Teslim Edildi)"}</option>
                    <option value="CANCELLED">{isEn ? "CANCELLED" : "CANCELLED (İptal)"}</option>
                    <option value="REFUNDED">{isEn ? "REFUNDED" : "REFUNDED (İade Edildi)"}</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.orders.thOrderNo")}</th>
                      <th className="p-3">{t("admin.orders.thCustomer")}</th>
                      <th className="p-3">{isEn ? "Carrier & Tracking" : "Kargo & Takip"}</th>
                      <th className="p-3">{t("admin.orders.thDate")}</th>
                      <th className="p-3">{t("admin.orders.thAmount")}</th>
                      <th className="p-3">{t("admin.orders.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.orders.thAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          {isEn ? "Loading orders from database..." : "Siparişler veritabanından yükleniyor..."}
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          {t("admin.orders.noOrdersFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-indigo-600">
                            <Link href={`/admin/orders/${ord.id}`} className="hover:underline">
                              {ord.orderNumber}
                            </Link>
                          </td>
                          <td className="p-3 font-bold text-text-main">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{getCustomerName(ord)}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {ord.trackingNumber ? (
                              <div className="flex flex-col text-[11px]">
                                <span className="font-bold text-slate-800">{ord.carrierName || "Yurtiçi Kargo"}</span>
                                <span className="font-mono text-slate-500">{ord.trackingNumber}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-3 text-text-muted">
                            {new Date(ord.createdAt).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="p-3 font-black text-text-main">
                            {formatCurrency(ord.grandTotal, currency)}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusBadgeClass(ord.status)}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/admin/orders/${ord.id}`}
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
