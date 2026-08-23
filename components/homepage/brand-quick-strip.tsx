import React, { useRef, useState, useEffect } from "react";
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
  Flame,
  Truck,
} from "lucide-react";

interface BrandItem {
  id?: string;
  name: string;
  slug: string;
  logoUrl?: string;
  logoText?: string;
}

// Dedicated Brand Logo Renderer matching reference designs
function BrandLogoRenderer({ brand }: { brand: BrandItem }) {
  const norm = (brand.name || "").toLowerCase().trim();

  if (norm.includes("defacto")) {
    return (
      <span className="font-sans text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
        DeFacto
      </span>
    );
  }

  if (norm.includes("koton")) {
    return (
      <div className="flex items-center gap-0.5 font-black text-slate-950 text-xs sm:text-sm tracking-wider">
        <span>K</span>
        <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-[1.8px] border-slate-950 flex items-center justify-center">
          <span className="w-1 h-1 bg-slate-950 rotate-45" />
        </span>
        <span>T</span>
        <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-[1.8px] border-slate-950 flex items-center justify-center">
          <span className="w-1 h-1 bg-slate-950 rotate-45" />
        </span>
        <span>N</span>
      </div>
    );
  }

  if (norm.includes("karaca")) {
    return (
      <div className="flex flex-col items-center leading-none">
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950">
          <path d="M7 3v2l1.5 1.5L7 8H5V6H3v4h2v2h2v4H5v2h2v2h2v-2h6v2h2v-2h2v-4h2v-2h2V6h-2v2h-2V6l-1.5-1.5L17 3h-2v2l-1.5 1.5L12 5l-1.5 1.5L9 5V3H7z" />
        </svg>
        <div className="flex items-baseline mt-0.5">
          <span className="font-extrabold text-[11px] sm:text-xs tracking-tight text-slate-950">karaca</span>
          <span className="text-[6px] font-bold text-slate-700 ml-0.5">®</span>
        </div>
      </div>
    );
  }

  if (norm.includes("polo") || norm.includes("u.s. polo")) {
    return (
      <div className="flex flex-col items-center leading-none text-center">
        <span className="font-serif font-black text-[9px] sm:text-[10px] text-[#0d2240] tracking-wide">
          U.S. POLO ASSN.
        </span>
        <span className="text-[6px] font-black text-rose-700 uppercase tracking-widest mt-0.5">
          SINCE 1890
        </span>
      </div>
    );
  }

  if (norm.includes("adidas")) {
    return (
      <div className="flex flex-col items-center leading-none">
        <svg viewBox="0 0 24 16" className="w-7 h-4 sm:w-8 sm:h-5 fill-[#007bc4]">
          <path d="M12 0c-.8 2-2.5 5.5-6 6.5 2 1.5 4 1.5 6 1.5s4 0 6-1.5c-3.5-1-5.2-4.5-6-6.5zm-8 4C1.5 6.5.5 10 0 12c2.5.5 4.5 0 6.5-1.5C5 9 4.2 6.5 4 4zm16 0c-.2 2.5-1 5-2.5 6.5 2 1.5 4 2 6.5 1.5-.5-2-1.5-5.5-4-8z" />
          <rect x="0" y="8" width="24" height="1" fill="#ffffff" />
          <rect x="0" y="10.5" width="24" height="1" fill="#ffffff" />
        </svg>
        <span className="font-black text-[10px] sm:text-[11px] tracking-tight text-[#007bc4] -mt-0.5">
          adidas
        </span>
      </div>
    );
  }

  if (norm.includes("lufian")) {
    return (
      <span className="font-sans font-extrabold text-[11px] sm:text-[12px] text-slate-900 tracking-[0.25em] uppercase">
        LUFIAN
      </span>
    );
  }

  if (norm.includes("mango")) {
    return (
      <span className="font-black text-xs sm:text-sm text-slate-950 tracking-wider">
        MANGO
      </span>
    );
  }

  if (norm.includes("pierre cardin")) {
    return (
      <div className="flex flex-col items-center leading-none">
        <span className="font-bold text-[11px] sm:text-[12px] text-slate-900 tracking-tight">
          pierre cardin
        </span>
        <span className="text-[6px] font-extrabold text-slate-600 tracking-[0.2em] uppercase mt-0.5">
          PARIS
        </span>
      </div>
    );
  }

  if (norm.includes("bershka")) {
    return (
      <span className="font-black text-xs sm:text-sm text-slate-950 tracking-normal">
        BERSHKA
      </span>
    );
  }

  if (norm.includes("pull") || norm.includes("bear")) {
    return (
      <span className="font-black text-[11px] sm:text-[12px] text-slate-950 tracking-tight">
        PULL&amp;BEAR
      </span>
    );
  }

  if (norm.includes("mavi")) {
    return (
      <span className="font-black text-sm sm:text-base text-[#0066cc] tracking-tight lowercase">
        mavi
      </span>
    );
  }

  if (norm.includes("altınyıldız") || norm.includes("altinyildiz")) {
    return (
      <div className="flex flex-col items-center leading-none text-center">
        <span className="font-black text-[8px] sm:text-[9px] text-[#0a192f] tracking-widest uppercase">
          ALTINYILDIZ
        </span>
        <span className="text-[6px] font-bold text-amber-700 tracking-[0.2em] uppercase mt-0.5">
          CLASSICS
        </span>
      </div>
    );
  }

  if (norm.includes("waikiki") || norm.includes("lcw")) {
    return (
      <div className="flex items-center gap-1 font-black text-[11px] sm:text-xs text-[#002d72]">
        <span>LC</span>
        <span>WAIKIKI</span>
      </div>
    );
  }

  if (norm.includes("nike")) {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 24 10" className="w-7 h-3 sm:w-8 sm:h-3.5 fill-slate-950">
          <path d="M21.7 0c-.5.8-1.5 1.8-2.8 2.6-2.5 1.7-6 2.4-9.9 2-3-.3-5.2-1.3-6.5-2.2-.6-.4-1-.7-1.3-.9l-.7-.4c-.3.7-.5 1.4-.5 2 0 1.2.6 2.3 1.8 3.1 1.7 1.2 4.3 1.8 7.5 1.8 3.4 0 7.3-.8 11.2-2.4 1.8-.7 3.1-1.6 3.8-2.6.5-.7.7-1.5.7-2.3 0-.3 0-.5-.1-.7H21.7z" />
        </svg>
        <span className="font-black text-[9px] sm:text-[10px] text-slate-950 tracking-wider">
          NIKE
        </span>
      </div>
    );
  }

  if (norm.includes("puma")) {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 24 12" className="w-6 h-3 fill-slate-950">
          <path d="M21.5 1.2c-.8-.2-1.8.3-2.4.9-1.2 1.2-2.5 2.1-4 2.6-1.5.5-3 .5-4.4.1-.7-.2-1.5-.6-2.2-1.1-.6-.4-1.3-.9-2-1.2-.7-.3-1.4-.4-2.1-.2-.8.2-1.5.7-1.9 1.4-.4.7-.5 1.6-.3 2.5.2.9.7 1.7 1.4 2.3.8.7 1.8 1.1 2.9 1.2 1.2.1 2.4-.1 3.5-.5 1.4-.5 2.7-1.3 3.8-2.3.8-.7 1.7-1.3 2.7-1.7 1-.4 2-.5 3-.4.8.1 1.5.4 2.1.9.6.5 1 1.2 1.2 1.9.2.8.2 1.6-.1 2.4l.7-.5c.5-.5.8-1.2.9-1.9.1-.8 0-1.6-.4-2.3-.4-.8-1-1.4-1.8-1.8-.2-.1-.5-.2-.7-.3z" />
        </svg>
        <span className="font-black text-[10px] sm:text-[11px] text-slate-950 tracking-widest">
          PUMA
        </span>
      </div>
    );
  }

  if (norm.includes("stradivarius")) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-base text-slate-950 leading-none">𝄞</span>
        <span className="font-serif italic font-bold text-xs text-slate-950">Stradivarius</span>
      </div>
    );
  }

  if (norm.includes("dyson")) {
    return (
      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tracking-tighter lowercase">
        dyson
      </span>
    );
  }

  if (norm.includes("samsung")) {
    return (
      <span className="font-black text-[11px] sm:text-xs text-[#034ea2] tracking-wider uppercase">
        SAMSUNG
      </span>
    );
  }

  if (norm.includes("apple")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-900">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.81.93-2.87-1 .04-2.19.67-2.88 1.48-.56.66-.99 1.73-.86 2.76 1.11.09 2.18-.61 2.81-1.37z" />
      </svg>
    );
  }

  if (norm.includes("ordinary")) {
    return (
      <span className="font-serif font-bold text-[11px] sm:text-xs text-slate-900 tracking-tight">
        The Ordinary.
      </span>
    );
  }

  if (norm.includes("l'oreal") || norm.includes("loreal")) {
    return (
      <div className="flex flex-col items-center leading-none">
        <span className="font-bold text-[10px] sm:text-[11px] text-slate-950 tracking-wider">
          L&apos;ORÉAL
        </span>
        <span className="text-[6px] font-extrabold text-slate-600 tracking-[0.2em] uppercase mt-0.5">
          PARIS
        </span>
      </div>
    );
  }

  if (norm.includes("english home")) {
    return (
      <span className="font-serif font-bold text-[9px] sm:text-[10px] text-slate-900 tracking-wider uppercase text-center">
        ENGLISH HOME
      </span>
    );
  }

  if (norm.includes("madame coco")) {
    return (
      <span className="font-serif font-bold text-[9px] sm:text-[10px] text-slate-900 tracking-widest uppercase text-center">
        MADAME COCO
      </span>
    );
  }

  if (norm.includes("philips")) {
    return (
      <span className="font-black text-[11px] sm:text-xs text-[#0066a1] tracking-widest uppercase">
        PHILIPS
      </span>
    );
  }

  if (norm.includes("xiaomi") || norm.includes("mi")) {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-[#ff6900] text-white font-black text-[8px] px-1 py-0.5 rounded">
          mi
        </span>
        <span className="font-black text-[11px] text-slate-900">Xiaomi</span>
      </div>
    );
  }

  if (norm.includes("h&m") || norm.includes("hm")) {
    return (
      <span className="font-black text-sm text-[#cc0000] italic tracking-tight">
        H&amp;M
      </span>
    );
  }

  if (norm.includes("madmext")) {
    return (
      <span className="font-black text-xs text-slate-950 uppercase tracking-widest">
        MADMEXT
      </span>
    );
  }

  if (norm.includes("daniel klein")) {
    return (
      <span className="font-bold text-[9px] sm:text-[10px] text-slate-950 uppercase tracking-wider text-center">
        DANIEL KLEIN
      </span>
    );
  }

  if (norm.includes("the ceel") || norm.includes("ceel")) {
    return (
      <span className="font-extrabold text-xs text-slate-900 lowercase tracking-wide">
        the <span className="uppercase font-black">CEEL</span>
      </span>
    );
  }

  if (norm.includes("bofigo")) {
    return (
      <span className="font-extrabold text-xs text-slate-900 lowercase tracking-tight">
        bofigo
      </span>
    );
  }

  return (
    <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight text-center line-clamp-1">
      {brand.name}
    </span>
  );
}

