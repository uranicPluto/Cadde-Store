"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Store,
  Search,
  ShieldCheck,
  Check,
  Ban,
  RefreshCw,
  Eye,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Footer } from "@/components/layout/footer";

export interface DbSeller {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string;
  logo: string;
  banner?: string | null;
  rating: number;
  verified: boolean;
  followers: number;
  responseRate: string;
  status: string; // PENDING | ACTIVE | SUSPENDED | REJECTED
  commissionRate?: number;
  shippingPolicy?: string | null;
  returnPolicy?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  products?: any[];
  orderGroups?: any[];
}

export default function AdminSellersPage() {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [sellers, setSellers] = useState<DbSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Commission Modal State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<DbSeller | null>(null);
  const [commissionInput, setCommissionInput] = useState<number>(10);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sellers");
      if (res.ok) {
        const data = await res.json();
        if (data.sellers) {
          setSellers(data.sellers);
          return;
        }
      }
      // Fallback to public sellers endpoint if needed
      const pubRes = await fetch("/api/sellers");
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.sellers) setSellers(pubData.sellers);
      }
    } catch (e) {
      console.error("Failed to load sellers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateSeller = async (
    sellerId: string,
    updates: { verified?: boolean; status?: string; commissionRate?: number }
  ) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          ...updates,
        }),
      });

      if (res.ok) {
        showFeedback(isEn ? "Merchant status updated with audit log" : "Satıcı durumu güncellendi ve denetim kaydı oluşturuldu");
        await fetchSellers();
      } else {
        const err = await res.json();
        alert(err.error || "Güncelleme başarısız.");
      }
    } catch (err) {
      console.error("Seller update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCommissionModal = (s: DbSeller) => {
    setSelectedSeller(s);
    setCommissionInput(s.commissionRate ? Math.round(s.commissionRate * 100) : 10);
    setIsCommissionModalOpen(true);
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;

    const rateFraction = commissionInput / 100;
    await handleUpdateSeller(selectedSeller.id, { commissionRate: rateFraction });
    setIsCommissionModalOpen(false);
  };

  const filtered = sellers.filter((s) => {
    const ownerEmail = s.user?.email || "";
    const matchesSearch =
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "ACTIVE") return matchesSearch && s.status === "ACTIVE";
    if (statusFilter === "PENDING") return matchesSearch && s.status === "PENDING";
    if (statusFilter === "SUSPENDED") return matchesSearch && s.status === "SUSPENDED";
    if (statusFilter === "VERIFIED") return matchesSearch && s.verified;

    return matchesSearch;
  });

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
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.sellers.title")}</span>
                    <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {filtered.length} {isEn ? "Sellers" : "Satıcı"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {isEn
                      ? "Approve merchant applications, manage commission rates, verified badges, and suspend stores."
                      : "Satıcı başvurularını onaylayın, komisyon oranlarını (%8-%20) belirleyin ve mağazaları yönetin."}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.sellers.searchPlaceholder")}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                    }`}
                  >
                    {t("admin.sellers.filterAll")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ACTIVE")}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === "ACTIVE" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                    }`}
                  >
                    {isEn ? "Active" : "Aktif"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("PENDING")}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === "PENDING" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                    }`}
                  >
                    {isEn ? "Pending Review" : "Onay Bekleyen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("SUSPENDED")}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === "SUSPENDED" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                    }`}
                  >
                    {isEn ? "Suspended" : "Askıya Alınan"}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.sellers.thSeller")}</th>
                      <th className="p-3">{isEn ? "Commission Rate" : "Komisyon Oranı"}</th>
                      <th className="p-3">{t("admin.sellers.thRating")}</th>
                      <th className="p-3">{isEn ? "Products / Orders" : "Ürün / Sipariş"}</th>
                      <th className="p-3">{t("admin.sellers.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.sellers.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {isEn ? "Loading merchants from database..." : "Satıcılar veritabanından yükleniyor..."}
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {t("admin.sellers.noSellersFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((s) => {
                        const commissionDisplay = s.commissionRate !== undefined ? `%${Math.round(s.commissionRate * 100)}` : "%10";

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={s.logo || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80"}
                                  alt=""
                                  className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-text-main text-xs">{s.storeName}</span>
                                    {s.verified && (
                                      <span title={isEn ? "Verified Seller" : "Onaylı Mağaza"}>
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-text-subtle">{s.user?.email || `slug: ${s.slug}`}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => handleOpenCommissionModal(s)}
                                className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 flex items-center gap-1 transition-colors"
                                title={isEn ? "Click to change commission" : "Komisyonu değiştirmek için tıklayın"}
                              >
                                <Percent className="w-3 h-3" />
                                <span>{commissionDisplay}</span>
                              </button>
                            </td>

                            <td className="p-3 font-extrabold text-amber-600">
                              {s.rating ? `${s.rating.toFixed(1)} ★` : "5.0 ★"}
                            </td>

                            <td className="p-3 font-bold">
                              <span className="text-slate-800">{s.products?.length || 0} {isEn ? "prod." : "ürün"}</span>
                              <span className="text-slate-400 text-[10px] ml-1">({s.orderGroups?.length || 0} {isEn ? "orders" : "sipariş"})</span>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                    s.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : s.status === "PENDING"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {s.status === "PENDING" ? (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleUpdateSeller(s.id, { status: "ACTIVE", verified: true })}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                                  >
                                    {t("admin.sellers.btnApprove")}
                                  </button>
                                ) : s.status === "ACTIVE" ? (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleUpdateSeller(s.id, { status: "SUSPENDED" })}
                                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-colors"
                                  >
                                    {t("admin.sellers.btnSuspend")}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleUpdateSeller(s.id, { status: "ACTIVE" })}
                                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors"
                                  >
                                    {isEn ? "Re-activate" : "Yeniden Aktifleştir"}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateSeller(s.id, { verified: !s.verified })}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    s.verified
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "text-slate-400 border-slate-200 hover:bg-slate-50"
                                  }`}
                                  title={s.verified ? (isEn ? "Remove verified badge" : "Onay rozetini kaldır") : (isEn ? "Add verified badge" : "Onay rozeti ver")}
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                </button>

                                <Link
                                  href={`/admin/sellers/${s.slug}`}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600"
                                  title={t("admin.sellers.btnViewDetails")}
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Adjust Commission Rate Modal */}
      <Modal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        title={isEn ? "Configure Merchant Commission Rate" : "Satıcı Komisyon Oranını Ayarla"}
      >
        <form onSubmit={handleSaveCommission} className="flex flex-col gap-4 text-xs p-1">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-semibold">{isEn ? "Store Name:" : "Mağaza:"}</span>{" "}
            <strong className="text-slate-900">{selectedSeller?.storeName}</strong>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">
              {isEn ? "Commission Percentage (%):" : "Komisyon Oranı (%):"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                required
                value={commissionInput}
                onChange={(e) => setCommissionInput(parseInt(e.target.value) || 0)}
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm outline-none focus:border-indigo-600 w-32"
              />
              <span className="font-bold text-slate-600">% (Örn: %8, %10, %12, %15, %20)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCommissionModalOpen(false)}
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isEn ? "Save Commission" : "Oranı Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
