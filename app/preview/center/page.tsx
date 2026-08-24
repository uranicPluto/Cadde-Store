"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { HeroSection } from "@/components/homepage/hero-section";
import { BrandQuickStrip } from "@/components/homepage/brand-quick-strip";
import { PopularProductsSection } from "@/components/homepage/popular-products-section";
import { FlashSalesSection } from "@/components/homepage/flash-sales-section";
import { CategoryGridStrips } from "@/components/homepage/category-grid-strips";
import { CampaignBannerStrips } from "@/components/homepage/campaign-banner-strips";
import { FeaturedBrandsSection } from "@/components/homepage/featured-brands-section";
import { StoreHighlightsSection } from "@/components/homepage/store-highlights-section";
import { BestsellerGridSection } from "@/components/homepage/bestseller-grid-section";
import { CustomerTrustBadges } from "@/components/homepage/customer-trust-badges";
import { Footer } from "@/components/layout/footer";
import {
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  Eye,
  User,
  Users,
  Store,
  Globe,
  Coins,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewCenterPage() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [persona, setPersona] = useState<"guest" | "customer" | "seller">("guest");
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDraft = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/homepage/draft");
      if (res.ok) {
        const data = await res.json();
        if (data.sections) setSections(data.sections);
      }
    } catch (e) {
      console.error("Preview center fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraft();
  }, []);

  const getViewportWidth = () => {
    if (viewport === "mobile") return "max-w-[390px]";
    if (viewport === "tablet") return "max-w-[768px]";
    return "w-full";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans antialiased">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms">
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Studio'ya Dön</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
              Preview Center (Çoklu Simülasyon)
            </span>
          </div>
        </div>

        {/* Viewport & Persona Controls */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setPersona("guest")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                persona === "guest" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3 h-3" />
              <span>Ziyaretçi</span>
            </button>
            <button
              type="button"
              onClick={() => setPersona("customer")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                persona === "customer" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Müşteri</span>
            </button>
            <button
              type="button"
              onClick={() => setPersona("seller")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                persona === "seller" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Satıcı</span>
            </button>
          </div>

          {/* Viewport Toggles */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewport === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Masaüstü</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewport === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewport === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDraft}
          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Yenile</span>
        </button>
      </header>

      {/* Stage */}
      <div className="flex-1 flex justify-center items-start p-4 sm:p-8 overflow-y-auto bg-slate-950">
        <div
          className={`transition-all duration-300 bg-white text-text-main shadow-2xl rounded-2xl overflow-hidden border border-slate-700 min-h-screen ${getViewportWidth()}`}
        >
          <MarketplaceHeader />
          <main className="flex flex-col gap-6 py-4">
            <HeroSection />
            <BrandQuickStrip />
            <PopularProductsSection />
            <CategoryGridStrips />
            <FlashSalesSection />
            <CampaignBannerStrips />
            <FeaturedBrandsSection />
            <StoreHighlightsSection />
            <BestsellerGridSection />
            <CustomerTrustBadges />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
