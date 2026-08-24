"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { SectionItem } from "@/lib/cms/cms-types";
import { Monitor, Tablet, Smartphone } from "lucide-react";
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

interface SectionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SectionItem | null;
  isEn?: boolean;
}

export const SectionPreviewModal: React.FC<SectionPreviewModalProps> = ({
  isOpen,
  onClose,
  section,
  isEn = false,
}) => {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  if (!section) return null;

  const renderSectionComponent = () => {
    const norm = (section.type || "").toUpperCase().trim();
    switch (norm) {
      case "HERO":
        return <HeroSection />;
      case "BRAND_STRIP":
      case "BRAND_CAROUSEL":
      case "BRANDS":
        return <BrandQuickStrip />;
      case "PRODUCT_CAROUSEL":
      case "POPULAR_PRODUCTS":
      case "NEW_ARRIVALS":
      case "TRENDING_PRODUCTS":
      case "RECOMMENDED_PRODUCTS":
        return <PopularProductsSection />;
      case "CATEGORY_GRID":
      case "POPULAR_CATEGORIES":
      case "CATEGORY_CAROUSEL":
        return <CategoryGridStrips />;
      case "FLASH_DEALS":
      case "FLASH_SALES":
      case "COUNTDOWN_CAMPAIGN":
        return <FlashSalesSection />;
      case "BANNER_STRIP":
      case "CAMPAIGN_STRIP":
      case "CAMPAIGN_CARDS":
      case "SEASONAL_CAMPAIGN":
        return <CampaignBannerStrips />;
      case "FEATURED_BRANDS":
      case "BRAND_DEALS":
        return <FeaturedBrandsSection />;
      case "STORE_HIGHLIGHTS":
      case "VERIFIED_SELLERS":
      case "FEATURED_STORES":
        return <StoreHighlightsSection />;
      case "BESTSELLER_GRID":
      case "BESTSELLERS":
      case "WEEKLY_BESTSELLERS":
        return <BestsellerGridSection />;
      case "TRUST_BADGES":
      case "CUSTOMER_TRUST":
        return <CustomerTrustBadges />;
      default:
        return (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-xs text-slate-500 uppercase">
              {section.titleTR || section.titleEN} ({section.type})
            </span>
          </div>
        );
    }
  };

  const getWidthClass = () => {
    if (viewport === "mobile") return "w-[375px]";
    if (viewport === "tablet") return "w-[768px]";
    return "w-full";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEn ? "Section Preview:" : "Bölüm Önizlemesi:"} ${
        isEn ? section.titleEN || section.titleTR : section.titleTR || section.titleEN
      }`}
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Viewport Toggles */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewport === "desktop" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isEn ? "Desktop" : "Masaüstü"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewport === "tablet" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (768px)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewport === "mobile" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (375px)</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-md">
            Type: {section.type}
          </span>
        </div>

        {/* Viewport Render Area */}
        <div className="bg-slate-100 p-4 rounded-xl flex justify-center items-center overflow-x-auto min-h-[350px]">
          <div
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${getWidthClass()}`}
          >
            {renderSectionComponent()}
          </div>
        </div>
      </div>
    </Modal>
  );
};
