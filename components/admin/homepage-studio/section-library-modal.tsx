"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { SectionType, HomepageTemplateItem } from "@/lib/cms/cms-types";
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  ShoppingCart,
  Tag,
  Store,
  Flame,
  Grid,
  ListOrdered,
  Type,
  Layout,
  Crown,
  Trash2,
  Plus,
  Compass,
  Award,
  Video,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (type: SectionType, titleTR: string, titleEN: string, initialConfig?: any) => void;
  insertIndex?: number;
  isEn?: boolean;
}

interface LibraryBlock {
  type: SectionType;
  titleTR: string;
  titleEN: string;
  descTR: string;
  descEN: string;
  category: "CONTENT" | "PRODUCTS" | "CATEGORIES" | "BRANDS" | "SELLERS" | "CAMPAIGNS" | "LAYOUT";
  icon: any;
  badge?: string;
}

const SECTION_LIBRARY_BLOCKS: LibraryBlock[] = [
  // CONTENT
  {
    type: "HERO",
    titleTR: "Ana Vitrin Slider & Banners",
    titleEN: "Hero Banner Slider",
    descTR: "Görsel, başlık ve aksiyon butonlu ana kampanya kaydırıcısı.",
    descEN: "Full-width campaign carousel with titles, badges, and CTAs.",
    category: "CONTENT",
    icon: ImageIcon,
    badge: "POPULAR",
  },
  {
    type: "BANNER_STRIP",
    titleTR: "Promosyonel Kampanya Kartları",
    titleEN: "Promotional Campaign Cards",
    descTR: "2'li veya 3'lü görsel kampanya banner ızgarası.",
    descEN: "Two or three column promotional visual banner cards.",
    category: "CONTENT",
    icon: Layout,
  },
  {
    type: "RICH_CONTENT",
    titleTR: "Zengin Metin & Duyuru Bloğu",
    titleEN: "Rich Content & Notice Block",
    descTR: "Özel metinler, duyurular veya HTML içerikleri.",
    descEN: "Custom announcements, HTML, or styled rich text.",
    category: "CONTENT",
    icon: Type,
  },
  {
    type: "TRUST_BADGES",
    titleTR: "Müşteri Güven Rozetleri (Trust Strip)",
    titleEN: "Customer Trust & Benefit Strip",
    descTR: "Hızlı kargo, 256-bit SSL, kolay iade güvence rozetleri.",
    descEN: "Fast delivery, SSL security, easy return reassurance pills.",
    category: "CONTENT",
    icon: Award,
  },

  // PRODUCTS
  {
    type: "PRODUCT_CAROUSEL",
    titleTR: "Popüler & Çok Satan Ürünler",
    titleEN: "Bestsellers Product Carousel",
    descTR: "Dinamik veya manuel seçilen ürün kaydırıcı koleksiyonu.",
    descEN: "Dynamic or manual product carousel collection.",
    category: "PRODUCTS",
    icon: ShoppingCart,
    badge: "CORE",
  },
  {
    type: "FLASH_DEALS",
    titleTR: "Günün Flaş Fırsatları (Countdown)",
    titleEN: "Flash Deals & Countdown Sale",
    descTR: "Geri sayım sayacı ve yüksek indirimli ürün vitrini.",
    descEN: "Real-time countdown timer with heavy discount products.",
    category: "PRODUCTS",
    icon: Flame,
    badge: "HIGH CONVERSION",
  },
  {
    type: "NEW_ARRIVALS",
    titleTR: "Yeni Gelenler Koleksiyonu",
    titleEN: "New Arrivals Collection",
    descTR: "En son eklenen taze ürünleri dinamik sergiler.",
    descEN: "Dynamically showcase the latest catalog arrivals.",
    category: "PRODUCTS",
    icon: Sparkles,
  },
  {
    type: "TRENDING_PRODUCTS",
    titleTR: "Haftanın Trend Ürünleri",
    titleEN: "Trending Products of the Week",
    descTR: "En çok incelenen ve sepete eklenen ürünler.",
    descEN: "Most viewed and added to cart items.",
    category: "PRODUCTS",
    icon: Crown,
  },
  {
    type: "BESTSELLER_GRID",
    titleTR: "Çok Satanlar Tablo Izgarası",
    titleEN: "Bestseller Product Grid",
    descTR: "Kategori bazlı çok satan ürün ızgarası.",
    descEN: "Categorized bestseller grid layout.",
    category: "PRODUCTS",
    icon: Grid,
  },

  // CATEGORIES
  {
    type: "CATEGORY_GRID",
    titleTR: "Popüler Kategori Izgarası",
    titleEN: "Popular Category Grid",
    descTR: "Görsel ve başlık içeren ana kategori navigasyon kutuları.",
    descEN: "Visual grid boxes linking to top store categories.",
    category: "CATEGORIES",
    icon: Compass,
  },
  {
    type: "CATEGORY_CAROUSEL",
    titleTR: "Kategori Kaydırıcı Şerit",
    titleEN: "Category Carousel Strip",
    descTR: "Dairesel ikonlarla yatay kaydırılabilir kategori şeridi.",
    descEN: "Horizontal scrollable circular category pills.",
    category: "CATEGORIES",
    icon: ListOrdered,
  },

  // BRANDS
  {
    type: "BRAND_STRIP",
    titleTR: "Sizin İçin Markalar (Logo Şeridi)",
    titleEN: "Brands For You (Logo Strip)",
    descTR: "Popüler marka logolarının yatay kaydırma şeridi.",
    descEN: "Horizontal slider of popular partner brand logos.",
    category: "BRANDS",
    icon: Tag,
  },
  {
    type: "FEATURED_BRANDS",
    titleTR: "Öne Çıkan Marka Kampanyaları",
    titleEN: "Featured Brand Campaigns",
    descTR: "Marka bannerları ve özel indirimli koleksiyonlar.",
    descEN: "Brand banners with exclusive discounted collections.",
    category: "BRANDS",
    icon: Award,
  },

  // SELLERS
  {
    type: "STORE_HIGHLIGHTS",
    titleTR: "Onaylı Mağazalar & Pazaryeri Satıcıları",
    titleEN: "Verified Sellers & Stores",
    descTR: "Yüksek puanlı onaylı satıcı mağaza kartları ve ürünleri.",
    descEN: "Top-rated verified merchant store spotlight cards.",
    category: "SELLERS",
    icon: Store,
  },
];

