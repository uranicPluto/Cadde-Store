"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getOrderById, updateOrderStatus } from "@/lib/orders/order-utils";
import { OrderRecord, OrderStatusType } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { language, currency } = useLanguage();
  const isEn = language === "en";

  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (orderId) {
      const found = getOrderById(orderId);
      if (found) setOrder(found);
    }
  }, [orderId]);

  const handleStatusChange = (newStatus: OrderStatusType) => {
    if (!order) return;
    const updated = updateOrderStatus(order.orderId, newStatus);
    if (updated) setOrder(updated);
  };

  if (!order) {
    return (
      <div className="flex h-screen bg-[#0b0f19] text-slate-100 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <ShoppingCart className="w-8 h-8 opacity-30" />
          <span className="text-xs font-bold">Sipariş bulunamadı.</span>
          <Link href="/admin/orders" className="text-xs text-indigo-400 hover:underline">
            Siparişler listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Siparişlere Dön</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Durumu Değiştir:</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatusType)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="confirmed">Onaylandı (confirmed)</option>
                <option value="processing">Hazırlanıyor (processing)</option>
                <option value="shipped">Kargoya Verildi (shipped)</option>
                <option value="out_for_delivery">Dağıtımda (out_for_delivery)</option>
                <option value="delivered">Teslim Edildi (delivered)</option>
                <option value="cancelled">İptal Edildi (cancelled)</option>
              </select>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900">Sipariş #{order.orderNumber}</h1>
                <span className="text-xs text-slate-400 mt-0.5">
                  Tarih: {new Date(order.createdAt).toLocaleString("tr-TR")}
                </span>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Teslimat Adresi</span>
                </span>
                <span className="font-bold text-slate-800">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </span>
                <span className="text-slate-600">{order.shippingAddress.addressLine}</span>
                <span className="text-slate-600">
                  {order.shippingAddress.district} / {order.shippingAddress.city}
                </span>
                <span className="text-slate-500 font-mono mt-1">Tel: {order.shippingAddress.phone}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Ödeme & Toplam</span>
                </span>
                <span className="text-slate-600">
                  Ödeme Yöntemi: <strong className="text-slate-800 uppercase">{order.paymentMethod}</strong>
                </span>
                <span className="text-slate-600">
                  Kargo Ücreti: {order.calculation.totalShipping > 0 ? formatCurrency(order.calculation.totalShipping, currency) : "Ücretsiz"}
                </span>
                <span className="text-base font-black text-slate-900 mt-2">
                  Toplam: {formatCurrency(order.calculation.grandTotal, currency)}
                </span>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-xs text-slate-900">Sipariş Edilen Ürünler</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {order.sellerGroups.map((group, gIdx) => (
                  <div key={gIdx} className="p-3 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">
                      Satıcı: <strong className="text-slate-800">{group.storeName}</strong>
                    </span>
                    <div className="space-y-2">
                      {group.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded bg-slate-100 border p-0.5 flex items-center justify-center shrink-0">
                              <img src={item.product?.imageUrl || ""} alt={item.product?.name || "Product"} className="max-h-full max-w-full object-cover rounded" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{item.product?.name}</span>
                              <span className="text-[10px] text-slate-500">Adet: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-slate-900">
                            {formatCurrency((item.product?.price || 0) * item.quantity, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
