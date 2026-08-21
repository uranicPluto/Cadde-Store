import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockBanners } from "@/lib/mock-data";
import { Banner } from "@/components/marketplace/banner";

export const CampaignBannerStrips: React.FC = () => {
  const { language } = useLanguage();
  const banners = getMockBanners(language);

  return (
    <section className="w-full bg-slate-100 py-6">
      <div className="max-w-wide mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Banner banner={banners[0]} variant="small" />
        <Banner banner={banners[1] || banners[0]} variant="small" />
      </div>
    </section>
  );
};
