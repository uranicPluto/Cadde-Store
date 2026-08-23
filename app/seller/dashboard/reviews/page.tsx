"use client";

import React, { useState, useEffect } from "react";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { SellerReview } from "@/lib/sellers/seller-types";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { Star, MessageSquare, Send, RefreshCw } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function SellerReviewsPage() {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch seller's products
      const prodRes = await fetch("/api/products");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const products = prodData.products || [];

        if (products.length > 0) {
          // 2. Fetch reviews for each product
          const reviewPromises = products.slice(0, 20).map(async (p: any) => {
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
                  date: new Date(rev.createdAt).toLocaleDateString(
                    language === "en" ? "en-US" : "tr-TR"
                  ),
                  comment: rev.comment,
                  reply: rev.sellerReply || undefined,
                  replyDate: rev.sellerReply
                    ? new Date(rev.updatedAt || rev.createdAt).toLocaleDateString(
                        language === "en" ? "en-US" : "tr-TR"
                      )
                    : undefined,
                  helpfulCount: 0,
                }));
              }
            } catch (err) {}
            return [];
          });

          const results = await Promise.all(reviewPromises);
          const allReviews = results.flat();

          if (allReviews.length > 0) {
            setReviews(allReviews);
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load real reviews from API, using fallback", e);
    }

    const base = getSellerBySlug("trend-fashion-magazasi")?.reviews || [];
    setReviews(base);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [language]);

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          sellerReply: replyText.trim(),
        }),
      });

      if (res.ok) {
        const dateStr = new Date().toLocaleDateString(language === "en" ? "en-US" : "tr-TR");
        const updated = reviews.map((r) =>
          r.id === reviewId
            ? { ...r, reply: replyText.trim(), replyDate: dateStr }
            : r
        );
        setReviews(updated);
        setReplyingId(null);
        setReplyText("");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Yanıt gönderilemedi.");
      }
    } catch (e) {
      console.error("Failed to submit seller reply", e);
      setErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const countBadgeText = t("seller.reviews.countBadge").replace("{count}", String(reviews.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("seller.reviews.title")}</span>
                    <span className="text-xs bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("seller.reviews.subtitle")}
                  </span>
                </div>
              </div>

              <button
                onClick={fetchReviews}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>{language === "en" ? "Refresh" : "Yenile"}</span>
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs font-bold text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Reviews List */}
            <div className="flex flex-col gap-4">
              {reviews.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-text-muted">
                  {language === "en" ? "No customer reviews yet." : "Henüz müşteri değerlendirmesi bulunmuyor."}
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-text-main">{rev.userName}</span>
                        <span className="text-text-subtle">•</span>
                        <Rating rating={rev.rating} size="sm" />
                      </div>
                      <span className="text-[11px] text-text-subtle font-medium">{rev.date}</span>
                    </div>

                    <span className="text-xs font-bold text-primary">{rev.productName}</span>
                    <p className="text-xs text-slate-700 font-medium">{rev.comment}</p>

                    {/* Existing Reply or Reply Box */}
                    {rev.reply ? (
                      <div className="mt-2 p-3 bg-primary-light/30 border border-primary/20 rounded-xl text-xs flex flex-col gap-1">
                        <span className="font-extrabold text-primary">
                          {t("seller.reviews.yourReply").replace("{date}", rev.replyDate || "")}
                        </span>
                        <p className="text-slate-800 font-medium">{rev.reply}</p>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        {replyingId === rev.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={t("seller.reviews.placeholderReply")}
                              className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:bg-white min-h-[70px]"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReplyingId(null);
                                  setReplyText("");
                                }}
                              >
                                {t("seller.reviews.cancel")}
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSendReply(rev.id)}
                                disabled={isSubmitting || !replyText.trim()}
                                className="font-bold"
                              >
                                <Send className="w-3.5 h-3.5 mr-1" />
                                <span>{t("seller.reviews.sendReply")}</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingId(rev.id);
                              setReplyText("");
                            }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t("seller.reviews.replyToThis")}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
