"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
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
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

const TURKISH_CARRIER_OPTIONS = [
  { name: "Yurtiçi Kargo", urlPrefix: "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=" },
  { name: "Aras Kargo", urlPrefix: "https://www.araskargo.com.tr/kargotakip/?trackingNumber=" },
  { name: "MNG Kargo", urlPrefix: "https://www.mngkargo.com.tr/kargotakip?trackingNumber=" },
  { name: "Sürat Kargo", urlPrefix: "https://suratkargo.com.tr/KargoTakip/?kargotakipno=" },
  { name: "PTT Kargo", urlPrefix: "https://gonderitakip.ptt.gov.tr/Track/Verify?q=" },
  { name: "HepsiJet", urlPrefix: "https://www.hepsijet.com/gonderi-takibi/" },
  { name: "Trendyol Express", urlPrefix: "https://kargotakip.trendyol.com/?trackingNumber=" },
];

function getCarrierTrackingUrl(carrierName?: string | null, trackingNumber?: string | null): string {
  if (!trackingNumber) return "#";
  const cleanNumber = encodeURIComponent(trackingNumber.trim());
  const carrier = TURKISH_CARRIER_OPTIONS.find((c) => c.name === carrierName);
  if (carrier) {
    return `${carrier.urlPrefix}${cleanNumber}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrierName || "Kargo"} ${trackingNumber} takip`)}`;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currency, language, t } = useLanguage();
  const isEn = language === "en";

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("CONFIRMED");
  const [carrier, setCarrier] = useState<string>("Yurtiçi Kargo");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          setSelectedStatus(data.order.status || "CONFIRMED");
          setCarrier(data.order.carrierName || "Yurtiçi Kargo");
          setTrackingNumber(data.order.trackingNumber || "");
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch order:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!order) return;
    setIsSaving(true);
    try {
      const payload = {
        orderId: order.id,
        status: selectedStatus,
        carrierName: carrier,
        trackingNumber: trackingNumber.trim(),
      };

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Try fallback to seller order group status updater
        if (order.orderGroups && order.orderGroups[0]) {
          await fetch("/api/orders/seller", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderGroupId: order.orderGroups[0].id,
              status: selectedStatus,
              carrierName: carrier,
              trackingNumber: trackingNumber.trim(),
            }),
          });
        }
      }

      setOrder({
        ...order,
        status: selectedStatus,
        carrierName: carrier,
        trackingNumber: trackingNumber.trim(),
      });
      showFeedback(
        isEn
          ? "Order status, carrier, and tracking number updated successfully"
          : "Sipariş durumu, kargo firması ve takip numarası güncellendi"
      );
      await fetchOrder();
    } catch (err) {
      console.error("Save order error:", err);
      showFeedback(isEn ? "Failed to update order" : "Sipariş güncellenemedi");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex justify-center flex-1">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center flex-1 gap-4">
          <Truck className="w-12 h-12 text-slate-400" />
          <h2 className="text-base font-bold text-slate-700">{isEn ? "Order not found" : "Sipariş bulunamadı"}</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-indigo-600 underline">
            &larr; {isEn ? "Back to Orders" : "Sipariş Listesine Dön"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const shippingAddress = (() => {
    try {
      return typeof order.shippingAddressSnapshot === "string"
        ? JSON.parse(order.shippingAddressSnapshot)
        : order.shippingAddressSnapshot || {};
    } catch (e) {
      return {};
    }
  })();

  const trackingPortalUrl = getCarrierTrackingUrl(carrier, trackingNumber);

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
                    <h1 className="text-xl font-black text-text-main">
                      {isEn ? "Order No:" : "Sipariş No:"} {order.orderNumber}
                    </h1>
                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
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
                  <span>{isSaving ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save Status & Carrier" : "Durumu & Kargoyu Kaydet")}</span>
                </Button>
              </div>
            </div>

            {/* Carrier & Delivery Status Management Form */}
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
                  <label className="font-bold text-slate-700">{isEn ? "Turkish Carrier" : "Kargo Firması"}</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600 text-slate-900"
                  >
                    {TURKISH_CARRIER_OPTIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
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

              {trackingNumber && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {isEn ? "Live Carrier Tracking Portal Link:" : "Canlı Kargo Takip Portalı Bağlantısı:"}
                  </span>
                  <a
                    href={trackingPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{carrier} {isEn ? "Live Tracking Portal" : "Kargo Takip Ekranını Aç"} &rarr;</span>
                  </a>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                <span>{isEn ? "Purchased Items & Seller Splits" : "Sipariş İçeriği & Mağaza Ayrımı"}</span>
              </h2>

              <div className="divide-y divide-slate-100">
                {(order.orderItems || []).map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80"}
                        alt=""
                        className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-primary uppercase text-[10px]">
                          {item.product?.brand || "Cadde"}
                        </span>
                        <span className="font-bold text-slate-900 line-clamp-1">{item.product?.name || "Ürün"}</span>
                        <span className="text-slate-500 font-semibold">
                          Adet: <strong>{item.quantity}</strong>
                          {item.selectedColor ? ` • Renk: ${item.selectedColor}` : ""}
                          {item.selectedSize ? ` • Beden: ${item.selectedSize}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-black text-sm text-slate-900">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({formatCurrency(item.price, currency)} / ad.)
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
                <span className="font-bold text-text-main text-sm">{shippingAddress.title || "Teslimat Adresi"}</span>
                <span className="text-text-muted">
                  {shippingAddress.firstName || order.customer?.firstName} {shippingAddress.lastName || order.customer?.lastName} ({shippingAddress.phone || order.customer?.phone || "—"})
                </span>
                <p className="text-slate-700 font-medium">{shippingAddress.addressLine || "—"}</p>
                <span className="font-bold text-text-main">
                  {shippingAddress.district || ""} / {shippingAddress.city || ""} - {shippingAddress.country || "Türkiye"}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  {t("admin.orders.financialSummary")}
                </span>

                <div className="flex items-center justify-between text-text-muted">
                  <span>{t("admin.orders.subtotal")}</span>
                  <span className="font-bold text-text-main">{formatCurrency(order.subtotal, currency)}</span>
                </div>

                {(order.couponDiscount > 0 || order.productDiscount > 0) && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>{isEn ? "Discount" : "İndirim"}</span>
                    <span>-{formatCurrency(order.couponDiscount + order.productDiscount, currency)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-text-muted">
                  <span>{isEn ? "Shipping Fee" : "Kargo Ücreti"}</span>
                  <span className="font-bold text-text-main">
                    {order.shippingFee === 0 ? (isEn ? "Free" : "Ücretsiz") : formatCurrency(order.shippingFee, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-black text-sm">
                  <span>{t("admin.orders.grandTotal")}</span>
                  <span className="text-indigo-600">{formatCurrency(order.grandTotal, currency)}</span>
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
