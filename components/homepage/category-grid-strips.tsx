"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockCategories } from "@/lib/mock-data";
import { Shirt, User, Footprints, Smartphone, Home, Sparkles, Activity, ShoppingBag, ArrowRight } from "lucide-react";

export interface CategoryGridStripsProps {
  title?: string;
  subtitle?: string;
  config?: any;
}

export const CategoryGridStrips: React.FC<CategoryGridStripsProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  config: propConfig,
}) => {
  const { language, t } = useLanguage();
  const router = useRouter();
  const categories = getMockCategories(language);

  const categoryIcons: Record<string, React.ReactNode> = {
    Shirt: <Shirt className="w-5 h-5 text-rose-500" />,
    User: <User className="w-5 h-5 text-indigo-500" />,
    Footprints: <Footprints className="w-5 h-5 text-amber-500" />,
    Smartphone: <Smartphone className="w-5 h-5 text-purple-500" />,
    Home: <Home className="w-5 h-5 text-emerald-500" />,
    Sparkles: <Sparkles className="w-5 h-5 text-pink-500" />,
    Activity: <Activity className="w-5 h-5 text-blue-500" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5 text-orange-500" />,
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

  const handleCategoryClick = (targetSlug: string) => {
    router.push(`/category/${targetSlug}`);
  };

  return (
    <section className="w-full bg-white py-8 border-b border-slate-200 select-none">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {propTitle || t("homepage.categoryStripsTitle")}
          </h2>
          <Link
            href="/category/kadin"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{t("homepage.viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((c) => {
            const targetSlug = categorySlugs[c.id] || "kadin";
            const targetUrl = `/category/${targetSlug}`;

            return (
              <a
                key={c.id}
                href={targetUrl}
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(targetSlug);
                }}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-primary hover:bg-orange-50/40 transition-all text-center gap-2 group shadow-2xs cursor-pointer active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                  {categoryIcons[c.icon] || <Shirt className="w-5 h-5 text-primary" />}
                </div>
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                  {c.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
