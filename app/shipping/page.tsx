"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";

export default function ShippingPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb items={[{ label: isEn ? "Shipping & Delivery" : "Kargo & Teslimat" }]} />

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEn ? "Shipping & Delivery Guide" : "Kargo & Teslimat Süreçleri"}
              </h1>
              <p className="text-xs text-text-subtle">
                {isEn ? "Fast, reliable shipping across all 81 provinces of Turkey." : "Türkiye'nin 81 iline hızlı, güvenli ve sigortalı kargo teslimat bilgileri."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {isEn ? "Delivery Timeframes" : "Teslimat Süreleri"}
              </span>
              <p>
                {isEn
                  ? "Standard orders are processed within 24 hours and delivered in 1-3 business days. Express fast delivery orders are prioritized for same-day dispatch."
                  : "Standart siparişler 24 saat içinde işleme alınıp 1-3 iş günü içerisinde teslim edilir. Hızlı teslimat etiketli ürünler aynı gün kargoya verilir."}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                {isEn ? "Free Shipping Threshold" : "Ücretsiz Kargo Barajı"}
              </span>
              <p>
                {isEn
                  ? "Enjoy Free Shipping on all orders over 200 ₺. Standard shipping fee of 34.90 ₺ applies for orders under 200 ₺."
                  : "200 ₺ üzerindeki tüm siparişlerinizde Kargo Bedava fırsatından yararlanabilirsiniz. 200 ₺ altındaki siparişlerde standart kargo ücreti 34.90 ₺'dir."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
