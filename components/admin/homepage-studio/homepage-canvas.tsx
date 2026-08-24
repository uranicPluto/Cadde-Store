"use client";

import React from "react";
import { SectionItem } from "@/lib/cms/cms-types";
import {
  ArrowUp,
  ArrowDown,
  Settings,
  Copy,
  Trash2,
  Eye,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
  EyeOff,
} from "lucide-react";
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

interface HomepageCanvasProps {
  sections: SectionItem[];
  selectedSectionId: string | null;
  viewport: "desktop" | "tablet" | "mobile";
  onSelectSection: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicateSection: (section: SectionItem) => void;
  onDeleteSection: (id: string) => void;
  onOpenPreview: (section: SectionItem) => void;
  onOpenLibrary: (insertIndex?: number) => void;
  isEn?: boolean;
}

export const HomepageCanvas: React.FC<HomepageCanvasProps> = ({
  sections,
  selectedSectionId,
  viewport,
  onSelectSection,
  onMoveUp,
  onMoveDown,
  onDuplicateSection,
  onDeleteSection,
  onOpenPreview,
  onOpenLibrary,
  isEn = false,
}) => {
  const getCanvasWidth = () => {
    if (viewport === "mobile") return "max-w-[390px]";
    if (viewport === "tablet") return "max-w-[768px]";
    return "w-full";
  };

  const renderSectionComponent = (sec: SectionItem) => {
    const norm = (sec.type || "").toUpperCase().trim();
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
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl my-2">
            <span className="font-bold text-xs text-slate-500 uppercase">
              {sec.titleTR || sec.titleEN} ({sec.type})
            </span>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-slate-100/90 rounded-2xl p-4 sm:p-6 overflow-y-auto flex justify-center items-start border border-slate-200 shadow-inner">
      <div
        className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 transition-all duration-300 flex flex-col ${getCanvasWidth()}`}
      >
        {/* Header Preview */}
        <div className="pointer-events-none opacity-90 select-none">
          <MarketplaceHeader />
        </div>

        {/* Section Stream */}
        <main className="flex flex-col py-4 relative">
          {sections.map((sec, idx) => {
            const isSelected = selectedSectionId === sec.id;
            const isActive = sec.active !== false;

            return (
              <React.Fragment key={sec.id}>
                {/* Inline "Add Section Anywhere" Separator */}
                <div className="group/divider py-1.5 flex items-center justify-center relative my-1">
                  <div className="w-full h-px bg-transparent group-hover/divider:bg-indigo-300 transition-colors" />
                  <button
                    type="button"
                    onClick={() => onOpenLibrary(idx)}
                    className="opacity-0 group-hover/divider:opacity-100 transition-all scale-90 group-hover/divider:scale-100 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 absolute z-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEn ? "Add Section Here" : "Araya Bölüm Ekle"}</span>
                  </button>
                </div>

                {/* Section Card */}
                <div
                  onClick={() => onSelectSection(sec.id)}
                  className={`relative transition-all rounded-xl cursor-pointer group/section ${
                    !isActive ? "opacity-40 grayscale" : ""
                  } ${
                    isSelected
                      ? "ring-2 ring-indigo-600 ring-offset-2 shadow-lg"
                      : "hover:ring-2 hover:ring-indigo-300"
                  }`}
                >
                  {/* Floating Action Toolbar */}
                  <div
                    className={`absolute top-2 right-4 z-30 bg-slate-950/90 backdrop-blur-md text-white px-2 py-1 rounded-xl shadow-lg flex items-center gap-1.5 transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover/section:opacity-100"
                    }`}
                  >
                    <span className="text-[10px] font-black text-indigo-400 uppercase mr-1 px-1.5 py-0.5 bg-indigo-950/60 rounded">
                      {sec.type}
                    </span>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(idx);
                      }}
                      className="p-1 hover:text-indigo-400 disabled:opacity-30"
                      title={isEn ? "Move Up" : "Yukarı Taşı"}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(idx);
                      }}
                      className="p-1 hover:text-indigo-400 disabled:opacity-30"
                      title={isEn ? "Move Down" : "Aşağı Taşı"}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPreview(sec);
                      }}
                      className="p-1 hover:text-indigo-400"
                      title={isEn ? "Preview Section" : "Bölüm Önizle"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSection(sec);
                      }}
                      className="p-1 hover:text-indigo-400"
                      title={isEn ? "Duplicate" : "Çoğalt"}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(sec.id);
                      }}
                      className="p-1 hover:text-rose-400"
                      title={isEn ? "Delete" : "Sil"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Real Section Rendering */}
                  <div className="pointer-events-none select-none">
                    {renderSectionComponent(sec)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Bottom Add Section Button */}
          <div className="py-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onOpenLibrary(sections.length)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? "Add Section at Bottom" : "En Alta Yeni Bölüm Ekle"}</span>
            </button>
          </div>
        </main>

        {/* Footer Preview */}
        <div className="pointer-events-none opacity-90 select-none">
          <Footer />
        </div>
      </div>
    </div>
  );
};
