"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { HelpCircle, ChevronDown, ChevronUp, Search, Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";

export default function HelpPage() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: isEn ? "How can I track my order?" : "Siparişimi nasıl takip edebilirim?",
      a: isEn
        ? "You can track your live shipment status anytime under My Account > My Orders or by entering your order number on the tracking page."
        : "Siparişinizin durumunu Hesabım > Siparişlerim sayfasından canlı kargo takip adımlarıyla anlık olarak inceleyebilirsiniz.",
    },
    {
      q: isEn ? "What is the return policy?" : "İade koşulları nelerdir?",
      a: isEn
        ? "Cadde Store offers an easy 14-day hassle-free return policy for all unused products in original packaging with complete invoice."
        : "Cadde Store'dan satın aldığınız kullanılmamış ürünleri 14 gün içerisinde orijinal kutusu ve faturasıyla ücretsiz iade edebilirsiniz.",
    },
    {
      q: isEn ? "Are all products original?" : "Ürünler orijinal mi?",
      a: isEn
        ? "Yes! 100% of products listed on Cadde Store are verified for authenticity and sold by authorized brand distributors."
        : "Evet! Cadde Store'da satılan tüm ürünler %100 orijinal olup yetkili marka distribütörleri ve onaylı satıcılar tarafından sunulur.",
    },
    {
      q: isEn ? "What payment methods are supported?" : "Hangi ödeme yöntemlerini kullanabilirim?",
      a: isEn
        ? "We support all major Credit Cards, Debit Cards, 3D Secure installment options, and Cash on Delivery."
        : "Tüm kredi kartları, banka kartları, 3D Secure taksitli ödeme ve kapıda ödeme seçeneklerini kullanabilirsiniz.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb items={[{ label: isEn ? "Help & FAQ" : "Yardım & SSS" }]} />

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEn ? "Frequently Asked Questions" : "Sıkça Sorulan Sorular"}
              </h1>
              <p className="text-xs text-text-subtle">
                {isEn ? "Find answers to popular shopping, shipping, and account questions." : "Sipariş, kargo, iade ve ödeme süreçleri hakkında merak edilen tüm sorular."}
              </p>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
