"use client";

import React, { useState, useEffect } from "react";
import {
  SectionItem,
  SectionConfig,
  ProductSourceType,
  CmsBannerItem,
} from "@/lib/cms/cms-types";
import { parseSectionConfig } from "@/lib/cms/cms-service";
import {
  Settings,
  Image as ImageIcon,
  ShoppingCart,
  Layout,
  Clock,
  Eye,
  Bookmark,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionSettingsInspectorProps {
  section: SectionItem | null;
  onUpdateSection: (updated: SectionItem) => void;
  onDuplicateSection: (section: SectionItem) => void;
  onDeleteSection: (id: string) => void;
  onOpenSectionPreview: (section: SectionItem) => void;
  isEn?: boolean;
}

export const SectionSettingsInspector: React.FC<SectionSettingsInspectorProps> = ({
  section,
  onUpdateSection,
  onDuplicateSection,
  onDeleteSection,
  onOpenSectionPreview,
  isEn = false,
}) => {
  const [activeTab, setActiveTab] = useState<"CONTENT" | "PRODUCTS" | "BANNERS" | "STYLE" | "SCHEDULE">("CONTENT");
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState(false);

  if (!section) {
    return (
      <div className="h-full bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-3">
        <Settings className="w-10 h-10 text-slate-300 animate-spin-slow" />
        <span className="font-bold text-sm text-slate-700">
          {isEn ? "No section selected" : "Seçili bölüm yok"}
        </span>
        <p className="text-xs text-slate-400 max-w-xs">
          {isEn
            ? "Click on any section in the Navigator outline or Canvas to inspect and edit its settings."
            : "Ayarlarını düzenlemek için sol paneldeki listeden veya canlı tuvaldeki bir bölüme tıklayın."}
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-full overflow-hidden text-xs">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            {section.type}
          </span>
          <h2 className="font-extrabold text-slate-900 text-sm truncate">
            {isEn ? section.titleEN || section.titleTR : section.titleTR || section.titleEN}
          </h2>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onOpenSectionPreview(section)}
            title={isEn ? "Preview Section" : "Bölümü Önizle"}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicateSection(section)}
            title={isEn ? "Duplicate Section" : "Bölümü Çoğalt"}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            title={isEn ? "Delete Section" : "Bölümü Sil"}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
        {[
          { id: "CONTENT", label: isEn ? "Content" : "İçerik", icon: Settings },
          { id: "PRODUCTS", label: isEn ? "Products" : "Ürünler", icon: ShoppingCart },
          { id: "BANNERS", label: isEn ? "Banners" : "Görseller", icon: ImageIcon },
          { id: "STYLE", label: isEn ? "Styling" : "Tasarım", icon: Layout },
          { id: "SCHEDULE", label: isEn ? "Schedule" : "Zamanlama", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-2xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inspector Body Content */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {activeTab === "CONTENT" && (
          <div className="flex flex-col gap-3.5">
            {/* Title TR */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>{isEn ? "Section Title (Turkish)" : "Bölüm Başlığı (Türkçe)"}</span>
                <span className="text-[10px] text-slate-400">TR</span>
              </label>
              <input
                type="text"
                value={section.titleTR}
                onChange={(e) => onUpdateSection({ ...section, titleTR: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold text-slate-900"
              />
            </div>

            {/* Title EN */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>{isEn ? "Section Title (English)" : "Bölüm Başlığı (İngilizce)"}</span>
                <span className="text-[10px] text-slate-400">EN</span>
              </label>
              <input
                type="text"
                value={section.titleEN}
                onChange={(e) => onUpdateSection({ ...section, titleEN: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold text-slate-900"
              />
            </div>

            {/* Subtitle TR */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>{isEn ? "Subtitle (Turkish)" : "Alt Başlık / Açıklama (Türkçe)"}</span>
                <span className="text-[10px] text-slate-400">TR</span>
              </label>
              <textarea
                rows={2}
                value={config.subtitleTR || ""}
                onChange={(e) => updateConfig({ subtitleTR: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium text-slate-800 resize-none"
              />
            </div>

            {/* Subtitle EN */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>{isEn ? "Subtitle (English)" : "Alt Başlık / Açıklama (İngilizce)"}</span>
                <span className="text-[10px] text-slate-400">EN</span>
              </label>
              <textarea
                rows={2}
                value={config.subtitleEN || ""}
                onChange={(e) => updateConfig({ subtitleEN: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium text-slate-800 resize-none"
              />
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">{isEn ? "CTA Text (TR)" : "Buton Metni (TR)"}</label>
                <input
                  type="text"
                  value={config.ctaTextTR || ""}
                  onChange={(e) => updateConfig({ ctaTextTR: e.target.value })}
                  placeholder="Tümünü Gör"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">{isEn ? "CTA Text (EN)" : "Buton Metni (EN)"}</label>
                <input
                  type="text"
                  value={config.ctaTextEN || ""}
                  onChange={(e) => updateConfig({ ctaTextEN: e.target.value })}
                  placeholder="View All"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "CTA Destination URL" : "Buton Yönlendirme Linki"}</label>
              <input
                type="text"
                value={config.ctaUrl || ""}
                onChange={(e) => updateConfig({ ctaUrl: e.target.value })}
                placeholder="/category/women"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        )}

        {activeTab === "PRODUCTS" && (
          <div className="flex flex-col gap-4">
            {/* Product Source Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">{isEn ? "Product Sourcing Rule" : "Ürün Seçim Kuralı"}</label>
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
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 outline-none"
              >
                <option value="BESTSELLING">{isEn ? "Bestselling (Most Popular)" : "En Çok Satanlar (Popüler)"}</option>
                <option value="TRENDING">{isEn ? "Trending Products" : "Haftanın Trend Ürünleri"}</option>
                <option value="NEW_ARRIVALS">{isEn ? "New Arrivals (Latest)" : "Yeni Gelenler (En Son Eklenenler)"}</option>
                <option value="HIGHEST_RATED">{isEn ? "Highest Customer Rating" : "En Yüksek Müşteri Puanı (★)"}</option>
                <option value="MOST_REVIEWED">{isEn ? "Most Reviewed Items" : "En Çok Yorum Alanlar"}</option>
                <option value="HIGHEST_DISCOUNT">{isEn ? "Highest Discount Rate (%)" : "En Yüksek İndirim Oranı (%)"}</option>
                <option value="LOWEST_PRICE">{isEn ? "Lowest Price First" : "En Uygun Fiyatlılar"}</option>
                <option value="CATEGORY">{isEn ? "Filter by Category" : "Kategoriye Göre Filtrele"}</option>
                <option value="MANUAL">{isEn ? "Manual Product Selection" : "Manuel Ürün Seçimi"}</option>
              </select>
            </div>

            {/* Category Filter if CATEGORY rule */}
            {config.productRules?.source === "CATEGORY" && (
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">{isEn ? "Target Category" : "Hedef Kategori"}</label>
                <select
                  value={config.productRules?.categorySlug || ""}
                  onChange={(e) =>
                    updateConfig({
                      productRules: {
                        ...(config.productRules || { source: "CATEGORY", itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
                        categorySlug: e.target.value,
                      },
                    })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">{isEn ? "Select Category" : "Kategori Seçiniz"}</option>
                  <option value="kadin">Kadın Giyim</option>
                  <option value="erkek">Erkek Giyim</option>
                  <option value="ayakkabi-canta">Ayakkabı & Çanta</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="ev-yasam">Ev & Yaşam</option>
                  <option value="kozmetik">Kozmetik & Kişisel Bakım</option>
                  <option value="spor">Spor & Outdoor</option>
                </select>
              </div>
            )}

            {/* Constraints: Min Rating, In stock */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">{isEn ? "Min Rating (★)" : "Min. Puan (★)"}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={config.productRules?.minRating || 0}
                  onChange={(e) =>
                    updateConfig({
                      productRules: {
                        ...(config.productRules || { source: "BESTSELLING", itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
                        minRating: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="stockOnly"
                  checked={config.productRules?.inStockOnly !== false}
                  onChange={(e) =>
                    updateConfig({
                      productRules: {
                        ...(config.productRules || { source: "BESTSELLING", itemLimitDesktop: 8, itemLimitTablet: 4, itemLimitMobile: 2 }),
                        inStockOnly: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="stockOnly" className="font-bold text-slate-700 cursor-pointer">
                  {isEn ? "In Stock Only" : "Yalnızca Stokta Olanlar"}
                </label>
              </div>
            </div>

            {/* Responsive Item Limits */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
              <span className="font-extrabold text-slate-800">{isEn ? "Responsive Item Counts" : "Cihaz Bazlı Ürün Sayısı"}</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{isEn ? "Desktop" : "Masaüstü"}</span>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={config.productRules?.itemLimitDesktop || 8}
                    onChange={(e) =>
                      updateConfig({
                        productRules: {
                          ...(config.productRules || { source: "BESTSELLING", itemLimitTablet: 4, itemLimitMobile: 2 }),
                          itemLimitDesktop: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-center font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{isEn ? "Tablet" : "Tablet"}</span>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={config.productRules?.itemLimitTablet || 4}
                    onChange={(e) =>
                      updateConfig({
                        productRules: {
                          ...(config.productRules || { source: "BESTSELLING", itemLimitDesktop: 8, itemLimitMobile: 2 }),
                          itemLimitTablet: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-center font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{isEn ? "Mobile" : "Mobil"}</span>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={config.productRules?.itemLimitMobile || 2}
                    onChange={(e) =>
                      updateConfig({
                        productRules: {
                          ...(config.productRules || { source: "BESTSELLING", itemLimitDesktop: 8, itemLimitTablet: 4 }),
                          itemLimitMobile: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "BANNERS" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">
                {isEn ? `Slides & Banners (${section.banners?.length || 0})` : `Görseller & Bannerlar (${section.banners?.length || 0})`}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newBanner: CmsBannerItem = {
                    id: `ban-${Date.now()}`,
                    titleTR: "Yeni Banner",
                    titleEN: "New Banner",
                    imageUrlDesktop: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
                    targetType: "CATEGORY",
                    targetValue: "/category/women",
                    orderIndex: section.banners?.length || 0,
                    active: true,
                  };
                  onUpdateSection({
                    ...section,
                    banners: [...(section.banners || []), newBanner],
                  });
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? "Add Slide" : "Görsel Ekle"}</span>
              </button>
            </div>

            {(!section.banners || section.banners.length === 0) ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <span>{isEn ? "No banners attached." : "Bu bölüme ait görsel bulunmuyor."}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {section.banners.map((ban, bIdx) => (
                  <div key={ban.id || bIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">Slide #{bIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = section.banners.filter((_, idx) => idx !== bIdx);
                          onUpdateSection({ ...section, banners: updated });
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img src={ban.imageUrlDesktop} alt="" className="w-20 h-12 object-cover rounded-lg border border-slate-300 shrink-0" />
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <input
                          type="text"
                          value={ban.imageUrlDesktop}
                          onChange={(e) => {
                            const updated = [...section.banners];
                            updated[bIdx].imageUrlDesktop = e.target.value;
                            onUpdateSection({ ...section, banners: updated });
                          }}
                          placeholder="Image URL"
                          className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px]"
                        />
                        <input
                          type="text"
                          value={ban.titleTR || ""}
                          onChange={(e) => {
                            const updated = [...section.banners];
                            updated[bIdx].titleTR = e.target.value;
                            onUpdateSection({ ...section, banners: updated });
                          }}
                          placeholder="Title (TR)"
                          className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "STYLE" && (
          <div className="flex flex-col gap-3.5">
            {/* Display Toggles */}
            <span className="font-extrabold text-slate-800">{isEn ? "Card Badges & Elements" : "Kart Rozetleri & Gösterim"}</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "showRating", label: isEn ? "Rating (★)" : "Puanı Göster" },
                { key: "showReviewCount", label: isEn ? "Review Count" : "Yorum Sayısı" },
                { key: "showSeller", label: isEn ? "Seller Name" : "Satıcı Adı" },
                { key: "showOriginalPrice", label: isEn ? "Old Price" : "Eski Fiyat (Çizili)" },
                { key: "showDiscountBadge", label: isEn ? "Discount %" : "İndirim Rozeti" },
                { key: "showFreeShippingBadge", label: isEn ? "Free Ship" : "Ücretsiz Kargo" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(config.displayOptions as any)?.[item.key] !== false}
                    onChange={(e) =>
                      updateConfig({
                        displayOptions: {
                          ...(config.displayOptions || {
                            showRating: true,
                            showReviewCount: true,
                            showSeller: true,
                            showOriginalPrice: true,
                            showDiscountBadge: true,
                            showFreeShippingBadge: true,
                            showAddToCart: true,
                          }),
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Background Color */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700">{isEn ? "Background Color" : "Arka Plan Rengi"}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.displayOptions?.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    updateConfig({
                      displayOptions: {
                        ...(config.displayOptions || {
                          showRating: true,
                          showReviewCount: true,
                          showSeller: true,
                          showOriginalPrice: true,
                          showDiscountBadge: true,
                          showFreeShippingBadge: true,
                          showAddToCart: true,
                        }),
                        backgroundColor: e.target.value,
                      },
                    })
                  }
                  className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.displayOptions?.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    updateConfig({
                      displayOptions: {
                        ...(config.displayOptions || {
                          showRating: true,
                          showReviewCount: true,
                          showSeller: true,
                          showOriginalPrice: true,
                          showDiscountBadge: true,
                          showFreeShippingBadge: true,
                          showAddToCart: true,
                        }),
                        backgroundColor: e.target.value,
                      },
                    })
                  }
                  className="flex-1 h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "SCHEDULE" && (
          <div className="flex flex-col gap-3.5">
            {/* Device Visibility */}
            <span className="font-extrabold text-slate-800">{isEn ? "Device Visibility" : "Cihaz Görünürlüğü"}</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "desktop", label: isEn ? "Desktop" : "Masaüstü" },
                { key: "tablet", label: isEn ? "Tablet" : "Tablet" },
                { key: "mobile", label: isEn ? "Mobile" : "Mobil" },
              ].map((dev) => (
                <label key={dev.key} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(config.visibility as any)?.[dev.key] !== false}
                    onChange={(e) =>
                      updateConfig({
                        visibility: {
                          ...(config.visibility || { desktop: true, tablet: true, mobile: true }),
                          [dev.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-700">{dev.label}</span>
                </label>
              ))}
            </div>

            {/* Campaign Scheduling Dates */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="font-extrabold text-slate-800">{isEn ? "Timezone Scheduling" : "Tarih Zamanlama"}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{isEn ? "Start Date" : "Başlangıç Tarihi"}</span>
                  <input
                    type="datetime-local"
                    value={section.startDate ? new Date(section.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => onUpdateSection({ ...section, startDate: e.target.value || null })}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{isEn ? "End Date" : "Bitiş Tarihi"}</span>
                  <input
                    type="datetime-local"
                    value={section.endDate ? new Date(section.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => onUpdateSection({ ...section, endDate: e.target.value || null })}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Flash Deal Countdown Clock */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  {isEn ? "Flash Deal Countdown Clock" : "Flaş Fırsat Geri Sayım Saati"}
                </span>
                <input
                  type="checkbox"
                  checked={config.countdownEnabled || false}
                  onChange={(e) => updateConfig({ countdownEnabled: e.target.checked })}
                  className="rounded text-amber-600"
                />
              </div>
              {config.countdownEnabled && (
                <input
                  type="datetime-local"
                  value={config.countdownEndDate ? new Date(config.countdownEndDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => updateConfig({ countdownEndDate: e.target.value })}
                  className="w-full h-8 px-2 bg-white border border-amber-300 rounded text-xs font-mono text-amber-900"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inspector Footer Actions: Save as Template */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={isEn ? "Template name (e.g. Summer Sale)" : "Şablon adı (örn: Yaz İndirimi)"}
            className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs"
          />
          <button
            type="button"
            disabled={isSavingTemplate || !templateName.trim()}
            onClick={handleSaveAsTemplate}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
          >
            {templateSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? "Saved!" : "Kaydedildi!"}</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isEn ? "Save Template" : "Şablon Yap"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
