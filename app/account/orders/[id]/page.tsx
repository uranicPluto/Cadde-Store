"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { OrderTracking } from "@/components/account/order-tracking";
import { ReturnRequestModal, ReturnItemOption } from "@/components/account/return-request-modal";
import { getCarrierTrackingUrl } from "@/lib/logistics/carrier-utils";
import { getSavedOrders, buildMockStatusHistory } from "@/lib/orders/order-utils";
import { OrderRecord, OrderStatusType } from "@/lib/orders/order-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  CreditCard,
  RefreshCw,
  Printer,
  ArrowLeft,
  Store,
  ExternalLink,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";

interface ReturnRequestRecord {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: string;
  status: string;
  refundAmount: number;
  evidenceImages: string;
  sellerNote?: string;
  adminNote?: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, currency, t } = useLanguage();
  const { addToCart } = useCart();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<ReturnItemOption | undefined>(undefined);
  const [returnRequests, setReturnRequests] = useState<ReturnRequestRecord[]>([]);

  const fetchReturns = useCallback((orderId: string) => {
    fetch(`/api/returns?orderId=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.returns)) {
          setReturnRequests(data.returns);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    fetch(`/api/orders/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found on server");
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data.order) return;
        const o = data.order;
        let shippingAddress: any = {};
        try {
          shippingAddress =
            typeof o.shippingAddressSnapshot === "string"
              ? JSON.parse(o.shippingAddressSnapshot)
              : o.shippingAddressSnapshot || {};
        } catch (e) {}

        const statusNormalized = (o.status?.toLowerCase() || "confirmed") as OrderStatusType;

        let sellerGroups: any[] = [];
        if (Array.isArray(o.orderGroups) && o.orderGroups.length > 0) {
          sellerGroups = o.orderGroups.map((g: any) => {
            const groupItems =
              Array.isArray(g.items) && g.items.length > 0
                ? g.items
                : Array.isArray(o.orderItems)
                ? o.orderItems.filter((item: any) => item.orderGroupId === g.id || !item.orderGroupId)
                : [];

            return {
              id: g.id,
              sellerId: g.sellerId,
              storeName: g.seller?.storeName || "Cadde Store Mağazası",
              carrierName: g.carrierName || o.carrierName || "Yurtiçi Kargo",
              trackingNumber: g.trackingNumber || o.trackingNumber,
              status: g.status,
              items: groupItems.map((item: any) => ({
                id: item.id,
                product: {
                  id: item.product?.id || item.productId,
                  slug: item.product?.slug || item.productId,
                  name: item.product?.name || "Ürün",
                  brand: item.product?.brand || "Cadde Store",
                  categorySlug: "general",
                  categoryName: "Genel",
                  storeName: g.seller?.storeName || "Cadde Store Mağazası",
                  price: item.price,
                  rating: 4.8,
                  reviewCount: 10,
                  imageUrl:
                    item.product?.imageUrl ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
                  galleryImages: [],
                  description: "",
                  specifications: {},
                  stock: 10,
                  reviews: [],
                },
                quantity: item.quantity,
                selectedColor: item.selectedColor || undefined,
                selectedSize: item.selectedSize || undefined,
              })),
              subtotal: g.subtotal,
              freeShippingThreshold: 200,
              shippingFee: 0,
              isFreeShipping: true,
            };
          });
        } else if (Array.isArray(o.orderItems) && o.orderItems.length > 0) {
          sellerGroups = [
            {
              id: "single-group",
              storeName: "Cadde Store Mağazası",
              carrierName: o.carrierName || "Yurtiçi Kargo",
              trackingNumber: o.trackingNumber,
              status: o.status,
              items: o.orderItems.map((item: any) => ({
                id: item.id,
                product: {
                  id: item.product?.id || item.productId,
                  slug: item.product?.slug || item.productId,
                  name: item.product?.name || "Ürün",
                  brand: item.product?.brand || "Cadde Store",
                  categorySlug: "general",
                  categoryName: "Genel",
                  storeName: "Cadde Store Mağazası",
                  price: item.price,
                  rating: 4.8,
                  reviewCount: 10,
                  imageUrl:
                    item.product?.imageUrl ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
                  galleryImages: [],
                  description: "",
                  specifications: {},
                  stock: 10,
                  reviews: [],
                },
                quantity: item.quantity,
                selectedColor: item.selectedColor || undefined,
                selectedSize: item.selectedSize || undefined,
              })),
              subtotal: o.subtotal,
              freeShippingThreshold: 200,
              shippingFee: o.shippingFee || 0,
              isFreeShipping: (o.shippingFee || 0) === 0,
            },
          ];
        }

        const dbMapped: OrderRecord = {
          orderId: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          customerInfo: {
            firstName: o.customer?.firstName || shippingAddress.firstName || "Müşteri",
            lastName: o.customer?.lastName || shippingAddress.lastName || "",
            email: o.customer?.email || shippingAddress.email || "",
            phone: o.customer?.phone || shippingAddress.phone || "",
          },
          shippingAddress: {
            id: shippingAddress.id || "addr-snapshot",
            title: shippingAddress.title || "Teslimat Adresi",
            firstName: shippingAddress.firstName || o.customer?.firstName || "Müşteri",
            lastName: shippingAddress.lastName || o.customer?.lastName || "",
            phone: shippingAddress.phone || o.customer?.phone || "",
            email: shippingAddress.email || o.customer?.email || "",
            city: shippingAddress.city || "İstanbul",
            district: shippingAddress.district || "Kadıköy",
            addressLine: shippingAddress.addressLine || "",
            country: shippingAddress.country || "Türkiye",
          },
          shippingMethod: {
            id: "std",
            name: { tr: o.carrierName || "Yurtiçi Kargo", en: o.carrierName || "Yurtiçi Kargo" },
            deliveryDays: { tr: "1-2 Gün", en: "1-2 Days" },
            price: o.shippingFee || 0,
          },
          sellerGroups,
          appliedCoupon: null,
          paymentMethod: (o.paymentMethod as any) || "credit_card",
          trackingNumber: o.trackingNumber || `YRT-${Math.floor(100000000 + Math.random() * 900000000)}`,
          estimatedDelivery: o.estimatedDelivery || "2-3 İş Günü",
          statusHistory: buildMockStatusHistory(statusNormalized, o.createdAt),
          calculation: {
            subtotal: o.subtotal,
            productDiscount: o.productDiscount || 0,
            couponDiscount: o.couponDiscount || 0,
            totalShipping: o.shippingFee || 0,
            grandTotal: o.grandTotal,
            sellerGroups,
          },
          status: statusNormalized,
        };

        setOrder(dbMapped);
        fetchReturns(o.id);
      })
      .catch(() => {
        if (!isMounted) return;
        const orders = getSavedOrders();
        const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
        if (found) {
          setOrder(found);
          fetchReturns(found.orderId);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, language, fetchReturns]);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <MarketplaceHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 text-center text-xs text-text-muted flex-1">
          Sipariş bilgisi yükleniyor...
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    language === "en" ? "en-US" : "tr-TR",
    { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  const statusHistory = order.statusHistory || buildMockStatusHistory(order.status, order.createdAt);

  const handleReorder = () => {
    order.sellerGroups.forEach((g) => {
      g.items.forEach((item) => {
        addToCart(item.product, item.quantity, item.selectedColor, item.selectedSize);
      });
    });
    router.push("/cart");
  };

  // Convert items for ReturnRequestModal
  const allOrderItems: ReturnItemOption[] = order.sellerGroups.flatMap((g) =>
    g.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      brand: item.product.brand,
      imageUrl: item.product.imageUrl,
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    }))
  );

  const openReturnModal = (item?: ReturnItemOption) => {
    setSelectedReturnItem(item);
    setReturnModalOpen(true);
  };

  const getReturnStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            İade Onaylandı
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            İade Reddedildi
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
            <CheckCircle2 className="w-3 h-3" />
            Ücret İade Edildi
          </span>
        );
      case "CARGO_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" />
            Kargo Satıcıya Ulaştı
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            İnceleniyor (Beklemede)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: language === "en" ? "My Account" : "Hesabım", href: "/account" },
            { label: language === "en" ? "My Orders" : "Siparişlerim", href: "/account/orders" },
            { label: order.orderNumber },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Title Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/account/orders" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-subtle">{formattedDate}</span>
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{language === "en" ? "Order No:" : "Sipariş No:"} {order.orderNumber}</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold text-xs">
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  <span>{language === "en" ? "View Invoice" : "Fatura Görüntüle"}</span>
                </Button>
                {/* Return Request button on order header */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openReturnModal()}
                  className="font-bold text-xs border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>{language === "en" ? "Request Return" : "Kolay İade Talebi"}</span>
                </Button>
                <Button variant="primary" size="sm" onClick={handleReorder} className="font-bold text-xs bg-slate-900 hover:bg-slate-800">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>{language === "en" ? "Buy Again" : "Tekrar Sipariş Et"}</span>
                </Button>
              </div>
            </div>

            {/* Visual Tracking Timeline */}
            <OrderTracking
              statusHistory={statusHistory}
              trackingNumber={order.trackingNumber}
              estimatedDelivery={order.estimatedDelivery}
            />

            {/* Existing Return Requests Banner if any */}
            {returnRequests.length > 0 && (
              <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <span className="font-extrabold text-amber-900 flex items-center gap-2 text-xs">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    {language === "en" ? `Return Requests on this Order (${returnRequests.length})` : `Bu Siparişe Ait İade Talepleri (${returnRequests.length})`}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 flex flex-col gap-3">
                  {returnRequests.map((ret) => (
                    <div key={ret.id} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{language === "en" ? "Reason:" : "Gerekçe:"} {ret.reason}</span>
                          {getReturnStatusBadge(ret.status)}
                        </div>
                        {ret.sellerNote && (
                          <span className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1">
                            <strong>{language === "en" ? "Seller Note:" : "Satıcı Notu:"}</strong> {ret.sellerNote}
                          </span>
                        )}
                        {ret.adminNote && (
                          <span className="text-purple-700 bg-purple-50 p-1.5 rounded border border-purple-200 mt-1">
                            <strong>{language === "en" ? "Admin Note:" : "Yönetici Notu:"}</strong> {ret.adminNote}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-500 block text-[10px]">{language === "en" ? "Refund Amount" : "İade Tutarı"}</span>
                        <span className="font-black text-emerald-700 text-sm">{formatCurrency(ret.refundAmount, currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery & Customer Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {language === "en" ? "Delivery Address" : "Teslimat Adresi"}
                </span>
                <span className="font-bold text-text-main">{order.shippingAddress.title}</span>
                <span className="text-text-muted">{order.customerInfo.firstName} {order.customerInfo.lastName} ({order.customerInfo.phone})</span>
                <p className="text-slate-700 font-medium leading-relaxed">{order.shippingAddress.addressLine}</p>
                <span className="font-bold text-text-main">{order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  {language === "en" ? "Payment & Delivery Info" : "Ödeme & Kargo Bilgileri"}
                </span>
                <div className="flex items-center justify-between text-text-muted pt-1">
                  <span>{language === "en" ? "Payment Method:" : "Ödeme Yöntemi:"}</span>
                  <span className="font-bold text-text-main">
                    {order.paymentMethod === "credit_card"
                      ? `${language === "en" ? "Credit Card" : "Kredi Kartı"} (${order.cardMaskedNumber || "**** 5400"})`
                      : language === "en" ? "Cash on Delivery" : "Kapıda Ödeme"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>{language === "en" ? "Carrier:" : "Kargo Firması:"}</span>
                  <span className="font-bold text-emerald-700">{order.shippingMethod?.name?.[language] || order.shippingMethod?.name?.tr || "Yurtiçi Kargo"}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted pt-2 border-t border-slate-100">
                  <span className="font-bold">{language === "en" ? "Grand Total:" : "Toplam Tutar:"}</span>
                  <span className="text-base font-black text-primary">{formatCurrency(order.calculation.grandTotal, currency)}</span>
                </div>
              </div>
            </div>

            {/* Ordered Products Breakdown per Seller Group */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-text-main uppercase tracking-wider">
                {language === "en" ? "Order Items & Shipment Tracking" : "Sipariş İçeriği & Gönderi Takibi"}
              </h2>

              {order.sellerGroups.map((g: any, gIdx: number) => {
                const carrierName = g.carrierName || order.shippingMethod?.name?.[language] || order.shippingMethod?.name?.tr || "Yurtiçi Kargo";
                const trackingNum = g.trackingNumber || order.trackingNumber;
                const trackingUrl = getCarrierTrackingUrl(carrierName, trackingNum);

                return (
                  <div key={g.id || g.storeName || gIdx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary" />
                        <span className="font-extrabold text-primary">{language === "en" ? "Seller:" : "Satıcı:"} {g.storeName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                          {g.status || order.status}
                        </span>
                      </div>

                      {/* Carrier Tracking Button */}
                      <div className="flex items-center gap-2">
                        {trackingNum ? (
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{carrierName}: {trackingNum}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-75" />
                          </a>
                        ) : (
                          <span className="font-bold text-slate-600">
                            {g.isFreeShipping ? (language === "en" ? "Free Shipping" : "Ücretsiz Kargo") : `${language === "en" ? "Shipping:" : "Kargo:"} ${formatCurrency(g.shippingFee, currency)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 p-4 flex flex-col gap-3">
                      {g.items.map((item: any) => {
                        const itemOption: ReturnItemOption = {
                          id: item.id,
                          name: item.product.name,
                          brand: item.product.brand,
                          imageUrl: item.product.imageUrl,
                          price: item.product.price,
                          quantity: item.quantity,
                          selectedColor: item.selectedColor,
                          selectedSize: item.selectedSize,
                        };

                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs pt-3 first:pt-0">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <img
                                src={item.product.imageUrl}
                                alt=""
                                className="w-16 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-extrabold text-primary uppercase text-[11px]">{item.product.brand}</span>
                                <span className="font-bold text-text-main text-sm truncate">{item.product.name}</span>
                                <div className="flex items-center gap-2 text-text-muted mt-1">
                                  {item.selectedColor && <span>{language === "en" ? "Color:" : "Renk:"} {item.selectedColor}</span>}
                                  {item.selectedSize && <span>{language === "en" ? "Size:" : "Beden:"} {item.selectedSize}</span>}
                                  <span>{language === "en" ? "Qty:" : "Adet:"} {item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                              <span className="font-black text-text-main text-sm">
                                {formatCurrency(item.product.price * item.quantity, currency)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReturnModal(itemOption)}
                                className="text-xs font-bold border-slate-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 text-slate-700"
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                <span>{language === "en" ? "Return Item" : "İade Et"}</span>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Return Request Modal */}
      <ReturnRequestModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        orderId={order.orderId}
        orderNumber={order.orderNumber}
        items={allOrderItems}
        preSelectedItemId={selectedReturnItem?.id}
        onSuccess={() => {
          fetchReturns(order.orderId);
        }}
      />

      <Footer />
    </div>
  );
}
