"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import {
  TrendingUp,
  Search,
  Zap,
  ArrowUpRight,
  PlusCircle,
  Megaphone,
  ShoppingBag,
  Sliders,
  Sparkles,
  Award,
  BarChart3,
  Target,
  Flame,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Package,
} from "lucide-react";

interface TrendingSearchTerm {
  term: string;
  volume: number;
  growth: string;
  conversionRate: number;
  competition: "HIGH" | "MEDIUM" | "LOW";
  suggestedAction: string;
}

interface CategoryDemandOpportunity {
  categoryName: string;
  slug: string;
  demandScore: number; // 0-100
  searchGrowth: string;
  stockStatus: "CRITICAL_LOW" | "NORMAL" | "HIGH_DEMAND";
  recommendedItems: string[];
  estimatedGmvUplift: number;
}

interface PriceOpportunity {
  productName: string;
  currentPrice: number;
  competitorPrice: number;
  recommendedPrice: number;
  elasticityIndex: string;
  potentialSalesIncrease: string;
}

const SAMPLE_SEARCH_TERMS: TrendingSearchTerm[] = [
  {
    term: "şifon elbise",
    volume: 184500,
    growth: "+48.2%",
    conversionRate: 4.8,
    competition: "HIGH",
    suggestedAction: "Sponsorlu Arama Kampanyası Başlat",
  },
  {
    term: "bluetooth kulaklık gürültü engelleyici",
    volume: 142000,
    growth: "+34.5%",
    conversionRate: 6.2,
    competition: "HIGH",
    suggestedAction: "Elektronik Vitrini Öne Çıkar",
  },
  {
    term: "spor sırt çantası laptop",
    volume: 89000,
    growth: "+62.1%",
    conversionRate: 3.9,
    competition: "MEDIUM",
    suggestedAction: "Okula Dönüş Kampanyası Oluştur",
  },
  {
    term: "filtre kahve makinesi çekirdek",
    volume: 76400,
    growth: "+22.4%",
    conversionRate: 5.1,
    competition: "MEDIUM",
    suggestedAction: "Ev & Yaşam Şeridine Ekle",
  },
  {
    term: "deri ceket kadın vintage",
    volume: 68200,
    growth: "+84.0%",
    conversionRate: 3.4,
    competition: "LOW",
    suggestedAction: "Yeni Gelenler Vitrinine Ekle",
  },
];

const SAMPLE_CATEGORY_OPPORTUNITIES: CategoryDemandOpportunity[] = [
  {
    categoryName: "Kadın Dış Giyim & Elbise",
    slug: "kadin",
    demandScore: 94,
    searchGrowth: "+42%",
    stockStatus: "HIGH_DEMAND",
    recommendedItems: ["Sonbahar Trençkot", "Çiçekli Midi Elbise", "Deri Bomber Ceket"],
    estimatedGmvUplift: 185000,
  },
  {
    categoryName: "Akıllı Telefon & Aksesuar",
    slug: "elektronik",
    demandScore: 88,
    searchGrowth: "+31%",
    stockStatus: "CRITICAL_LOW",
    recommendedItems: ["Hızlı Şarj Adaptörü (65W)", "Manyetik Kılıf", "Ekran Koruyucu"],
    estimatedGmvUplift: 142000,
  },
  {
    categoryName: "Mutfak Robotu & Kahve Makineleri",
    slug: "ev-yasam",
    demandScore: 79,
    searchGrowth: "+26%",
    stockStatus: "NORMAL",
    recommendedItems: ["Tam Otomatik Espresso", "Airfryer Çift Hazneli", "Döküm Tava"],
    estimatedGmvUplift: 98000,
  },
];

const SAMPLE_PRICE_OPPORTUNITIES: PriceOpportunity[] = [
  {
    productName: "Kadın Çiçekli Şifon Elbise",
    currentPrice: 599.9,
    competitorPrice: 529.9,
    recommendedPrice: 499.9,
    elasticityIndex: "Yüksek",
    potentialSalesIncrease: "+65% Sipariş Artışı",
  },
  {
    productName: "Deri Tabanlı Erkek Sneaker",
    currentPrice: 899.0,
    competitorPrice: 849.0,
    recommendedPrice: 799.0,
    elasticityIndex: "Orta",
    potentialSalesIncrease: "+38% Sipariş Artışı",
  },
  {
    productName: "AirPods Pro Uyumlu Kulaklık Kılıfı",
    currentPrice: 149.0,
    competitorPrice: 119.0,
    recommendedPrice: 99.0,
    elasticityIndex: "Çok Yüksek",
    potentialSalesIncrease: "+120% Sipariş Artışı",
  },
];

