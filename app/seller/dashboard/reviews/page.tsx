"use client";

import React, { useState, useEffect } from "react";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { SellerReview } from "@/lib/sellers/seller-types";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Send } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const SELLER_REVIEWS_KEY = "cadde-store-seller-reviews";

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const base = getSellerBySlug("trend-fashion-magazasi")?.reviews || [];
    try {
      const saved = localStorage.getItem(SELLER_REVIEWS_KEY);
      if (saved) {
        setReviews(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setReviews(base);
  }, []);

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const updated = reviews.map((r) =>
      r.id === reviewId
        ? { ...r, reply: replyText, replyDate: new Date().toLocaleDateString("tr-TR") }
        : r
    );
    setReviews(updated);
    setReplyingId(null);
    setReplyText("");
    try {
      localStorage.setItem(SELLER_REVIEWS_KEY, JSON.stringify(updated));
    } catch (e) {}
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>Müşteri Değerlendirmeleri</span>
                    <span className="text-xs bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {reviews.length} Yorum
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    Müşterilerinizin ürünlerinize yazdığı yorumları yanıtlayın.
                  </span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
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
                      <span className="font-extrabold text-primary">Yanıtınız ({rev.replyDate}):</span>
                      <p className="text-slate-800 font-medium">{rev.reply}</p>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      {replyingId === rev.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Müşterinize vereceğiniz nazik yanıtı buraya yazınız..."
                            className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:bg-white min-h-[70px]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setReplyingId(null)}>
                              İptal
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => handleSendReply(rev.id)} className="font-bold">
                              <Send className="w-3.5 h-3.5 mr-1" />
                              <span>Yanıtı Gönder</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReplyingId(rev.id)}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Bu Yorumu Yanıtla</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
