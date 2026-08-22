"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { MapPin, ArrowLeft, PackageCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { currency, t } = useLanguage();
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const orders = getSavedOrders();
    const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
    if (found) setOrder(found);
  }, [id]);

  if (!order) return null;

  const platformCommission = order.calculation.grandTotal * 0.1;

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
                <Link href="/admin/orders" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">Sipariş No: {order.orderNumber}</h1>
                  <span className="text-xs text-text-muted">{t("admin.orders.detailSubtitle")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {t("admin.orders.deliveryAddress")}
                </span>
                <span className="font-bold text-text-main text-sm">{order.shippingAddress.title}</span>
                <span className="text-text-muted">{order.customerInfo.firstName} {order.customerInfo.lastName} ({order.customerInfo.phone})</span>
                <p className="text-slate-700 font-medium">{order.shippingAddress.addressLine}</p>
                <span className="font-bold text-text-main">{order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  {t("admin.orders.financialSummary")}
                </span>

                <div className="flex items-center justify-between text-text-muted">
                  <span>{t("admin.orders.subtotal")}</span>
                  <span className="font-bold text-text-main">{formatCurrency(order.calculation.subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>{t("admin.orders.commission")}</span>
                  <span className="font-extrabold text-emerald-700">+{formatCurrency(platformCommission, currency)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-black text-sm">
                  <span>{t("admin.orders.grandTotal")}</span>
                  <span className="text-indigo-600">{formatCurrency(order.calculation.grandTotal, currency)}</span>
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
