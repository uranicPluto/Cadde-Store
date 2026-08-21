import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/marketplace/product-card";
import { Flame, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FlashSalesSection: React.FC = () => {
  const { language, t } = useLanguage();
  const products = getMockProducts(language);

  // Live countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 35 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 12, seconds: 35 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigit = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="w-full bg-gradient-to-b from-rose-50/50 via-white to-slate-50 py-8 border-y border-rose-100/60">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        {/* Flash Sales Header Bar with Live Countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md animate-pulse">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{t("homepage.flashSalesTitle")}</span>
              </h2>
              <p className="text-xs text-text-subtle">
                {t("homepage.flashSalesSubtitle")}
              </p>
            </div>
          </div>

          {/* Countdown Clock Bar */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-rose-200 shadow-xs">
            <Clock className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-rose-900 mr-1">{t("homepage.endsIn")}</span>
            <div className="flex items-center gap-1 font-mono font-black text-xs">
              <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded">{formatDigit(timeLeft.hours)}</span>
              <span className="text-rose-600 font-bold">:</span>
              <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded">{formatDigit(timeLeft.minutes)}</span>
              <span className="text-rose-600 font-bold">:</span>
              <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded">{formatDigit(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        {/* High Density Flash Deals Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
