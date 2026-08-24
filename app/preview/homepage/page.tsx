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
import { SectionItem } from "@/lib/cms/cms-types";
import { getDefaultBaselineSections } from "@/lib/cms/cms-service";
import { Monitor, Tablet, Smartphone, ArrowLeft, RefreshCw, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomepageLivePreviewPage() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [sections, setSections] = useState<SectionItem[]>(getDefaultBaselineSections());
  const [loading, setLoading] = useState(true);

  const fetchDraftData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/homepage/draft");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
        }
      }
    } catch (e) {
      console.error("Draft preview load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftData();
  }, []);

  const renderSection = (sec: SectionItem) => {
    if (!sec.active) return null;
    const norm = (sec.type || "").toUpperCase().trim();

    switch (norm) {
      case "HERO":
        return <HeroSection key={sec.id} />;
      case "BRAND_STRIP":
      case "BRAND_CAROUSEL":
      case "BRANDS":
        return <BrandQuickStrip key={sec.id} />;
      case "PRODUCT_CAROUSEL":
      case "POPULAR_PRODUCTS":
      case "NEW_ARRIVALS":
      case "TRENDING_PRODUCTS":
      case "RECOMMENDED_PRODUCTS":
        return <PopularProductsSection key={sec.id} />;
      case "CATEGORY_GRID":
      case "POPULAR_CATEGORIES":
      case "CATEGORY_CAROUSEL":
        return <CategoryGridStrips key={sec.id} />;
      case "FLASH_DEALS":
      case "FLASH_SALES":
      case "COUNTDOWN_CAMPAIGN":
        return <FlashSalesSection key={sec.id} />;
      case "BANNER_STRIP":
      case "CAMPAIGN_STRIP":
      case "CAMPAIGN_CARDS":
      case "SEASONAL_CAMPAIGN":
        return <CampaignBannerStrips key={sec.id} />;
      case "FEATURED_BRANDS":
      case "BRAND_DEALS":
        return <FeaturedBrandsSection key={sec.id} />;
      case "STORE_HIGHLIGHTS":
      case "VERIFIED_SELLERS":
      case "FEATURED_STORES":
        return <StoreHighlightsSection key={sec.id} />;
      case "BESTSELLER_GRID":
      case "BESTSELLERS":
      case "WEEKLY_BESTSELLERS":
        return <BestsellerGridSection key={sec.id} />;
      case "TRUST_BADGES":
      case "CUSTOMER_TRUST":
        return <CustomerTrustBadges key={sec.id} />;
      default:
        return (
          <div key={sec.id} className="max-w-wide mx-auto w-full px-4 py-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center">
            <span className="font-bold text-xs text-slate-500 uppercase">{sec.titleTR || sec.titleEN} ({sec.type})</span>
          </div>
        );
    }
  };

  const getViewportWidth = () => {
    if (viewport === "mobile") return "max-w-[390px]";
    if (viewport === "tablet") return "max-w-[768px]";
    return "w-full";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans antialiased">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms">
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Studio'ya Dön</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Canlı Taslak Önizleme
            </span>
          </div>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewport === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Masaüstü</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewport === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewport === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobil (390px)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchDraftData}
          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Yenile</span>
        </button>
      </header>

      {/* Preview Stage */}
      <div className="flex-1 flex justify-center items-start p-4 sm:p-8 overflow-y-auto bg-slate-950">
        <div
          className={`transition-all duration-300 bg-white text-text-main shadow-2xl rounded-2xl overflow-hidden border border-slate-700 min-h-screen ${getViewportWidth()}`}
        >
          <MarketplaceHeader />
          <main className="flex flex-col gap-6 py-4">
            {sections.map(renderSection)}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
