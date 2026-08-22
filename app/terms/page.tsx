"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb items={[{ label: isEn ? "Terms of Use" : "Kullanım Koşulları" }]} />

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEn ? "Terms & Conditions" : "Kullanım Koşulları & Mesafeli Satış"}
              </h1>
              <p className="text-xs text-text-subtle">
                {isEn ? "Legal framework governing your use of Cadde Store marketplace services." : "Cadde Store platformunu kullanımınızı düzenleyen yasal kural ve koşullar."}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed flex flex-col gap-4">
            <p>
              {isEn
                ? "Welcome to Cadde Store. By accessing or using our marketplace platform, you agree to be bound by these Terms of Use and all applicable laws and regulations of the Republic of Turkey."
                : "Cadde Store platformuna hoş geldiniz. Pazaryeri hizmetlerimizi kullanarak, bu kullanım koşullarına ve Türkiye Cumhuriyeti ilgili mevzuatına uymayı kabul etmiş sayılırsınız."}
            </p>
            <p>
              {isEn
                ? "All order transactions, merchant relationships, customer protection rights, and intellectual property remain governed by official distance selling contracts."
                : "Platform üzerinden gerçekleşen tüm alışverişler, mesafeli satış sözleşmesi ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümlerine tabidir."}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
