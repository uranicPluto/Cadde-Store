import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockBrands } from "@/lib/mock-data";
import { BrandCard } from "@/components/marketplace/brand-card";
import { ArrowRight, Tag } from "lucide-react";

export const FeaturedBrandsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const brands = getMockBrands(language);

  return (
    <section className="w-full bg-white py-8 border-b border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-main tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              <span>{t("homepage.featuredBrandsTitle")}</span>
            </h2>
            <p className="text-xs text-text-subtle">
              {t("homepage.featuredBrandsSubtitle")}
            </p>
          </div>
          <a href="#" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t("homepage.viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div>
      </div>
    </section>
  );
};
