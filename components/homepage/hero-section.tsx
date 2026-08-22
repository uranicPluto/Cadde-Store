import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getMockBanners, getMockCategories } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/language-context";
import { ChevronLeft, ChevronRight, ArrowRight, Tag, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const defaultBanners = getMockBanners(language);
  const categories = getMockCategories(language);

  const [banners, setBanners] = useState(defaultBanners);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadCmsBanners() {
      try {
        const res = await fetch("/api/cms/sections");
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          const hero = data.sections.find((s: any) => s.type === "HERO") || data.sections[0];
          if (hero && hero.banners && hero.banners.length > 0) {
            setBanners(
              hero.banners.map((b: any, i: number) => ({
                id: b.id,
                title: isEn ? b.titleEN || b.titleTR : b.titleTR || b.titleEN,
                subtitle: isEn ? b.subtitleEN || b.subtitleTR : b.subtitleTR || b.subtitleEN,
                ctaText: isEn ? "Explore Now" : "Fırsatı İncele",
                badge: isEn ? b.badgeTextEN || b.badgeTextTR : b.badgeTextTR || b.badgeTextEN,
                bgGradient: i % 2 === 0 ? "from-orange-500 to-amber-600" : "from-indigo-600 to-purple-700",
                imageUrl: b.imageUrlDesktop,
                targetUrl: b.targetValue || "/category/women",
              }))
            );
          }
        }
      } catch (e) {
        // Fall back to default banners
      }
    }
    loadCmsBanners();
  }, [language, isEn]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[activeIndex] || banners[0] || defaultBanners[0];
  const targetUrl = (currentBanner as any).targetUrl || "/category/women";

  return (
    <section className="w-full bg-slate-100 pt-4 pb-6">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        {/* Main Hero Slider Box */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 min-h-[320px] sm:min-h-[380px] bg-slate-900 flex items-center">
          {/* Background Image with Gradient Mask */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center opacity-40 transition-opacity duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient} opacity-80 mix-blend-multiply`} />
          </div>

          {/* Banner Text Overlay Content */}
          <div className="relative z-10 p-6 sm:p-12 text-white flex flex-col items-start gap-3 sm:gap-4 max-w-2xl">
            {currentBanner.badge && (
              <span className="text-xs font-black uppercase tracking-widest bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-slate-900" />
                {currentBanner.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              {currentBanner.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed max-w-lg">
              {currentBanner.subtitle}
            </p>
            <Link href={targetUrl}>
              <Button
                variant="primary"
                size="lg"
                className="mt-2 font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <span>{currentBanner.ctaText}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Slide Arrow Navigation */}
          <button
            onClick={() => setActiveIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="absolute left-3 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-3 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? "w-8 bg-amber-400" : "w-2 bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Category Icons Strip Underneath */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {categories.slice(0, 8).map((cat) => (
            <a
              key={cat.id}
              href="#"
              className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-xs group transition-all text-center gap-1.5"
            >
              <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Tag className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