export const SectionLibraryModal: React.FC<SectionLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  isEn = false,
}) => {
  const [activeTab, setActiveTab] = useState<"LIBRARY" | "TEMPLATES">("LIBRARY");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [templates, setTemplates] = useState<HomepageTemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/cms/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.templates) setTemplates(data.templates);
      }
    } catch (e) {
      console.error("Failed to load templates:", e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "TEMPLATES") {
      fetchTemplates();
    }
  }, [isOpen, activeTab]);

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isEn ? "Delete this template?" : "Bu şablonu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/cms/templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete template error:", err);
    }
  };

  const filteredBlocks = SECTION_LIBRARY_BLOCKS.filter(
    (b) => categoryFilter === "ALL" || b.category === categoryFilter
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Section Library & Templates" : "Bölüm Kütüphanesi & Şablonlar"}
      size="xl"
    >
      <div className="flex flex-col gap-5 text-xs">
        {/* Main Tab Toggle: Library vs My Templates */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("LIBRARY")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                activeTab === "LIBRARY"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isEn ? "Standard Library (20+ Blocks)" : "Standart Kütüphane (20+ Blok)"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("TEMPLATES")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 ${
                activeTab === "TEMPLATES"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isEn ? "My Saved Templates" : "Kayıtlı Şablonlarım"}</span>
            </button>
          </div>
        </div>

        {activeTab === "LIBRARY" ? (
          <>
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "ALL", label: isEn ? "All Blocks" : "Tüm Bloklar" },
                { id: "CONTENT", label: isEn ? "Content & Banners" : "İçerik & Banner" },
                { id: "PRODUCTS", label: isEn ? "Products & Deals" : "Ürünler & Fırsatlar" },
                { id: "CATEGORIES", label: isEn ? "Categories" : "Kategoriler" },
                { id: "BRANDS", label: isEn ? "Brands" : "Markalar" },
                { id: "SELLERS", label: isEn ? "Sellers" : "Satıcılar" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCategoryFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    categoryFilter === pill.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Blocks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[450px] overflow-y-auto pr-1">
              {filteredBlocks.map((block) => {
                const IconComponent = block.icon;
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => {
                      onSelectSection(block.type, block.titleTR, block.titleEN);
                      onClose();
                    }}
                    className="p-4 bg-white border border-slate-200 hover:border-indigo-600 rounded-2xl flex flex-col gap-2 text-left hover:shadow-md transition-all group cursor-pointer relative"
                  >
                    {block.badge && (
                      <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {block.badge}
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {isEn ? block.titleEN : block.titleTR}
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {isEn ? block.descEN : block.descTR}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Templates Tab */
          <div className="flex flex-col gap-3">
            {loadingTemplates ? (
              <div className="p-8 text-center text-slate-400">
                {isEn ? "Loading saved templates..." : "Şablonlar yükleniyor..."}
              </div>
            ) : templates.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-2">
                <Bookmark className="w-8 h-8 text-slate-300" />
                <span className="font-bold text-slate-700">
                  {isEn ? "No saved templates found." : "Henüz kayıtlı bir şablon bulunmuyor."}
                </span>
                <p className="text-slate-400 text-xs max-w-sm">
                  {isEn
                    ? "You can configure any section in the Homepage Studio and click 'Save as Template' to reuse it anytime."
                    : "Homepage Studio'da herhangi bir bölümü yapılandırıp 'Şablon Olarak Kaydet' butonuna basarak burada saklayabilirsiniz."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto">
                {templates.map((tpl) => {
                  let config = {};
                  try {
                    config = JSON.parse(tpl.configJson as string);
                  } catch (e) {}

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        onSelectSection(tpl.type as SectionType, tpl.name, tpl.name, config);
                        onClose();
                      }}
                      className="p-4 bg-white border border-slate-200 hover:border-indigo-600 rounded-2xl flex flex-col justify-between gap-3 text-left hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {tpl.name}
                          </span>
                          {tpl.description && (
                            <p className="text-slate-500 text-xs">{tpl.description}</p>
                          )}
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-max border border-indigo-100">
                            Type: {tpl.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400">
                        {isEn ? "Click to insert" : "Eklemek için tıkla"} &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
