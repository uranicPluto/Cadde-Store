"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  MapPin,
  ArrowLeft,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Save,
  Store,
  User,
  CreditCard,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

const SAVED_ORDERS_STORAGE_KEY = "cadde-store-orders";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currency, language, t } = useLanguage();
  const isEn = language === "en";

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("CONFIRMED");
  const [carrier, setCarrier] = useState<string>("Yurtiçi Kargo");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  useEffect(() => {
    const orders = getSavedOrders();
    const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
    if (found) {
      setOrder(found);
      setSelectedStatus(found.status || "CONFIRMED");
      setCarrier(found.carrier || "Yurtiçi Kargo");
      setTrackingNumber(found.trackingNumber || "");
    }
  }, [id]);

  if (!order) return null;

  const platformCommission = order.calculation.grandTotal * 0.1;

  const handleSaveChanges = () => {
    setIsSaving(true);
    try {
      const orders = getSavedOrders();
      const updated = orders.map((o) => {
        if (o.orderId === order.orderId || o.orderNumber === order.orderNumber) {
          return {
            ...o,
            status: selectedStatus as any,
            carrier,
            trackingNumber,
          };
        }
        return o;
      });

      localStorage.setItem(SAVED_ORDERS_STORAGE_KEY, JSON.stringify(updated));
      setOrder({
        ...order,
        status: selectedStatus as any,
        carrier,
        trackingNumber,
      });
      showFeedback(isEn ? "Order status and tracking updated successfully" : "Sipariş durumu ve kargo takip bilgileri güncellendi");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/orders"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-text-main">Sipariş No: {order.orderNumber}</h1>
                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded">
                      {order.status || "CONFIRMED"}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>{isSaving ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save Status & Cargo" : "Durumu Kaydet")}</span>
                </Button>
              </div>
            </div>

            {/* Status & Carrier Fulfillment Control */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>{isEn ? "Logistics & Status Fulfillment Controls" : "Kargo & Sipariş Durumu Yönetimi"}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">{isEn ? "Order Lifecycle Status" : "Sipariş Durumu"}</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600 text-slate-900"
                  >
                    <option value="CONFIRMED">{isEn ? "CONFIRMED (Order Received)" : "CONFIRMED (Sipariş Alındı)"}</option>
                    <option value="PROCESSING">{isEn ? "PROCESSING (In Preparation)" : "PROCESSING (Hazırlanıyor)"}</option>
                    <option value="SHIPPED">{isEn ? "SHIPPED (In Transit)" : "SHIPPED (Kargoya Verildi)"}</option>
                    <option value="DELIVERED">{isEn ? "DELIVERED (Completed)" : "DELIVERED (Teslim Edildi)"}</option>
                    <option value="CANCELLED">{isEn ? "CANCELLED (Voided)" : "CANCELLED (İptal Edildi)"}</option>
                    <option value="REFUNDED">{isEn ? "REFUNDED (Money Returned)" : "REFUNDED (İade Edildi)"}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">{isEn ? "Cargo Carrier" : "Kargo Firması"}</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600 text-slate-900"
                  >
                    <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                    <option value="Aras Kargo">Aras Kargo</option>
                    <option value="MNG Kargo">MNG Kargo</option>
                    <option value="Sürat Kargo">Sürat Kargo</option>
                    <option value="HepsiJet">HepsiJet</option>
                    <option value="PTT Kargo">PTT Kargo</option>
                    <option value="Trendyol Express">Trendyol Express</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">{isEn ? "Tracking Code" : "Kargo Takip Kodu"}</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Örn: 928374829103"
                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                <span>{isEn ? "Purchased Items & Seller Splits" : "Sipariş İçeriği & Mağaza Ayrımı"}</span>
              </h2>

              <div className="divide-y divide-slate-100">
                {(order.sellerGroups?.flatMap((g) => g.items) || []).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-primary uppercase text-[10px]">
                          {item.product.brand}
                        </span>
                        <span className="font-bold text-slate-900 line-clamp-1">{item.product.name}</span>
                        <span className="text-slate-500 font-semibold">
                          {isEn ? "Seller:" : "Satıcı:"} <strong>{item.product.storeName || "Cadde Store"}</strong> • Adet:{" "}
                          <strong>{item.quantity}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-black text-sm text-slate-900">
                        {formatCurrency(item.product.price * item.quantity, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({formatCurrency(item.product.price, currency)} / ad.)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Financials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {t("admin.orders.deliveryAddress")}
                </span>
                <span className="font-bold text-text-main text-sm">{order.shippingAddress.title}</span>
                <span className="text-text-muted">
                  {order.customerInfo.firstName} {order.customerInfo.lastName} ({order.customerInfo.phone})
                </span>
                <p className="text-slate-700 font-medium">{order.shippingAddress.addressLine}</p>
                <span className="font-bold text-text-main">
                  {order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}
                </span>
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
                {((order.calculation.couponDiscount || 0) + (order.calculation.productDiscount || 0)) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>{isEn ? "Discount" : "İndirim"}</span>
                    <span>-{formatCurrency((order.calculation.couponDiscount || 0) + (order.calculation.productDiscount || 0), currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-text-muted">
                  <span>{isEn ? "Shipping Fee" : "Kargo Ücreti"}</span>
                  <span className="font-bold text-text-main">
                    {order.calculation.totalShipping === 0 ? (isEn ? "Free" : "Ücretsiz") : formatCurrency(order.calculation.totalShipping, currency)}
                  </span>
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
