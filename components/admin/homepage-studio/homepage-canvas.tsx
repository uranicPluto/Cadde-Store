"use client";

import React from "react";
import { SectionItem } from "@/lib/cms/cms-types";
import { HeroSection } from "@/components/homepage/hero-section";
import { PopularProductsSection } from "@/components/homepage/popular-products-section";
import { CategoryGridStrips } from "@/components/homepage/category-grid-strips";
import { FlashSalesSection } from "@/components/homepage/flash-sales-section";
import { CampaignBannerStrips } from "@/components/homepage/campaign-banner-strips";
import { FeaturedBrandsSection } from "@/components/homepage/featured-brands-section";
import { StoreHighlightsSection } from "@/components/homepage/store-highlights-section";
import { BestsellerGridSection } from "@/components/homepage/bestseller-grid-section";
import { CustomerTrustBadges } from "@/components/homepage/customer-trust-badges";
import { BrandQuickStrip } from "@/components/homepage/brand-quick-strip";
import { Eye, Sliders, CheckCircle2, AlertCircle } from "lucide-react";

interface HomepageCanvasProps {
  sections: SectionItem[];
  selectedSectionId: string | null;
  onSelectSection: (section: SectionItem) => void;
  viewportMode: "desktop" | "tablet" | "mobile";
  isEn?: boolean;
}

export const HomepageCanvas: React.FC<HomepageCanvasProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  viewportMode,
  isEn = false,
}) => {
  const getContainerWidth = () => {
    switch (viewportMode) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full max-w-7xl";
    }
  };

  const renderSectionComponent = (sec: SectionItem) => {
    const norm = (sec.type || "").toUpperCase();
    const config = typeof sec.configJson === "string" ? (() => {
      try { return JSON.parse(sec.configJson); } catch { return {}; }
    })() : (sec.configJson || {});

    switch (norm) {
      case "HERO":
        return (
          <HeroSection
            title={sec.titleTR}
            subtitle={config?.subtitleTR}
            config={config}
            banners={sec.banners}
          />
        );
      case "BRAND_STRIP":
      case "BRAND_CAROUSEL":
      case "BRANDS":
        return <BrandQuickStrip title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "PRODUCT_CAROUSEL":
      case "POPULAR_PRODUCTS":
      case "NEW_ARRIVALS":
      case "TRENDING_PRODUCTS":
      case "RECOMMENDED_PRODUCTS":
        return <PopularProductsSection title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "CATEGORY_GRID":
      case "POPULAR_CATEGORIES":
      case "CATEGORY_CAROUSEL":
        return <CategoryGridStrips title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "FLASH_DEALS":
      case "FLASH_SALES":
      case "COUNTDOWN_CAMPAIGN":
        return <FlashSalesSection title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "BANNER_STRIP":
      case "CAMPAIGN_STRIP":
      case "CAMPAIGN_CARDS":
      case "SEASONAL_CAMPAIGN":
      case "PROMOTIONAL_BANNER":
      case "IMAGE_TEXT_BANNER":
        return <CampaignBannerStrips title={sec.titleTR} subtitle={config?.subtitleTR} config={config} banners={sec.banners} />;
      case "FEATURED_BRANDS":
      case "BRAND_DEALS":
      case "SPONSOR_CAROUSEL":
        return <FeaturedBrandsSection title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "STORE_HIGHLIGHTS":
      case "VERIFIED_SELLERS":
      case "FEATURED_STORES":
      case "SELLER_CAROUSEL":
        return <StoreHighlightsSection title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "BESTSELLER_GRID":
      case "BESTSELLERS":
      case "WEEKLY_BESTSELLERS":
        return <BestsellerGridSection title={sec.titleTR} subtitle={config?.subtitleTR} config={config} />;
      case "TRUST_BADGES":
      case "CUSTOMER_TRUST":
        return <CustomerTrustBadges config={config} />;
      default:
        return (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl my-2">
            <span className="font-bold text-xs text-slate-600 uppercase">
              {sec.titleTR || sec.titleEN} ({sec.type})
            </span>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto bg-slate-100/80 p-4 sm:p-6 flex flex-col items-center">
      <div
        className={`transition-all duration-300 mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 ${getContainerWidth()}`}
      >
        {sections.map((section) => {
          const isSelected = selectedSectionId === section.id;

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section)}
              className={`relative transition-all cursor-pointer group ${
                isSelected
                  ? "ring-4 ring-indigo-500/40 ring-inset z-20"
                  : "hover:ring-2 hover:ring-indigo-300/60 hover:ring-inset"
              }`}
            >
              {/* Floating Section Action Bar on Selection/Hover */}
              <div
                className={`absolute top-2 left-2 z-30 transition-opacity flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <Sliders className="w-3 h-3 text-indigo-400" />
                <span>{section.titleTR || section.titleEN || section.type}</span>
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                  {section.type}
                </span>
              </div>

              {/* Render Config-Driven Section Component */}
              <div className="pointer-events-none">
                {renderSectionComponent(section)}
              </div>
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Sliders className="w-10 h-10 opacity-30" />
            <span className="text-xs font-bold text-slate-700">
              {isEn ? "No sections added yet." : "Henüz bölüm eklenmedi."}
            </span>
            <span className="text-[11px] text-slate-400">
              {isEn ? "Click 'Add Section' to start building." : "Başlamak için 'Bölüm Ekle' butonuna tıklayın."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
