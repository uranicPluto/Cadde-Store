"use client";

import React, { useState } from "react";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Toggle } from "@/components/ui/toggle";
import { SearchComponent } from "@/components/marketplace/search-component";
import { ProductCard } from "@/components/marketplace/product-card";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { BrandCard } from "@/components/marketplace/brand-card";
import { StoreCard } from "@/components/marketplace/store-card";
import { Banner } from "@/components/marketplace/banner";
import { Carousel } from "@/components/marketplace/carousel";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FilterSidebar } from "@/components/marketplace/filter-sidebar";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { Toast, ToastType } from "@/components/ui/toast";
import {
  ProductCardSkeleton,
  BrandCardSkeleton,
} from "@/components/ui/skeleton";
import { EmptyState } from "@/components/marketplace/empty-state";
import { ErrorState } from "@/components/marketplace/error-state";
import { useLanguage } from "@/lib/i18n/language-context";

import {
  getMockProducts,
  getMockBrands,
  getMockStores,
  getMockBanners,
} from "@/lib/mock-data";
import { Heart, Filter as FilterIcon, Layers, Globe } from "lucide-react";

export default function DesignSystemPage() {
  const { language, setLanguage, t } = useLanguage();

  const products = getMockProducts(language);
  const brands = getMockBrands(language);
  const stores = getMockStores(language);
  const banners = getMockBanners(language);

  // Interactive State Handlers
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Form State Handlers
  const [textInputVal, setTextInputVal] = useState("");
  const [selectVal, setSelectVal] = useState("tr");
  const [multiSelectVal, setMultiSelectVal] = useState(["nike", "zara"]);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState("opt1");
  const [toggleVal, setToggleVal] = useState(true);

  // Toast Trigger State
  const [activeToast, setActiveToast] = useState<{
    type: ToastType;
    title: string;
    message?: string;
  } | null>({
    type: "success",
    title: t("designSystem.sampleToastSuccess"),
    message: t("designSystem.sampleToastMessage"),
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-wide mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg shadow-sm">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-text-main">
                CADDE STORE
              </span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                Stage 01 — Design System
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold text-text-muted">
            <a href="#colors" className="hover:text-primary transition-colors px-2 py-1">{t("filters.filtersTitle")}</a>
            <a href="#typography" className="hover:text-primary transition-colors px-2 py-1">Tipografi</a>
            <a href="#buttons" className="hover:text-primary transition-colors px-2 py-1">Butonlar</a>
            <a href="#inputs" className="hover:text-primary transition-colors px-2 py-1">Inputlar</a>
            <a href="#search" className="hover:text-primary transition-colors px-2 py-1">{t("common.search")}</a>
            <a href="#product-cards" className="hover:text-primary transition-colors px-2 py-1">{t("common.allProducts")}</a>
            <a href="#filters" className="hover:text-primary transition-colors px-2 py-1">{t("filters.filtersTitle")}</a>
          </div>

          <div className="flex items-center gap-2">
            {/* TR / EN Direct Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200 rounded-md">
              <Button
                variant={language === "tr" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("tr")}
                className="text-xs px-2 py-0.5 min-h-[26px]"
              >
                TR
              </Button>
              <Button
                variant={language === "en" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("en")}
                className="text-xs px-2 py-0.5 min-h-[26px]"
              >
                EN
              </Button>
            </div>

            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
              Stage 01 Restored
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-wide mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-10">
        {/* Intro Hero Box */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary/90 rounded-2xl p-8 text-white shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" /> Trendyol-Grade UX Benchmark
            </div>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded text-white flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Language: {language.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t("designSystem.heroTitle")}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            {t("designSystem.heroDesc")}
          </p>
        </div>

        {/* 01. COLOR SYSTEM */}
        <SectionWrapper id="colors" number={1} title="Color Token System" description="Centralized CSS design tokens for primary conversion brand color, neutrals, and e-commerce functional states.">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="h-16 rounded bg-primary shadow-xs" />
              <span className="text-xs font-bold text-text-main mt-1">Brand Primary</span>
              <span className="text-[10px] text-text-muted font-mono">#F27A1A</span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="h-16 rounded bg-discount shadow-xs" />
              <span className="text-xs font-bold text-text-main mt-1">Discount Red</span>
              <span className="text-[10px] text-text-muted font-mono">#E20613</span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="h-16 rounded bg-campaign shadow-xs" />
              <span className="text-xs font-bold text-text-main mt-1">Campaign Purple</span>
              <span className="text-[10px] text-text-muted font-mono">#7C3AED</span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="h-16 rounded bg-success shadow-xs" />
              <span className="text-xs font-bold text-text-main mt-1">Success Green</span>
              <span className="text-[10px] text-text-muted font-mono">#10B981</span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="h-16 rounded bg-warning shadow-xs" />
              <span className="text-xs font-bold text-text-main mt-1">Warning Amber</span>
              <span className="text-[10px] text-text-muted font-mono">#F59E0B</span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="h-16 rounded bg-text-main shadow-xs" />
              <span className="text-xs font-bold text-text-main mt-1">Near Black</span>
              <span className="text-[10px] text-text-muted font-mono">#1A1A1E</span>
            </div>
          </div>
        </SectionWrapper>

        {/* 02. TYPOGRAPHY SYSTEM */}
        <SectionWrapper id="typography" number={2} title="Typography Hierarchy & Character Support" description="Modern sans-serif typography system supporting Turkish and English character sets.">
          <div className="flex flex-col gap-4 divide-y divide-slate-100">
            <div className="pt-2">
              <span className="text-xs font-mono text-text-subtle">Display (36px / Bold)</span>
              <h1 className="text-3xl font-extrabold text-text-main">
                {t("designSystem.heroTitle")}
              </h1>
            </div>
            <div className="pt-3">
              <span className="text-xs font-mono text-text-subtle">H1 (30px / Bold)</span>
              <h1 className="text-2xl font-bold text-text-main">
                {language === "tr"
                  ? "Şapka, Ayakkabı, Çanta & Elektronik Ürün Çeşitleri"
                  : "Hats, Shoes, Bags & Electronics Collection"}
              </h1>
            </div>
            <div className="pt-3">
              <span className="text-xs font-mono text-text-subtle">H2 (24px / SemiBold)</span>
              <h2 className="text-xl font-semibold text-text-main">
                {t("carousel.flashDeals")} & {t("badges.coupon")}
              </h2>
            </div>
            <div className="pt-3">
              <span className="text-xs font-mono text-text-subtle">Body Large (16px / Regular)</span>
              <p className="text-base text-text-main leading-relaxed">
                {t("designSystem.heroDesc")}
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs font-semibold text-amber-900 flex-1">
                {t("designSystem.characterTestTr")} <span className="font-extrabold text-primary">ç ğ ı İ ö ş ü Ç Ğ İ Ö Ş Ü</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-xs font-semibold text-indigo-900 flex-1">
                {t("designSystem.characterTestEn")} <span className="font-extrabold text-indigo-700">ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* 03. BUTTON SYSTEM */}
        <SectionWrapper id="buttons" number={3} title="Core Button System" description="10 production-ready button variants with state triggers (Default, Hover, Active, Focus, Disabled, Loading).">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="icon-only"><Heart className="w-4 h-4" /></Button>
              <Button variant="quick-action">{t("productCard.quickView")}</Button>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-text-muted uppercase">Marketplace Action Buttons</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 max-w-md gap-3">
                <Button variant="add-to-cart">{t("productCard.addToCart")}</Button>
                <Button variant="primary" isLoading>{t("common.loading")}</Button>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* 04. INPUT SYSTEM */}
        <SectionWrapper id="inputs" number={4} title="Form Input System" description="Comprehensive form controls including text, password, select, multi-select, checkbox, radio, and toggle switches.">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Input
              label={t("designSystem.sampleFullName")}
              placeholder={language === "en" ? "John Doe" : "Ahmet Yılmaz"}
              value={textInputVal}
              onChange={(e) => setTextInputVal(e.target.value)}
              helperText={language === "en" ? "Used for billing and delivery." : "Fatura ve teslimat için kullanılır."}
            />

            <Input
              label={t("designSystem.samplePassword")}
              type="password"
              placeholder="••••••••"
              error={language === "en" ? "Must be at least 8 characters." : "En az 8 karakter olmalıdır."}
            />

            <Select
              label={t("designSystem.sampleCountry")}
              options={[
                { label: language === "en" ? "Turkey" : "Türkiye", value: "tr" },
                { label: language === "en" ? "Germany" : "Almanya", value: "de" },
                { label: language === "en" ? "United Kingdom" : "İngiltere", value: "uk" },
              ]}
              value={selectVal}
              onChange={setSelectVal}
            />

            <Select
              label={t("designSystem.sampleBrands")}
              isMulti
              isSearchable
              options={[
                { label: "Nike", value: "nike" },
                { label: "Zara", value: "zara" },
                { label: "Apple", value: "apple" },
                { label: "Samsung", value: "samsung" },
              ]}
              value={multiSelectVal}
              onChange={setMultiSelectVal}
            />

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-text-main">{t("designSystem.sampleOptions")}</label>
              <Checkbox
                label={t("designSystem.sampleAgreement")}
                checked={checkboxVal}
                onChange={(e) => setCheckboxVal(e.target.checked)}
              />
              <Radio
                label={t("designSystem.samplePayment")}
                name="pay"
                checked={radioVal === "opt1"}
                onChange={() => setRadioVal("opt1")}
              />
              <Toggle
                label={t("designSystem.sampleNotification")}
                checked={toggleVal}
                onChange={setToggleVal}
              />
            </div>
          </div>
        </SectionWrapper>

        {/* 05. MARKETPLACE SEARCH */}
        <SectionWrapper id="search" number={5} title="Marketplace Search Bar" description="Search input bar with instant autocomplete suggestions modal overlay for recent, popular, and product results.">
          <div className="p-4 bg-slate-100 rounded-lg flex items-center justify-center">
            <SearchComponent onSearchSubmit={(q) => alert(`${t("common.search")}: ${q}`)} />
          </div>
        </SectionWrapper>

        {/* 06. PRODUCT CARD */}
        <SectionWrapper id="product-cards" number={6} title="Product Card Component" description="High-density e-commerce product card with exact image ratio, badges, ratings, TL prices, and quick add-to-cart.">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(prod) =>
                  setActiveToast({
                    type: "success",
                    title: t("header.cartSummary", { count: 1 }),
                    message: `${prod.name}`,
                  })
                }
                onQuickView={() => setIsModalOpen(true)}
              />
            ))}
          </div>
        </SectionWrapper>

        {/* 07. PRICE COMPONENT */}
        <SectionWrapper id="prices" number={7} title="Price Formatting (TL)" description="Reusable prices formatted with Turkish Lira currency standard (e.g. 1.299,99 TL).">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-white border rounded flex flex-col gap-1">
              <span className="text-xs font-bold text-text-muted">{t("designSystem.priceStandard")}</span>
              <Price price={1299.99} originalPrice={1899.00} size="lg" />
            </div>

            <div className="p-4 bg-white border rounded flex flex-col gap-1">
              <span className="text-xs font-bold text-text-muted">{t("designSystem.priceCartDiscount")}</span>
              <Price
                price={899.00}
                originalPrice={1299.00}
                campaignPrice={799.00}
                size="md"
              />
            </div>

            <div className="p-4 bg-white border rounded flex flex-col gap-1">
              <span className="text-xs font-bold text-text-muted">{t("designSystem.priceInstallments")}</span>
              <Price
                price={4599.00}
                originalPrice={5299.00}
                installmentText={language === "en" ? "3 Installments x 1,533 TL" : "3 Taksit x 1.533 TL"}
                size="xl"
              />
            </div>
          </div>
        </SectionWrapper>

        {/* 08. RATINGS */}
        <SectionWrapper id="ratings" number={8} title="Rating Component" description="Star ratings with review count badges, compact, half-star, and numeric formats.">
          <div className="flex flex-wrap items-center gap-6">
            <Rating rating={4.8} reviewCount={1420} size="md" />
            <Rating rating={4.5} reviewCount={320} size="sm" />
            <Rating rating={4.9} variant="compact" />
          </div>
        </SectionWrapper>

        {/* 09. BADGES */}
        <SectionWrapper id="badges" number={9} title="Marketplace Badges" description="E-commerce promotional badges for campaigns, shipping, discounts, and ratings.">
          <div className="flex flex-wrap gap-2">
            <Badge variant="bestseller">{t("badges.bestseller")}</Badge>
            <Badge variant="new">{t("badges.new")}</Badge>
            <Badge variant="discount">%50 {t("badges.discount")}</Badge>
            <Badge variant="free-shipping">{t("badges.freeShipping")}</Badge>
            <Badge variant="fast-delivery">{t("badges.fastDelivery")}</Badge>
            <Badge variant="coupon">{t("badges.coupon")}</Badge>
            <Badge variant="campaign">{t("badges.campaign")}</Badge>
            <Badge variant="limited-stock">{t("badges.limitedStock", { count: 3 })}</Badge>
            <Badge variant="top-rated">{t("badges.topRated")}</Badge>
            <Badge variant="seller">{t("badges.seller")}</Badge>
          </div>
        </SectionWrapper>

        {/* 10. BRAND CARDS */}
        <SectionWrapper id="brand-cards" number={10} title="Brand Card Component" description="Promotional brand logos with discount taglines for homepage and category strips.">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        </SectionWrapper>

        {/* 11. STORE CARDS */}
        <SectionWrapper id="store-cards" number={11} title="Store Card Component" description="Merchant store profile cards for multi-vendor marketplace presentation.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </SectionWrapper>

        {/* 12. BANNERS */}
        <SectionWrapper id="banners" number={12} title="Banner Components" description="Responsive hero and promotional banners for CMS layout composition.">
          <div className="flex flex-col gap-6">
            <Banner banner={banners[0]} variant="hero" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Banner banner={banners[1]} variant="small" />
              <Banner banner={banners[0]} variant="small" />
            </div>
          </div>
        </SectionWrapper>

        {/* 13. CAROUSELS */}
        <SectionWrapper id="carousels" number={13} title="Horizontal Carousel" description="Responsive product carousel with smooth horizontal scrolling and navigation controls.">
          <Carousel title={t("carousel.flashDeals")} subtitle={t("carousel.flashSubtitle")}>
            {products.map((p) => (
              <div key={p.id} className="w-52 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </Carousel>
        </SectionWrapper>

        {/* 14. BREADCRUMBS */}
        <SectionWrapper id="breadcrumbs" number={14} title="Breadcrumb Navigation" description="Responsive path trail for e-commerce category pages.">
          <Breadcrumb
            items={[
              { label: t("categories.elektronik"), href: "#" },
              { label: language === "en" ? "Headphones" : "Kulaklıklar", href: "#" },
              { label: language === "en" ? "Bluetooth Headphones" : "Bluetooth Kulaklıklar" },
            ]}
          />
        </SectionWrapper>

        {/* 15. FILTERS */}
        <SectionWrapper id="filters" number={15} title="Filter UI (Sidebar & Mobile Drawer)" description="Marketplace filter component with sidebar and mobile drawer trigger.">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="md:hidden"
              >
                <FilterIcon className="w-4 h-4 mr-1" /> {t("filters.openMobileFilters")}
              </Button>
            </div>

            <div className="max-w-xs">
              <FilterSidebar />
            </div>
          </div>
        </SectionWrapper>

        {/* 16. TABS */}
        <SectionWrapper id="tabs" number={16} title="Tabs Component" description="Underline and pill style tabs for product details, reviews, and store sections.">
          <div className="flex flex-col gap-6">
            <Tabs
              items={[
                { id: "all", label: t("tabs.allProducts"), count: 120 },
                { id: "best", label: t("tabs.bestsellers"), count: 42 },
                { id: "new", label: t("tabs.newArrivals"), count: 15 },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
            />

            <Tabs
              variant="pills"
              items={[
                { id: "all", label: t("tabs.all") },
                { id: "best", label: t("tabs.flashDiscounts") },
                { id: "new", label: t("tabs.couponProducts") },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </SectionWrapper>

        {/* 17. MODALS */}
        <SectionWrapper id="modals" number={17} title="Modal Dialog" description="Accessible modal dialog with overlay, keyboard escape, and focus trap.">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            {t("designSystem.openQuickViewModal")}
          </Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={t("designSystem.modalTitle")}
            footer={
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                {t("designSystem.understood")}
              </Button>
            }
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={products[0].imageUrl}
                alt="Modal Product"
                className="w-36 h-36 object-cover rounded border"
              />
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm text-text-main">{products[0].name}</span>
                <Price price={products[0].price} originalPrice={products[0].originalPrice} />
                <p className="text-xs text-text-muted">
                  {language === "en"
                    ? "100% Cotton high quality oversize fit t-shirt."
                    : "%100 Pamuklu yüksek kaliteli oversize fit tişört."}
                </p>
              </div>
            </div>
          </Modal>
        </SectionWrapper>

        {/* 18. DRAWERS */}
        <SectionWrapper id="drawers" number={18} title="Drawer & Bottom Sheet" description="Sidebar and bottom sheet drawer overlays for mobile filters and cart panels.">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
              {t("designSystem.openRightDrawer")}
            </Button>
          </div>
          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title={t("header.cartSummary", { count: 1 })}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded">
                <img
                  src={products[0].imageUrl}
                  alt="Cart product"
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-bold text-text-main">{products[0].name}</span>
                  <span className="text-xs font-bold text-primary">{products[0].price} TL</span>
                </div>
              </div>
            </div>
          </Drawer>

          <Drawer
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            position="bottom"
            title={t("filters.mobileFilterTitle")}
          >
            <FilterSidebar />
          </Drawer>
        </SectionWrapper>

        {/* 19. TOASTS */}
        <SectionWrapper id="toasts" number={19} title="Toasts & Notifications" description="Toast alert cards for success, error, warning, and informational feedback.">
          <div className="flex flex-col gap-3 max-w-sm">
            <Toast type="success" title={t("designSystem.sampleToastSuccess")} message={t("designSystem.sampleToastMessage")} />
            <Toast type="error" title={t("designSystem.sampleToastErrorTitle")} message={t("designSystem.sampleToastErrorMsg")} />
            <Toast type="warning" title={t("designSystem.sampleToastWarningTitle")} message={t("designSystem.sampleToastWarningMsg")} />
            <Toast type="info" title={t("designSystem.sampleToastInfoTitle")} message={t("designSystem.sampleToastInfoMsg")} />
          </div>
        </SectionWrapper>

        {/* 20. SKELETONS */}
        <SectionWrapper id="skeletons" number={20} title="Loading Skeleton States" description="Skeleton loaders matching exact component shapes to prevent layout shifts.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <BrandCardSkeleton />
            <BrandCardSkeleton />
          </div>
        </SectionWrapper>

        {/* 21. EMPTY STATES */}
        <SectionWrapper id="empty-states" number={21} title="Empty States UI" description="Empty state card UI presets for no products, empty cart, and no search matches.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState type="no-products" />
            <EmptyState type="empty-cart" />
          </div>
        </SectionWrapper>

        {/* 22. ERROR STATES */}
        <SectionWrapper id="error-states" number={22} title="Error States UI" description="Error state cards for generic errors, network disconnects, and 404 pages.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ErrorState type="network" onRetry={() => alert(language === "en" ? "Retrying..." : "Yeniden deneniyor...")} />
            <ErrorState type="not-found" />
          </div>
        </SectionWrapper>

        {/* 23. RESPONSIVE GRID PREVIEW */}
        <SectionWrapper id="responsive" number={23} title="Responsive Grid Behavior Preview" description="Demonstration of high-density product grid adapting from 6 columns (1440px+) to 2 columns (mobile).">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </SectionWrapper>
      </main>
    </div>
  );
}
