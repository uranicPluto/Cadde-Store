import React, { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Crown,
  Zap,
  Tag,
  Ticket,
  Gift,
  ShoppingBag,
  Sparkles,
  Utensils,
  Coins,
  Palette,
  HeartHandshake,
  Percent,
} from "lucide-react";

export const BrandQuickStrip: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 260, behavior: "smooth" });
  };

  const featuredBrands = [
    { name: "DeFacto", slug: "defacto", logoText: "DeFacto" },
    { name: "Koton", slug: "koton", logoText: "KOTON" },
    { name: "Karaca", slug: "karaca", logoText: "Karaca" },
    { name: "U.S. POLO ASSN.", slug: "us-polo-assn", logoText: "U.S. POLO ASSN." },
    { name: "Adidas", slug: "adidas", logoText: "adidas" },
    { name: "LUFIAN", slug: "lufian", logoText: "LUFIAN" },
    { name: "MANGO", slug: "mango", logoText: "MANGO" },
    { name: "Pierre Cardin", slug: "pierre-cardin", logoText: "pierre cardin" },
    { name: "BERSHKA", slug: "bershka", logoText: "BERSHKA" },
    { name: "Pull&Bear", slug: "pull-bear", logoText: "PULL&BEAR" },
    { name: "Mavi", slug: "mavi", logoText: "mavi" },
    { name: "Madmext", slug: "madmext", logoText: "Madmext" },
    { name: "H&M", slug: "hm", logoText: "H&M" },
    { name: "Puma", slug: "puma", logoText: "PUMA" },
    { name: "Bofigo", slug: "bofigo", logoText: "bofigo" },
    { name: "the CEEL", slug: "the-ceel", logoText: "the CEEL" },
    { name: "DANIEL KLEIN", slug: "daniel-klein", logoText: "DANIEL KLEIN" },
    { name: "Nike", slug: "nike", logoText: "NIKE" },
    { name: "ENGLISH HOME", slug: "english-home", logoText: "ENGLISH HOME" },
  ];

  const quickActions = [
    {
      label: isEn ? "Today's price drops" : "Günün Fırsatları",
      href: "/search?q=discount",
      icon: TrendingDown,
      ringColor: "border-rose-400 bg-rose-50 text-rose-600",
    },
    {
      label: isEn ? "Meal" : "Cadde Yemek",
      href: "/category/supermarket",
      icon: Utensils,
      badge: "Yeni",
      ringColor: "border-orange-500 bg-orange-50 text-orange-600",
    },
    {
      label: isEn ? "Discover benefits" : "Cadde Plus Fırsatları",
      href: "/category/women",
      icon: Crown,
      ringColor: "border-amber-400 bg-amber-50 text-amber-600",
    },
    {
      label: isEn ? "Campaign details" : "Kampanya Detayları",
      href: "/category/electronics",
      icon: ShoppingBag,
      ringColor: "border-pink-300 bg-pink-50 text-pink-600",
    },
    {
      label: isEn ? "Marriage campaign" : "Çeyiz Kampanyası",
      href: "/category/home-living",
      icon: HeartHandshake,
      badge: "Keşfet",
      ringColor: "border-amber-500 bg-amber-50 text-amber-700",
    },
    {
      label: isEn ? "Art" : "Cadde Sanat",
      href: "/category/kitap-kirtasiye",
      icon: Palette,
      ringColor: "border-orange-600 bg-orange-500 text-white",
    },
    {
      label: isEn ? "Good deals" : "Harika Fırsatlar",
      href: "/search?q=deals",
      icon: Percent,
      ringColor: "border-indigo-400 bg-indigo-50 text-indigo-600",
    },
    {
      label: isEn ? "Get yours too!" : "Hemen Sen de Al!",
      href: "/category/shoes-bags",
      icon: Sparkles,
      ringColor: "border-cyan-400 bg-cyan-50 text-cyan-600",
    },
    {
      label: isEn ? "Promotions" : "Promosyonlar",
      href: "/category/men",
      icon: Gift,
      ringColor: "border-purple-300 bg-purple-50 text-purple-600",
    },
    {
      label: isEn ? "My coupons" : "Kuponlarım",
      href: "/account/coupons",
      icon: Ticket,
      ringColor: "border-purple-500 bg-purple-100 text-purple-700",
    },
    {
      label: isEn ? "Loans & Credit" : "Kredi & Taksit",
      href: "/help",
      icon: Coins,
      ringColor: "border-amber-400 bg-amber-100 text-amber-800",
    },
  ];

  return (
    <div className="w-full bg-slate-50/80 py-6 border-b border-slate-200 select-none">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-5">
        {/* Section Title: Brands for You (Matches Reference Image 2 & 3) */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            {isEn ? "Brands for You" : "Sana Özel Markalar"}
          </h3>
        </div>

        {/* Row 1: Squarish Brand Logo Cards Carousel with Left/Right Arrow Buttons (Matches Reference Image 2 & 3) */}
        <div className="relative group">
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all opacity-90 group-hover:opacity-100"
            aria-label="Previous brands"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {featuredBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/search?q=${encodeURIComponent(b.name)}`}
                className="w-28 h-20 sm:w-32 sm:h-24 bg-white border border-slate-200/90 hover:border-primary rounded-2xl p-3 flex items-center justify-center shadow-2xs hover:shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight text-center line-clamp-1">
                  {b.logoText}
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all opacity-90 group-hover:opacity-100"
            aria-label="Next brands"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Row 2: 3D Circular Quick Link Action Buttons (Matches Reference Image 2) */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {quickActions.map((qa, idx) => {
            const IconComponent = qa.icon;
            return (
              <Link
                key={idx}
                href={qa.href}
                className="flex flex-col items-center gap-2 group shrink-0 select-none w-20"
              >
                <div className="relative">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 ${qa.ringColor} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>
                  {qa.badge && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs whitespace-nowrap">
                      {qa.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-primary transition-colors text-center leading-tight">
                  {qa.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
