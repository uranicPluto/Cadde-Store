"use client";

import React, { useState } from "react";
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

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(4);
  const [cartCount, setCartCount] = useState(2);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main selection:bg-primary/20 selection:text-primary">
      {/* 1. Global Marketplace Header Shell */}
      <MarketplaceHeader
        isLoggedInMock={isLoggedIn}
        onLoginToggleMock={() => setIsLoggedIn(!isLoggedIn)}
        favoriteCount={favoriteCount}
        cartCount={cartCount}
      />

      {/* 2. Homepage CMS Main Content Body */}
      <main className="flex-1 flex flex-col">
        {/* Campaign Hero Slider */}
        <HeroSection />

        {/* Brand Logos & 3D Quick Action Strip */}
        <BrandQuickStrip />

        {/* Popular Products Section (Placed directly after Brand For You Section as requested) */}
        <PopularProductsSection />

        {/* Category Circle Strips */}
        <CategoryGridStrips />

        {/* Flash Sales & Countdown Timer */}
        <FlashSalesSection />

        {/* Campaign Banner Strips */}
        <CampaignBannerStrips />

        {/* Featured Brands Grid */}
        <FeaturedBrandsSection />

        {/* Verified Store Highlights */}
        <StoreHighlightsSection />

        {/* High Density Bestseller Grid */}
        <BestsellerGridSection />

        {/* Customer Trust & Guarantee Highlights */}
        <CustomerTrustBadges />
      </main>

      {/* 3. Global Marketplace Footer Shell */}
      <Footer />
    </div>
  );
}
