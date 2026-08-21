"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/marketplace/product-card";
import { useLanguage } from "@/lib/i18n/language-context";
import { Layout, CheckCircle2, User, Heart, ShoppingBag, Globe, Search } from "lucide-react";

export default function HeaderDemoPage() {
  const { language, setLanguage, t } = useLanguage();
  const products = getMockProducts(language);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(4);
  const [cartCount, setCartCount] = useState(2);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Primary Global Marketplace Header Shell */}
      <MarketplaceHeader
        isLoggedInMock={isLoggedIn}
        onLoginToggleMock={() => setIsLoggedIn(!isLoggedIn)}
        favoriteCount={favoriteCount}
        cartCount={cartCount}
      />

      {/* Main Demo Showcase Body */}
      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        {/* Stage 02 Control & Interactive Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="bestseller" size="sm" className="bg-primary text-white border-0">
                Stage 02 — TR ↔ EN Localization
              </Badge>
              {/* Visual Demo Language Indicator */}
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Language: {language.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-text-main tracking-tight">
              {t("headerDemo.bannerTitle")}
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              {t("headerDemo.bannerSubtitle")}
            </p>
          </div>

          {/* Interactive State Toggles */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-3 shrink-0 w-full sm:w-auto">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center justify-between">
              <span>{t("headerDemo.demoControls")}</span>
              <span className="text-primary font-bold">{language.toUpperCase()}</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {/* TR / EN Direct Toggle Buttons */}
              <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 rounded-md">
                <Button
                  variant={language === "tr" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage("tr")}
                  className="text-xs px-2.5 py-1"
                >
                  <Globe className="w-3 h-3 mr-1" /> TR (Türkçe)
                </Button>
                <Button
                  variant={language === "en" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className="text-xs px-2.5 py-1"
                >
                  <Globe className="w-3 h-3 mr-1" /> EN (English)
                </Button>
              </div>

              <Button
                variant={isLoggedIn ? "primary" : "outline"}
                size="sm"
                onClick={() => setIsLoggedIn(!isLoggedIn)}
              >
                <User className="w-3.5 h-3.5 mr-1" />
                {isLoggedIn ? "Ahmet Yılmaz" : t("common.signIn")}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFavoriteCount((prev) => (prev > 0 ? 0 : 5))}
              >
                <Heart className="w-3.5 h-3.5 mr-1 text-rose-500" />
                {t("common.favorites")} ({favoriteCount})
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCartCount((prev) => (prev > 0 ? 0 : 3))}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1 text-primary" />
                {t("common.cart")} ({cartCount})
              </Button>
            </div>
          </div>
        </div>

        {/* DEMO STATES SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* State 1: Utility & Main Header */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2">
            <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. {t("common.language")} & {t("common.currency")} (TR ↔ EN)
            </h3>
            <p className="text-xs text-text-muted">
              {language === "tr"
                ? "Üst çubukta yer alan 🌐 TR / TL menüsü üzerinden Türkçe ve İngilizce dilleri arasında anında geçiş yapılır, seçim localStorage'da saklanır."
                : "Switch instantly between Turkish and English using the 🌐 TR / TL menu in the top bar. Preference is saved in localStorage."}
            </p>
          </div>

          {/* State 2: Search Integration */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2">
            <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              2. {t("common.search")}
            </h3>
            <p className="text-xs text-text-muted">
              {t("common.searchPlaceholder")}
            </p>
          </div>

          {/* State 3: Mega Menu */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2">
            <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
              <Layout className="w-4 h-4 text-purple-600" />
              3. {t("megaMenu.featuredBrands")} & {t("megaMenu.popularCategories")}
            </h3>
            <p className="text-xs text-text-muted">
              {language === "tr"
                ? "Mega menü başlıkları, kampanya yazıları ve buton etiketleri seçili dile göre dinamik güncellenir."
                : "Mega menu headers, campaign banners, and button labels update dynamically based on selected language."}
            </p>
          </div>

          {/* State 4: Account & Cart Dropdowns */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2">
            <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              4. {t("common.account")} & {t("common.cart")}
            </h3>
            <p className="text-xs text-text-muted">
              {language === "tr"
                ? `Kullanıcı aksiyonları (${t("header.myOrders")}, ${t("header.myFavorites")}, ${t("header.myCoupons")}) seçilen dile anında adapte olur.`
                : `User account actions (${t("header.myOrders")}, ${t("header.myFavorites")}, ${t("header.myCoupons")}) adapt to the selected language immediately.`}
            </p>
          </div>
        </div>

        {/* Product Cards Localization Test */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-text-main">
                {t("common.allProducts")} (Product Card i18n Test)
              </h3>
              <p className="text-xs text-text-muted">
                {t("headerDemo.gridTestSubtitle")}
              </p>
            </div>
            <Badge variant="seller" size="sm">i18n Active</Badge>
          </div>

          {/* High density product preview grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
