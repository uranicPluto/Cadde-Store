"use client";

import React, { useState, useEffect } from "react";
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
import { SponsorCarouselSection } from "@/components/homepage/sponsor-carousel-section";
import { CustomerTrustBadges } from "@/components/homepage/customer-trust-badges";
import { Footer } from "@/components/layout/footer";


export interface CmsSectionItem {
  id: string;
  titleTR?: string;
  titleEN?: string;
  type: string;
  orderIndex: number;
  active?: boolean;
  isActive?: boolean;
  configJson?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  banners?: any[];
}

const DEFAULT_SECTIONS: CmsSectionItem[] = [
  { id: "sec-hero", type: "HERO", orderIndex: 0, active: true },
  { id: "sec-brand-strip", type: "BRAND_STRIP", orderIndex: 1, active: true },
  { id: "sec-popular-products", type: "PRODUCT_CAROUSEL", orderIndex: 2, active: true },
  { id: "sec-category-grid", type: "CATEGORY_GRID", orderIndex: 3, active: true },
  { id: "sec-flash-deals", type: "FLASH_DEALS", orderIndex: 4, active: true },
  { id: "sec-banner-strip", type: "BANNER_STRIP", orderIndex: 5, active: true },
  { id: "sec-featured-brands", type: "FEATURED_BRANDS", orderIndex: 6, active: true },
  { id: "sec-store-highlights", type: "STORE_HIGHLIGHTS", orderIndex: 7, active: true },
  { id: "sec-bestseller-grid", type: "BESTSELLER_GRID", orderIndex: 8, active: true },
  { id: "sec-trust-badges", type: "TRUST_BADGES", orderIndex: 9, active: true },
];

function isSectionActiveAndScheduled(s: CmsSectionItem): boolean {
  const isActive = s.active !== false && s.isActive !== false;
  if (!isActive) return false;

  const now = Date.now();
  if (s.startDate) {
    const start = new Date(s.startDate).getTime();
    if (!isNaN(start) && start > now) return false;
  }
  if (s.endDate) {
    const end = new Date(s.endDate).getTime();
    if (!isNaN(end) && end < now) return false;
  }
  return true;
}

function renderCmsSection(section: CmsSectionItem) {
  const normalizedType = (section.type || "").toUpperCase().trim();
  const config = typeof section.configJson === "string" ? (() => {
    try { return JSON.parse(section.configJson); } catch { return {}; }
  })() : (section.configJson || {});

  switch (normalizedType) {
    case "HERO":
      return (
        <HeroSection
          key={section.id}
          title={section.titleTR}
          subtitle={config.subtitleTR}
          config={config}
          banners={section.banners}
        />
      );
    case "BRAND_STRIP":
      return <BrandQuickStrip key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "PRODUCT_CAROUSEL":
    case "POPULAR_PRODUCTS":
    case "NEW_ARRIVALS":
    case "TRENDING_PRODUCTS":
    case "RECOMMENDED_PRODUCTS":
    case "DEALS_OF_THE_DAY":
      return <PopularProductsSection key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "CATEGORY_GRID":
    case "POPULAR_CATEGORIES":
    case "CATEGORY_CAROUSEL":
      return <CategoryGridStrips key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "FLASH_DEALS":
    case "FLASH_SALES":
      return <FlashSalesSection key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "BANNER_STRIP":
    case "CAMPAIGN_STRIP":
    case "CAMPAIGN_CARDS":
    case "COUNTDOWN_CAMPAIGN":
    case "SEASONAL_CAMPAIGN":
    case "PROMOTIONAL_BANNER":
    case "IMAGE_TEXT_BANNER":
      return <CampaignBannerStrips key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} banners={section.banners} />;
    case "FEATURED_BRANDS":
    case "BRAND_CAROUSEL":
    case "BRAND_DEALS":
      return <FeaturedBrandsSection key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "SPONSOR_CAROUSEL":
    case "SPONSORS":
      return <SponsorCarouselSection key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "STORE_HIGHLIGHTS":
    case "VERIFIED_SELLERS":
    case "FEATURED_STORES":
    case "SELLER_CAROUSEL":
      return <StoreHighlightsSection key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "BESTSELLER_GRID":
    case "BESTSELLERS":
      return <BestsellerGridSection key={section.id} title={section.titleTR} subtitle={config.subtitleTR} config={config} />;
    case "TRUST_BADGES":
    case "CUSTOMER_TRUST":
      return <CustomerTrustBadges key={section.id} config={config} />;
    default:
      return null;
  }
}

export default function HomePage() {
  const [sections, setSections] = useState<CmsSectionItem[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    let isMounted = true;

    async function loadCmsSections() {
      try {
        const res = await fetch("/api/cms/sections");
        const data = await res.json();

        if (isMounted && data?.sections && Array.isArray(data.sections) && data.sections.length > 0) {
          // If the source is mock and only returns a single HERO section, keep full rich fixtures
          if (data.source === "mock" && data.sections.length <= 1) {
            setSections(DEFAULT_SECTIONS);
            return;
          }

          const activeScheduled = data.sections
            .filter(isSectionActiveAndScheduled)
            .sort((a: CmsSectionItem, b: CmsSectionItem) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

          if (activeScheduled.length > 0) {
            setSections(activeScheduled);
          } else {
            setSections(DEFAULT_SECTIONS);
          }
        }
      } catch (e) {
        console.warn("Failed to load dynamic CMS sections, using defaults:", e);
        if (isMounted) setSections(DEFAULT_SECTIONS);
      }
    }

    loadCmsSections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main selection:bg-primary/20 selection:text-primary">
      {/* 1. Global Marketplace Header Shell */}
      <MarketplaceHeader />

      {/* 2. Homepage Dynamic CMS Main Content Body */}
      <main className="flex-1 flex flex-col">
        {sections.map((sec) => renderCmsSection(sec))}
      </main>

      {/* 3. Global Marketplace Footer Shell */}
      <Footer />
    </div>
  );
}