export default function AdminResearchPage() {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";

  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerms = SAMPLE_SEARCH_TERMS.filter((t) =>
    t.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                    Platform Intelligence & AI Insights
                  </span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Canlı Pazar Trendleri</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {isEn ? "Market Research & Growth Opportunities" : "Pazar Araştırması & Büyüme Fırsatları"}
                </h1>
                <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
                  {isEn
                    ? "Identify trending search terms, high-demand product categories, and price elasticities to launch instant high-ROI marketing campaigns."
                    : "Müşteri arama trendlerini ve talep boşluklarını analiz ederek anında yüksek getirili reklam ve vitrin kampanyaları oluşturun."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/admin/marketing"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>{isEn ? "Go to Marketing Studio" : "Reklam Kampanyası Başlat"}</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">{isEn ? "Top Search Velocity" : "Hızlı Yükselen Terimler"}</span>
                <span className="text-xl font-black text-indigo-600">+84.0%</span>
                <span className="text-[10px] text-slate-400 font-semibold">"deri ceket vintage"</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">{isEn ? "Est. GMV Opportunity" : "Tahmini Ek Ciro Fırsatı"}</span>
                <span className="text-xl font-black text-emerald-600">{formatCurrency(425000, currency)}</span>
                <span className="text-[10px] text-emerald-700 font-bold">{isEn ? "In 3 top categories" : "Top 3 kategoride"}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">{isEn ? "Avg. Conversion Rate" : "Arama Dönüşüm Oranı"}</span>
                <span className="text-xl font-black text-slate-900">%4.88</span>
                <span className="text-[10px] text-blue-600 font-bold">{isEn ? "+1.2% vs last month" : "Geçen aya göre +%1.2"}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">{isEn ? "Stock Alert Gaps" : "Stok Uyarısı Olanlar"}</span>
                <span className="text-xl font-black text-amber-600">8 Kategori</span>
                <span className="text-[10px] text-amber-700 font-bold">{isEn ? "High demand shortage" : "Yüksek talep eksikliği"}</span>
              </div>
            </div>

            {/* Trending Search Terms Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      {isEn ? "Trending Customer Search Terms (Last 30 Days)" : "En Çok Aranan Müşteri Terimleri (Son 30 Gün)"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isEn
                        ? "High-volume customer intent keywords. Launch sponsored placements directly."
                        : "Yüksek hacimli müşteri arama terimleri. Doğrudan sponsorlu arama reklamı başlatın."}
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isEn ? "Filter keywords..." : "Arama terimi filtrele..."}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{isEn ? "Search Term / Keyword" : "Arama Terimi"}</th>
                      <th className="p-3">{isEn ? "Monthly Volume" : "Aylık Hacim"}</th>
                      <th className="p-3">{isEn ? "Growth" : "Büyüme"}</th>
                      <th className="p-3">{isEn ? "Conv. Rate" : "Dönüşüm"}</th>
                      <th className="p-3">{isEn ? "Competition" : "Rekabet"}</th>
                      <th className="p-3 text-right">{isEn ? "Direct Action" : "Aksiyon"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTerms.map((term, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-900 text-xs">"{term.term}"</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{(term.volume).toLocaleString("tr-TR")} arama</td>
                        <td className="p-3 font-extrabold text-emerald-600">{term.growth}</td>
                        <td className="p-3 font-bold text-indigo-600">%{term.conversionRate}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                              term.competition === "HIGH"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : term.competition === "MEDIUM"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {term.competition}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/admin/marketing?prefill=${encodeURIComponent(term.term)}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{isEn ? "Create Campaign" : "Kampanya Başlat"}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* High Demand Category Opportunities */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Target className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {isEn ? "High-Demand Category Opportunities & Stock Shortages" : "Yüksek Talep Gören Kategoriler & Stok Açıkları"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isEn
                      ? "Categories with high buyer demand where additional merchant inventory can unlock immediate revenue."
                      : "Tüketici talebi yüksek olan ve satıcı stoğu eklendiğinde hemen ciroya dönüşecek kategoriler."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SAMPLE_CATEGORY_OPPORTUNITIES.map((cat, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{cat.categoryName}</span>
                        <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          Skor: {cat.demandScore}/100
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{isEn ? "Arama Büyümesi:" : "Arama Büyümesi:"}</span>
                        <span className="font-bold text-emerald-600">{cat.searchGrowth}</span>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px] pt-2 border-t border-slate-200/80">
                        <span className="font-bold text-slate-700">{isEn ? "Top Missing Items:" : "En Çok Aranan Ürünler:"}</span>
                        <div className="flex flex-wrap gap-1">
                          {cat.recommendedItems.map((item, i) => (
                            <span key={i} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">{isEn ? "Est. Uplift:" : "Tahmini Katkı:"}</span>
                        <span className="font-black text-emerald-600">{formatCurrency(cat.estimatedGmvUplift, currency)}</span>
                      </div>

                      <Link
                        href={`/admin/cms`}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        {isEn ? "Promote on CMS" : "Vitrine Ekle"} &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Elasticity & Competitive Opportunities */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {isEn ? "Competitive Price Optimization Opportunities" : "Fiyat Esnekliği & Rekabetçi Fiyat Önerileri"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isEn
                      ? "Algorithmically detected products where adjusting price to market sweet-spot drives disproportionate volume."
                      : "Piyasa fiyatlarıyla optimize edildiğinde sipariş hacmini katlayacak ürünler."}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {SAMPLE_PRICE_OPPORTUNITIES.map((item, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900">{item.productName}</span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{isEn ? "Current:" : "Mevcut:"} <strong>{formatCurrency(item.currentPrice, currency)}</strong></span>
                        <span>•</span>
                        <span>{isEn ? "Market Benchmark:" : "Piyasa:"} <strong>{formatCurrency(item.competitorPrice, currency)}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-700 font-extrabold">{item.potentialSalesIncrease}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400">{isEn ? "Recommended Price:" : "Önerilen Fiyat:"}</span>
                        <span className="text-sm font-black text-indigo-600">{formatCurrency(item.recommendedPrice, currency)}</span>
                      </div>

                      <Link
                        href="/admin/products"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        {isEn ? "Update Product" : "Ürünü Düzenle"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
