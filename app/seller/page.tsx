"use client";

import React from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Store, ShieldCheck, TrendingUp, Truck, ArrowRight } from "lucide-react";

export default function SellerOnboardingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="flex-1 flex flex-col gap-12 pb-12">
        {/* Hero Banner Section */}
        <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b border-slate-800">
          <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full w-max border border-amber-400/30">
                {t("seller.onboarding.badge")}
              </span>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {t("seller.onboarding.heroTitle")}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                {t("seller.onboarding.heroDesc")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/seller/dashboard">
                  <Button variant="primary" size="lg" className="font-extrabold px-8 py-3.5 bg-primary hover:bg-primary-hover shadow-lg text-sm">
                    <Store className="w-5 h-5 mr-2" />
                    <span>{t("seller.onboarding.startSelling")}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/seller/trend-fashion-magazasi">
                  <Button variant="outline" size="lg" className="font-bold border-slate-700 text-white hover:bg-slate-800 text-sm">
                    {t("seller.onboarding.viewSampleStore")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                    CS
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{t("seller.onboarding.guaranteeTitle")}</span>
                    <span className="text-xs text-amber-400">{t("seller.onboarding.guaranteeBadge")}</span>
                  </div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400">{t("seller.onboarding.dailyVisitors")}</span>
                  <p className="text-lg font-black text-white mt-1">2.5M+</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400">{t("seller.onboarding.activeSellers")}</span>
                  <p className="text-lg font-black text-amber-400 mt-1">15.000+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="max-w-wide mx-auto w-full px-4 sm:px-6 flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
              {t("seller.onboarding.whySellTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              {t("seller.onboarding.whySellSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-main">{t("seller.onboarding.benefit1Title")}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("seller.onboarding.benefit1Desc")}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-main">{t("seller.onboarding.benefit2Title")}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("seller.onboarding.benefit2Desc")}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-main">{t("seller.onboarding.benefit3Title")}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("seller.onboarding.benefit3Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="max-w-wide mx-auto w-full px-4 sm:px-6">
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-4 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-black">{t("seller.onboarding.ctaTitle")}</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              {t("seller.onboarding.ctaDesc")}
            </p>
            <Link href="/seller/dashboard">
              <Button variant="primary" size="lg" className="font-black px-10 py-3.5 bg-primary hover:bg-primary-hover shadow-lg text-sm mt-2">
                {t("seller.onboarding.ctaButton")}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
