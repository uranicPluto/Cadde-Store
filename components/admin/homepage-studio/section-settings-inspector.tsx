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
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProductSelectorModal,
  CategorySelectorModal,
  IconPickerModal,
  ICON_OPTIONS,
} from "./data-selectors";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";

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
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<string>("heroBannerUrl");
  const [activeBadgeIndex, setActiveBadgeIndex] = useState<number | null>(null);

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

  const updateConfig = (newConfigPartial: Partial<SectionConfig>) => {
    const merged = { ...config, ...newConfigPartial };
    onUpdateSection({
      ...section,
      configJson: merged,
    });
  };

  const normType = (section.type || "").toUpperCase();

  return (
    <div className="h-full bg-white border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden shadow-2xs">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-xs text-slate-900 truncate">
              {section.titleTR || section.titleEN || section.type}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{section.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicateSection(section)}
            title={isEn ? "Duplicate" : "Kopyala"}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            title={isEn ? "Delete" : "Sil"}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("BASIC")}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "BASIC"
              ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>{isEn ? "Content & Media" : "İçerik & Görseller"}</span>
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

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {activeTab === "BASIC" ? (
          <>
            {/* Section Titles */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700 text-xs">{isEn ? "Section Headings" : "Bölüm Başlıkları"}</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">TR Başlık</label>
                  <input
                    type="text"
                    value={section.titleTR || ""}
                    onChange={(e) => onUpdateSection({ ...section, titleTR: e.target.value })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold outline-none focus:border-indigo-600 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">EN Title</label>
                  <input
                    type="text"
                    value={section.titleEN || ""}
                    onChange={(e) => onUpdateSection({ ...section, titleEN: e.target.value })}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold outline-none focus:border-indigo-600 text-xs"
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
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-indigo-600 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold">EN Subtitle</label>
                  <input
                    type="text"
                    value={config.subtitleEN || ""}
                    onChange={(e) => updateConfig({ subtitleEN: e.target.value })}
                    placeholder="E.g: Curated collections"
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-indigo-600 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* HERO SECTION SPECIFIC CONTROLS */}
            {normType === "HERO" && (
              <div className="flex flex-col gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEn ? "Hero Banner & CTA" : "Hero Görseli & Eylem Butonu"}</span>
                </span>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600">{isEn ? "Banner Image" : "Hero Görseli"}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField("heroBannerUrl");
                        setIsMediaPickerOpen(true);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>{isEn ? "Select / Upload" : "Kütüphaneden Seç / Yükle"}</span>
                    </button>
                  </div>
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
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">EN Button Text</label>
                    <input
                      type="text"
                      value={config.ctaTextEN || "Explore Now"}
                      onChange={(e) => updateConfig({ ctaTextEN: e.target.value })}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 text-xs"
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
                <span className="font-bold text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isEn ? "Product Source Rules" : "Ürün Besleme Kuralları"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="text-[10px] text-indigo-600 hover:underline font-bold"
                  >
                    {isEn ? "Manual Pick" : "Manuel Seçim"}
                  </button>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600">{isEn ? "Display Count" : "Görüntüleme Adedi"}</label>
                    <input
                      type="number"
                      min={2}
                      max={24}
                      value={config.productRules?.itemLimitDesktop || 8}
                      onChange={(e) =>
                        updateConfig({
                          productRules: {
                            ...(config.productRules || { source: "BESTSELLING", itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
                            itemLimitDesktop: Number(e.target.value),
                          },
                        })
                      }
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ADVANCED SETTINGS TAB */
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700 text-xs">{isEn ? "Visibility Toggles" : "Cihaz Görünürlük Ayarları"}</span>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.active}
                    onChange={(e) => onUpdateSection({ ...section, active: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>{isEn ? "Active Section" : "Aktif Bölüm"}</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductSelectorModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        selectedProductIds={config.productRules?.selectedProductIds || []}
        onSave={(ids) =>
          updateConfig({
            productRules: {
              ...(config.productRules || { source: "MANUAL", itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
              source: "MANUAL",
              selectedProductIds: ids,
            },
          })
        }
        isEn={isEn}
      />

      <CategorySelectorModal
        isOpen={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        selectedCategoryIds={config.selectedCategoryIds || []}
        onSave={(ids) => updateConfig({ selectedCategoryIds: ids })}
        isEn={isEn}
      />

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          updateConfig({ [mediaTargetField]: url });
        }}
        isEn={isEn}
      />
    </div>
  );
};
