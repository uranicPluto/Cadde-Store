"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Palette,
  Layout,
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
  Lock,
  Headset,
  Search,
  ShoppingCart,
  Heart,
  User,
  Store,
  HelpCircle,
  PhoneCall,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import {
  AppearanceSettingsDTO,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  HeaderConfig,
  FooterConfig,
  FooterColumn,
  deriveCssVariables,
} from "@/lib/appearance/appearance-repository";

type ActiveTab = "branding" | "header" | "footer" | "preview";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const PRESET_THEMES = [
  {
    id: "default-blue",
    name: "Modern Cadde (Default)",
    nameTr: "Modern Cadde (Varsayılan)",
    brandColor: "#2563eb",
    accentColor: "#f97316",
    borderRadius: "8px",
    fontHeading: "Inter",
    fontBody: "Inter",
    announcementBgColor: "#1e293b",
    announcementTextColor: "#f8fafc",
  },
  {
    id: "vibrant-orange",
    name: "Vibrant Marketplace",
    nameTr: "Canlı Pazaryeri (Turuncu)",
    brandColor: "#ea580c",
    accentColor: "#0284c7",
    borderRadius: "12px",
    fontHeading: "Plus Jakarta Sans",
    fontBody: "Plus Jakarta Sans",
    announcementBgColor: "#7c2d12",
    announcementTextColor: "#ffedd5",
  },
  {
    id: "emerald-retail",
    name: "Emerald & Eco",
    nameTr: "Zümrüt Yeşili & Eko",
    brandColor: "#059669",
    accentColor: "#f59e0b",
    borderRadius: "8px",
    fontHeading: "Outfit",
    fontBody: "Outfit",
    announcementBgColor: "#064e3b",
    announcementTextColor: "#ecfdf5",
  },
  {
    id: "royal-purple",
    name: "Luxury Boutique",
    nameTr: "Kraliyet Moru & Butik",
    brandColor: "#7c3aed",
    accentColor: "#ec4899",
    borderRadius: "16px",
    fontHeading: "Montserrat",
    fontBody: "Inter",
    announcementBgColor: "#4c1d95",
    announcementTextColor: "#f3e8ff",
  },
  {
    id: "slate-minimal",
    name: "Midnight Slate",
    nameTr: "Gece Mavisi Minimal",
    brandColor: "#0f172a",
    accentColor: "#38bdf8",
    borderRadius: "6px",
    fontHeading: "Inter",
    fontBody: "Inter",
    announcementBgColor: "#020617",
    announcementTextColor: "#e2e8f0",
  },
];

const FONT_OPTIONS = [
  "Inter",
  "Plus Jakarta Sans",
  "Outfit",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Open Sans",
  "System-UI",
];

const RADIUS_OPTIONS = [
  { label: "None (0px)", value: "0px" },
  { label: "Small (4px)", value: "4px" },
  { label: "Medium (8px)", value: "8px" },
  { label: "Large (12px)", value: "12px" },
  { label: "Extra (16px)", value: "16px" },
  { label: "Pill (9999px)", value: "9999px" },
];

