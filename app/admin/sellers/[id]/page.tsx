"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Star,
  Users,
  Store,
  Percent,
  CheckCircle2,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function AdminSellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [seller, setSeller] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchSeller = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sellers");
      if (res.ok) {
        const data = await res.json();
        if (data.sellers) {
          const found = data.sellers.find((s: any) => s.slug === id || s.id === id);
          if (found) {
            setSeller(found);
            setCommissionRate(found.commissionRate ? Math.round(found.commissionRate * 100) : 10);
            return;
          }
        }
      }

      // Public fallback
      const pubRes = await fetch(`/api/sellers?slug=${id}`);
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.seller) {
          setSeller(pubData.seller);
          setCommissionRate(pubData.seller.commissionRate ? Math.round(pubData.seller.commissionRate * 100) : 10);
        }
      }
    } catch (e) {
      console.error("Fetch seller error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSeller();
  }, [id]);

  const handleUpdateSeller = async (updates: { verified?: boolean; status?: string; commissionRate?: number }) => {
    if (!seller) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: seller.id,
          ...updates,
        }),
      });

      if (res.ok) {
        showFeedback(isEn ? "Seller profile updated successfully" : "Satıcı profili başarıyla güncellendi");
        await fetchSeller();
      } else {
        const err = await res.json();
        alert(err.error || "Güncelleme başarısız.");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex justify-center flex-1">
          <div className="animate-spin w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center flex-1 gap-4">
          <Store className="w-12 h-12 text-slate-400" />
          <h2 className="text-base font-bold text-slate-700">{isEn ? "Seller not found" : "Satıcı bulunamadı"}</h2>
          <Link href="/admin/sellers" className="text-xs font-bold text-indigo-600 underline">
            &larr; {isEn ? "Back to Sellers" : "Satıcılar Listesine Dön"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

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
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/admin/sellers" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-text-main">{seller.storeName}</h1>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                        seller.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : seller.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {seller.status}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    slug: {seller.slug} • {isEn ? "ID:" : "Satıcı No:"} {seller.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {seller.status === "PENDING" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateSeller({ status: "ACTIVE", verified: true })}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    <span>{t("admin.sellers.btnApprove")}</span>
                  </Button>
                ) : seller.status === "ACTIVE" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateSeller({ status: "SUSPENDED" })}
                    className="border-rose-300 text-rose-700 bg-rose-50 font-bold"
                  >
                    <span>{t("admin.sellers.btnSuspend")}</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateSeller({ status: "ACTIVE" })}
                    className="bg-slate-900 text-white font-bold"
                  >
                    <span>{isEn ? "Re-activate Store" : "Mağazayı Yeniden Aç"}</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleUpdateSeller({ verified: !seller.verified })}
                  className={seller.verified ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "font-bold"}
                >
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>{seller.verified ? (isEn ? "Verified ✓" : "Onaylı Rozetli") : (isEn ? "Add Verified Badge" : "Onay Rozeti Ver")}</span>
                </Button>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider">{t("admin.sellers.sellerInfo")}</span>
                <div className="flex items-center gap-3">
                  <img
                    src={seller.logo || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80"}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-text-main">{seller.storeName}</span>
                    <span className="text-text-muted">
                      {new Date(seller.createdAt).toLocaleDateString("tr-TR")} tarihinden beri üye
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed pt-2">
                  {typeof seller.description === "object" ? seller.description[language] || seller.description.tr : seller.description || "Açıklama belirtilmedi."}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider">{t("admin.sellers.contactInfo")}</span>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{seller.user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{seller.user?.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{seller.followers || 0} Takipçi • Yanıt Oranı: {seller.responseRate || "%99"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Percent className="w-4 h-4 text-indigo-600" />
                  <span>Platform Komisyonu: %{commissionRate}</span>
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
