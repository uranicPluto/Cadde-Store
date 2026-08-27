import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockStores } from "@/lib/mock-data";
import { StoreCard } from "@/components/marketplace/store-card";
import { Store, ArrowRight } from "lucide-react";

export interface StoreHighlightsSectionProps {
  title?: string;
  subtitle?: string;
  config?: any;
}

export const StoreHighlightsSection: React.FC<StoreHighlightsSectionProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  config: propConfig,
}) => {
  const { language, t } = useLanguage();
  const stores = getMockStores(language);

  return (
    <section className="w-full bg-slate-100 py-8">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-main tracking-tight flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <span>{propTitle || t("homepage.storeHighlightsTitle")}</span>
            </h2>
            <p className="text-xs text-text-subtle">
              {propSubtitle || t("homepage.storeHighlightsSubtitle")}
            </p>
          </div>
          <a href="#" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t("homepage.viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      </div>
    </section>
  );
};
