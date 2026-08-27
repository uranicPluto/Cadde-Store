"use client";

import React from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { TrendingUp, Sparkles, BarChart2, Compass, ArrowUpRight } from "lucide-react";

export default function AdminResearchPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const marketTrends = [
    { category: "Ayakkabı & Sneaker", growth: "+42%", searchVolume: "145.000", topDemand: "Retro Koşu Ayakkabıları" },
    { category: "Oversize Tişört & Giyim", growth: "+38%", searchVolume: "210.000", topDemand: "Yıkamalı Vintage Pamuklu" },
    { category: "Kablosuz Kulaklık & Ses", growth: "+29%", searchVolume: "98.000", topDemand: "Aktif Gürültü Engelleme (ANC)" },
    { category: "Termos & Outdoor Matara", growth: "+51%", searchVolume: "74.000", topDemand: "Çift Duvar Vakumlu Paslanmaz" },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Market Research & Commercial Intelligence" : "Pazar Araştırması & Ticari İçgörüler"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Category search volumes, buyer demand surges, trending keyword intelligence, and conversion insights."
                    : "Pazaryeri arama hacimlerini, talep artışlarını ve trend anahtar kelimeleri analiz edin."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketTrends.map((t, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-slate-900">{t.category}</span>
                    <span className="text-xs text-slate-500 mt-0.5">En Çok Aranan: <strong>{t.topDemand}</strong></span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {t.growth}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                  Aylık Tahmini Arama Hacmi: <strong className="text-slate-700">{t.searchVolume}</strong>
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