export const BrandQuickStrip: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultBrands: BrandItem[] = [
    { name: "DeFacto", slug: "defacto" },
    { name: "Koton", slug: "koton" },
    { name: "Karaca", slug: "karaca" },
    { name: "U.S. POLO ASSN.", slug: "us-polo-assn" },
    { name: "Adidas", slug: "adidas" },
    { name: "LUFIAN", slug: "lufian" },
    { name: "MANGO", slug: "mango" },
    { name: "Pierre Cardin", slug: "pierre-cardin" },
    { name: "BERSHKA", slug: "bershka" },
    { name: "Pull&Bear", slug: "pull-bear" },
    { name: "Mavi", slug: "mavi" },
    { name: "Altınyıldız Classics", slug: "altinyildiz-classics" },
    { name: "LC Waikiki", slug: "lc-waikiki" },
    { name: "Nike", slug: "nike" },
    { name: "Puma", slug: "puma" },
    { name: "Stradivarius", slug: "stradivarius" },
    { name: "Dyson", slug: "dyson" },
    { name: "Samsung", slug: "samsung" },
    { name: "Apple", slug: "apple" },
    { name: "The Ordinary", slug: "the-ordinary" },
    { name: "L'Oréal Paris", slug: "loreal-paris" },
    { name: "English Home", slug: "english-home" },
    { name: "Madame Coco", slug: "madame-coco" },
    { name: "Philips", slug: "philips" },
    { name: "Xiaomi", slug: "xiaomi" },
    { name: "H&M", slug: "hm" },
    { name: "Madmext", slug: "madmext" },
    { name: "the CEEL", slug: "the-ceel" },
    { name: "DANIEL KLEIN", slug: "daniel-klein" },
    { name: "Bofigo", slug: "bofigo" },
  ];

  const [brands, setBrands] = useState<BrandItem[]>(defaultBrands);

  useEffect(() => {
    async function fetchFeaturedBrands() {
      try {
        const res = await fetch("/api/brands?featured=true");
        const data = await res.json();
        if (data.brands && data.brands.length > 0) {
          // Merge database brands with default logos
          const dbBrands = data.brands.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            logoUrl: b.logoUrl && !b.logoUrl.includes("unsplash.com") ? b.logoUrl : undefined,
            logoText: b.name,
          }));
          // Ensure all default brands are included
          const brandMap = new Map<string, BrandItem>();
          defaultBrands.forEach((b) => brandMap.set(b.name.toLowerCase(), b));
          dbBrands.forEach((b: BrandItem) => brandMap.set(b.name.toLowerCase(), b));
          setBrands(Array.from(brandMap.values()));
        } else {
          setBrands(defaultBrands);
        }
      } catch (e) {
        setBrands(defaultBrands);
      }
    }
    fetchFeaturedBrands();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

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
    {
      label: isEn ? "Flash Deals" : "Flaş Satışlar",
      href: "/search?q=flash",
      icon: Flame,
      badge: "Flaş",
      ringColor: "border-rose-500 bg-rose-100 text-rose-700",
    },
    {
      label: isEn ? "Free Delivery" : "Hızlı Kargo",
      href: "/shipping",
      icon: Truck,
      ringColor: "border-emerald-400 bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="w-full bg-slate-50/80 py-6 border-b border-slate-200 select-none overflow-hidden">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-5 w-full">
        {/* Section Title: Brands for You */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            {isEn ? "Brands for You" : "Sana Özel Markalar"}
          </h3>
          <Link
            href="/brands"
            className="text-xs font-bold text-primary hover:underline"
          >
            {isEn ? "All Brands >" : "Tüm Markalar >"}
          </Link>
        </div>

        {/* Row 1: Squarish Brand Logo Cards Carousel with Left/Right Arrow Buttons */}
        <div className="relative group w-full">
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
            aria-label="Previous brands"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full"
          >
            {brands.map((b, idx) => (
              <Link
                key={b.slug || idx}
                href={`/search?brand=${encodeURIComponent(b.name)}`}
                className="w-28 h-20 sm:w-32 sm:h-24 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-3 flex flex-col items-center justify-center shadow-2xs hover:shadow-md transition-all shrink-0 cursor-pointer overflow-hidden group/card"
              >
                <div className="w-full h-full flex items-center justify-center group-hover/card:scale-105 transition-transform duration-200">
                  <BrandLogoRenderer brand={b} />
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
            aria-label="Next brands"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Row 2: 3D Circular Action Buttons Spanning Full Width */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-2 w-full">
          {quickActions.map((qa, idx) => {
            const IconComponent = qa.icon;
            return (
              <Link
                key={idx}
                href={qa.href}
                className="flex flex-col items-center gap-2 group shrink-0 select-none flex-1 min-w-[70px]"
              >
                <div className="relative">
                  <div
                    className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 ${qa.ringColor} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
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

