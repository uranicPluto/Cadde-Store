"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Building2, ShieldCheck, Users, ShoppingBag, Award, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "About Us" : "Hakkımızda" },
          ]}
        />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-md flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 font-extrabold px-3 py-1 rounded-full text-xs w-fit">
            <Building2 className="w-4 h-4" />
            <span>Cadde Store Türkiye</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {isEn ? "Turkey's Premier Multi-Vendor E-Commerce Marketplace" : "Türkiye'nin Lider Çok Satıcılı E-Ticaret Pazaryeri"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {isEn
              ? "Cadde Store connects millions of customers with thousands of verified merchants, offering seamless shopping, guaranteed original products, and lightning-fast logistics."
              : "Cadde Store, milyonlarca müşteriyi binlerce onaylı satıcı ile buluşturan, kesintisiz alışveriş, orijinal ürün garantisi ve jet hızında lojistik sunan yenilikçi bir pazaryeridir."}
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? "100% Original Guarantee" : "%100 Orijinal Ürün Güvencesi"}
            </h3>
            <p className="text-xs text-text-subtle leading-relaxed">
              {isEn
                ? "All products sold on Cadde Store are sourced directly from authorized brand distributors and verified merchants."
                : "Cadde Store üzerindeki tüm ürünler yetkili distribütörler ve onaylı mağazalardan doğrudan temin edilir."}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? "Empowering Local Merchants" : "Yerli Üretici & Satıcı Desteği"}
            </h3>
            <p className="text-xs text-text-subtle leading-relaxed">
              {isEn
                ? "We empower thousands of Turkish small businesses and entrepreneurs with state-of-the-art digital seller tools."
                : "Türkiye'nin 81 ilindeki binlerce KOBİ ve girişimciyi dijital pazaryeri araçlarıyla güçlendiriyoruz."}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? "Customer-Centric Support" : "Kesintisiz Müşteri Destek"}
            </h3>
            <p className="text-xs text-text-subtle leading-relaxed">
              {isEn
                ? "Our 24/7 dedicated support team ensures effortless returns, instant tracking, and absolute shopping satisfaction."
                : "7/24 hizmet veren müşteri ekibimiz, kolay iade, anlık takip ve koşulsuz müşteri memnuniyeti sağlar."}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-primary">5M+</span>
            <span className="text-xs font-bold text-text-muted">{isEn ? "Active Shoppers" : "Aktif Müşteri"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-indigo-600">15K+</span>
            <span className="text-xs font-bold text-text-muted">{isEn ? "Verified Sellers" : "Onaylı Satıcı"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-emerald-600">2M+</span>
            <span className="text-xs font-bold text-text-muted">{isEn ? "Products Listed" : "Aktif Ürün"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-amber-500">99.4%</span>
            <span className="text-xs font-bold text-text-muted">{isEn ? "Satisfaction Rate" : "Müşteri Memnuniyeti"}</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
