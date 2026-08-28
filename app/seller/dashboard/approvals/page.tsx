"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  Layers,
  Sparkles,
  Store,
  Tag,
  Flame,
  MessageSquare,
  Lock,
  Unlock,
} from "lucide-react";

interface ApprovalData {
  approvalStatus: string;
  requestedBy: string | null;
  requestedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  sellerNotes: string | null;
  sections: any[];
}

export default function SellerHomepageApprovalPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [data, setData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [sellerNotes, setSellerNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchApprovalDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/homepage-approval");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load approval data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalDetails();
  }, []);

  const handleApprove = async () => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/seller/homepage-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", sellerNotes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Approval failed");

      setStatusMessage({
        type: "success",
        text: isEn
          ? "Homepage layout changes successfully approved and confirmed!"
          : "Ana sayfa vitrin değişiklikleri başarıyla onaylandı ve teyit edildi!",
      });
      await fetchApprovalDetails();
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Approval failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/seller/homepage-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason, sellerNotes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Rejection failed");

      setRejectionModalOpen(false);
      setRejectionReason("");
      setStatusMessage({
        type: "success",
        text: isEn
          ? "Changes rejected and feedback sent to administrators."
          : "Değişiklikler reddedildi ve geri bildirim yöneticilere iletildi.",
      });
      await fetchApprovalDetails();
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Rejection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const status = data?.approvalStatus || "DRAFT";
  const isPending = status === "PENDING_SELLER_APPROVAL";
  const isApproved = status === "SELLER_APPROVED";
  const isRejected = status === "SELLER_REJECTED";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <SellerSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SellerHeader />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  {isEn ? "Merchant Governance Gate" : "Satıcı Onay & Teyit Merkezi"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {isEn ? "Homepage Layout Approvals" : "Ana Sayfa Vitrin Değişiklik Onayları"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isEn
                  ? "As a verified marketplace merchant, review and approve proposed storefront homepage changes before they go live."
                  : "Doğrulanmış satıcı olarak, ana sayfada yayınlanacak vitrin ve kampanya değişikliklerini inceleyin ve onaylayın."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(!previewOpen)}
                className="text-xs font-bold"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span>{previewOpen ? (isEn ? "Hide Preview" : "Önizlemeyi Gizle") : isEn ? "Live Preview" : "Canlı Önizleme"}</span>
              </Button>
            </div>
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Main Status Hero Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isPending
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : isApproved
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : isRejected
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {isPending ? (
                    <Clock className="w-7 h-7 animate-pulse" />
                  ) : isApproved ? (
                    <Unlock className="w-7 h-7" />
                  ) : isRejected ? (
                    <XCircle className="w-7 h-7" />
                  ) : (
                    <Lock className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">STATUS:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                        isPending
                          ? "bg-amber-500 text-white"
                          : isApproved
                          ? "bg-emerald-600 text-white"
                          : isRejected
                          ? "bg-rose-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isPending
                        ? isEn ? "Pending Seller Approval" : "Satıcı Onayı Bekliyor"
                        : isApproved
                        ? isEn ? "Approved & Confirmed" : "Satıcı Tarafından Onaylandı"
                        : isRejected
                        ? isEn ? "Rejected by Seller" : "Satıcı Tarafından Reddedildi"
                        : isEn ? "Draft in Progress" : "Taslak Aşamasında"}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {isPending
                      ? isEn
                        ? "New Homepage Changes Awaiting Your Confirmation"
                        : "Onayınızı Bekleyen Yeni Ana Sayfa Vitrin Değişiklikleri Var"
                      : isApproved
                      ? isEn
                        ? "Homepage Layout is Confirmed & Ready to Publish"
                        : "Ana Sayfa Düzeni Teyit Edildi ve Canlıya Yayınlanmaya Hazır"
                      : isRejected
                      ? isEn
                        ? "Changes Were Rejected"
                        : "Değişiklikler Reddedildi"
                      : isEn
                      ? "No Pending Approvals"
                      : "Bekleyen Onay Bulunmuyor"}
                  </h2>

                  <p className="text-xs text-slate-600">
                    {isPending
                      ? isEn
                        ? `Requested by ${data?.requestedBy || "Site Administrator"} on ${
                            data?.requestedAt ? new Date(data.requestedAt).toLocaleString() : "recently"
                          }.`
                        : `${data?.requestedBy || "Yönetici"} tarafından ${
                            data?.requestedAt ? new Date(data.requestedAt).toLocaleString("tr-TR") : "kısa süre önce"
                          } onaya sunuldu.`
                      : isApproved
                      ? isEn
                        ? `Approved by ${data?.approvedBy || "You"} on ${
                            data?.approvedAt ? new Date(data.approvedAt).toLocaleString() : ""
                          }.`
                        : `${data?.approvedBy || "Siz"} tarafından ${
                            data?.approvedAt ? new Date(data.approvedAt).toLocaleString("tr-TR") : ""
                          } tarihinde onaylandı.`
                      : isEn
                      ? "When administrators create or reorder homepage sections, they submit them here for merchant confirmation."
                      : "Yöneticiler ana sayfa düzeninde değişiklik yaptığında burada inceleyip onaylamanız istenir."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {isPending && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setRejectionModalOpen(true)}
                      disabled={actionLoading}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      <span>{isEn ? "Reject / Request Changes" : "Reddet / Düzeltme İste"}</span>
                    </Button>

                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      <span>{actionLoading ? (isEn ? "Approving..." : "Onaylanıyor...") : isEn ? "Approve & Confirm Changes" : "Değişiklikleri Onayla & Teyit Et"}</span>
                    </Button>
                  </>
                )}

                {isApproved && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isEn ? "Confirmed & Ready" : "Teyit Edildi — Canlıya Alınabilir"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason Display */}
            {isRejected && data?.rejectionReason && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  {isEn ? "Rejection Reason:" : "Reddetme Gerekçesi:"}
                </span>
                <p className="text-rose-800 pl-5">{data.rejectionReason}</p>
              </div>
            )}

            {/* Section Breakdown Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>
                    {isEn
                      ? `Proposed Layout Sections (${data?.sections?.length || 0})`
                      : `Önerilen Vitrin Bölümleri (${data?.sections?.length || 0})`}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data?.sections && data.sections.length > 0 ? (
                  data.sections.map((sec: any, idx: number) => (
                    <div
                      key={sec.id || idx}
                      className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                          {sec.type}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {isEn ? sec.titleEN || sec.titleTR : sec.titleTR || sec.titleEN}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {sec.banners?.length > 0 ? `${sec.banners.length} banner/öğe` : "Dinamik katalog alanı"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-xs text-slate-400">
                    {isEn ? "No draft layout currently loaded." : "Yüklü taslak bulunamadı."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Storefront Preview Drawer / Box */}
          {previewOpen && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  {isEn ? "Live Storefront Visual Preview" : "Canlı Vitrin Görsel Önizlemesi"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">https://cadde-store.vercel.app</span>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 h-[600px]">
                <iframe
                  src="/"
                  title="Homepage Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>{isEn ? "Reject Homepage Changes" : "Ana Sayfa Değişikliklerini Reddet"}</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              {isEn
                ? "Please explain why this layout is being rejected so administrators can make adjustments."
                : "Yöneticilerin gerekli düzenlemeleri yapabilmesi için reddetme gerekçenizi belirtin."}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? "Rejection Reason (Required):" : "Reddetme Gerekçesi (Zorunlu):"}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={
                  isEn
                    ? "e.g. The featured brand discount banner is outdated or product section order needs revision..."
                    : "Örn: Öne çıkan kampanya görseli güncel değil veya ürün bölümü sıralamasının değişmesi gerekiyor..."
                }
                rows={3}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectionModalOpen(false)}
                className="text-xs font-bold"
              >
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>

              <Button
                size="sm"
                disabled={!rejectionReason.trim() || actionLoading}
                onClick={handleReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                <span>{actionLoading ? (isEn ? "Submitting..." : "Gönderiliyor...") : isEn ? "Confirm Rejection" : "Reddi Onayla"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
