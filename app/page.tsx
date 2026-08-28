"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { HeroSection } from "@/components/homepage/hero-section";
import { BrandQuickStrip } from "@/components/homepage/brand-quick-strip";
import { PopularProductsSection } from "@/components/homepage/popular-products-section";
import { CategoryGridStrips } from "@/components/homepage/category-grid-strips";
import { FlashSalesSection } from "@/components/homepage/flash-sales-section";
import { CampaignBannerStrips } from "@/components/homepage/campaign-banner-strips";
import { FeaturedBrandsSection } from "@/components/homepage/featured-brands-section";
import { StoreHighlightsSection } from "@/components/homepage/store-highlights-section";
import { BestsellerGridSection } from "@/components/homepage/bestseller-grid-section";
import { CustomerTrustBadges } from "@/components/homepage/customer-trust-badges";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main selection:bg-primary/20 selection:text-primary">
      {/* 1. Global Marketplace Header Shell */}
      <MarketplaceHeader />

      {/* 2. Main Storefront Sections (Rock Solid & Stable) */}
      <main className="flex-1 flex flex-col">
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

      {/* 3. Global Marketplace Footer Shell */}
      <Footer />
    </div>
  );
}
