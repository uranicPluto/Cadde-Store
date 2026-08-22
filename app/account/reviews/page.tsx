"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Star, MessageSquare, ThumbsUp, CheckCircle, Camera, Edit3, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  sellerName: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
}

interface PendingReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  sellerName: string;
  deliveryDate: string;
  orderNumber: string;
}

export default function MyReviewsPage() {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"reviewed" | "pending">("reviewed");
  const [reviews, setReviews] = useState<UserReview[]>([
    {
      id: "rev-1",
      productId: "w1",
      productName: isEn ? "Chiffon Patterned Midi Dress - Burgundy" : "Desenli Şifon Midi Elbise - Bordo",
      productImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
      productSlug: "zara-desenli-sifon-elbise-bordo",
      sellerName: "Trend Fashion Mağazası",
      rating: 5,
      date: "14.08.2026",
      comment: isEn
        ? "The fabric quality and cut is absolutely stunning! Fits true to size and arrived in perfect packaging within 2 days."
        : "Kumaşı ve duruşu harika! Tam bedeninizi alabilirsiniz, 2 gün içinde çok özenli paketleme ile ulaştı.",
      photos: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80",
      ],
      helpfulCount: 18,
      isVerifiedPurchase: true,
    },
    {
      id: "rev-2",
      productId: "e4",
      productName: isEn ? "AirPods Pro (2nd Gen) USB-C ANC Earbuds" : "AirPods Pro (2. Nesil) USB-C Kulak İçi Kulaklık",
      productImage: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80",
      productSlug: "apple-airpods-pro-2-nesil-usb-c",
      sellerName: "TechWorld Türkiye",
      rating: 5,
      date: "02.08.2026",
      comment: isEn
        ? "Active noise canceling is remarkable. Original guaranteed product with valid Apple warranty."
        : "Aktif gürültü engellemesi inanılmaz seviyede. Orijinal Apple Türkiye garantili ürün, hemen faturası geldi.",
      helpfulCount: 34,
      isVerifiedPurchase: true,
    },
  ]);

  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([
    {
      id: "pend-1",
      productId: "m2",
      productName: isEn ? "100% Pure Linen Long Sleeve Shirt - Sky Blue" : "%100 Keten Uzun Kollu Erkek Gömlek - Gök Mavi",
      productImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
      productSlug: "massimo-dutti-keten-uzun-kol-gomlek-mavi",
      sellerName: "Trend Fashion Mağazası",
      deliveryDate: "20.08.2026",
      orderNumber: "CS-98421",
    },
    {
      id: "pend-2",
      productId: "bs-1",
      productName: isEn ? "Collagen and Prebiotic Tablets 60 Count" : "Kolajen ve Prebiyotik Tablet 60 Adet",
      productImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80",
      productSlug: "icollagen-tablets",
      sellerName: "Cadde Verified Store",
      deliveryDate: "18.08.2026",
      orderNumber: "CS-98319",
    },
  ]);

  // Review Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingReview | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const handleOpenReviewModal = (item: PendingReview) => {
    setSelectedPending(item);
    setNewRating(5);
    setNewComment("");
    setIsModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPending || !newComment.trim()) return;

    const newRev: UserReview = {
      id: `rev-${Date.now()}`,
      productId: selectedPending.productId,
      productName: selectedPending.productName,
      productImage: selectedPending.productImage,
      productSlug: selectedPending.productSlug,
      sellerName: selectedPending.sellerName,
      rating: newRating,
      date: new Date().toLocaleDateString("tr-TR"),
      comment: newComment,
      helpfulCount: 0,
      isVerifiedPurchase: true,
    };

    setReviews([newRev, ...reviews]);
    setPendingReviews(pendingReviews.filter((p) => p.id !== selectedPending.id));
    setIsModalOpen(false);
    setActiveTab("reviewed");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "My Reviews" : "Değerlendirmelerim" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4" />
                  <span>{isEn ? "Product Feedback" : "Ürün Deneyimleri"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "My Reviews" : "Değerlendirmelerim"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "View your submitted reviews and rate newly delivered items to earn Cadde Points!"
                    : "Yaptığınız yorumları inceleyin ve teslim edilen ürünleri değerlendirerek Cadde Puan kazanın!"}
                </p>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("reviewed")}
                  className={cn(
                    "px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer",
                    activeTab === "reviewed"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {isEn ? `Reviewed (${reviews.length})` : `Yorumlarım (${reviews.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pending")}
                  className={cn(
                    "px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                    activeTab === "pending"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <span>{isEn ? "Waiting Review" : "Değerlendirme Bekleyen"}</span>
                  {pendingReviews.length > 0 && (
                    <span className="bg-[#f27a1a] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {pendingReviews.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab 1: Reviewed Products */}
            {activeTab === "reviewed" && (
              <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                    <MessageSquare className="w-12 h-12 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-900">
                      {isEn ? "No reviews yet" : "Henüz bir değerlendirmeniz bulunmuyor"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {isEn
                        ? "You can share your thoughts on the products you purchased to help other shoppers."
                        : "Satın aldığınız ürünlere yorum yaparak diğer kullanıcılara yol gösterebilirsiniz."}
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row gap-5 hover:border-slate-300 transition-colors"
                    >
                      <Link href={`/product/${rev.productSlug}`} className="shrink-0">
                        <img
                          src={rev.productImage}
                          alt={rev.productName}
                          className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl border border-slate-100 hover:opacity-90 transition-opacity"
                        />
                      </Link>

                      <div className="flex flex-col justify-between flex-1 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Link href={`/product/${rev.productSlug}`}>
                              <h3 className="text-sm font-black text-slate-900 hover:text-primary transition-colors">
                                {rev.productName}
                              </h3>
                            </Link>
                            <span className="text-[11px] font-semibold text-slate-400">{rev.date}</span>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Stars */}
                            <div className="flex items-center text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                  )}
                                />
                              ))}
                            </div>

                            {rev.isVerifiedPurchase && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{isEn ? "Verified Buyer" : "Onaylı Alıcı"}</span>
                              </span>
                            )}

                            <span className="text-[11px] text-slate-500 font-medium">
                              Satıcı: <span className="font-bold text-slate-700">{rev.sellerName}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                            {rev.comment}
                          </p>

                          {rev.photos && rev.photos.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {rev.photos.map((ph, idx) => (
                                <img
                                  key={idx}
                                  src={ph}
                                  alt="Review attachment"
                                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                            <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {rev.helpfulCount} {isEn ? "people found this helpful" : "kişi bu yorumu faydalı buldu"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/product/${rev.productSlug}`}
                              className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                            >
                              <span>{isEn ? "View Product" : "Ürünü İncele"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Pending Reviews */}
            {activeTab === "pending" && (
              <div className="flex flex-col gap-4">
                {pendingReviews.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                    <h3 className="text-base font-bold text-slate-900">
                      {isEn ? "All caught up!" : "Değerlendirme bekleyen ürününüz bulunmuyor"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {isEn
                        ? "You have reviewed all your delivered orders. Thank you for contributing!"
                        : "Teslim edilen tüm siparişlerinizi değerlendirdiniz. Katkınız için teşekkür ederiz!"}
                    </p>
                  </div>
                ) : (
                  pendingReviews.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-24 object-cover rounded-xl border border-slate-100 shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-400">
                            Sipariş No: {item.orderNumber} • Teslim: {item.deliveryDate}
                          </span>
                          <h3 className="text-sm font-black text-slate-900">{item.productName}</h3>
                          <span className="text-xs text-slate-500 font-medium">
                            Satıcı: <span className="font-bold text-slate-700">{item.sellerName}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(item)}
                        className="w-full sm:w-auto bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isEn ? "Write a Review" : "Ürünü Değerlendir"}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review Submission Modal */}
      {isModalOpen && selectedPending && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {isEn ? "Evaluate Product" : "Ürünü Değerlendir"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <img
                src={selectedPending.productImage}
                alt={selectedPending.productName}
                className="w-14 h-16 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 line-clamp-1">
                  {selectedPending.productName}
                </span>
                <span className="text-[11px] text-slate-500">Satıcı: {selectedPending.sellerName}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              {/* Star Rating Picker */}
              <div className="flex flex-col gap-1.5 items-center justify-center py-2 bg-amber-50/60 border border-amber-200/60 rounded-2xl">
                <span className="text-xs font-extrabold text-slate-700">
                  {isEn ? "Your Product Rating" : "Ürün Puanınız"}
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={cn(
                          "w-7 h-7",
                          star <= newRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-800">
                  {isEn ? "Your Review & Feedback" : "Yorumunuz ve Deneyiminiz"}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    isEn
                      ? "Share details about the product quality, fit, material, delivery..."
                      : "Ürünün kalitesi, kumaşı, kalıbı ve kargo süreci hakkında düşüncelerinizi yazın..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Vazgeç"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isEn ? "Publish Review" : "Yorumu Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
