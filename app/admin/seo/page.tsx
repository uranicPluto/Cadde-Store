"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Globe, Check, Sparkles, Share2, Search } from "lucide-react";

export default function AdminSeoPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [seo, setSeo] = useState({
    metaTitle: "Cadde Store — Türkiye'nin Çok Satıcılı Güvenilir Alışveriş Pazaryeri",
    metaDescription: "En popüler markaların orijinal ürünleri, flaş fırsatlar, hızlı kargo ve güvenli ödeme ayrıcalığıyla Cadde Store'da.",
    canonicalUrl: "https://cadde-store.com",
    ogImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "SEO Control Center & Social Previews" : "SEO Kontrol Merkezi & Sosyal Önizleme"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage global meta tags, OpenGraph social cards, search engine indexes, and XML sitemaps."
                    : "Pazaryeri arama motoru başlıklarını, meta açıklamalarını ve sosyal medya önizleme kartlarını yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{saved ? (isEn ? "Saved!" : "Kaydedildi!") : isEn ? "Save SEO Tags" : "SEO Ayarlarını Kaydet"}</span>
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Global Meta Başlık (Meta Title)</label>
              <Input
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                className="text-xs"
              />
              <span className="text-[10px] text-slate-400 text-right">{seo.metaTitle.length} / 60 karakter</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Global Meta Açıklama (Meta Description)</label>
              <textarea
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                rows={3}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:border-indigo-600 resize-none"
              />
              <span className="text-[10px] text-slate-400 text-right">{seo.metaDescription.length} / 160 karakter</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Kanonik URL (Canonical URL)</label>
              <Input
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            {/* Google SERP Preview Card */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 mb-1">Google Arama Önizlemesi</span>
              <span className="text-xs text-slate-500 font-mono">cadde-store.com</span>
              <h4 className="text-base text-indigo-700 font-medium hover:underline cursor-pointer leading-tight">
                {seo.metaTitle}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{seo.metaDescription}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
