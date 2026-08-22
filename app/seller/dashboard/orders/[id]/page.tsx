"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord, OrderStatusType } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, PackageCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ORDERS_STORAGE_KEY = "cadde-store-orders";

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currency, t } = useLanguage();
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const orders = getSavedOrders();
    const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
    if (found) setOrder(found);
  }, [id]);

  const handleUpdateStatus = (newStatus: OrderStatusType) => {
    if (!order) return;
    const orders = getSavedOrders();
    const updated = orders.map((o) => (o.orderId === order.orderId ? { ...o, status: newStatus } : o));
    setOrder({ ...order, status: newStatus });
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  if (!order) return null;

  const sellerEarnings = order.calculation.grandTotal * 0.9;
  const dateText = t("seller.orders.detailDate").replace("{date}", new Date(order.createdAt).toLocaleDateString("tr-TR"));
  const orderNoText = t("seller.orders.detailOrderNo").replace("{no}", order.orderNumber);

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
                <Link href="/seller/dashboard/orders" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-subtle">{dateText}</span>
                  <h1 className="text-xl font-black text-text-main">{orderNoText}</h1>
                </div>
              </div>

              {/* Quick Status Buttons */}
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus("processing")}
                  className={order.status === "processing" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : ""}
                >
                  {t("seller.orders.btnMarkProcessing")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus("shipped")}
                  className={order.status === "shipped" ? "bg-amber-50 border-amber-300 text-amber-700" : ""}
                >
                  {t("seller.orders.btnMarkShipped")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus("delivered")}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  {t("seller.orders.btnMarkDelivered")}
                </Button>
              </div>
            </div>

            {/* Address & Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {t("seller.orders.deliveryAddress")}
                </span>
                <span className="font-bold text-text-main text-sm">{order.shippingAddress.title}</span>
                <span className="text-text-muted">{order.customerInfo.firstName} {order.customerInfo.lastName} ({order.customerInfo.phone})</span>
                <p className="text-slate-700 font-medium">{order.shippingAddress.addressLine}</p>
                <span className="font-bold text-text-main">{order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  {t("seller.orders.earningsSummary")}
                </span>

                <div className="flex items-center justify-between text-text-muted">
                  <span>{t("seller.orders.orderAmount")}</span>
                  <span className="font-bold text-text-main">{formatCurrency(order.calculation.grandTotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>{t("seller.orders.commissionDeduction")}</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(order.calculation.grandTotal * 0.1, currency)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-extrabold text-sm">
                  <span>{t("seller.orders.netEarnings")}</span>
                  <span className="text-emerald-700">{formatCurrency(sellerEarnings, currency)}</span>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-text-main">{t("seller.orders.orderItems")}</h2>
              <div className="divide-y divide-slate-100 flex flex-col gap-3">
                {order.sellerGroups.flatMap((g) => g.items).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 text-xs pt-2 first:pt-0">
                    <img src={item.product.imageUrl} alt="" className="w-14 h-16 object-cover rounded-lg border border-slate-200 shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-extrabold text-primary uppercase text-[11px]">{item.product.brand}</span>
                      <span className="font-bold text-text-main text-sm truncate">{item.product.name}</span>
                      <div className="flex items-center gap-2 text-text-muted mt-1">
                        {item.selectedColor && <span>{t("seller.orders.color").replace("{color}", item.selectedColor)}</span>}
                        {item.selectedSize && <span>{t("seller.orders.size").replace("{size}", item.selectedSize)}</span>}
                        <span>{t("seller.orders.quantity").replace("{qty}", String(item.quantity))}</span>
                      </div>
                    </div>
                    <span className="font-black text-text-main text-sm shrink-0">
                      {formatCurrency(item.product.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
