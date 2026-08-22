"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { MessageCircleQuestion, CheckCircle2, Clock, Store, ArrowRight, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellerQuestion {
  id: string;
  productName: string;
  productImage: string;
  productSlug: string;
  sellerName: string;
  questionText: string;
  questionDate: string;
  status: "answered" | "pending";
  answerText?: string;
  answerDate?: string;
}

export default function MyQuestionsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"answered" | "pending">("answered");
  const [searchQuery, setSearchQuery] = useState("");

  const [questions, setQuestions] = useState<SellerQuestion[]>([
    {
      id: "q-1",
      productName: isEn ? "iPhone 15 Pro Max 256GB - Natural Titanium" : "iPhone 15 Pro Max 256GB - Doğal Titanyum",
      productImage: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=500&q=80",
      productSlug: "apple-iphone-15-pro-max-256gb-dogal-titanyum",
      sellerName: "TechWorld Türkiye",
      questionText: isEn
        ? "Hello, is this product officially imported with 2-year Apple Turkey warranty and sealed box?"
        : "Merhaba, ürün 2 yıl Apple Türkiye garantili ve kapalı kutu mudur? İthalatçı garantili mi?",
      questionDate: "12.08.2026 14:20",
      status: "answered",
      answerText: isEn
        ? "Hello Ahmet! Yes, all our Apple products are 100% original, brand new in sealed box, with 2-year official Apple Turkey warranty. Your invoice is sent electronically immediately upon shipping."
        : "Merhaba Ahmet Bey! Evet, tüm Apple ürünlerimiz %100 orijinal, sıfır kapalı kutusunda ve 2 yıl resmi Apple Türkiye garantilidir. E-faturanız sipariş kargolandığında sistemde otomatik oluşturulmaktadır.",
      answerDate: "12.08.2026 14:45",
    },
    {
      id: "q-2",
      productName: isEn ? "Chiffon Patterned Midi Dress - Burgundy" : "Desenli Şifon Midi Elbise - Bordo",
      productImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
      productSlug: "zara-desenli-sifon-elbise-bordo",
      sellerName: "Trend Fashion Mağazası",
      questionText: isEn
        ? "Is the size standard or does it run small? I am 168cm, 58kg, which size should I pick?"
        : "Kalıbı tam mıdır yoksa dar kalıp mı? 168 boy 58 kilo için hangi bedeni önerirsiniz?",
      questionDate: "08.08.2026 18:10",
      status: "answered",
      answerText: isEn
        ? "Hello! The dress is true-to-size regular fit. For 168cm and 58kg, size 'S' will fit you perfectly and comfortably."
        : "Merhaba! Ürünümüz tam kalıptır. Belirttiğiniz ölçülere göre 'S' beden sizin için tam ve çok dökümlü olacaktır.",
      answerDate: "08.08.2026 18:30",
    },
    {
      id: "q-3",
      productName: isEn ? "Air Cushion Running & Walking Sports Shoes" : "Air Cushion Koşu ve Yürüyüş Spor Ayakkabısı",
      productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
      productSlug: "nike-air-cushion-kosu-ve-yuruyus-spor-ayakkabisi",
      sellerName: "Spor Market Türkiye",
      questionText: isEn
        ? "Will size 43 be back in stock soon for the red color?"
        : "Kırmızı renk için 43 numara stoklara tekrar ne zaman girecek?",
      questionDate: "21.08.2026 10:15",
      status: "pending",
    },
  ]);

  const filteredQuestions = questions.filter((q) => {
    const matchesTab = q.status === activeTab;
    const matchesSearch =
      q.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const answeredCount = questions.filter((q) => q.status === "answered").length;
  const pendingCount = questions.filter((q) => q.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "My Questions" : "Satıcı Sorularım" },
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
                  <MessageCircleQuestion className="w-4 h-4" />
                  <span>{isEn ? "Seller Q&A Portal" : "Satıcı İletişim Portalı"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "My Questions to Sellers" : "Satıcı Sorularım"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Track questions you asked to store owners and read verified answers."
                    : "Ürünler hakkında satıcılara sorduğunuz soruları ve resmi satıcı yanıtlarını buradan takip edin."}
                </p>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("answered")}
                  className={cn(
                    "px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer",
                    activeTab === "answered"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {isEn ? `Answered (${answeredCount})` : `Cevaplanan (${answeredCount})`}
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
                  <span>{isEn ? "Pending" : "Cevap Bekleyen"}</span>
                  {pendingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  isEn ? "Search across your questions, product names or sellers..." : "Sorularınızda veya satıcı adlarında arayın..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-2xs"
              />
            </div>

            {/* Questions List */}
            <div className="flex flex-col gap-4">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                  <MessageCircleQuestion className="w-12 h-12 text-slate-300" />
                  <h3 className="text-base font-bold text-slate-900">
                    {isEn ? "No questions found" : "Soru bulunamadı"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {isEn
                      ? "You have not asked any questions in this status or matching your search."
                      : "Bu sekmede veya aramanıza uygun bir satıcı sorusu bulunmuyor."}
                  </p>
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-4"
                  >
                    {/* Product Top Strip */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={q.productImage}
                          alt={q.productName}
                          className="w-12 h-14 object-cover rounded-lg border border-slate-100 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/product/${q.productSlug}`}
                            className="text-xs font-black text-slate-900 hover:text-primary transition-colors truncate"
                          >
                            {q.productName}
                          </Link>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              Satıcı: <span className="font-bold text-slate-700">{q.sellerName}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {q.status === "answered" ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isEn ? "Answered" : "Cevaplandı"}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isEn ? "Awaiting Seller Reply" : "Cevap Bekliyor"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Box */}
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-slate-800">
                          {isEn ? "Your Question:" : "Sorunuz:"}
                        </span>
                        <span className="text-slate-400 font-semibold">{q.questionDate}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Answer Box (If answered) */}
                    {q.answerText && (
                      <div className="flex flex-col gap-1.5 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl ml-4 sm:ml-6">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 font-black text-emerald-800">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>{q.sellerName} (Yetkili Satıcı Yanıtı):</span>
                          </div>
                          <span className="text-emerald-700/80 font-semibold">{q.answerDate}</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                          {q.answerText}
                        </p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                      <Link
                        href={`/product/${q.productSlug}`}
                        className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{isEn ? "Go to Product Page" : "Ürün Sayfasına Git"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
