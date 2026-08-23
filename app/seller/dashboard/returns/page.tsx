"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { Footer } from "@/components/layout/footer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Image as ImageIcon,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Package,
} from "lucide-react";

interface ReturnItem {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CARGO_RECEIVED" | "REFUNDED";
  refundAmount: number;
  evidenceImages: string;
  sellerNote?: string;
  adminNote?: string;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    createdAt: string;
    grandTotal: number;
    status: string;
  };
  orderItem: {
    product: {
      id: string;
      name: string;
      imageUrl: string;
      price: number;
      brand: string;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  seller: {
    id: string;
    storeName: string;
    slug: string;
  };
}

export default function SellerReturnsPage() {
  const { currency, language } = useLanguage();

  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalReturn, setActiveModalReturn] = useState<ReturnItem | null>(null);
  const [modalAction, setModalAction] = useState<"APPROVED" | "REJECTED" | "CARGO_RECEIVED">("APPROVED");
  const [sellerNoteInput, setSellerNoteInput] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedStatus === "ALL" ? "/api/returns" : `/api/returns?status=${selectedStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.returns)) {
          setReturns(data.returns);
        }
      }
    } catch (e) {
      console.error("Failed to fetch returns:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const openActionModal = (ret: ReturnItem, action: "APPROVED" | "REJECTED" | "CARGO_RECEIVED") => {
    setActiveModalReturn(ret);
    setModalAction(action);
    setSellerNoteInput(
      action === "APPROVED"
        ? "İade talebiniz onaylandı. Lütfen anlaşmalı kargo kodu ile ürünü tarafımıza iletiniz."
        : action === "REJECTED"
        ? "Ürün iade koşullarına uymadığından dolayı talebiniz reddedilmiştir."
        : "İade edilen ürün satıcı şubemize ulaşmıştır, kontrol edilmektedir."
    );
  };

  const handleModerateReturn = async () => {
    if (!activeModalReturn) return;
    try {
      setActionLoading(true);
      setFeedback(null);

      const res = await fetch(`/api/returns/${activeModalReturn.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modalAction,
          sellerNote: sellerNoteInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İade durumu güncellenemedi.");
      }

      setFeedback({
        type: "success",
        message: `İade talebi başarıyla "${modalAction}" olarak güncellendi ve müşteriye bildirildi.`,
      });
      setActiveModalReturn(null);
      fetchReturns();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Bir hata oluştu." });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.order?.orderNumber?.toLowerCase().includes(q) ||
      r.orderItem?.product?.name?.toLowerCase().includes(q) ||
      `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: returns.length,
    pending: returns.filter((r) => r.status === "PENDING").length,
    approved: returns.filter((r) => r.status === "APPROVED" || r.status === "CARGO_RECEIVED").length,
    refunded: returns.filter((r) => r.status === "REFUNDED").length,
    totalRefundAmount: returns
      .filter((r) => r.status === "REFUNDED" || r.status === "APPROVED")
      .reduce((sum, r) => sum + r.refundAmount, 0),
  };

  const isEn = language === "en";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isEn ? "Approved (Waiting Courier)" : "Onaylandı (Kargo Bekleniyor)"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            {isEn ? "Rejected" : "Reddedildi"}
          </span>
        );
      case "CARGO_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" />
            {isEn ? "Parcel Received" : "Kargo Teslim Alındı"}
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isEn ? "Refunded" : "Ücret İade Edildi"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            {isEn ? "Pending Review" : "Yeni Talep (İnceleniyor)"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Title */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-text-subtle uppercase tracking-wider">
                  {isEn ? "Customer Satisfaction & After-Sales" : "Müşteri Memnuniyeti & Satış Sonrası"}
                </span>
                <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span>{isEn ? "Returns & Claims Management" : "İade & Değişim Yönetimi"}</span>
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/seller/dashboard/orders">
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    <Package className="w-3.5 h-3.5 mr-1" />
                    <span>{isEn ? "Go to Orders" : "Siparişlere Git"}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">
                  {isEn ? "Total Return Requests" : "Toplam İade Talebi"}
                </span>
                <span className="text-2xl font-black text-slate-900">{stats.total}</span>
              </div>
              <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1 bg-amber-50/30">
                <span className="text-xs font-bold text-amber-700">
                  {isEn ? "Pending Approval" : "Onay Bekleyenler"}
                </span>
                <span className="text-2xl font-black text-amber-900">{stats.pending}</span>
              </div>
              <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1 bg-emerald-50/30">
                <span className="text-xs font-bold text-emerald-700">
                  {isEn ? "Approved Returns" : "Onaylanan İadeler"}
                </span>
                <span className="text-2xl font-black text-emerald-900">{stats.approved}</span>
              </div>
              <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1 bg-purple-50/30">
                <span className="text-xs font-bold text-purple-700">
                  {isEn ? "Total Refund Amount" : "Toplam İade Tutarı"}
                </span>
                <span className="text-xl font-black text-purple-900">
                  {formatCurrency(stats.totalRefundAmount, currency)}
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

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: isEn ? "All" : "Tümü" },
                  { id: "PENDING", label: isEn ? `Pending (${stats.pending})` : `Bekleyenler (${stats.pending})` },
                  { id: "APPROVED", label: isEn ? "Approved" : "Onaylananlar" },
                  { id: "CARGO_RECEIVED", label: isEn ? "Parcel Received" : "Kargo Ulaşanlar" },
                  { id: "REFUNDED", label: isEn ? "Refunded" : "İadesi Yapılanlar" },
                  { id: "REJECTED", label: isEn ? "Rejected" : "Reddedilenler" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedStatus === tab.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search by Order No, Product, Customer..." : "Sipariş No, Ürün veya Müşteri Ara..."}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden bg-slate-50"
                />
              </div>
            </div>

            {/* Returns List */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                {isEn ? "Loading return requests..." : "İade talepleri yükleniyor..."}
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <RotateCcw className="w-10 h-10 text-slate-300" />
                <span className="font-bold text-sm text-slate-700">
                  {isEn ? "No return requests found." : "Seçilen kriterde iade talebi bulunamadı."}
                </span>
                <p className="text-xs text-slate-500 max-w-sm">
                  {isEn
                    ? "When a customer creates a return request for your store products, it will appear here."
                    : "Mağazanızın ürünlerine ait yeni bir iade talebi oluşturulduğunda burada listelenecektir."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredReturns.map((ret) => {
                  let evidenceList: string[] = [];
                  try {
                    evidenceList = JSON.parse(ret.evidenceImages || "[]");
                  } catch (e) {}

                  return (
                    <div
                      key={ret.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/seller/dashboard/orders/${ret.order?.id || ret.orderId}`}
                            className="font-black text-slate-900 hover:text-primary transition-colors flex items-center gap-1 text-sm"
                          >
                            <span>Sipariş #{ret.order?.orderNumber}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(ret.createdAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {getStatusBadge(ret.status)}
                      </div>

                      {/* Content Body */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Product & Customer Details */}
                        <div className="md:col-span-8 flex items-start gap-4">
                          <img
                            src={
                              ret.orderItem?.product?.imageUrl ||
                              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"
                            }
                            alt=""
                            className="w-16 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <span className="text-[10px] font-extrabold text-primary uppercase">
                              {ret.orderItem?.product?.brand || "Mağaza Ürünü"}
                            </span>
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {ret.orderItem?.product?.name || "Sipariş Ürünü"}
                            </span>
                            <div className="text-xs text-slate-600 mt-1">
                              <strong>Müşteri:</strong> {ret.user?.firstName} {ret.user?.lastName} ({ret.user?.email})
                            </div>
                            <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 mt-1">
                              <strong>İade Gerekçesi:</strong> {ret.reason}
                            </div>
                          </div>
                        </div>

                        {/* Financial & Moderation Action */}
                        <div className="md:col-span-4 flex flex-col justify-between items-start md:items-end gap-3 h-full border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                          <div className="text-left md:text-right">
                            <span className="text-[11px] font-bold text-slate-500 block">Talep Edilen İade Tutarı</span>
                            <span className="text-base font-black text-emerald-700">
                              {formatCurrency(ret.refundAmount, currency)}
                            </span>
                          </div>

                          {/* Action Buttons for Seller */}
                          {ret.status === "PENDING" && (
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => openActionModal(ret, "APPROVED")}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs flex-1 md:flex-initial"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionModal(ret, "REJECTED")}
                                className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex-1 md:flex-initial"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reddet
                              </Button>
                            </div>
                          )}

                          {ret.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionModal(ret, "CARGO_RECEIVED")}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs w-full md:w-auto"
                            >
                              <Truck className="w-3.5 h-3.5 mr-1" />
                              Kargo Teslim Alındı
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Evidence Photos Preview */}
                      {evidenceList.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                            Müşteri Tarafından Yüklenen Fotoğraf Kanıtları ({evidenceList.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {evidenceList.map((imgUrl, imgIdx) => (
                              <a
                                key={imgIdx}
                                href={imgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity bg-slate-100"
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Existing Seller & Admin Notes */}
                      {(ret.sellerNote || ret.adminNote) && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 text-xs">
                          {ret.sellerNote && (
                            <div className="flex items-start gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <span>
                                <strong>Satıcı Notunuz:</strong> {ret.sellerNote}
                              </span>
                            </div>
                          )}
                          {ret.adminNote && (
                            <div className="flex items-start gap-1.5 text-purple-800 bg-purple-50 p-2 rounded-lg border border-purple-200">
                              <MessageSquare className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                              <span>
                                <strong>Yönetici Notu:</strong> {ret.adminNote}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Moderation Modal */}
      {activeModalReturn && (
        <Modal
          isOpen={Boolean(activeModalReturn)}
          onClose={() => setActiveModalReturn(null)}
          title={`İade Talebi İşlemi #${activeModalReturn.order?.orderNumber}`}
          size="md"
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1">
              <span className="font-bold text-slate-800">
                {modalAction === "APPROVED"
                  ? "İadeyi Onaylamak Üzeresiniz"
                  : modalAction === "REJECTED"
                  ? "İadeyi Reddetmek Üzeresiniz"
                  : "Kargo Teslim Alındı Olarak İşaretlemek Üzeresiniz"}
              </span>
              <span className="text-slate-600">
                Müşteri: {activeModalReturn.user?.firstName} {activeModalReturn.user?.lastName} — Tutar:{" "}
                <strong>{formatCurrency(activeModalReturn.refundAmount, currency)}</strong>
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">Müşteriye İletilecek Satıcı Açıklaması / Kargo Kodu</label>
              <textarea
                rows={3}
                value={sellerNoteInput}
                onChange={(e) => setSellerNoteInput(e.target.value)}
                placeholder="Müşteriye iletilecek notu yazınız..."
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-normal focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setActiveModalReturn(null)}
                className="font-bold"
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={handleModerateReturn}
                className={`font-bold ${
                  modalAction === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : modalAction === "REJECTED"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionLoading ? "İşleniyor..." : "Onayla ve Müşteriye Bildir"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}
