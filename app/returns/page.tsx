"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";

export default function ReturnsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb items={[{ label: isEn ? "Returns & Exchanges" : "Kolay İade & Değişim" }]} />

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEn ? "14-Day Easy Return Policy" : "14 Gün Kolay İade Rehberi"}
              </h1>
              <p className="text-xs text-text-subtle">
                {isEn ? "Hassle-free 100% money-back guarantee for all returnable items." : "Koşulsuz müşteri memnuniyeti kapsamında ücretsiz ve kolay iade adımları."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? "Simply open Hesabım > Siparişlerim, click 'İade Talebi Oluştur', print your free return barcode, and drop off the package at any partner shipping branch."
                  : "Hesabım > Siparişlerim sayfasından 'İade Talebi Oluştur' butonuna tıklayarak ücretsiz iade kargo kodunuzu alın ve paketi anlaşmalı kargoya teslim edin."}
              </span>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? "Returned items must be unused, unwashed, in original packaging with intact brand tags and complete invoice."
                  : "İade edilecek ürünlerin kullanılmamış, yıkanmamış, etiketi sökülmemiş ve orijinal ambalajıyla faturası tam olarak gönderilmesi gerekmektedir."}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
