"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Award, ExternalLink } from "lucide-react";

interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
  linkUrl?: string | null;
  priority: number;
  active: boolean;
}

export const SponsorCarouselSection: React.FC<{
  title?: string;
  subtitle?: string;
  config?: any;
}> = ({ title, subtitle, config }) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSponsors() {
      try {
        const res = await fetch("/api/sponsors?active=true");
        if (res.ok) {
          const data = await res.json();
          if (data.sponsors && Array.isArray(data.sponsors)) {
            const activeSorted = data.sponsors
              .filter((s: SponsorItem) => s.active !== false)
              .sort((a: SponsorItem, b: SponsorItem) => (b.priority || 0) - (a.priority || 0));
            setSponsors(activeSorted);
          }
        }
      } catch (err) {
        console.error("Failed to load sponsors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSponsors();
  }, []);

  if (!loading && sponsors.length === 0) {
    return null;
  }

  const displayTitle = title || (isEn ? (config?.titleEN || "Official Sponsors & Partners") : (config?.titleTR || "Resmi Sponsorlarimiz & Is Ortaklarimiz"));
  const displaySubtitle = subtitle || (isEn ? config?.subtitleEN : config?.subtitleTR);

  return (
    <section className="py-12 bg-slate-900 text-white border-y border-slate-800" data-section="sponsor-carousel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>{isEn ? "Strategic Partnerships" : "Resmi Is Birlikleri"}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
          {sponsors.map((sponsor) => {
            const Card = (
              <div className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center justify-center aspect-[3/2] transition-all group shadow-sm hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer">
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="max-h-12 max-w-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-75 group-hover:opacity-100 group-hover:scale-105"
                />
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-300 mt-2 truncate max-w-full">
                  {sponsor.name}
                </span>
              </div>
            );

            return sponsor.linkUrl ? (
              <a
                key={sponsor.id}
                href={sponsor.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {Card}
              </a>
            ) : (
              <div key={sponsor.id}>{Card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
