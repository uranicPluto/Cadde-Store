"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Lock } from "lucide-react";

export default function KvkkPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb items={[{ label: isEn ? "KVKK Information" : "KVKK Aydınlatma Metni" }]} />

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEn ? "KVKK Personal Data Protection Text" : "6698 Sayılı KVKK Aydınlatma Metni"}
              </h1>
              <p className="text-xs text-text-subtle">
                {isEn ? "Information on your statutory data subject rights under Turkish Law No. 6698." : "6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınız."}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed flex flex-col gap-4">
            <p>
              {isEn
                ? "In accordance with Law No. 6698 on Protection of Personal Data (KVKK), Cadde Store acts as Data Controller for your personal data."
                : "6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, Cadde Store Veri Sorumlusu sıfatıyla hareket etmektedir."}
            </p>
            <p>
              {isEn
                ? "You have the right to request access to, rectification of, or erasure of your personal data at any time by contacting kvkk@cadde.store."
                : "Kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme hakkına kvkk@cadde.store adresine başvurarak sahipsiniz."}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
