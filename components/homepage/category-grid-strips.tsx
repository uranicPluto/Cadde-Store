"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockCategories } from "@/lib/mock-data";
import { Shirt, User, Footprints, Smartphone, Home, Sparkles, Activity, ShoppingBag, ArrowRight } from "lucide-react";

export const CategoryGridStrips: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const categories = getMockCategories(language);

  const categoryIcons: Record<string, { icon: React.ReactNode; bg: string }> = {
    c1: { icon: <Shirt className="w-5 h-5 text-rose-500" />, bg: "bg-rose-50 border-rose-100" },
    c2: { icon: <User className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50 border-indigo-100" },
    c3: { icon: <Footprints className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50 border-amber-100" },
    c4: { icon: <Smartphone className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50 border-purple-100" },
    c5: { icon: <Home className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100" },
    c6: { icon: <Sparkles className="w-5 h-5 text-pink-500" />, bg: "bg-pink-50 border-pink-100" },
    c7: { icon: <Activity className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 border-blue-100" },
    c8: { icon: <ShoppingBag className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50 border-orange-100" },
  };

  const categorySlugs: Record<string, string> = {
    c1: "kadin",
    c2: "erkek",
    c3: "ayakkabi-canta",
    c4: "elektronik",
    c5: "ev-yasam",
    c6: "kozmetik",
    c7: "spor",
    c8: "supermarket",
  };

  return (
    <section className="w-full bg-white py-8 border-b border-slate-200 select-none">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEn ? "Explore Popular Categories" : "Popüler Kategorileri Keşfet"}
          </h2>
          <Link
            href="/category/kadin"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{isEn ? "View All" : "Tümünü Gör"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.slice(0, 8).map((c) => {
            const targetSlug = categorySlugs[c.id] || "kadin";
            const targetUrl = `/category/${targetSlug}`;
            const iconData = categoryIcons[c.id] || {
              icon: <Shirt className="w-5 h-5 text-primary" />,
              bg: "bg-orange-50 border-orange-100",
            };

            return (
              <Link
                key={c.id}
                href={targetUrl}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200/90 rounded-2xl hover:border-primary hover:shadow-xs transition-all text-center gap-2.5 group cursor-pointer active:scale-95 shadow-2xs"
              >
                <div className={`w-12 h-12 rounded-full ${iconData.bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {iconData.icon}
                </div>
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
