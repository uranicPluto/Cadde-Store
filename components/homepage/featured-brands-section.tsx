import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockBrands, BrandMock } from "@/lib/mock-data";
import { BrandCard } from "@/components/marketplace/brand-card";
import { ArrowRight, Tag } from "lucide-react";

export interface FeaturedBrandsSectionProps {
  title?: string;
  subtitle?: string;
  config?: any;
}

export const FeaturedBrandsSection: React.FC<FeaturedBrandsSectionProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  config: propConfig,
}) => {
  const { language, t } = useLanguage();
  const defaultBrands = getMockBrands(language);
  const [brands, setBrands] = useState<BrandMock[]>(defaultBrands);

  useEffect(() => {
    async function loadFeaturedBrands() {
      try {
        const res = await fetch("/api/brands?featured=true");
        const data = await res.json();
        if (data.brands && data.brands.length > 0) {
          setBrands(
            data.brands.map((b: any) => ({
              id: b.id,
              name: b.name,
              logoUrl: b.logoUrl,
              bannerUrl: b.bannerUrl || undefined,
              discountText: language === "en" ? "Official Store" : "Resmi Mağaza",
            }))
          );
        } else {
          setBrands(getMockBrands(language));
        }
      } catch (e) {
        setBrands(getMockBrands(language));
      }
    }

    loadFeaturedBrands();
  }, [language]);

  return (
    <section className="w-full bg-white py-8 border-b border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-main tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              <span>{propTitle || t("homepage.featuredBrandsTitle")}</span>
            </h2>
            <p className="text-xs text-text-subtle">
              {propSubtitle || t("homepage.featuredBrandsSubtitle")}
            </p>
          </div>
          <Link href="/brands" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t("homepage.viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {brands.slice(0, 6).map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div>
      </div>
    </section>
  );
};
