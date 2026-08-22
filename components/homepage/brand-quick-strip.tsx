import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { Percent, Crown, Zap, Tag, Ticket, Bell, Sparkles, ShoppingBag, Gift, Heart, HelpCircle } from "lucide-react";

export const BrandQuickStrip: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const featuredBrands = [
    { name: "DeFacto", slug: "defacto", logo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80" },
    { name: "Koton", slug: "koton", logo: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=120&q=80" },
    { name: "Karaca", slug: "karaca", logo: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=120&q=80" },
    { name: "U.S. POLO ASSN.", slug: "us-polo-assn", logo: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=120&q=80" },
    { name: "Adidas", slug: "adidas", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80" },
    { name: "Pierre Cardin", slug: "pierre-cardin", logo: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=120&q=80" },
    { name: "Penti", slug: "penti", logo: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=120&q=80" },
    { name: "Pull&Bear", slug: "pull-bear", logo: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=120&q=80" },
  ];

  const quickActions = [
    {
      label: isEn ? "Price Drops" : "Günün Fırsatları",
      href: "/search?q=discount",
      icon: Percent,
      color: "bg-rose-500 text-white",
    },
    {
      label: isEn ? "Cadde Plus" : "Cadde Plus Fırsatları",
      href: "/category/women",
      icon: Crown,
      color: "bg-amber-500 text-white",
    },
    {
      label: isEn ? "Flash Deals" : "Flaş Ürünler",
      href: "/category/electronics",
      icon: Zap,
      color: "bg-indigo-600 text-white",
    },
    {
      label: isEn ? "Promotions" : "İndirimli Ürünler",
      href: "/category/men",
      icon: Tag,
      color: "bg-emerald-600 text-white",
    },
    {
      label: isEn ? "My Coupons" : "Kuponlarım",
      href: "/account/coupons",
      icon: Ticket,
      color: "bg-purple-600 text-white",
    },
    {
      label: isEn ? "New Arrivals" : "Yeni Gelenler",
      href: "/category/shoes-bags",
      icon: Bell,
      color: "bg-cyan-600 text-white",
    },
    {
      label: isEn ? "Free Shipping" : "Kargo Bedava",
      href: "/category/home-living",
      icon: Sparkles,
      color: "bg-orange-500 text-white",
    },
    {
      label: isEn ? "Help 24/7" : "Canlı Destek",
      href: "/help",
      icon: HelpCircle,
      color: "bg-slate-800 text-white",
    },
  ];

  return (
    <div className="w-full bg-slate-100 py-6 border-b border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        {/* Row 1: Featured Brand Logos (Competitor Screenshot 5) */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {featuredBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/search?q=${encodeURIComponent(b.name)}`}
              className="flex items-center justify-center bg-white border border-slate-200 hover:border-primary rounded-xl px-5 py-3 shadow-2xs hover:shadow-md transition-all shrink-0 font-black text-sm text-slate-800 tracking-tight"
            >
              {b.name}
            </Link>
          ))}
        </div>

        {/* Row 2: 3D Circular Quick Link Action Buttons (Competitor Screenshot 5) */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {quickActions.map((qa, idx) => {
            const IconComponent = qa.icon;
            return (
              <Link
                key={idx}
                href={qa.href}
                className="flex flex-col items-center gap-2 group shrink-0 select-none"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${qa.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors text-center">
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
