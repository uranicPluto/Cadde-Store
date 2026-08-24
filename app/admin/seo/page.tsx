"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Search,
  Share2,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function AdminSeoPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [seo, setSeo] = useState({
    siteTitleTr: "Cadde Store Türkiye | Güvenilir Çok Satıcılı Pazaryeri",
    siteTitleEn: "Cadde Store Turkey | Multi-Vendor Marketplace",
    metaDescriptionTr: "Türkiye'nin en popüler kadın giyim, erkek modası, elektronik ve ev yaşam ürünleri avantajlı fiyatlarla Cadde Store'da.",
    metaDescriptionEn: "Shop top-rated women's fashion, menswear, electronics, and home essentials with fast shipping on Cadde Store.",
    keywords: "alışveriş, pazaryeri, kadın giyim, erkek giyim, elektronik, indirim, flaş fırsatlar, türkiye",
    canonicalUrl: "https://cadde-store.vercel.app",
    ogImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    indexEnabled: true,
    sitemapEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  useEffect(() => {
    async function loadSeo() {
      try {
        const res = await fetch("/api/seo");
        if (res.ok) {
          const data = await res.json();
          if (data.seo) setSeo(data.seo);
        }
      } catch (e) {
        console.error("Failed to load SEO:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSeo();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seo),
      });
      if (res.ok) {
        showNotice("success", isEn ? "SEO settings saved!" : "SEO ayarları başarıyla kaydedildi!");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-900 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />

        {/* Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              {isEn ? "SEO & Social Sharing Studio" : "SEO & Sosyal Paylaşım Kontrol Merkezi"}
            </h1>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save SEO Settings" : "SEO Ayarlarını Kaydet"}</span>
          </Button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`px-6 py-2 flex items-center justify-between text-xs font-bold shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
                : "bg-rose-50 text-rose-900 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback.text}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-12 gap-5 p-5 min-h-0 overflow-y-auto bg-slate-100">
          {/* Left Form (7 cols) */}
          <div className="col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 text-xs">
            <h2 className="text-sm font-black text-slate-900">
              {isEn ? "Metadata & Search Engine Tagging" : "Meta Etiketler & Arama Motoru Ayarları"}
            </h2>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Site Title (TR)" : "Site Başlığı (TR)"}</label>
              <input
                type="text"
                value={seo.siteTitleTr}
                onChange={(e) => setSeo({ ...seo, siteTitleTr: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Site Title (EN)" : "Site Başlığı (EN)"}</label>
              <input
                type="text"
                value={seo.siteTitleEn}
                onChange={(e) => setSeo({ ...seo, siteTitleEn: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Meta Description (TR)" : "Meta Açıklaması (TR)"}</label>
              <textarea
                rows={2}
                value={seo.metaDescriptionTr}
                onChange={(e) => setSeo({ ...seo, metaDescriptionTr: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Meta Description (EN)" : "Meta Açıklaması (EN)"}</label>
              <textarea
                rows={2}
                value={seo.metaDescriptionEn}
                onChange={(e) => setSeo({ ...seo, metaDescriptionEn: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "SEO Keywords (Comma-separated)" : "Arama Anahtar Kelimeleri (Virgülle ayrılmış)"}</label>
              <input
                type="text"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">{isEn ? "Canonical URL" : "Kanonik URL"}</label>
                <input
                  type="text"
                  value={seo.canonicalUrl}
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">{isEn ? "Social OpenGraph Image" : "Sosyal Paylaşım Görseli"}</label>
                <input
                  type="text"
                  value={seo.ogImage}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Live Preview Cards (5 cols) */}
          <div className="col-span-5 flex flex-col gap-4 text-xs">
            {/* Google Search Mockup Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" />
                {isEn ? "Google Search Result Preview" : "Google Arama Sonucu Önizlemesi"}
              </span>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <span className="text-[11px] text-slate-500 truncate">https://cadde-store.vercel.app</span>
                <h3 className="font-bold text-sm text-blue-700 hover:underline cursor-pointer">
                  {isEn ? seo.siteTitleEn : seo.siteTitleTr}
                </h3>
                <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                  {isEn ? seo.metaDescriptionEn : seo.metaDescriptionTr}
                </p>
              </div>
            </div>

            {/* Social Share Card Mockup */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-600" />
                {isEn ? "Social Media Card (OpenGraph)" : "Sosyal Medya Kart Önizlemesi (OG)"}
              </span>

              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <img src={seo.ogImage} alt="" className="w-full h-32 object-cover" />
                <div className="p-3 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-black">cadde-store.vercel.app</span>
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {isEn ? seo.siteTitleEn : seo.siteTitleTr}
                  </span>
                  <p className="text-slate-500 text-[10px] line-clamp-2">
                    {isEn ? seo.metaDescriptionEn : seo.metaDescriptionTr}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
