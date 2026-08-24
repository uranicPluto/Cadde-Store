"use client";

import React, { useEffect, useRef } from "react";
import { SectionItem } from "@/lib/cms/cms-types";
import {
  ArrowUp,
  ArrowDown,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Plus,
  EyeOff,
  Sparkles,
  CheckCircle2,
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
  onEditSection: (section: SectionItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleActive: (id: string) => void;
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
  onEditSection,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onDuplicateSection,
  onDeleteSection,
  onOpenPreview,
  onOpenLibrary,
  isEn = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(false);

  // 1. Two-Way Sync: When selectedSectionId changes from Navigator Tree, smooth scroll to it
  useEffect(() => {
    if (!selectedSectionId) return;

    const el = document.getElementById(`canvas-section-${selectedSectionId}`);
    if (el && containerRef.current) {
      isAutoScrollingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      const timeout = setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [selectedSectionId]);

  // 2. Two-Way Sync: When administrator scrolls the Canvas, detect active section
  const handleScroll = () => {
    if (isAutoScrollingRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerTop = container.getBoundingClientRect().top;
    const centerY = containerTop + container.clientHeight / 2;

    let closestId: string | null = null;
    let minDistance = Infinity;

    sections.forEach((sec) => {
      const el = document.getElementById(`canvas-section-${sec.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elCenter - centerY);

        if (distance < minDistance) {
          minDistance = distance;
          closestId = sec.id;
        }
      }
    });

    if (closestId && closestId !== selectedSectionId && minDistance < 350) {
      onSelectSection(closestId);
    }
  };

  const getCanvasWidth = () => {
    if (viewport === "mobile") return "max-w-[390px] min-w-[390px]";
    if (viewport === "tablet") return "max-w-[768px] min-w-[768px]";
    return "w-full max-w-[1440px]";
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
            <span className="font-bold text-xs text-slate-600 uppercase">
              {sec.titleTR || sec.titleEN} ({sec.type})
            </span>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full bg-slate-100/90 rounded-2xl p-4 sm:p-6 overflow-y-auto flex justify-center items-start border border-slate-200 shadow-inner"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 transition-all duration-300 flex flex-col ${getCanvasWidth()}`}
      >
        {/* Real Header Preview Shell */}
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
                  <div className="w-full h-px bg-transparent group-hover/divider:bg-indigo-400 transition-colors" />
                  <button
                    type="button"
                    onClick={() => onOpenLibrary(idx)}
                    className="opacity-0 group-hover/divider:opacity-100 transition-all scale-90 group-hover/divider:scale-100 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 absolute z-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEn ? "Add Section Here" : "Araya Bölüm Ekle"}</span>
                  </button>
                </div>

                {/* Section Card with Floating Controls */}
                <div
                  id={`canvas-section-${sec.id}`}
                  onClick={() => onSelectSection(sec.id)}
                  onDoubleClick={() => onEditSection(sec)}
                  className={`relative transition-all duration-200 rounded-2xl cursor-pointer group/section ${
                    !isActive ? "opacity-40 grayscale" : ""
                  } ${
                    isSelected
                      ? "ring-4 ring-indigo-600 ring-offset-2 shadow-2xl bg-indigo-50/10"
                      : "hover:ring-2 hover:ring-indigo-300"
                  }`}
                >
                  {/* Floating Action Toolbar on Selected Section */}
                  <div
                    className={`absolute top-3 right-4 z-30 bg-slate-950/95 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 transition-all ${
                      isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none group-hover/section:opacity-100 group-hover/section:scale-100 group-hover/section:pointer-events-auto"
                    }`}
                  >
                    <span className="text-[10px] font-black text-indigo-400 uppercase px-2 py-0.5 bg-indigo-950/70 rounded-md border border-indigo-500/30">
                      {sec.type}
                    </span>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(idx);
                      }}
                      className="p-1.5 hover:text-indigo-400 disabled:opacity-20 transition-colors rounded-lg hover:bg-slate-800"
                      title={isEn ? "Move Up" : "Yukarı Taşı"}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(idx);
                      }}
                      className="p-1.5 hover:text-indigo-400 disabled:opacity-20 transition-colors rounded-lg hover:bg-slate-800"
                      title={isEn ? "Move Down" : "Aşağı Taşı"}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Section Settings (Slide-over) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSection(sec);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                      title={isEn ? "Edit Settings" : "Ayarları Düzenle"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isEn ? "Edit" : "Düzenle"}</span>
                    </button>

                    {/* Hide / Show Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(sec.id);
                      }}
                      className="p-1.5 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800"
                      title={isActive ? (isEn ? "Hide Section" : "Bölümü Gizle") : isEn ? "Show Section" : "Bölümü Göster"}
                    >
                      {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSection(sec);
                      }}
                      className="p-1.5 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800"
                      title={isEn ? "Duplicate Section" : "Bölümü Çoğalt"}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(sec.id);
                      }}
                      className="p-1.5 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
                      title={isEn ? "Delete Section" : "Bölümü Sil"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Real Section Storefront Component */}
                  <div className="pointer-events-none select-none">
                    {renderSectionComponent(sec)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Bottom Add Section Button */}
          <div className="py-8 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onOpenLibrary(sections.length)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? "Add New Section at Bottom" : "En Alta Yeni Bölüm Ekle"}</span>
            </button>
          </div>
        </main>

        {/* Real Footer Preview Shell */}
        <div className="pointer-events-none opacity-90 select-none">
          <Footer />
        </div>
      </div>
    </div>
  );
};
