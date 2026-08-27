"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Palette, Check, Sparkles, Layout, Type, Sliders, Image as ImageIcon } from "lucide-react";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";

export default function AdminAppearancePage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [themeConfig, setThemeConfig] = useState({
    brandName: "Cadde Store",
    primaryColor: "#4f46e5",
    accentColor: "#f59e0b",
    fontFamily: "Inter, sans-serif",
    borderRadius: "16px",
    announcementTextTr: "Yaz İndirimleri Başladı! Tüm Siparişlerde Ücretsiz Kargo.",
    announcementTextEn: "Summer Deals Live! Free Express Delivery on All Orders.",
    announcementActive: true,
    logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
  });

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Palette className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Global Appearance & Theme Studio" : "Global Görünüm & Tema Stüdyosu"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Control marketplace branding, typography, color palettes, announcement banners, and header tokens."
                    : "Pazaryeri marka renklerini, duyuru çubuğunu, logo ve tipografi ayarlarını yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{saved ? (isEn ? "Saved!" : "Kaydedildi!") : isEn ? "Save Theme Tokens" : "Temayı Kaydet"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branding & Logo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Marka & Logo</span>
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Pazaryeri Adı</label>
                <Input
                  value={themeConfig.brandName}
                  onChange={(e) => setThemeConfig({ ...themeConfig, brandName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Logo Görseli</label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="text-xs text-indigo-600 hover:underline font-bold"
                  >
                    Kütüphaneden Seç
                  </button>
                </div>
                <Input
                  value={themeConfig.logoUrl}
                  onChange={(e) => setThemeConfig({ ...themeConfig, logoUrl: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Colors & Styling */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Renk Paleti</span>
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Ana Marka Rengi (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeConfig.primaryColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={themeConfig.primaryColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Vurgu Rengi (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeConfig.accentColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, accentColor: e.target.value })}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={themeConfig.accentColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, accentColor: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-indigo-600" />
                  <span>Tepe Duyuru Çubuğu (Announcement Bar)</span>
                </h2>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={themeConfig.announcementActive}
                    onChange={(e) => setThemeConfig({ ...themeConfig, announcementActive: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Duyuruyu Göster</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">TR Duyuru Metni</label>
                  <Input
                    value={themeConfig.announcementTextTr}
                    onChange={(e) => setThemeConfig({ ...themeConfig, announcementTextTr: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">EN Announcement Text</label>
                  <Input
                    value={themeConfig.announcementTextEn}
                    onChange={(e) => setThemeConfig({ ...themeConfig, announcementTextEn: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setThemeConfig({ ...themeConfig, logoUrl: url })}
        isEn={isEn}
      />
    </div>
  );
}
