"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Tag, Plus, Check, Ban, Trash2, Edit2, RefreshCw, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Footer } from "@/components/layout/footer";

interface CouponItem {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumOrder?: number | null;
  maximumDiscount?: number | null;
  expiresAt?: string | null;
  active: boolean;
  usageLimit?: number | null;
  usageCount?: number;
  createdAt?: string;
}

export default function AdminCouponsPage() {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<CouponItem>>({});
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error("Failed to load coupons:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon({
      code: "",
      type: "PERCENTAGE",
      value: 15,
      minimumOrder: 250,
      maximumDiscount: 200,
      active: true,
      usageLimit: 500,
      expiresAt: "",
    });
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon.code || editingCoupon.value === undefined) return;

    setSaving(true);
    try {
      if (editingCoupon.id) {
        // Update
        const res = await fetch("/api/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCoupon),
        });
        if (res.ok) {
          showFeedback(isEn ? "Coupon updated successfully" : "Kupon başarıyla güncellendi");
          setIsModalOpen(false);
          fetchCoupons();
        }
      } else {
        // Create
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCoupon),
        });
        if (res.ok) {
          showFeedback(isEn ? "New coupon created successfully" : "Yeni kupon başarıyla oluşturuldu");
          setIsModalOpen(false);
          fetchCoupons();
        }
      }
    } catch (err) {
      console.error("Error saving coupon:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, code: coupon.code, active: !coupon.active }),
      });
      if (res.ok) {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
        showFeedback(isEn ? "Coupon status updated" : "Kupon durumu güncellendi");
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete coupon ${code}?` : `${code} kuponunu silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/coupons?id=${id}&code=${code}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id && c.code !== code));
        showFeedback(isEn ? "Coupon deleted" : "Kupon silindi");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const countBadgeText = t("admin.coupons.countBadge").replace("{count}", String(coupons.length));

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
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.coupons.title")}</span>
                    <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">{t("admin.coupons.subtitle")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCoupons}
                  className="border-slate-200 text-slate-700 font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{isEn ? "Refresh" : "Yenile"}</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAdd}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{isEn ? "Create Coupon" : "Kupon Oluştur"}</span>
                </Button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.coupons.thCode")}</th>
                      <th className="p-3">{t("admin.coupons.thDiscount")}</th>
                      <th className="p-3">{t("admin.coupons.thMinSubtotal")}</th>
                      <th className="p-3">{isEn ? "Usage Count" : "Kullanım"}</th>
                      <th className="p-3">{t("admin.coupons.thStatus")}</th>
                      <th className="p-3 text-right">{isEn ? "Actions" : "İşlemler"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {isEn ? "No coupons found." : "Henüz kupon bulunmuyor."}
                        </td>
                      </tr>
                    ) : (
                      coupons.map((c) => (
                        <tr key={c.id || c.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-indigo-600 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-indigo-700 font-black">
                                {c.code}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-900 font-bold">
                            {c.type === "PERCENTAGE"
                              ? `%${c.value} ${isEn ? "Discount" : "İndirim"}`
                              : c.type === "FREE_SHIPPING"
                              ? isEn ? "Free Cargo" : "Ücretsiz Kargo"
                              : `${formatCurrency(c.value, currency)} ${isEn ? "Discount" : "İndirim"}`}
                          </td>
                          <td className="p-3 font-bold text-text-main">
                            {c.minimumOrder ? formatCurrency(c.minimumOrder, currency) : isEn ? "None" : "Yok"}
                          </td>
                          <td className="p-3 text-slate-600 font-semibold">
                            {c.usageCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : ""}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                c.active
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {c.active ? t("admin.coupons.statusActive") : isEn ? "Inactive" : "Pasif"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(c)}
                                title={c.active ? (isEn ? "Deactivate" : "Pasife Al") : (isEn ? "Activate" : "Aktif Et")}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  c.active
                                    ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                                    : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                }`}
                              >
                                {c.active ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(c.id, c.code)}
                                title={isEn ? "Delete" : "Sil"}
                                className="p-1.5 text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon.id ? (isEn ? "Edit Coupon" : "Kupon Düzenle") : (isEn ? "Create New Coupon" : "Yeni Kupon Tanımla")}
      >
        <form onSubmit={handleSaveCoupon} className="flex flex-col gap-4 text-xs p-1">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "Coupon Code *" : "Kupon Kodu *"}</label>
            <input
              type="text"
              required
              value={editingCoupon.code || ""}
              onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
              placeholder="Örn: CADDE20, BAHAR50"
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-black uppercase text-indigo-700 tracking-wider outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Discount Type" : "İndirim Tipi"}</label>
              <select
                value={editingCoupon.type || "PERCENTAGE"}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, type: e.target.value })}
                className="h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="PERCENTAGE">{isEn ? "Percentage (%)" : "Yüzde (%)"}</option>
                <option value="FIXED">{isEn ? "Fixed Amount (TL)" : "Sabit Tutar (TL)"}</option>
                <option value="FREE_SHIPPING">{isEn ? "Free Shipping" : "Ücretsiz Kargo"}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">
                {editingCoupon.type === "PERCENTAGE" ? (isEn ? "Discount Percentage (%) *" : "İndirim Yüzdesi (%) *") : (isEn ? "Discount Amount (TL) *" : "İndirim Tutarı (TL) *")}
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={editingCoupon.value ?? ""}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Min Cart Subtotal (TL)" : "Min. Sepet Tutarı (TL)"}</label>
              <input
                type="number"
                value={editingCoupon.minimumOrder ?? ""}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, minimumOrder: parseFloat(e.target.value) || null })}
                placeholder="Örn: 250"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Usage Limit" : "Kullanım Limiti"}</label>
              <input
                type="number"
                value={editingCoupon.usageLimit ?? ""}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: parseInt(e.target.value) || null })}
                placeholder="Örn: 500"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="couponActiveCheck"
              checked={editingCoupon.active ?? true}
              onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="couponActiveCheck" className="font-bold text-slate-800 cursor-pointer">
              {isEn ? "Active coupon (valid for customer checkouts)" : "Aktif kupon (müşteri sepetinde kullanılabilir)"}
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="font-bold"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {saving ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save Coupon" : "Kuponu Kaydet")}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
