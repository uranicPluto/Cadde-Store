"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";
import { ProductCard } from "@/components/marketplace/product-card";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { MOCK_BRANDS } from "@/lib/mock-data";
import { SponsorCarouselSection } from "@/components/homepage/sponsor-carousel-section";

import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  Award,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Clock,
  Tag,
  Star,
  Zap,
  ShoppingBag,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PageSectionData {
  id: string;
  type: string;
  titleTR?: string;
  titleEN?: string;
  orderIndex?: number;
  active?: boolean;
  configJson?: any;
  banners?: any[];
}

export interface StorefrontPageRendererProps {
  page: {
    id: string;
    slug: string;
    titleTr: string;
    titleEn: string;
    type?: string;
    status?: string;
    sectionsJson: string | PageSectionData[];
    metaTitleTr?: string | null;
    metaTitleEn?: string | null;
    metaDescriptionTr?: string | null;
    metaDescriptionEn?: string | null;
  };
  previewMode?: boolean;
}

export function StorefrontPageRenderer({ page, previewMode = false }: StorefrontPageRendererProps) {
  const { language } = useLanguage();
  const isEn = language === "en";

  const sections: PageSectionData[] = useMemo(() => {
    try {
      if (Array.isArray(page.sectionsJson)) {
        return page.sectionsJson;
      }
      if (typeof page.sectionsJson === "string") {
        const parsed = JSON.parse(page.sectionsJson);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.warn("Failed to parse page sectionsJson:", e);
      return [];
    }
  }, [page.sectionsJson]);

  const sortedActiveSections = useMemo(() => {
    return sections
      .filter((sec) => previewMode || sec.active !== false)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [sections, previewMode]);

  const allProducts = useMemo(() => getFullCatalog(language), [language]);

  if (sortedActiveSections.length === 0) {
    return (
      <div className="py-16 text-center max-w-2xl mx-auto px-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {isEn ? "Page Under Construction" : "Sayfa İçeriği Hazırlanıyor"}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {isEn
            ? "This page has been created but does not contain active sections yet."
            : "Bu sayfa oluşturuldu fakat henüz aktif bölüm eklenmedi."}
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="primary">
              {isEn ? "Return to Homepage" : "Ana Sayfaya Dön"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-14 w-full">
      {sortedActiveSections.map((section, idx) => (
        <section key={section.id || `sec-${idx}`} id={section.id} className="w-full">
          <SectionBlockRenderer
            section={section}
            isEn={isEn}
            allProducts={allProducts}
            language={language}
          />
        </section>
      ))}
    </div>
  );
}

function SectionBlockRenderer({
  section,
  isEn,
  allProducts,
  language,
}: {
  section: PageSectionData;
  isEn: boolean;
  allProducts: DetailedProductMock[];
  language: string;
}) {
  const config = typeof section.configJson === "string" ? (() => {
    try { return JSON.parse(section.configJson); } catch { return {}; }
  })() : (section.configJson || {});

  const title = isEn ? section.titleEN || section.titleTR : section.titleTR || section.titleEN;
  const subtitle = isEn ? config.subtitleEN || config.subtitleTR : config.subtitleTR || config.subtitleEN;

  const type = (section.type || "RICH_CONTENT").toUpperCase();

  switch (type) {
    case "HERO":
      return <HeroSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;

    case "BANNER":
    case "PROMOTIONAL_BANNER":
    case "BANNER_STRIP":
      return <BannerSectionBlock title={title} subtitle={subtitle} config={config} banners={section.banners} isEn={isEn} />;

    case "PRODUCT_GRID":
    case "BESTSELLER_GRID":
    case "NEW_ARRIVALS":
    case "FLASH_DEALS":
    case "TRENDING_PRODUCTS":
    case "RECOMMENDED_PRODUCTS":
      return (
        <ProductGridSectionBlock
          title={title}
          subtitle={subtitle}
          config={config}
          allProducts={allProducts}
          isEn={isEn}
        />
      );

    case "CAROUSEL":
    case "PRODUCT_CAROUSEL":
    case "BRAND_CAROUSEL":
    case "CATEGORY_CAROUSEL":
      return (
        <CarouselSectionBlock
          title={title}
          subtitle={subtitle}
          config={config}
          allProducts={allProducts}
          isEn={isEn}
        />
      );

    case "RICH_CONTENT":
    case "CUSTOM_HTML":
    case "MARKDOWN":
      return <RichContentSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;

    case "FAQ":
    case "FAQ_ACCORDION":
      return <FaqAccordionSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;

    case "CONTACT_FORM":
      return <ContactFormSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;

    case "FEATURES":
    case "STORE_HIGHLIGHTS":
      return <FeaturesSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;

    case "TRUST_BADGES":
      return <TrustBadgesSectionBlock isEn={isEn} config={config} />;

    case "SPONSOR_CAROUSEL":
    case "SPONSORS":
      return <SponsorCarouselSection title={title} subtitle={subtitle} config={config} />;

    case "CUSTOM_GRID":
      return <CustomGridSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;

    case "DIVIDER":
      return <hr className="my-6 border-slate-200" />;

    case "SPACER":
      return <div style={{ height: `${config.height || 40}px` }} />;

    default:
      return <RichContentSectionBlock title={title} subtitle={subtitle} config={config} isEn={isEn} />;
  }
}

/* =========================================================================
   1. HERO SECTION BLOCK
   ========================================================================= */
function HeroSectionBlock({
  title,
  subtitle,
  config,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  isEn: boolean;
}) {
  const bgGradient = config.bgGradient || "from-slate-900 via-indigo-950 to-slate-900";
  const bgImage = config.backgroundImage || config.imageUrl;
  const primaryCtaText = isEn ? config.primaryCtaTextEN || config.primaryCtaTextTR || "Explore Now" : config.primaryCtaTextTR || config.primaryCtaTextEN || "Hemen Keşfet";
  const primaryCtaLink = config.primaryCtaLink || "/category/kadin";
  const secondaryCtaText = isEn ? config.secondaryCtaTextEN || config.secondaryCtaTextTR : config.secondaryCtaTextTR || config.secondaryCtaTextEN;
  const secondaryCtaLink = config.secondaryCtaLink || "/about";
  const badgeText = isEn ? config.badgeEN || config.badgeTR : config.badgeTR || config.badgeEN;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-lg text-white p-8 sm:p-14 flex flex-col justify-center gap-6",
        !bgImage && `bg-gradient-to-r ${bgGradient}`
      )}
      style={
        bgImage
          ? {
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {badgeText && (
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 font-extrabold px-3.5 py-1 rounded-full text-xs w-fit shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{badgeText}</span>
        </div>
      )}

      {title && (
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        {primaryCtaText && (
          <Link href={primaryCtaLink}>
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-white font-bold px-6 shadow-md">
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
        {secondaryCtaText && (
          <Link href={secondaryCtaLink}>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold px-6">
              {secondaryCtaText}
            </Button>
          </Link>
        )}
      </div>

      {config.stats && Array.isArray(config.stats) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15 mt-4">
          {config.stats.map((stat: any, i: number) => (
            <div key={i} className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{stat.value}</span>
              <span className="text-xs text-slate-300 font-medium">{isEn ? stat.labelEN || stat.labelTR : stat.labelTR || stat.labelEN}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   2. BANNER SECTION BLOCK
   ========================================================================= */
function BannerSectionBlock({
  title,
  subtitle,
  config,
  banners,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  banners?: any[];
  isEn: boolean;
}) {
  const bannerList = banners && banners.length > 0 ? banners : config.items || [
    {
      titleTR: title || "Özel Kampanya",
      titleEN: title || "Special Campaign",
      subtitleTR: subtitle || "Seçili ürünlerde indirimleri kaçırmayın",
      subtitleEN: subtitle || "Don't miss deals on selected items",
      imageUrlDesktop: config.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      targetValue: config.ctaLink || "/category/kadin",
      ctaTextTR: config.ctaTextTR || "İncele",
      ctaTextEN: config.ctaTextEN || "Explore",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}

      <div className={cn("grid gap-4", bannerList.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {bannerList.map((banner: any, idx: number) => {
          const bTitle = isEn ? banner.titleEN || banner.titleTR : banner.titleTR || banner.titleEN;
          const bSub = isEn ? banner.subtitleEN || banner.subtitleTR : banner.subtitleTR || banner.subtitleEN;
          const bCta = isEn ? banner.ctaTextEN || banner.ctaTextTR || "Shop Now" : banner.ctaTextTR || banner.ctaTextEN || "Alışverişe Başla";
          const bImg = banner.imageUrlDesktop || banner.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";
          const bLink = banner.targetValue || banner.linkUrl || "/";

          return (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden shadow-sm group min-h-[220px] sm:min-h-[260px] flex items-center p-6 sm:p-8 text-white"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.1) 100%), url(${bImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex flex-col gap-2 max-w-md z-10">
                {bTitle && <h3 className="text-lg sm:text-2xl font-extrabold leading-snug">{bTitle}</h3>}
                {bSub && <p className="text-xs sm:text-sm text-slate-200">{bSub}</p>}
                <div className="pt-3">
                  <Link href={bLink}>
                    <Button size="sm" className="bg-primary hover:bg-primary-hover text-white font-bold shadow-xs">
                      <span>{bCta}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   3. PRODUCT GRID SECTION BLOCK
   ========================================================================= */
function ProductGridSectionBlock({
  title,
  subtitle,
  config,
  allProducts,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  allProducts: DetailedProductMock[];
  isEn: boolean;
}) {
  const limit = config.limit || config.itemLimit || 8;
  const categorySlug = config.categorySlug;
  const source = config.source || "ALL";

  const displayedProducts = useMemo(() => {
    let list = [...allProducts];

    if (categorySlug) {
      list = list.filter((p) => p.categorySlug === categorySlug);
    }

    if (source === "BESTSELLER" || source === "BESTSELLING") {
      list = list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (source === "DISCOUNT" || source === "FLASH_DEALS") {
      list = list.sort((a, b) => {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
    } else if (source === "RATING") {
      list = list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (config.selectedProductIds && Array.isArray(config.selectedProductIds) && config.selectedProductIds.length > 0) {
      const selected = allProducts.filter((p) => config.selectedProductIds.includes(p.id));
      if (selected.length > 0) list = selected;
    }

    return list.slice(0, limit);
  }, [allProducts, categorySlug, source, limit, config.selectedProductIds]);

  const columnsMap: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  };
  const columnsClass = columnsMap[Number(config.columns)] || "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          {title && <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 shrink-0"
          >
            <span>{isEn ? "View All" : "Tümünü Gör"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className={cn("grid gap-4", columnsClass)}>
        {displayedProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   4. CAROUSEL SECTION BLOCK
   ========================================================================= */
function CarouselSectionBlock({
  title,
  subtitle,
  config,
  allProducts,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  allProducts: DetailedProductMock[];
  isEn: boolean;
}) {
  const [scrollIdx, setScrollIdx] = useState(0);
  const limit = config.limit || 10;
  const items = useMemo(() => allProducts.slice(0, limit), [allProducts, limit]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          {title && <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4 pt-1 no-scrollbar">
        <div className="flex gap-4 w-max">
          {items.map((prod) => (
            <div key={prod.id} className="w-[240px] sm:w-[260px] shrink-0">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. RICH CONTENT / CUSTOM HTML / MARKDOWN BLOCK
   ========================================================================= */
function RichContentSectionBlock({
  title,
  subtitle,
  config,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  isEn: boolean;
}) {
  const htmlContent = isEn
    ? config.customHtmlEN || config.customHtmlTR || config.contentEN || config.contentTR || config.markdownEN || config.markdownTR
    : config.customHtmlTR || config.customHtmlEN || config.contentTR || config.contentEN || config.markdownTR || config.markdownEN;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs flex flex-col gap-4">
      {title && (
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}

      {htmlContent ? (
        <div
          className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-4"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p className="text-sm text-slate-500">
          {isEn ? "No content available." : "İçerik bulunmuyor."}
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   6. FAQ ACCORDION SECTION BLOCK
   ========================================================================= */
function FaqAccordionSectionBlock({
  title,
  subtitle,
  config,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  isEn: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const rawItems: Array<{ qTR?: string; qEN?: string; aTR?: string; aEN?: string; questionTR?: string; questionEN?: string; answerTR?: string; answerEN?: string }> =
    config.items || config.faqs || [
      {
        questionTR: "Siparişimi nasıl takip edebilirim?",
        questionEN: "How can I track my order?",
        answerTR: "Hesabım > Siparişlerim sayfasından kargo takip numaranızla anlık durum takibi yapabilirsiniz.",
        answerEN: "You can track your order status in real time from My Account > Orders using your tracking number.",
      },
      {
        questionTR: "İade ve değişim şartları nelerdir?",
        questionEN: "What are the return and exchange conditions?",
        answerTR: "Teslimat tarihinden itibaren 14 gün içerisinde ücretsiz ve kolay iade talebi oluşturabilirsiniz.",
        answerEN: "You can create a free return request within 14 days of delivery date.",
      },
      {
        questionTR: "Hangi ödeme yöntemlerini kullanabilirim?",
        questionEN: "Which payment methods are accepted?",
        answerTR: "Kredi kartı, banka kartı, Troy kart ve anlaşmalı taksit seçenekleri ile 3D Secure güvencesiyle ödeme yapabilirsiniz.",
        answerEN: "We accept credit cards, debit cards, Troy cards, and installment plans with 3D Secure.",
      },
      {
        questionTR: "Kargo ücreti ne kadar?",
        questionEN: "How much is the shipping fee?",
        answerTR: "200 TL ve üzeri siparişlerde kargo ücretsizdir. Altındaki siparişlerde standart sabit kargo ücreti uygulanır.",
        answerEN: "Shipping is free for orders over 200 TRY. Standard shipping fee applies below this threshold.",
      },
    ];

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const q = isEn ? item.questionEN || item.qEN || item.questionTR || item.qTR || "" : item.questionTR || item.qTR || item.questionEN || item.qEN || "";
      const a = isEn ? item.answerEN || item.aEN || item.answerTR || item.aTR || "" : item.answerTR || item.aTR || item.answerEN || item.aEN || "";
      const s = searchQuery.toLowerCase().trim();
      if (!s) return true;
      return q.toLowerCase().includes(s) || a.toLowerCase().includes(s);
    });
  }, [rawItems, isEn, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title || (isEn ? "Frequently Asked Questions" : "Sıkça Sorulan Sorular")}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder={isEn ? "Search questions..." : "Sorularda ara..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            {isEn ? "No matching questions found." : "Aramanızla eşleşen soru bulunamadı."}
          </p>
        ) : (
          filteredItems.map((item, idx) => {
            const q = isEn ? item.questionEN || item.qEN || item.questionTR || item.qTR : item.questionTR || item.qTR || item.questionEN || item.qEN;
            const a = isEn ? item.answerEN || item.aEN || item.answerTR || item.aTR : item.answerTR || item.aTR || item.answerEN || item.aEN;
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-100/70 transition-colors"
                >
                  <span>{q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 bg-white leading-relaxed border-t border-slate-100">
                    {a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   7. CONTACT FORM SECTION BLOCK
   ========================================================================= */
function ContactFormSectionBlock({
  title,
  subtitle,
  config,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  isEn: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Contact Info Sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-6 justify-between bg-slate-900 text-white p-6 sm:p-8 rounded-xl">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-primary bg-white/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
            <Mail className="w-3.5 h-3.5" />
            <span>{isEn ? "Direct Support" : "Doğrudan İletişim"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {title || (isEn ? "Get in Touch with Us" : "Bizimle İletişime Geçin")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {subtitle ||
              (isEn
                ? "Our support team is available 7 days a week to answer questions regarding orders, merchants, and partnerships."
                : "Destek ekibimiz siparişler, satıcı süreçleri ve iş birlikleriyle ilgili sorularınızı yanıtlamak için haftanın 7 günü hizmetinizdedir.")}
          </p>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>destek@cadde.store</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+90 850 123 45 67</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Maslak Mah. Büyükdere Cad. No: 120 Sarıyer / İstanbul</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          {isEn ? "Average response time: Under 2 hours" : "Ortalama yanıt süresi: 2 saat içinde"}
        </div>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-7 flex flex-col justify-center">
        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            <h4 className="text-lg font-bold text-emerald-900">
              {isEn ? "Message Sent Successfully!" : "Mesajınız Başarıyla İletildi!"}
            </h4>
            <p className="text-xs text-emerald-700 max-w-md">
              {isEn
                ? "Thank you for reaching out. A support representative will review your request and reply shortly."
                : "Bizimle iletişime geçtiğiniz için teşekkür ederiz. Müşteri temsilcimiz en kısa sürede sizinle iletişime geçecektir."}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
              }}
              className="mt-2 text-xs"
            >
              {isEn ? "Send Another Message" : "Yeni Mesaj Gönder"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Full Name *" : "Ad Soyad *"}
                </label>
                <Input
                  required
                  placeholder={isEn ? "John Doe" : "Ahmet Yılmaz"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Email Address *" : "E-posta Adresi *"}
                </label>
                <Input
                  required
                  type="email"
                  placeholder="ornek@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Phone Number" : "Telefon Numarası"}
                </label>
                <Input
                  placeholder="0532 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Subject" : "Konu"}
                </label>
                <Input
                  placeholder={isEn ? "Order inquiry / Partnership" : "Sipariş sorgusu / İş ortaklığı"}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEn ? "Message *" : "Mesajınız *"}
              </label>
              <textarea
                required
                rows={4}
                placeholder={isEn ? "Write your question or message here..." : "Sorunuzu veya mesajınızı buraya yazınız..."}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto self-end font-bold text-xs">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>{isEn ? "Submit Message" : "Mesajı Gönder"}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   8. FEATURES / STORE HIGHLIGHTS SECTION BLOCK
   ========================================================================= */
function FeaturesSectionBlock({
  title,
  subtitle,
  config,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  isEn: boolean;
}) {
  const items: any[] = config.items || [
    {
      icon: "ShieldCheck",
      titleTR: "%100 Orijinal Ürün",
      titleEN: "100% Authentic Products",
      descTR: "Tüm ürünler yetkili satıcılardan doğrudan temin edilir.",
      descEN: "All items sourced directly from authorized brand sellers.",
    },
    {
      icon: "Truck",
      titleTR: "Hızlı & Güvenli Teslimat",
      titleEN: "Fast & Secure Shipping",
      descTR: "24-48 saat içinde kargoya teslimat garantisi.",
      descEN: "Dispatched within 24-48 hours guaranteed.",
    },
    {
      icon: "RotateCcw",
      titleTR: "14 Gün Kolay İade",
      titleEN: "14-Day Free Returns",
      descTR: "Koşulsuz şartsız ücretsiz iade imkanı.",
      descEN: "Hassle-free 14-day return and instant refund.",
    },
    {
      icon: "Headphones",
      titleTR: "7/24 Müşteri Desteği",
      titleEN: "24/7 Dedicated Support",
      descTR: "Canlı destek ve hızlı çözüm merkezi.",
      descEN: "Live chat and prompt assistance around the clock.",
    },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case "ShieldCheck": return ShieldCheck;
      case "Truck": return Truck;
      case "RotateCcw": return RotateCcw;
      case "Headphones": return Headphones;
      case "CreditCard": return CreditCard;
      case "Award": return Award;
      default: return Sparkles;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {title && (
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className={cn("grid gap-4 sm:gap-6", `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(items.length, 4)}`)}>
        {items.map((item, i) => {
          const IconComp = getIcon(item.icon);
          const iTitle = isEn ? item.titleEN || item.titleTR : item.titleTR || item.titleEN;
          const iDesc = isEn ? item.descEN || item.descTR : item.descTR || item.descEN;

          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <IconComp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{iTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{iDesc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   9. TRUST BADGES SECTION BLOCK
   ========================================================================= */
function TrustBadgesSectionBlock({ isEn, config }: { isEn: boolean; config: any }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900">{isEn ? "100% Original" : "%100 Orijinal"}</span>
          <span className="text-[10px] text-slate-500">{isEn ? "Verified sellers" : "Onaylı satıcılar"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Truck className="w-8 h-8 text-indigo-600 shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900">{isEn ? "Fast Shipping" : "Hızlı Kargo"}</span>
          <span className="text-[10px] text-slate-500">{isEn ? "Over 200 TRY free" : "200 TL üzeri ücretsiz"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <RotateCcw className="w-8 h-8 text-emerald-600 shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900">{isEn ? "14-Day Return" : "14 Gün İade"}</span>
          <span className="text-[10px] text-slate-500">{isEn ? "Hassle-free refund" : "Kolay iade garantisi"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-amber-600 shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900">{isEn ? "3D Secure Payment" : "3D Güvenli Ödeme"}</span>
          <span className="text-[10px] text-slate-500">{isEn ? "256-bit SSL" : "256-bit SSL şifreleme"}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   10. CUSTOM GRID SECTION BLOCK
   ========================================================================= */
function CustomGridSectionBlock({
  title,
  subtitle,
  config,
  isEn,
}: {
  title?: string;
  subtitle?: string;
  config: any;
  isEn: boolean;
}) {
  const items: any[] = config.items || [];

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const iTitle = isEn ? item.titleEN || item.titleTR : item.titleTR || item.titleEN;
          const iDesc = isEn ? item.descEN || item.descTR : item.descTR || item.descEN;
          const iImg = item.imageUrl;
          const iLink = item.linkUrl || "#";

          return (
            <Link
              key={idx}
              href={iLink}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col"
            >
              {iImg && (
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={iImg}
                    alt={iTitle || "Grid item"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col gap-2 flex-1">
                {iTitle && <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors">{iTitle}</h3>}
                {iDesc && <p className="text-xs text-slate-500 leading-relaxed">{iDesc}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
