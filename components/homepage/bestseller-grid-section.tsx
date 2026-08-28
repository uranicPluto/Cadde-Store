"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { fetchDbProducts, DetailedProductMock } from "@/lib/catalog/product-repository";
import { ProductCard } from "@/components/marketplace/product-card";
import { Sparkles, ArrowRight } from "lucide-react";

export interface BestsellerGridSectionProps {
  title?: string;
  subtitle?: string;
  config?: any;
}

export const BestsellerGridSection: React.FC<BestsellerGridSectionProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  config: propConfig,
}) => {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<DetailedProductMock[]>([]);

  useEffect(() => {
    fetchDbProducts(language).then((prods) => setProducts(prods));
  }, [language]);

  return (
    <section className="w-full bg-white py-10 border-t border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{propTitle || t("homepage.bestsellerTitle")}</span>
            </h2>
            <p className="text-xs text-text-subtle">
              {propSubtitle || t("homepage.bestsellerSubtitle")}
            </p>
          </div>
          <a href="/search" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t("homepage.viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 6-Column High Density Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
