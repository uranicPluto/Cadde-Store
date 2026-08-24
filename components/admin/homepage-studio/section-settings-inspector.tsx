"use client";

import React, { useState } from "react";
import {
  SectionItem,
  SectionConfig,
  ProductSourceType,
} from "@/lib/cms/cms-types";
import { parseSectionConfig } from "@/lib/cms/cms-service";
import {
  Settings,
  Image as ImageIcon,
  ShoppingCart,
  Layout,
  Clock,
  Eye,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  Globe,
  Sliders,
  X,
  Tag,
  Store,
  Grid,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionSettingsInspectorProps {
  section: SectionItem | null;
  onUpdateSection: (updated: SectionItem) => void;
  onDuplicateSection: (section: SectionItem) => void;
  onDeleteSection: (id: string) => void;
  onOpenSectionPreview?: (section: SectionItem) => void;
  onClose?: () => void;
  isEn?: boolean;
}

export const SectionSettingsInspector: React.FC<SectionSettingsInspectorProps> = ({
  section,
  onUpdateSection,
  onDuplicateSection,
  onDeleteSection,
  onOpenSectionPreview,
  onClose,
  isEn = false,
}) => {
  const [activeTab, setActiveTab] = useState<"BASIC" | "ADVANCED">("BASIC");
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState(false);

  if (!section) {
    return (
      <div className="h-full bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-3">
        <Sliders className="w-10 h-10 text-indigo-400 animate-pulse" />
        <span className="font-bold text-sm text-slate-800">
          {isEn ? "Select a section to edit" : "Düzenlemek için bir bölüm seçin"}
        </span>
        <p className="text-xs text-slate-400 max-w-xs">
          {isEn
            ? "Click on any section block in the outline or live canvas to customize its content and layout."
            : "İçerik, görsel ve kurallarını özelleştirmek için tuvaldeki veya listedeki bir bölüme tıklayın."}
        </p>
      </div>
    );
  }

  const config: SectionConfig = parseSectionConfig(section.configJson);

  const updateConfig = (patch: Partial<SectionConfig>) => {
    const updatedConfig: SectionConfig = {
      ...config,
      ...patch,
    };
    onUpdateSection({
      ...section,
      configJson: updatedConfig,
    });
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert(isEn ? "Please provide a template name." : "Lütfen bir şablon adı giriniz.");
      return;
    }

    try {
      setIsSavingTemplate(true);
      const res = await fetch("/api/cms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          description: `${section.type} configuration template`,
          type: section.type,
          configJson: config,
        }),
      });

      if (res.ok) {
        setTemplateSuccess(true);
        setTimeout(() => {
          setTemplateSuccess(false);
          setTemplateName("");
        }, 3000);
      }
    } catch (e) {
      console.error("Save template error:", e);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const normType = (section.type || "").toUpperCase().trim();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col h-full overflow-hidden text-xs">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-900 text-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              {section.type}
            </span>
            <h2 className="font-extrabold text-white text-xs truncate">
              {isEn ? section.titleEN || section.titleTR : section.titleTR || section.titleEN}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenSectionPreview && (
            <button
              type="button"
              onClick={() => onOpenSectionPreview(section)}
              title={isEn ? "Preview Section" : "Bölümü Önizle"}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isEn ? "Close Inspector" : "Paneli Kapat"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Basic vs Advanced Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("BASIC")}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "BASIC"
              ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isEn ? "Basic Settings" : "Temel Ayarlar"}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ADVANCED")}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "ADVANCED"
              ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{isEn ? "Advanced Settings" : "Gelişmiş Ayarlar"}</span>
        </button>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {activeTab === "BASIC" ? (
          <>
            {/* Section Titles */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700">{isEn ? "Section Headings" : "Bölüm Başlıkları"}</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">TR Başlık</label>
                  <input
                    type="text"
                    value={section.titleTR || ""}
                    onChange={(e) => onUpdateSection({ ...section, titleTR: e.target.value })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">EN Title</label>
                  <input
                    type="text"
                    value={section.titleEN || ""}
                    onChange={(e) => onUpdateSection({ ...section, titleEN: e.target.value })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">TR Alt Başlık</label>
                  <input
                    type="text"
                    value={config.subtitleTR || ""}
                    onChange={(e) => updateConfig({ subtitleTR: e.target.value })}
                    placeholder="Örn: Özel koleksiyonlar"
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">EN Subtitle</label>
                  <input
                    type="text"
                    value={config.subtitleEN || ""}
                    onChange={(e) => updateConfig({ subtitleEN: e.target.value })}
                    placeholder="E.g: Curated collections"
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* HERO SECTION SPECIFIC CONTROLS */}
            {normType === "HERO" && (
              <div className="flex flex-col gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEn ? "Hero Banner & CTA" : "Hero Görseli & Eylem Butonu"}</span>
                </span>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-600">{isEn ? "Banner Image URL" : "Hero Görsel URL"}</label>
                  <input
                    type="text"
                    value={config.heroBannerUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"}
                    onChange={(e) => updateConfig({ heroBannerUrl: e.target.value })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">TR Buton Metni</label>
                    <input
                      type="text"
                      value={config.ctaTextTR || "Şimdi Keşfet"}
                      onChange={(e) => updateConfig({ ctaTextTR: e.target.value })}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">EN Button Text</label>
                    <input
                      type="text"
                      value={config.ctaTextEN || "Explore Now"}
                      onChange={(e) => updateConfig({ ctaTextEN: e.target.value })}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-600">{isEn ? "Target Destination URL" : "Hedef Yönlendirme Linki"}</label>
                  <input
                    type="text"
                    value={config.ctaUrl || "/category/kadin"}
                    onChange={(e) => updateConfig({ ctaUrl: e.target.value })}
                    placeholder="/category/kadin"
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* PRODUCT CAROUSEL / BESTSELLERS CONTROLS */}
            {(normType.includes("PRODUCT") || normType.includes("BESTSELLER") || normType.includes("ARRIVALS") || normType.includes("TRENDING")) && (
              <div className="flex flex-col gap-3 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isEn ? "Product Source & Merchandising Rules" : "Ürün Kaynağı ve Sıralama Kuralları"}</span>
                </span>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-600">{isEn ? "Product Selection Source" : "Ürün Seçim Kaynağı"}</label>
                  <select
                    value={config.productRules?.source || "BESTSELLING"}
                    onChange={(e) =>
                      updateConfig({
                        productRules: {
                          ...(config.productRules || { itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
                          source: e.target.value as ProductSourceType,
                        },
                      })
                    }
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
                  >
                    <option value="BESTSELLING">{isEn ? "Best Sellers (Automatic)" : "Çok Satanlar (Otomatik)"}</option>
                    <option value="TRENDING">{isEn ? "Trending Products" : "Trend Ürünler"}</option>
                    <option value="NEW_ARRIVALS">{isEn ? "New Arrivals" : "Yeni Gelenler"}</option>
                    <option value="HIGHEST_DISCOUNT">{isEn ? "Highest Discount" : "En Yüksek İndirimli"}</option>
                    <option value="HIGHEST_RATED">{isEn ? "Top Rated (4.5+ Stars)" : "En Yüksek Puanlı (4.5+ Yıldız)"}</option>
                    <option value="MANUAL">{isEn ? "Manual Product Selection" : "Manuel Seçilmiş Ürünler"}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">{isEn ? "Item Limit (Desktop)" : "Masaüstü Ürün Limiti"}</label>
                    <input
                      type="number"
                      min={2}
                      max={24}
                      value={config.productRules?.itemLimitDesktop || 8}
                      onChange={(e) =>
                        updateConfig({
                          productRules: {
                            ...(config.productRules || { source: "BESTSELLING", itemLimitTablet: 4, itemLimitMobile: 2 }),
                            itemLimitDesktop: Number(e.target.value),
                          },
                        })
                      }
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">{isEn ? "Minimum Rating (Stars)" : "Min. Yıldız Puanı"}</label>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      max={5}
                      value={config.productRules?.minRating || 4.0}
                      onChange={(e) =>
                        updateConfig({
                          productRules: {
                            ...(config.productRules || { source: "BESTSELLING", itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
                            minRating: Number(e.target.value),
                          },
                        })
                      }
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY GRID CONTROLS */}
            {normType.includes("CATEGORY") && (
              <div className="flex flex-col gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isEn ? "Category Grid Layout" : "Kategori Düzeni"}</span>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">{isEn ? "Columns (Desktop)" : "Sütun Sayısı (Masaüstü)"}</label>
                    <select
                      value={config.categoryColumns || "6"}
                      onChange={(e) => updateConfig({ categoryColumns: Number(e.target.value) })}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
                    >
                      <option value="4">4 Sütun</option>
                      <option value="6">6 Sütun</option>
                      <option value="8">8 Sütun</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">{isEn ? "Card Style" : "Kart Stili"}</label>
                    <select
                      value={config.cardStyle || "ROUNDED"}
                      onChange={(e) => updateConfig({ cardStyle: e.target.value })}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
                    >
                      <option value="ROUNDED">{isEn ? "Rounded Cards" : "Yuvarlak Kartlar"}</option>
                      <option value="SQUARE">{isEn ? "Square Tiles" : "Kare Kartlar"}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* BRAND STRIP CONTROLS */}
            {normType.includes("BRAND") && (
              <div className="flex flex-col gap-3 p-3 bg-slate-100 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEn ? "Brand Strip Settings" : "Marka Şeridi Ayarları"}</span>
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.grayscaleLogos ?? true}
                    onChange={(e) => updateConfig({ grayscaleLogos: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-bold">{isEn ? "Grayscale logos with hover color" : "Üzerine gelince renklenen gri logolar"}</span>
                </label>
              </div>
            )}

            {/* FLASH DEALS CONTROLS */}
            {normType.includes("FLASH") && (
              <div className="flex flex-col gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isEn ? "Flash Deals & Countdown" : "Flaş Fırsatlar & Geri Sayım"}</span>
                </span>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-600">{isEn ? "Deal Expiration Date" : "Kampanya Bitiş Tarihi"}</label>
                  <input
                    type="datetime-local"
                    value={config.endDate ? new Date(config.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => updateConfig({ endDate: e.target.value })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* ADVANCED SETTINGS TAB */
          <div className="flex flex-col gap-4">
            {/* Device Visibility */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700">{isEn ? "Device Visibility" : "Cihaz Görünürlüğü"}</span>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={config.visibility?.desktop ?? true}
                    onChange={(e) =>
                      updateConfig({
                        visibility: {
                          ...(config.visibility || { tablet: true, mobile: true }),
                          desktop: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold">Masaüstü</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={config.visibility?.tablet ?? true}
                    onChange={(e) =>
                      updateConfig({
                        visibility: {
                          ...(config.visibility || { desktop: true, mobile: true }),
                          tablet: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold">Tablet</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={config.visibility?.mobile ?? true}
                    onChange={(e) =>
                      updateConfig({
                        visibility: {
                          ...(config.visibility || { desktop: true, tablet: true }),
                          mobile: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold">Mobil</span>
                </label>
              </div>
            </div>

            {/* Campaign Scheduling */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700">{isEn ? "Time-Based Scheduling" : "Zamanlı Yayın Takvimi"}</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">{isEn ? "Start Date" : "Başlangıç Tarihi"}</label>
                  <input
                    type="datetime-local"
                    value={section.startDate ? new Date(section.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => onUpdateSection({ ...section, startDate: e.target.value ? e.target.value : null })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">{isEn ? "End Date" : "Bitiş Tarihi"}</label>
                  <input
                    type="datetime-local"
                    value={section.endDate ? new Date(section.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => onUpdateSection({ ...section, endDate: e.target.value ? e.target.value : null })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Save as Template */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700">{isEn ? "Save Section as Preset Template" : "Şablon Olarak Kaydet"}</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={isEn ? "Template name..." : "Şablon adı..."}
                  className="flex-1 h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                />
                <Button
                  size="sm"
                  disabled={isSavingTemplate}
                  onClick={handleSaveAsTemplate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 text-xs"
                >
                  <span>{isSavingTemplate ? "..." : isEn ? "Save" : "Kaydet"}</span>
                </Button>
              </div>
              {templateSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isEn ? "Template saved!" : "Şablon kaydedildi!"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inspector Bottom Actions */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDuplicateSection(section)}
          className="rounded-xl text-xs font-bold text-slate-700 border-slate-300 hover:bg-white"
        >
          <Copy className="w-3.5 h-3.5 mr-1" />
          <span>{isEn ? "Duplicate" : "Çoğalt"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteSection(section.id)}
          className="rounded-xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>{isEn ? "Delete" : "Sil"}</span>
        </Button>
      </div>
    </div>
  );
};
