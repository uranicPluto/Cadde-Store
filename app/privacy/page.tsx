"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb items={[{ label: isEn ? "Privacy Policy" : "Gizlilik Politikası" }]} />

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEn ? "Privacy & Data Protection Policy" : "Gizlilik & Veri Güvenliği Politikası"}
              </h1>
              <p className="text-xs text-text-subtle">
                {isEn ? "How we collect, store, and protect your personal information with 256-bit encryption." : "Kişisel verilerinizin 256-bit SSL şifreleme ile nasıl korunduğuna dair bilgilendirme."}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed flex flex-col gap-4">
            <p>
              {isEn
                ? "Cadde Store prioritizes the confidentiality and security of your personal data. We collect data solely to fulfill orders, improve service quality, and prevent fraud."
                : "Cadde Store, kişisel verilerinizin gizliliğine ve güvenliğine en üst düzeyde önem verir. Verileriniz yalnızca sipariş teslimatı ve hizmet kalitesi amacıyla işlenir."}
            </p>
            <p>
              {isEn
                ? "Your credit card and payment details are processed through encrypted 3D Secure bank gateways and are NEVER stored on our servers."
                : "Kredi kartı ve ödeme bilgileriniz 256-bit SSL şifreli 3D Secure banka altyapısıyla işlenir ve sunucularımızda KESİNLİKLE saklanmaz."}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
