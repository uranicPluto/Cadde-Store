"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { StorefrontPageRenderer } from "@/components/cms/storefront-page-renderer";
import {
  ArrowLeft,
  Save,
  Rocket,
  History,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Sliders,
  Settings,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  X,
  Megaphone,
  HelpCircle,
  BookOpen,
  Layout,
  Globe,
  Tag,
  ShoppingBag,
  ShieldCheck,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PageSection {
  id: string;
  type: string;
  titleTR?: string;
  titleEN?: string;
  orderIndex: number;
  active: boolean;
  configJson: any;
  banners?: any[];
}

interface CmsPageDetail {
  id: string;
  slug: string;
  titleTr: string;
  titleEn: string;
  type: string;
  status: string;
  sectionsJson: string;
  metaTitleTr?: string | null;
  metaTitleEn?: string | null;
  metaDescriptionTr?: string | null;
  metaDescriptionEn?: string | null;
  schedulePublishAt?: string | null;
  scheduleUnpublishAt?: string | null;
  versions?: any[];
}

const SECTION_TEMPLATES: Array<{
  type: string;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  icon: any;
  defaultConfig: any;
}> = [
  {
    type: "HERO",
    nameTr: "Hero Başlık & Vitrin",
    nameEn: "Hero Banner & Showcase",
    descriptionTr: "Geniş arka plan, dikkat çekici başlık, etiket ve eylem butonları.",
    descriptionEn: "Full-width background, striking heading, badge, and CTA buttons.",
    icon: Sparkles,
    defaultConfig: {
      subtitleTR: "En yeni trendler ve seçkin koleksiyonlar burada.",
      subtitleEN: "Explore latest trends and premium collections.",
      bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
      primaryCtaTextTR: "Hemen İncele",
      primaryCtaTextEN: "Explore Now",
      primaryCtaLink: "/category/kadin",
      badgeTR: "YENİ SEZON",
      badgeEN: "NEW SEASON",
    },
  },
  {
    type: "BANNER",
    nameTr: "Promosyon & Kampanya Bannerı",
    nameEn: "Promo & Campaign Banner",
    descriptionTr: "Görsel banner kartları, indirim duyuruları ve yönlendirme linkleri.",
    descriptionEn: "Visual banner cards, discount announcements and call-to-action links.",
    icon: Megaphone,
    defaultConfig: {
      items: [
        {
          titleTR: "Özel Fırsat",
          titleEN: "Special Deal",
          subtitleTR: "Seçili ürünlerde geçerli indirimler",
          subtitleEN: "Discounts on selected items",
          imageUrlDesktop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
          targetValue: "/category/kadin",
          ctaTextTR: "Alışverişe Başla",
          ctaTextEN: "Shop Now",
        },
      ],
    },
  },
  {
    type: "PRODUCT_GRID",
    nameTr: "Ürün Izgarası (Grid)",
    nameEn: "Product Grid",
    descriptionTr: "Kategoriye, çok satanlara veya indirime göre 4'lü/3'lü ürün vitrini.",
    descriptionEn: "4-column or 3-column product showcase by category, bestseller, or discount.",
    icon: ShoppingBag,
    defaultConfig: {
      limit: 8,
      columns: 4,
      source: "BESTSELLER",
      subtitleTR: "Haftanın en çok tercih edilen popüler ürünleri",
      subtitleEN: "Most preferred popular items of the week",
    },
  },
  {
    type: "CAROUSEL",
    nameTr: "Ürün Kaydırıcı (Carousel)",
    nameEn: "Product Carousel",
    descriptionTr: "Yatay kaydırılabilir ürün şeridi.",
    descriptionEn: "Horizontally scrolling interactive product carousel.",
    icon: Layout,
    defaultConfig: {
      limit: 10,
      subtitleTR: "Keşfetmeye devam edin",
      subtitleEN: "Keep exploring",
    },
  },
  {
    type: "RICH_CONTENT",
    nameTr: "Zengin Metin & Makale",
    nameEn: "Rich Text & Article",
    descriptionTr: "Başlıklar, paragraflar, listeler ve HTML biçimlendirme.",
    descriptionEn: "Headings, paragraphs, bullet lists, and HTML formatting.",
    icon: BookOpen,
    defaultConfig: {
      customHtmlTR: "<div class='prose'><p>Bu alana dilediğiniz zengin metin içeriğini veya HTML kodlarını ekleyebilirsiniz.</p></div>",
      customHtmlEN: "<div class='prose'><p>Add any formatted rich text content or custom HTML code here.</p></div>",
    },
  },
  {
    type: "FAQ_ACCORDION",
    nameTr: "SSS Akordeon Paneli",
    nameEn: "FAQ Accordion Panel",
    descriptionTr: "Açılır kapanır sıkça sorulan sorular ve anlık arama.",
    descriptionEn: "Expandable frequently asked questions with instant search filter.",
    icon: HelpCircle,
    defaultConfig: {
      subtitleTR: "Sıkça merak edilen soruların yanıtları",
      subtitleEN: "Answers to the most common questions",
      items: [
        {
          questionTR: "Siparişim ne zaman kargolanır?",
          questionEN: "When will my order be shipped?",
          answerTR: "Siparişleriniz 24-48 saat içinde anlaşmalı kargoya teslim edilir.",
          answerEN: "Orders are dispatched within 24-48 hours.",
        },
        {
          questionTR: "İade süreci nasıl işler?",
          questionEN: "How does return process work?",
          answerTR: "14 gün içinde ücretsiz iade talebi oluşturabilirsiniz.",
          answerEN: "You can create a free return request within 14 days.",
        },
      ],
    },
  },
  {
    type: "CONTACT_FORM",
    nameTr: "İletişim & Destek Formu",
    nameEn: "Contact & Support Form",
    descriptionTr: "Müşteri geri bildirim formu ve şirket iletişim koordinatları.",
    descriptionEn: "Customer feedback form and corporate coordinates.",
    icon: Globe,
    defaultConfig: {
      subtitleTR: "Bize dilediğiniz zaman ulaşabilirsiniz.",
      subtitleEN: "You can contact us anytime.",
    },
  },
  {
    type: "FEATURES",
    nameTr: "Özellik & Değer Kartları",
    nameEn: "Features & Highlights",
    descriptionTr: "İkonlu 4 sütunlu kurumsal değer ve özellik kutuları.",
    descriptionEn: "4-column icon highlight cards for company values and service perks.",
    icon: ShieldCheck,
    defaultConfig: {
      items: [
        {
          icon: "ShieldCheck",
          titleTR: "%100 Orijinal Ürün",
          titleEN: "100% Authentic Products",
          descTR: "Yetkili distribütörlerden doğrudan tedarik.",
          descEN: "Directly sourced from authorized brand sellers.",
        },
        {
          icon: "Truck",
          titleTR: "Hızlı Teslimat",
          titleEN: "Fast Delivery",
          descTR: "24-48 saat içinde kargoda.",
          descEN: "Dispatched within 24-48 hours.",
        },
        {
          icon: "RotateCcw",
          titleTR: "Kolay İade",
          titleEN: "Easy Returns",
          descTR: "14 gün ücretsiz iade garantisi.",
          descEN: "14-day free return guarantee.",
        },
        {
          icon: "Headphones",
          titleTR: "Canlı Destek",
          titleEN: "Live Support",
          descTR: "7/24 kesintisiz müşteri desteği.",
          descEN: "24/7 dedicated customer assistance.",
        },
      ],
    },
  },
  {
    type: "TRUST_BADGES",
    nameTr: "Güvenlik & Rozet Şeridi",
    nameEn: "Trust & Security Badges",
    descriptionTr: "SSL, orijinal ürün, hızlı kargo ve güvenli ödeme rozetleri.",
    descriptionEn: "SSL encryption, authentic goods, fast shipping and secure checkout badges.",
    icon: ShieldCheck,
    defaultConfig: {},
  },
];

export default function AdminPageBuilderStudio() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.id as string;
  const { language } = useLanguage();
  const isEn = language === "en";

  const [page, setPage] = useState<CmsPageDetail | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"sections" | "pageSettings">("sections");

  // Dirty and save states
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const showNotice = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Load Page Details
  const loadPage = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}?includeVersions=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.page) {
          setPage(data.page);
          try {
            const parsed = JSON.parse(data.page.sectionsJson || "[]");
            const arr = Array.isArray(parsed) ? parsed : [];
            setSections(arr);
            if (arr.length > 0 && !selectedSectionId) {
              setSelectedSectionId(arr[0].id);
            }
          } catch (e) {
            setSections([]);
          }
          if (data.page.versions) {
            setVersionsList(data.page.versions);
          }
        }
      } else {
        showNotice("error", isEn ? "Page not found." : "Sayfa bulunamadı.");
      }
    } catch (e) {
      console.error("Failed to load page:", e);
      showNotice("error", isEn ? "Failed to load page." : "Sayfa yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [pageId, isEn, selectedSectionId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Selected Section Object
  const selectedSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  // Add Block from Library
  const handleAddSection = (tmpl: typeof SECTION_TEMPLATES[0]) => {
    const newSec: PageSection = {
      id: `sec-${tmpl.type.toLowerCase()}-${Date.now().toString().slice(-6)}`,
      type: tmpl.type,
      titleTR: tmpl.nameTr,
      titleEN: tmpl.nameEn,
      orderIndex: sections.length,
      active: true,
      configJson: JSON.parse(JSON.stringify(tmpl.defaultConfig)),
      banners: [],
    };

    const nextSections = [...sections, newSec];
    setSections(nextSections);
    setSelectedSectionId(newSec.id);
    setIsDirty(true);
    setIsLibraryOpen(false);
    showNotice("success", isEn ? `Added ${tmpl.nameEn}` : `${tmpl.nameTr} eklendi`);
  };

  // Move Section Up/Down
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const next = [...sections];
    const item = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = item;

    // Update orderIndex
    next.forEach((s, i) => {
      s.orderIndex = i;
    });

    setSections(next);
    setIsDirty(true);
  };

  // Duplicate Section
  const handleDuplicateSection = (index: number) => {
    const target = sections[index];
    const copy: PageSection = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${target.type.toLowerCase()}-${Date.now().toString().slice(-6)}`,
      titleTR: `${target.titleTR || ""} (Kopya)`,
      titleEN: `${target.titleEN || ""} (Copy)`,
      orderIndex: index + 1,
    };

    const next = [...sections];
    next.splice(index + 1, 0, copy);
    next.forEach((s, i) => {
      s.orderIndex = i;
    });

    setSections(next);
    setSelectedSectionId(copy.id);
    setIsDirty(true);
  };

  // Delete Section
  const handleDeleteSection = (id: string) => {
    const next = sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, orderIndex: i }));
    setSections(next);
    if (selectedSectionId === id) {
      setSelectedSectionId(next[0]?.id || null);
    }
    setIsDirty(true);
  };

  // Toggle Section Active
  const handleToggleSectionActive = (id: string) => {
    const next = sections.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSections(next);
    setIsDirty(true);
  };

  // Update Section Properties
  const handleUpdateSelectedSection = (updater: (prev: PageSection) => PageSection) => {
    if (!selectedSectionId) return;
    const next = sections.map((s) => (s.id === selectedSectionId ? updater(s) : s));
    setSections(next);
    setIsDirty(true);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!page) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleTr: page.titleTr,
          titleEn: page.titleEn,
          slug: page.slug,
          type: page.type,
          metaTitleTr: page.metaTitleTr,
          metaTitleEn: page.metaTitleEn,
          metaDescriptionTr: page.metaDescriptionTr,
          metaDescriptionEn: page.metaDescriptionEn,
          sectionsJson: JSON.stringify(sections),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsDirty(false);
        setLastSavedTime(new Date().toLocaleTimeString("tr-TR"));
        showNotice("success", isEn ? "Draft saved successfully!" : "Taslak başarıyla kaydedildi!");
      } else {
        showNotice("error", data.error || "Kaydetme başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Publish Page
  const handlePublishPage = async () => {
    if (!page) return;
    setPublishing(true);
    try {
      // First save latest sections
      await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleTr: page.titleTr,
          titleEn: page.titleEn,
          slug: page.slug,
          sectionsJson: JSON.stringify(sections),
        }),
      });

      // Then publish
      const res = await fetch(`/api/pages/${page.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          changeSummary: `${sections.length} blok ile yayınlandı.`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsDirty(false);
        setPage(data.page);
        showNotice("success", isEn ? "Page published live!" : "Sayfa canlı olarak yayınlandı!");
        // Refresh versions
        const vRes = await fetch(`/api/pages/${page.id}/versions`);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVersionsList(vData.versions || []);
        }
      } else {
        showNotice("error", data.error || "Yayınlama başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Yayınlama hatası.");
    } finally {
      setPublishing(false);
    }
  };

  // Rollback to version
  const handleRollbackVersion = async (versionId: string) => {
    if (!page) return;
    try {
      const res = await fetch(`/api/pages/${page.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice("success", isEn ? "Version restored!" : "Versiyon geri yüklendi!");
        setIsVersionModalOpen(false);
        await loadPage();
      } else {
        showNotice("error", data.error || "Geri yükleme başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
        {isEn ? "Loading Page Studio..." : "Sayfa Stüdyosu yükleniyor..."}
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <span className="text-sm font-bold text-slate-300">
          {isEn ? "Page not found." : "Sayfa bulunamadı."}
        </span>
        <Link href="/admin/pages">
          <Button size="sm" className="bg-indigo-600 text-white">
            {isEn ? "Back to Pages" : "Sayfalara Dön"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden h-screen">
      {/* =========================================================================
          TOP STUDIO TOOLBAR
          ========================================================================= */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0 z-30 shadow-md">
        {/* Left: Back & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/pages"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-black text-sm text-white truncate max-w-[200px] sm:max-w-xs">
              {isEn ? page.titleEn : page.titleTr}
            </span>
            <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950/80 border border-indigo-900 px-2 py-0.5 rounded hidden sm:inline">
              /p/{page.slug}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                page.status === "PUBLISHED" && "bg-emerald-950 text-emerald-400 border border-emerald-800",
                page.status === "SCHEDULED" && "bg-amber-950 text-amber-400 border border-amber-800",
                page.status === "DRAFT" && "bg-slate-800 text-slate-400 border border-slate-700"
              )}
            >
              {page.status}
            </span>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewport("desktop")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewport === "desktop" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            )}
            title="Masaüstü (Desktop)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewport === "tablet" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            )}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewport === "mobile" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            )}
            title="Mobil (Mobile)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-[11px] text-amber-400 font-bold hidden lg:inline flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {isEn ? "Unsaved changes" : "Kaydedilmemiş değişiklikler"}
            </span>
          )}

          {lastSavedTime && !isDirty && (
            <span className="text-[10px] text-slate-500 hidden lg:inline">
              {isEn ? `Saved: ${lastSavedTime}` : `Kaydedildi: ${lastSavedTime}`}
            </span>
          )}

          {/* Version History */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVersionModalOpen(true)}
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs h-8 px-2.5"
            title="Versiyon Geçmişi"
          >
            <History className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            <span className="hidden sm:inline">{isEn ? "History" : "Geçmiş"}</span>
          </Button>

          {/* Public Preview */}
          <Link href={`/p/${page.slug}`} target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs h-8 px-2.5"
              title="Önizle"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span className="hidden sm:inline">{isEn ? "Preview" : "Önizle"}</span>
            </Button>
          </Link>

          {/* Save Draft */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-8 px-3"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save Draft" : "Taslak Kaydet")}</span>
          </Button>

          {/* Publish */}
          <Button
            size="sm"
            onClick={handlePublishPage}
            disabled={publishing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3.5 shadow-md"
          >
            <Rocket className="w-3.5 h-3.5 mr-1.5" />
            <span>{publishing ? (isEn ? "Publishing..." : "Yayınlanıyor...") : (isEn ? "Publish Live" : "Canlıya Al")}</span>
          </Button>
        </div>
      </header>

      {/* =========================================================================
          MAIN 3-PANE STUDIO WORKSPACE
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* =====================================================================
            LEFT PANE: SECTION NAVIGATOR & TREE
            ===================================================================== */}
        <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 z-20">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isEn ? "Page Sections" : "Sayfa Blokları"} ({sections.length})</span>
            </div>
            <Button
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white h-7 px-2 text-[11px] font-bold"
            >
              <Plus className="w-3 h-3 mr-1" />
              <span>{isEn ? "Add Block" : "Blok Ekle"}</span>
            </Button>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {sections.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Layout className="w-8 h-8 text-slate-700" />
                <span>{isEn ? "No sections yet." : "Henüz blok eklenmedi."}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLibraryOpen(true)}
                  className="border-slate-800 text-[11px] text-indigo-400 mt-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {isEn ? "Add First Block" : "İlk Bloğu Ekle"}
                </Button>
              </div>
            ) : (
              sections.map((sec, idx) => {
                const isSelected = selectedSectionId === sec.id;
                const tmpl = SECTION_TEMPLATES.find((t) => t.type === sec.type) || SECTION_TEMPLATES[0];
                const IconComp = tmpl.icon;

                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      setActiveTab("sections");
                    }}
                    className={cn(
                      "p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 group",
                      isSelected
                        ? "bg-indigo-950/70 border-indigo-500 shadow-xs"
                        : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold",
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                        )}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-slate-300")}>
                          {isEn ? sec.titleEN || sec.titleTR || tmpl.nameEn : sec.titleTR || sec.titleEN || tmpl.nameTr}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{sec.type}</span>
                      </div>
                    </div>

                    {/* Section Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                        title="Yukarı Taşı"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, "down");
                        }}
                        disabled={idx === sections.length - 1}
                        className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                        title="Aşağı Taşı"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSection(idx);
                        }}
                        className="p-1 hover:text-white text-slate-400"
                        title="Kopyala"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(sec.id);
                        }}
                        className="p-1 hover:text-rose-400 text-slate-400"
                        title="Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Page Settings Trigger at Bottom */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTab("pageSettings")}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between border transition-colors",
                activeTab === "pageSettings"
                  ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
              )}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>{isEn ? "SEO & Page Settings" : "SEO & Sayfa Ayarları"}</span>
              </div>
            </button>
          </div>
        </aside>

        {/* =====================================================================
            CENTER PANE: INTERACTIVE VISUAL CANVAS
            ===================================================================== */}
        <main className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          <div
            className={cn(
              "w-full transition-all bg-slate-100 text-text-main rounded-2xl shadow-2xl p-4 sm:p-8 border border-slate-300 min-h-[750px]",
              viewport === "desktop" && "max-w-wide",
              viewport === "tablet" && "max-w-2xl",
              viewport === "mobile" && "max-w-sm"
            )}
          >
            {/* Visual Canvas Banner */}
            <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 mb-6 flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                {isEn ? "Live Studio Visual Canvas" : "Canlı Stüdyo Görsel Tuvali"}
              </span>
              <span className="font-mono text-[10px] text-slate-500 uppercase">
                Viewport: {viewport}
              </span>
            </div>

            {/* Render Storefront Content */}
            <StorefrontPageRenderer
              page={{
                id: page.id,
                slug: page.slug,
                titleTr: page.titleTr,
                titleEn: page.titleEn,
                type: page.type,
                status: page.status,
                sectionsJson: sections,
              }}
              previewMode={true}
            />
          </div>
        </main>

        {/* =====================================================================
            RIGHT PANE: PROPERTY INSPECTOR
            ===================================================================== */}
        <aside className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 z-20">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>
                {activeTab === "sections"
                  ? (isEn ? "Block Inspector" : "Blok Özellikleri")
                  : (isEn ? "Page Settings" : "Sayfa Ayarları")}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
            {activeTab === "pageSettings" ? (
              /* Page Level Settings Form */
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "Page Title (Turkish)" : "Sayfa Başlığı (Türkçe)"}
                  </label>
                  <Input
                    value={page.titleTr}
                    onChange={(e) => {
                      setPage({ ...page, titleTr: e.target.value });
                      setIsDirty(true);
                    }}
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "Page Title (English)" : "Sayfa Başlığı (İngilizce)"}
                  </label>
                  <Input
                    value={page.titleEn}
                    onChange={(e) => {
                      setPage({ ...page, titleEn: e.target.value });
                      setIsDirty(true);
                    }}
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "URL Slug" : "URL Adresi (Slug)"}
                  </label>
                  <Input
                    value={page.slug}
                    onChange={(e) => {
                      setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
                      setIsDirty(true);
                    }}
                    className="bg-slate-900 border-slate-700 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "Page Type" : "Sayfa Türü"}
                  </label>
                  <select
                    value={page.type}
                    onChange={(e) => {
                      setPage({ ...page, type: e.target.value });
                      setIsDirty(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-2 text-xs font-bold"
                  >
                    <option value="CAMPAIGN">CAMPAIGN (Kampanya)</option>
                    <option value="LANDING">LANDING (Açılış Vitrini)</option>
                    <option value="POLICY">POLICY (Yasal / Sözleşme)</option>
                    <option value="STATIC">STATIC (Sabit İçerik)</option>
                    <option value="CUSTOM">CUSTOM (Özel)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <span className="block text-indigo-400 font-extrabold text-[10px] uppercase mb-2">
                    SEO Meta Etiketleri
                  </span>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Meta Title (TR)</label>
                      <Input
                        value={page.metaTitleTr || ""}
                        onChange={(e) => {
                          setPage({ ...page, metaTitleTr: e.target.value });
                          setIsDirty(true);
                        }}
                        className="bg-slate-900 border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Meta Description (TR)</label>
                      <textarea
                        rows={3}
                        value={page.metaDescriptionTr || ""}
                        onChange={(e) => {
                          setPage({ ...page, metaDescriptionTr: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedSection ? (
              /* Selected Section Inspector */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-[11px] text-indigo-400 font-bold uppercase">{selectedSection.type}</span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSection.active}
                      onChange={() => handleToggleSectionActive(selectedSection.id)}
                      className="rounded border-slate-700"
                    />
                    <span>{isEn ? "Active" : "Aktif"}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "Title (Turkish)" : "Blok Başlığı (Türkçe)"}
                  </label>
                  <Input
                    value={selectedSection.titleTR || ""}
                    onChange={(e) =>
                      handleUpdateSelectedSection((s) => ({ ...s, titleTR: e.target.value }))
                    }
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "Title (English)" : "Blok Başlığı (İngilizce)"}
                  </label>
                  <Input
                    value={selectedSection.titleEN || ""}
                    onChange={(e) =>
                      handleUpdateSelectedSection((s) => ({ ...s, titleEN: e.target.value }))
                    }
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isEn ? "Subtitle (Turkish)" : "Alt Başlık (Türkçe)"}
                  </label>
                  <Input
                    value={selectedSection.configJson?.subtitleTR || ""}
                    onChange={(e) =>
                      handleUpdateSelectedSection((s) => ({
                        ...s,
                        configJson: { ...s.configJson, subtitleTR: e.target.value },
                      }))
                    }
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>

                {/* Type specific config options */}
                {selectedSection.type === "HERO" && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Badge (TR)</label>
                      <Input
                        value={selectedSection.configJson?.badgeTR || ""}
                        onChange={(e) =>
                          handleUpdateSelectedSection((s) => ({
                            ...s,
                            configJson: { ...s.configJson, badgeTR: e.target.value },
                          }))
                        }
                        className="bg-slate-900 border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Primary CTA Text (TR)</label>
                      <Input
                        value={selectedSection.configJson?.primaryCtaTextTR || ""}
                        onChange={(e) =>
                          handleUpdateSelectedSection((s) => ({
                            ...s,
                            configJson: { ...s.configJson, primaryCtaTextTR: e.target.value },
                          }))
                        }
                        className="bg-slate-900 border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Primary CTA Link</label>
                      <Input
                        value={selectedSection.configJson?.primaryCtaLink || ""}
                        onChange={(e) =>
                          handleUpdateSelectedSection((s) => ({
                            ...s,
                            configJson: { ...s.configJson, primaryCtaLink: e.target.value },
                          }))
                        }
                        className="bg-slate-900 border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {selectedSection.type === "PRODUCT_GRID" && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Product Source</label>
                      <select
                        value={selectedSection.configJson?.source || "BESTSELLER"}
                        onChange={(e) =>
                          handleUpdateSelectedSection((s) => ({
                            ...s,
                            configJson: { ...s.configJson, source: e.target.value },
                          }))
                        }
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs"
                      >
                        <option value="BESTSELLER">Çok Satanlar (Bestsellers)</option>
                        <option value="DISCOUNT">En Yüksek İndirimler (Discounts)</option>
                        <option value="RATING">En Yüksek Puanlılar (Top Rated)</option>
                        <option value="ALL">Tüm Ürünler (All Products)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Item Limit</label>
                      <Input
                        type="number"
                        value={selectedSection.configJson?.limit || 8}
                        onChange={(e) =>
                          handleUpdateSelectedSection((s) => ({
                            ...s,
                            configJson: { ...s.configJson, limit: parseInt(e.target.value, 10) || 8 },
                          }))
                        }
                        className="bg-slate-900 border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {(selectedSection.type === "RICH_CONTENT" || selectedSection.type === "CUSTOM_HTML") && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    <label className="block text-slate-300 font-bold">Custom HTML / Markdown (TR)</label>
                    <textarea
                      rows={8}
                      value={selectedSection.configJson?.customHtmlTR || ""}
                      onChange={(e) =>
                        handleUpdateSelectedSection((s) => ({
                          ...s,
                          configJson: { ...s.configJson, customHtmlTR: e.target.value },
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded p-2"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                {isEn ? "Select a block from the left navigator to inspect its properties." : "Özelliklerini düzenlemek için soldaki listeden bir blok seçin."}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* =========================================================================
          BLOCK LIBRARY MODAL
          ========================================================================= */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white">
                  {isEn ? "Section Block Library" : "Bölüm & Blok Kütüphanesi"}
                </h3>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
              {SECTION_TEMPLATES.map((tmpl) => {
                const IconComp = tmpl.icon;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => handleAddSection(tmpl)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-indigo-500 cursor-pointer transition-all flex flex-col gap-2 group shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {isEn ? tmpl.nameEn : tmpl.nameTr}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isEn ? tmpl.descriptionEn : tmpl.descriptionTr}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsLibraryOpen(false)}
                className="border-slate-700 text-xs text-slate-300"
              >
                {isEn ? "Close" : "Kapat"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VERSION HISTORY MODAL
          ========================================================================= */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white">
                  {isEn ? "Version History & Rollback" : "Versiyon Geçmişi & Geri Yükleme"}
                </h3>
              </div>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
              {versionsList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  {isEn ? "No published snapshots found for this page." : "Bu sayfa için henüz kaydedilmiş bir versiyon bulunmuyor."}
                </div>
              ) : (
                versionsList.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          v{ver.versionNumber}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {ver.changeSummary || `Versiyon ${ver.versionNumber}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ver.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRollbackVersion(ver.id)}
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-200 h-7"
                    >
                      <RotateCcw className="w-3 h-3 mr-1 text-amber-400" />
                      <span>{isEn ? "Restore" : "Geri Yükle"}</span>
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsVersionModalOpen(false)}
                className="border-slate-700 text-xs text-slate-300"
              >
                {isEn ? "Close" : "Kapat"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