﻿export default function AdminAppearancePage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<ActiveTab>("branding");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewLang, setPreviewLang] = useState<"tr" | "en">("tr");

  const [settings, setSettings] = useState<AppearanceSettingsDTO>({
    ...DEFAULT_APPEARANCE_SETTINGS,
    updatedAt: new Date().toISOString(),
  });
  const [initialSettings, setInitialSettings] = useState<AppearanceSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/appearance");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          setInitialSettings(data.settings);
        }
      }
    } catch (err) {
      console.error("Failed to load appearance settings:", err);
      showToast("error", isEn ? "Failed to load appearance settings" : "Görünüm ayarları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          setInitialSettings(data.settings);
        }
        showToast("success", isEn ? "Global Appearance saved successfully!" : "Görünüm ve tasarım ayarları başarıyla kaydedildi!");
      } else {
        const err = await res.json();
        showToast("error", err.error || (isEn ? "Failed to save settings" : "Ayarlar kaydedilemedi"));
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", isEn ? "Network error saving settings" : "Bağlantı hatası oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(isEn ? "Reset all appearance and theme settings to default?" : "Tüm görünüm ve tema ayarları varsayılana sıfırlansın mı?")) {
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/appearance/reset", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          setInitialSettings(data.settings);
        }
        showToast("success", isEn ? "Reset to factory defaults successfully!" : "Görünüm ayarları varsayılanlara sıfırlandı!");
      } else {
        const err = await res.json();
        showToast("error", err.error || (isEn ? "Reset failed" : "Sıfırlama başarısız"));
      }
    } catch (err) {
      console.error("Reset error:", err);
      showToast("error", isEn ? "Network error during reset" : "Sıfırlama sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setSettings((prev) => ({
      ...prev,
      brandColor: preset.brandColor,
      accentColor: preset.accentColor,
      borderRadius: preset.borderRadius,
      fontHeading: preset.fontHeading,
      fontBody: preset.fontBody,
      headerConfig: {
        ...prev.headerConfig,
        announcementBgColor: preset.announcementBgColor,
        announcementTextColor: preset.announcementTextColor,
      },
    }));
    showToast("success", isEn ? `Applied "${preset.name}" preset` : `"${preset.nameTr}" teması uygulandı`);
  };

  const updateField = <K extends keyof AppearanceSettingsDTO>(key: K, value: AppearanceSettingsDTO[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateHeader = <K extends keyof HeaderConfig>(key: K, value: HeaderConfig[K]) => {
    setSettings((prev) => ({
      ...prev,
      headerConfig: {
        ...prev.headerConfig,
        [key]: value,
      },
    }));
  };

  const updateFooter = <K extends keyof FooterConfig>(key: K, value: FooterConfig[K]) => {
    setSettings((prev) => ({
      ...prev,
      footerConfig: {
        ...prev.footerConfig,
        [key]: value,
      },
    }));
  };

  const addFooterColumn = () => {
    const newCol: FooterColumn = {
      id: `col-${Date.now()}`,
      titleTr: "Yeni Menü",
      titleEn: "New Menu",
      links: [
        { titleTr: "Bağlantı 1", titleEn: "Link 1", url: "/" },
        { titleTr: "Bağlantı 2", titleEn: "Link 2", url: "/" },
      ],
    };
    updateFooter("columns", [...(settings.footerConfig.columns || []), newCol]);
  };

  const removeFooterColumn = (colId: string) => {
    updateFooter(
      "columns",
      settings.footerConfig.columns.filter((c) => c.id !== colId)
    );
  };

  const addColumnLink = (colId: string) => {
    const updated = settings.footerConfig.columns.map((c) => {
      if (c.id === colId) {
        return {
          ...c,
          links: [...c.links, { titleTr: "Yeni Bağlantı", titleEn: "New Link", url: "/" }],
        };
      }
      return c;
    });
    updateFooter("columns", updated);
  };

  const removeColumnLink = (colId: string, linkIndex: number) => {
    const updated = settings.footerConfig.columns.map((c) => {
      if (c.id === colId) {
        return {
          ...c,
          links: c.links.filter((_, idx) => idx !== linkIndex),
        };
      }
      return c;
    });
    updateFooter("columns", updated);
  };

  const updateColumnLink = (
    colId: string,
    linkIndex: number,
    field: "titleTr" | "titleEn" | "url" | "openInNewTab",
    val: any
  ) => {
    const updated = settings.footerConfig.columns.map((c) => {
      if (c.id === colId) {
        const newLinks = [...c.links];
        newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: val };
        return { ...c, links: newLinks };
      }
      return c;
    });
    updateFooter("columns", updated);
  };

﻿  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastMsg.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 shrink-0">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    {isEn ? "Global Appearance & Design Studio" : "Görünüm & Tasarım Stüdyosu"}
                  </h1>
                  {isDirty && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-wide uppercase border border-amber-200 animate-pulse">
                      {isEn ? "Unsaved Changes" : "Kaydedilmemiş Değişiklikler"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Customize live marketplace branding, theme design tokens, header navigation, and footer architecture."
                    : "Pazaryeri marka kimliği, renk paleti, tipografi, başlık navigasyonu ve altbilgi bileşenlerini yönetin."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={saving}
                className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEn ? "Reset Defaults" : "Varsayılana Sıfırla"}</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save Changes" : "Değişiklikleri Kaydet")}</span>
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {isEn ? "Quick Theme Presets" : "Hızlı Tema Şablonları"}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {isEn ? "Switch your storefront style in 1-click." : "Tek tıkla hazır kurumsal renk ve tipografi şablonlarına geçiş yapın."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 active:scale-95"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs shrink-0"
                    style={{ backgroundColor: preset.brandColor }}
                  />
                  <span>{isEn ? preset.name : preset.nameTr}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("branding")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "branding"
                  ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isEn ? "1. Branding & Tokens" : "1. Marka & Tasarım Belirteçleri"}</span>
            </button>
            <button
              onClick={() => setActiveTab("header")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "header"
                  ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>{isEn ? "2. Header & Navigation" : "2. Başlık & Navigasyon"}</span>
            </button>
            <button
              onClick={() => setActiveTab("footer")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "footer"
                  ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{isEn ? "3. Footer & Social" : "3. Altbilgi & Sosyal Medya"}</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "preview"
                  ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isEn ? "4. Live Preview" : "4. Canlı Mağaza Önizleme"}</span>
            </button>
          </div>

﻿          {activeTab === "branding" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>{isEn ? "Marketplace Identity & Logos" : "Pazaryeri Kimliği & Logo"}</span>
                </h3>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Marketplace Name" : "Pazaryeri Adı"}
                    </label>
                    <input
                      type="text"
                      value={settings.marketplaceName || ""}
                      onChange={(e) => updateField("marketplaceName", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="Cadde Store Türkiye"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Marketplace Tagline / Slogan" : "Slogan / Alt Başlık"}
                    </label>
                    <input
                      type="text"
                      value={settings.tagline || ""}
                      onChange={(e) => updateField("tagline", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="Türkiye'nin Güvenilir Alışveriş Caddesi"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Logo Image URL" : "Logo Görsel URL"}
                    </label>
                    <input
                      type="text"
                      value={settings.logoUrl || ""}
                      onChange={(e) => updateField("logoUrl", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="/logo.svg or https://..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Favicon URL" : "Favicon URL"}
                    </label>
                    <input
                      type="text"
                      value={settings.faviconUrl || ""}
                      onChange={(e) => updateField("faviconUrl", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span>{isEn ? "Color Palette & Border Radius" : "Renk Paleti & Köşe Yuvarlama"}</span>
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      {isEn ? "Brand Primary Color (--brand-primary)" : "Ana Marka Rengi (--brand-primary)"}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.brandColor || "#2563eb"}
                        onChange={(e) => updateField("brandColor", e.target.value)}
                        className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={settings.brandColor || "#2563eb"}
                        onChange={(e) => updateField("brandColor", e.target.value)}
                        className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 uppercase"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["#2563eb", "#ea580c", "#059669", "#7c3aed", "#dc2626", "#0f172a"].map((c) => (
                          <button
                            key={c}
                            onClick={() => updateField("brandColor", c)}
                            className="w-6 h-6 rounded-md border border-slate-200 shadow-xs"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      {isEn ? "Brand Accent Color (--brand-accent)" : "Vurgu Rengi (--brand-accent)"}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.accentColor || "#f97316"}
                        onChange={(e) => updateField("accentColor", e.target.value)}
                        className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={settings.accentColor || "#f97316"}
                        onChange={(e) => updateField("accentColor", e.target.value)}
                        className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 uppercase"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["#f97316", "#e11d48", "#8b5cf6", "#10b981", "#f59e0b", "#38bdf8"].map((c) => (
                          <button
                            key={c}
                            onClick={() => updateField("accentColor", c)}
                            className="w-6 h-6 rounded-md border border-slate-200 shadow-xs"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      {isEn ? "Border Radius Scale (--radius)" : "Köşe Yuvarlama Ölçeği (--radius)"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {RADIUS_OPTIONS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => updateField("borderRadius", r.value)}
                          className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                            settings.borderRadius === r.value
                              ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4 md:col-span-2">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>{isEn ? "Typography Scale" : "Tipografi Ölçeği & Yazı Tipleri"}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      {isEn ? "Heading Font Family (--font-heading)" : "Başlık Yazı Tipi (--font-heading)"}
                    </label>
                    <select
                      value={settings.fontHeading || "Inter"}
                      onChange={(e) => updateField("fontHeading", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      {isEn ? "Body Font Family (--font-body)" : "Gövde Metni Yazı Tipi (--font-body)"}
                    </label>
                    <select
                      value={settings.fontBody || "Inter"}
                      onChange={(e) => updateField("fontBody", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

﻿          {activeTab === "header" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-600" />
                    <span>{isEn ? "Top Announcement Bar" : "Üst Duyuru / Kampanya Bandı"}</span>
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.headerConfig?.showAnnouncement !== false}
                      onChange={(e) => updateHeader("showAnnouncement", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Announcement Text (Turkish)" : "Duyuru Metni (Türkçe)"}
                    </label>
                    <input
                      type="text"
                      value={settings.headerConfig?.announcementTextTr || ""}
                      onChange={(e) => updateHeader("announcementTextTr", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="🎉 Bahar İndirimleri Başladı! Seçili Ürünlerde %50'ye Varan Avantajlar"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Announcement Text (English)" : "Duyuru Metni (İngilizce)"}
                    </label>
                    <input
                      type="text"
                      value={settings.headerConfig?.announcementTextEn || ""}
                      onChange={(e) => updateHeader("announcementTextEn", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="🎉 Spring Sale is Live! Up to 50% Off Selected Collections"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Target Link URL" : "Yönlendirme Bağlantısı"}
                    </label>
                    <input
                      type="text"
                      value={settings.headerConfig?.announcementLink || ""}
                      onChange={(e) => updateHeader("announcementLink", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="/category/women"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {isEn ? "Background Color" : "Arka Plan Rengi"}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.headerConfig?.announcementBgColor || "#1e293b"}
                          onChange={(e) => updateHeader("announcementBgColor", e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.headerConfig?.announcementBgColor || "#1e293b"}
                          onChange={(e) => updateHeader("announcementBgColor", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {isEn ? "Text Color" : "Metin Rengi"}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.headerConfig?.announcementTextColor || "#f8fafc"}
                          onChange={(e) => updateHeader("announcementTextColor", e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.headerConfig?.announcementTextColor || "#f8fafc"}
                          onChange={(e) => updateHeader("announcementTextColor", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>{isEn ? "Navigation & Search Bar Controls" : "Arama Çubuğu & Kısayol Ayarları"}</span>
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Search Placeholder (TR)" : "Arama Yer Tutucusu (TR)"}
                    </label>
                    <input
                      type="text"
                      value={settings.headerConfig?.searchPlaceholderTr || ""}
                      onChange={(e) => updateHeader("searchPlaceholderTr", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                      placeholder="Ürün, kategori veya marka ara..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Search Placeholder (EN)" : "Arama Yer Tutucusu (EN)"}
                    </label>
                    <input
                      type="text"
                      value={settings.headerConfig?.searchPlaceholderEn || ""}
                      onChange={(e) => updateHeader("searchPlaceholderEn", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                      placeholder="Search products, categories or brands..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        {isEn ? "Logo Max Height (px)" : "Logo Maksimum Yükseklik (px)"}
                      </label>
                      <span className="text-xs font-extrabold text-indigo-600">
                        {settings.headerConfig?.logoHeight || 40}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={72}
                      value={settings.headerConfig?.logoHeight || 40}
                      onChange={(e) => updateHeader("logoHeight", Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.headerConfig?.showSearch !== false}
                        onChange={(e) => updateHeader("showSearch", e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{isEn ? "Show Search Bar" : "Arama Çubuğu"}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.headerConfig?.showAccountMenu !== false}
                        onChange={(e) => updateHeader("showAccountMenu", e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{isEn ? "Account Menu" : "Hesap Menüsü"}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.headerConfig?.showFavoritesButton !== false}
                        onChange={(e) => updateHeader("showFavoritesButton", e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{isEn ? "Favorites Button" : "Favoriler Butonu"}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.headerConfig?.showCartButton !== false}
                        onChange={(e) => updateHeader("showCartButton", e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{isEn ? "Cart Drawer Button" : "Sepet Butonu"}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.headerConfig?.showSellerHubLink !== false}
                        onChange={(e) => updateHeader("showSellerHubLink", e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{isEn ? "Seller Hub Links" : "Satıcı Portalı Linki"}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.headerConfig?.sticky !== false}
                        onChange={(e) => updateHeader("sticky", e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{isEn ? "Sticky Header" : "Sabit Başlık"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

﻿          {activeTab === "footer" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                    {isEn ? "Footer Feature Badges" : "Altbilgi Özellik Rozetleri"}
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.footerConfig?.showTrustBadges !== false}
                      onChange={(e) => updateFooter("showTrustBadges", e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isEn ? "Show Trust Badges Bar (Originality, Fast Delivery, etc.)" : "Güvenilirlik Rozetlerini Göster (Orijinallik, Hızlı Teslimat)"}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.footerConfig?.showPaymentBadges !== false}
                      onChange={(e) => updateFooter("showPaymentBadges", e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isEn ? "Show Payment Provider Badges (Visa, Mastercard, Troy)" : "Ödeme & Kargo Logolarını Göster (Visa, Mastercard, Troy)"}</span>
                  </label>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Copyright Notice (TR)" : "Telif Hakkı Metni (TR)"}
                    </label>
                    <input
                      type="text"
                      value={settings.footerConfig?.copyrightTextTr || ""}
                      onChange={(e) => updateFooter("copyrightTextTr", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                      placeholder="© 2026 Cadde Store Türkiye. Tüm hakları saklıdır."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Copyright Notice (EN)" : "Telif Hakkı Metni (EN)"}
                    </label>
                    <input
                      type="text"
                      value={settings.footerConfig?.copyrightTextEn || ""}
                      onChange={(e) => updateFooter("copyrightTextEn", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                      placeholder="© 2026 Cadde Store Turkey. All rights reserved."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {isEn ? "Newsletter Subscription Bar" : "E-Bülten Abonelik Alanı"}
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.footerConfig?.showNewsletter !== false}
                        onChange={(e) => updateFooter("showNewsletter", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Newsletter Title (TR)" : "Bülten Başlığı (TR)"}
                    </label>
                    <input
                      type="text"
                      value={settings.footerConfig?.newsletterTitleTr || ""}
                      onChange={(e) => updateFooter("newsletterTitleTr", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isEn ? "Newsletter Subtitle (TR)" : "Bülten Açıklaması (TR)"}
                    </label>
                    <input
                      type="text"
                      value={settings.footerConfig?.newsletterSubtitleTr || ""}
                      onChange={(e) => updateFooter("newsletterSubtitleTr", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {isEn ? "Multi-Column Footer Menus" : "Çok Kolonlu Altbilgi Link Menüleri"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isEn ? "Configure columns and links displayed in the storefront footer." : "Mağaza altbilgisinde gösterilen kolon ve bağlantıları düzenleyin."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFooterColumn}
                    className="text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEn ? "Add Column" : "Yeni Kolon Ekle"}</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {settings.footerConfig?.columns?.map((col) => (
                    <div
                      key={col.id}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <input
                          type="text"
                          value={col.titleTr}
                          onChange={(e) => {
                            const updated = settings.footerConfig.columns.map((c) =>
                              c.id === col.id ? { ...c, titleTr: e.target.value } : c
                            );
                            updateFooter("columns", updated);
                          }}
                          className="font-bold text-xs bg-transparent border-b border-transparent focus:border-indigo-600 focus:bg-white px-1 py-0.5 rounded"
                          placeholder="Kolon Başlığı (TR)"
                        />
                        <button
                          onClick={() => removeFooterColumn(col.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title={isEn ? "Remove Column" : "Kolonu Sil"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {col.links.map((link, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1.5 text-xs bg-white p-2 rounded-lg border border-slate-200">
                            <div className="flex-1 flex flex-col gap-1">
                              <input
                                type="text"
                                value={link.titleTr}
                                onChange={(e) => updateColumnLink(col.id, lIdx, "titleTr", e.target.value)}
                                className="font-semibold text-[11px] text-slate-800 focus:outline-none"
                                placeholder="Başlık"
                              />
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => updateColumnLink(col.id, lIdx, "url", e.target.value)}
                                className="text-[10px] text-slate-500 font-mono focus:outline-none"
                                placeholder="/url"
                              />
                            </div>
                            <button
                              onClick={() => removeColumnLink(col.id, lIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => addColumnLink(col.id)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 py-1 flex items-center justify-center gap-1 border border-dashed border-indigo-300 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isEn ? "Add Link" : "Bağlantı Ekle"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

﻿          {activeTab === "preview" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-700">
                    {isEn ? "Device Viewport:" : "Cihaz Görünümü:"}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                        previewDevice === "desktop"
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desktop (100%)</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice("tablet")}
                      className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                        previewDevice === "tablet"
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tablet (768px)</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                        previewDevice === "mobile"
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mobile (375px)</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-700">
                    {isEn ? "Preview Language:" : "Önizleme Dili:"}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setPreviewLang("tr")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        previewLang === "tr" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      TR
                    </button>
                    <button
                      onClick={() => setPreviewLang("en")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        previewLang === "en" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-100 p-4 sm:p-8 rounded-2xl flex justify-center items-start min-h-[600px] overflow-x-auto border border-slate-200">
                <div
                  className="bg-white shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
                  style={{
                    width:
                      previewDevice === "desktop"
                        ? "100%"
                        : previewDevice === "tablet"
                        ? "768px"
                        : "375px",
                    borderRadius: settings.borderRadius || "8px",
                    fontFamily: settings.fontBody || "Inter",
                  }}
                >
                  {settings.headerConfig?.showAnnouncement !== false && (
                    <div
                      className="w-full py-2 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: settings.headerConfig?.announcementBgColor || "#1e293b",
                        color: settings.headerConfig?.announcementTextColor || "#f8fafc",
                      }}
                    >
                      <span>
                        {previewLang === "en"
                          ? settings.headerConfig?.announcementTextEn
                          : settings.headerConfig?.announcementTextTr}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </div>
                  )}

                  <div className="w-full bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      {settings.headerConfig?.showSellerHubLink !== false && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[10px]">
                          <Store className="w-3 h-3" />
                          {previewLang === "en" ? "Sell on Cadde" : "Cadde'de Satıcı Ol"}
                        </span>
                      )}
                      <span className="text-slate-400">|</span>
                      <span className="text-[10px] text-slate-300 truncate">
                        {previewLang === "en"
                          ? "Join 1,000+ verified merchants"
                          : "1.000'den fazla onaylı satıcı arasına katılın"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                        {previewLang === "en" ? "Help" : "Yardım"}
                      </span>
                      <span className="flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        {previewLang === "en" ? "Support" : "Destek"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      {settings.logoUrl && settings.logoUrl !== "/logo.svg" && !settings.logoUrl.endsWith(".svg") ? (
                        <img
                          src={settings.logoUrl}
                          alt={settings.marketplaceName}
                          style={{ maxHeight: `${settings.headerConfig?.logoHeight || 40}px` }}
                          className="h-auto w-auto object-contain rounded"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                          style={{
                            backgroundColor: settings.brandColor || "#2563eb",
                            borderRadius: settings.borderRadius || "8px",
                          }}
                        >
                          {settings.marketplaceName ? settings.marketplaceName.charAt(0).toUpperCase() : "C"}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span
                          className="font-extrabold text-base tracking-tight text-slate-900"
                          style={{ fontFamily: settings.fontHeading || "Inter" }}
                        >
                          {settings.marketplaceName.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest -mt-1">
                          {settings.tagline || (previewLang === "en" ? "Marketplace" : "Pazaryeri")}
                        </span>
                      </div>
                    </div>

                    {settings.headerConfig?.showSearch !== false && previewDevice !== "mobile" && (
                      <div className="flex-1 max-w-md mx-auto">
                        <div
                          className="flex items-center w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-400 shadow-inner"
                          style={{ borderRadius: settings.borderRadius || "8px" }}
                        >
                          <Search className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="truncate">
                            {previewLang === "en"
                              ? settings.headerConfig?.searchPlaceholderEn || "Search products..."
                              : settings.headerConfig?.searchPlaceholderTr || "Ürün, kategori veya marka ara..."}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {settings.headerConfig?.showAccountMenu !== false && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">
                          <User className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{previewLang === "en" ? "Sign In" : "Giriş Yap"}</span>
                        </div>
                      )}
                      {settings.headerConfig?.showFavoritesButton !== false && (
                        <div className="p-2 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 relative">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                            2
                          </span>
                        </div>
                      )}
                      {settings.headerConfig?.showCartButton !== false && (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs"
                          style={{
                            backgroundColor: settings.brandColor || "#2563eb",
                            borderRadius: settings.borderRadius || "8px",
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>3.490 ₺</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="p-8 sm:p-12 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${settings.brandColor || "#2563eb"} 0%, #0f172a 100%)`,
                    }}
                  >
                    <div className="max-w-md flex flex-col gap-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit"
                        style={{
                          backgroundColor: settings.accentColor || "#f97316",
                          color: "#ffffff",
                        }}
                      >
                        {previewLang === "en" ? "Exclusive Deals" : "Fırsat Ürünleri"}
                      </span>
                      <h2
                        className="text-2xl sm:text-3xl font-black leading-tight"
                        style={{ fontFamily: settings.fontHeading || "Inter" }}
                      >
                        {previewLang === "en"
                          ? "Summer 2026 Collection"
                          : "2026 Yaz Sezonu Vitrini"}
                      </h2>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {previewLang === "en"
                          ? "Discover thousands of authentic brands with express shipping."
                          : "Binlerce marka ve milyonlarca üründe güvenli alışveriş ve hızlı kargo avantajı."}
                      </p>
                      <div className="pt-2">
                        <button
                          className="px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
                          style={{
                            backgroundColor: settings.accentColor || "#f97316",
                            borderRadius: settings.borderRadius || "8px",
                          }}
                        >
                          {previewLang === "en" ? "Explore Catalog" : "Kataloğu İncele"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 text-slate-300 text-xs flex flex-col">
                    {settings.footerConfig?.showTrustBadges !== false && (
                      <div className="py-4 px-6 border-b border-slate-800 bg-slate-900/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-bold text-white">
                            {previewLang === "en" ? "100% Original" : "%100 Orijinal"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-bold text-white">
                            {previewLang === "en" ? "Fast Delivery" : "Hızlı Teslimat"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-bold text-white">
                            {previewLang === "en" ? "Secure Payment" : "Güvenli Ödeme"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Headset className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-bold text-white">
                            {previewLang === "en" ? "24/7 Support" : "7/24 Destek"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="py-8 px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[11px]">
                      {settings.footerConfig?.columns?.slice(0, 3).map((col) => (
                        <div key={col.id} className="flex flex-col gap-2">
                          <h4 className="font-bold text-white uppercase text-xs tracking-wider">
                            {previewLang === "en" ? col.titleEn : col.titleTr}
                          </h4>
                          <ul className="flex flex-col gap-1 text-slate-400">
                            {col.links.slice(0, 3).map((l, lIdx) => (
                              <li key={lIdx}>{previewLang === "en" ? l.titleEn : l.titleTr}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="py-3 px-6 border-t border-slate-900 text-[10px] text-slate-500 text-center">
                      {previewLang === "en"
                        ? settings.footerConfig?.copyrightTextEn || "© 2026 Cadde Store. All rights reserved."
                        : settings.footerConfig?.copyrightTextTr || "© 2026 Cadde Store Türkiye. Tüm hakları saklıdır."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

