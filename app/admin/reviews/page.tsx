"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { Rating } from "@/components/ui/rating";
import { useLanguage } from "@/lib/i18n/language-context";
import { Star, RefreshCw, CheckCircle2, EyeOff, Eye } from "lucide-react";
import { Footer } from "@/components/layout/footer";

interface AdminReviewItem {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  status: string; // PUBLISHED | HIDDEN | PENDING | REJECTED
  date: string;
  sellerReply?: string;
}

export default function AdminReviewsPage() {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const prodRes = await fetch("/api/products");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const products = prodData.products || [];

        if (products.length > 0) {
          const promises = products.slice(0, 30).map(async (p: any) => {
            try {
              const rRes = await fetch(`/api/reviews?productId=${p.id}`);
              if (rRes.ok) {
                const rData = await rRes.json();
                return (rData.reviews || []).map((rev: any) => ({
                  id: rev.id,
                  productId: p.id,
                  productName: p.name,
                  userName: rev.user
                    ? `${rev.user.firstName} ${rev.user.lastName}`.trim()
                    : "Müşteri",
                  rating: rev.rating,
                  comment: rev.comment,
                  status: rev.status || "PUBLISHED",
                  date: new Date(rev.createdAt).toLocaleDateString(
                    language === "en" ? "en-US" : "tr-TR"
                  ),
                  sellerReply: rev.sellerReply,
                }));
              }
            } catch (err) {}
            return [];
          });

          const results = await Promise.all(promises);
          const flattened = results.flat();
          if (flattened.length > 0) {
            setReviews(flattened);
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load reviews from API, using fallback", e);
    }

    const base = getSellerBySlug("trend-fashion-magazasi")?.reviews || [];
    setReviews(
      base.map((r) => ({
        id: r.id,
        productId: "p-1",
        productName: r.productName,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        status: "PUBLISHED",
        date: r.date,
        sellerReply: r.reply,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [language]);

  const handleToggleStatus = async (review: AdminReviewItem) => {
    const nextStatus = review.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
    setIsUpdating(review.id);

    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r))
        );
      }
    } catch (e) {
      console.error("Failed to moderate review status", e);
    } finally {
      setIsUpdating(null);
    }
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

              <button
                onClick={fetchReviews}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>{isEn ? "Refresh" : "Yenile"}</span>
              </button>
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
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {isEn ? "No reviews found." : "Değerlendirme bulunamadı."}
                        </td>
                      </tr>
                    ) : (
                      reviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-text-main">{rev.userName}</td>
                          <td className="p-3 font-semibold text-indigo-600 max-w-[180px] truncate">
                            {rev.productName}
                          </td>
                          <td className="p-3">
                            <Rating rating={rev.rating} size="sm" />
                          </td>
                          <td className="p-3 text-slate-700 max-w-xs">
                            <p className="line-clamp-2">{rev.comment}</p>
                            {rev.sellerReply && (
                              <p className="mt-1 text-[11px] text-primary font-bold line-clamp-1">
                                {isEn ? "Reply: " : "Yanıt: "} {rev.sellerReply}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            {rev.status === "PUBLISHED" ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{t("admin.reviews.statusPublished")}</span>
                              </span>
                            ) : (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-fit">
                                <EyeOff className="w-3 h-3 text-rose-600" />
                                <span>{t("admin.reviews.statusHidden")}</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(rev)}
                              disabled={isUpdating === rev.id}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              {rev.status === "PUBLISHED" ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                                  <span>{t("admin.reviews.btnHide")}</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{t("admin.reviews.btnPublish")}</span>
                                </>
                              )}
                            </button>
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

      <Footer />
    </div>
  );
}
