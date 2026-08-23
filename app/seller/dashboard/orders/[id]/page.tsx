"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getSavedOrders } from "@/lib/orders/order-utils";
import { OrderRecord, OrderStatusType } from "@/lib/orders/order-types";
import {
  TURKISH_CARRIERS,
  TurkishCarrier,
  getCarrierTrackingUrl,
  validateTrackingNumber,
  CARRIER_REGISTRY,
} from "@/lib/logistics/carrier-utils";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ArrowLeft,
  PackageCheck,
  Truck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Building2,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ORDERS_STORAGE_KEY = "cadde-store-orders";

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currency, t } = useLanguage();
  const [order, setOrder] = useState<any | null>(null);
  const [orderGroupId, setOrderGroupId] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<TurkishCarrier>("Yurtiçi Kargo");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [fulfillmentNote, setFulfillmentNote] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string>("CONFIRMED");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchOrderData = useCallback(async () => {
    if (!id) return;
    try {
      // 1. Try to fetch from /api/orders/seller
      const res = await fetch("/api/orders/seller");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orderGroups)) {
          const match = data.orderGroups.find(
            (g: any) =>
              g.id === id ||
              g.orderId === id ||
              g.order?.id === id ||
              g.order?.orderNumber === id
          );

          if (match) {
            setOrderGroupId(match.id);
            setCurrentStatus(match.status || "CONFIRMED");
            if (match.carrierName && TURKISH_CARRIERS.includes(match.carrierName as any)) {
              setSelectedCarrier(match.carrierName as TurkishCarrier);
            }
            if (match.trackingNumber) {
              setTrackingCode(match.trackingNumber);
            }

            let address: any = {};
            try {
              address = JSON.parse(match.order?.shippingAddressSnapshot || "{}");
            } catch (e) {}

            setOrder({
              orderId: match.orderId,
              orderNumber: match.order?.orderNumber || `CS-${match.orderId.substring(0, 8)}`,
              createdAt: match.order?.createdAt || match.createdAt,
              customerInfo: {
                firstName: match.order?.customer?.firstName || address.firstName || "Müşteri",
                lastName: match.order?.customer?.lastName || address.lastName || "",
                email: match.order?.customer?.email || address.email || "",
                phone: match.order?.customer?.phone || address.phone || "",
              },
              shippingAddress: {
                title: address.title || "Teslimat Adresi",
                firstName: address.firstName || "Müşteri",
                lastName: address.lastName || "",
                phone: address.phone || "",
                email: address.email || "",
                city: address.city || "İstanbul",
                district: address.district || "Kadıköy",
                addressLine: address.addressLine || "",
                country: address.country || "Türkiye",
              },
              calculation: {
                grandTotal: match.subtotal || match.order?.grandTotal || 0,
              },
              items: match.items || [],
              status: match.status,
            });
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Seller order fetch error:", e);
    }

    // 2. Fallback to /api/orders/[id]
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          const o = data.order;
          const firstGroup = Array.isArray(o.orderGroups) && o.orderGroups.length > 0 ? o.orderGroups[0] : null;
          if (firstGroup) {
            setOrderGroupId(firstGroup.id);
            setCurrentStatus(firstGroup.status || o.status || "CONFIRMED");
            if (firstGroup.carrierName && TURKISH_CARRIERS.includes(firstGroup.carrierName as any)) {
              setSelectedCarrier(firstGroup.carrierName as TurkishCarrier);
            }
            if (firstGroup.trackingNumber) {
              setTrackingCode(firstGroup.trackingNumber);
            }
          }

          let address: any = {};
          try {
            address = JSON.parse(o.shippingAddressSnapshot || "{}");
          } catch (e) {}

          setOrder({
            orderId: o.id,
            orderNumber: o.orderNumber,
            createdAt: o.createdAt,
            customerInfo: {
              firstName: o.customer?.firstName || address.firstName || "Müşteri",
              lastName: o.customer?.lastName || address.lastName || "",
              email: o.customer?.email || address.email || "",
              phone: o.customer?.phone || address.phone || "",
            },
            shippingAddress: {
              title: address.title || "Teslimat Adresi",
              firstName: address.firstName || "Müşteri",
              lastName: address.lastName || "",
              phone: address.phone || "",
              email: address.email || "",
              city: address.city || "İstanbul",
              district: address.district || "Kadıköy",
              addressLine: address.addressLine || "",
              country: address.country || "Türkiye",
            },
            calculation: {
              grandTotal: o.grandTotal || o.subtotal || 0,
            },
            items: firstGroup?.items || o.orderItems || [],
            status: firstGroup?.status || o.status,
          });
          return;
        }
      }
    } catch (e) {}

    // 3. Fallback to localStorage
    const orders = getSavedOrders();
    const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
    if (found) {
      setOrder(found);
      setCurrentStatus(found.status.toUpperCase());
      if (found.trackingNumber) setTrackingCode(found.trackingNumber);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  const handleUpdateStatusAndCarrier = async (targetStatus: string) => {
    setFeedback(null);

    // If moving to SHIPPED or DELIVERED and tracking number is provided, validate it
    if (targetStatus === "SHIPPED" || targetStatus === "DELIVERED") {
      if (trackingCode) {
        const validation = validateTrackingNumber(selectedCarrier, trackingCode);
        if (!validation.valid) {
          setFeedback({ type: "error", message: validation.message || "Geçersiz takip numarası." });
          return;
        }
      }
    }

    try {
      setLoading(true);

      if (orderGroupId) {
        const res = await fetch("/api/orders/seller", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderGroupId,
            status: targetStatus,
            carrierName: selectedCarrier,
            trackingNumber: trackingCode.trim() || undefined,
            note: fulfillmentNote.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Sipariş durumu güncellenemedi.");
        }

        setCurrentStatus(targetStatus);
        setFeedback({
          type: "success",
          message: `Sipariş durumu başarıyla "${targetStatus}" olarak güncellendi ve müşteriye bildirim iletildi.`,
        });
      } else {
        // Fallback for local state
        setCurrentStatus(targetStatus);
        const orders = getSavedOrders();
        const updated = orders.map((o) =>
          o.orderId === order?.orderId ? { ...o, status: targetStatus.toLowerCase() as any, trackingNumber: trackingCode } : o
        );
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
        setFeedback({
          type: "success",
          message: `Sipariş durumu "${targetStatus}" olarak kaydedildi.`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <SellerHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 text-center text-xs text-text-muted flex-1">
          Sipariş bilgisi yükleniyor...
        </main>
        <Footer />
      </div>
    );
  }

  const grandTotal = order.calculation?.grandTotal || 0;
  const sellerEarnings = grandTotal * 0.9;
  const dateText = new Date(order.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const trackingUrl = getCarrierTrackingUrl(selectedCarrier, trackingCode);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header & Status Indicator */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/seller/dashboard/orders"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-subtle">{dateText}</span>
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>Sipariş No: {order.orderNumber}</span>
                  </h1>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Mevcut Durum:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                    currentStatus === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentStatus === "SHIPPED"
                      ? "bg-amber-100 text-amber-800"
                      : currentStatus === "PROCESSING"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Logistics & Fulfillment Controls Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-2 text-xs">
                  <Truck className="w-4 h-4" />
                  Kargo & Gönderi Yönetim Paneli
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Türk Kargo Entegrasyonları (6 Taşıyıcı)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Carrier Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Anlaşmalı Kargo Firması</label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value as TurkishCarrier)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
                  >
                    {TURKISH_CARRIERS.map((carrier) => (
                      <option key={carrier} value={carrier}>
                        {carrier} ({CARRIER_REGISTRY[carrier]?.customerService || "Anlaşmalı"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracking Number Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Kargo Takip / Barkod Numarası</label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder={CARRIER_REGISTRY[selectedCarrier]?.trackingPlaceholder || "Örn: YRT-948201948"}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-xs font-mono text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
                  />
                </div>
              </div>

              {/* Note / Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Müşteri / Kargo Bilgilendirme Notu (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={fulfillmentNote}
                  onChange={(e) => setFulfillmentNote(e.target.value)}
                  placeholder="Örn: Siparişiniz özenle paketlendi ve Yurtiçi Kargo şubesine teslim edildi."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
                />
              </div>

              {/* Tracking Link Preview & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div>
                  {trackingCode ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{selectedCarrier} Resmi Takip Sayfasını Önizle ({trackingCode})</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Takip bağlantısı oluşturmak için takip kodu giriniz.
                    </span>
                  )}
                </div>

                {/* Status Transition Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleUpdateStatusAndCarrier("PROCESSING")}
                    className={
                      currentStatus === "PROCESSING"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold"
                        : "font-bold text-xs"
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Hazırlanıyor Yap
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleUpdateStatusAndCarrier("SHIPPED")}
                    className={
                      currentStatus === "SHIPPED"
                        ? "bg-amber-50 border-amber-300 text-amber-700 font-bold"
                        : "font-bold text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                    }
                  >
                    <Truck className="w-3.5 h-3.5 mr-1" />
                    Kargoya Verildi
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleUpdateStatusAndCarrier("DELIVERED")}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Teslim Edildi Onayla
                  </Button>
                </div>
              </div>
            </div>

            {/* Address & Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Teslimat Adresi
                </span>
                <span className="font-bold text-text-main text-sm">{order.shippingAddress.title}</span>
                <span className="text-text-muted">
                  {order.customerInfo.firstName} {order.customerInfo.lastName} ({order.customerInfo.phone})
                </span>
                <p className="text-slate-700 font-medium leading-relaxed">{order.shippingAddress.addressLine}</p>
                <span className="font-bold text-text-main">
                  {order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  Hakediş & Finans Özeti
                </span>

                <div className="flex items-center justify-between text-text-muted">
                  <span>Sipariş Tutarı:</span>
                  <span className="font-bold text-text-main">{formatCurrency(grandTotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Pazaryeri Komisyonu (%10):</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(grandTotal * 0.1, currency)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-extrabold text-sm">
                  <span>Net Satıcı Hakedişi:</span>
                  <span className="text-emerald-700">{formatCurrency(sellerEarnings, currency)}</span>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-text-main uppercase tracking-wider">Siparişteki Ürünler</h2>
              <div className="divide-y divide-slate-100 flex flex-col gap-3">
                {(order.items || []).map((item: any) => {
                  const prod = item.product || item;
                  return (
                    <div key={item.id} className="flex items-center gap-4 text-xs pt-3 first:pt-0">
                      <img
                        src={prod.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"}
                        alt=""
                        className="w-14 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-extrabold text-primary uppercase text-[11px]">{prod.brand || "Cadde Store"}</span>
                        <span className="font-bold text-text-main text-sm truncate">{prod.name}</span>
                        <div className="flex items-center gap-2 text-text-muted mt-1">
                          {item.selectedColor && <span>Renk: {item.selectedColor}</span>}
                          {item.selectedSize && <span>Beden: {item.selectedSize}</span>}
                          <span>Adet: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-black text-text-main text-sm shrink-0">
                        {formatCurrency((item.price || prod.price || 0) * (item.quantity || 1), currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
