"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { SellerReview } from "@/lib/sellers/seller-types";
import { Rating } from "@/components/ui/rating";
import { useLanguage } from "@/lib/i18n/language-context";
import { Star, EyeOff, Eye } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_REVIEWS_KEY = "cadde-store-admin-reviews";

export default function AdminReviewsPage() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<(SellerReview & { hidden?: boolean })[]>([]);

  useEffect(() => {
    const base = getSellerBySlug("trend-fashion-magazasi")?.reviews || [];
    try {
      const saved = localStorage.getItem(ADMIN_REVIEWS_KEY);
      if (saved) {
        setReviews(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setReviews(base.map((r) => ({ ...r, hidden: false })));
  }, []);

  const handleToggleHide = (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r));
    setReviews(updated);
    try {
      localStorage.setItem(ADMIN_REVIEWS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const countBadgeText = t("admin.reviews.countBadge").replace("{count}", String(reviews.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.reviews.title")}</span>
                    <span className="text-xs bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">{t("admin.reviews.subtitle")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.reviews.thCustomer")}</th>
                      <th className="p-3">{t("admin.reviews.thProduct")}</th>
                      <th className="p-3">{t("admin.reviews.thRating")}</th>
                      <th className="p-3">{t("admin.reviews.thComment")}</th>
                      <th className="p-3">{t("admin.reviews.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.reviews.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-text-main">{rev.userName}</td>
                        <td className="p-3 font-semibold text-indigo-600">{rev.productName}</td>
                        <td className="p-3">
                          <Rating rating={rev.rating} size="sm" />
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs truncate">{rev.comment}</td>
                        <td className="p-3">
                          {rev.hidden ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                              {t("admin.reviews.statusHidden")}
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                              {t("admin.reviews.statusPublished")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleHide(rev.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                          >
                            {rev.hidden ? t("admin.reviews.btnPublish") : t("admin.reviews.btnHide")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
