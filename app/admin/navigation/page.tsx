"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Footer } from "@/components/layout/footer";
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Link2,
  CheckCircle2,
  Eye,
  Menu,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FolderTree,
  ListOrdered,
  Search,
  Smartphone,
  Monitor,
  Calendar,
  Image as ImageIcon,
  Tag,
  Clock,
  Check,
  AlertCircle,
  Copy,
  FolderPlus,
  Flame,
  Zap,
} from "lucide-react";

export type NavSection = "MEGA_MENU" | "HEADER" | "FOOTER" | "MOBILE_DRAWER";
export type DeviceVisibility = "ALL" | "DESKTOP" | "MOBILE";
export type NavItemType = "LINK" | "CATEGORY" | "BRAND" | "PROMO_CARD" | "HEADING";

export interface NavigationItem {
  id: string;
  titleTr: string;
  titleEn: string;
  url: string;
  section: NavSection;
  parentId?: string | null;
  sortOrder: number;
  badgeTr?: string | null;
  badgeEn?: string | null;
  isActive: boolean;
  deviceVisibility?: DeviceVisibility;
  itemType?: NavItemType;
  imageUrl?: string | null;
  descriptionTr?: string | null;
  descriptionEn?: string | null;
  ctaTextTr?: string | null;
  ctaTextEn?: string | null;
  targetUrl?: string | null;
  scheduleStartAt?: string | null;
  scheduleEndAt?: string | null;
  metadataJson?: string | null;
  createdAt?: string;
  updatedAt?: string;
  children?: NavigationItem[];
}

const BADGE_PRESETS = [
  { tr: "YENİ", en: "NEW", color: "bg-rose-500 text-white" },
  { tr: "ÇOK SATAN", en: "BESTSELLER", color: "bg-indigo-600 text-white" },
  { tr: "FIRSAT", en: "DEAL", color: "bg-amber-500 text-slate-900" },
  { tr: "FLAŞ", en: "FLASH", color: "bg-orange-500 text-white" },
  { tr: "SICAK", en: "HOT", color: "bg-red-600 text-white" },
  { tr: "%50", en: "50% OFF", color: "bg-emerald-600 text-white" },
  { tr: "KAZAN", en: "EARN", color: "bg-purple-600 text-white" },
  { tr: "POPÜLER", en: "POPULAR", color: "bg-blue-600 text-white" },
];

const DEFAULT_SAMPLE_NAV_ITEMS: NavigationItem[] = [
  // Mega Menu Level 1: Root Categories
  {
    id: "nav-1",
    titleTr: "Kadın",
    titleEn: "Women",
    url: "/category/kadin",
    section: "MEGA_MENU",
    sortOrder: 1,
    badgeTr: "ÇOK SATAN",
    badgeEn: "BESTSELLER",
    deviceVisibility: "ALL",
    itemType: "CATEGORY",
    isActive: true,
  },
  // Level 2: Sub-category Group
  {
    id: "nav-1-1",
    titleTr: "Giyim & Moda",
    titleEn: "Clothing & Fashion",
    url: "/category/kadin?cat=giyim",
    section: "MEGA_MENU",
    parentId: "nav-1",
    sortOrder: 1,
    badgeTr: "YENİ",
    badgeEn: "NEW",
    deviceVisibility: "ALL",
    itemType: "HEADING",
    isActive: true,
  },
  // Level 3: Items under Level 2
  {
    id: "nav-1-1-1",
    titleTr: "Elbiseler",
    titleEn: "Dresses",
    url: "/category/kadin?sub=elbiseler",
    section: "MEGA_MENU",
    parentId: "nav-1-1",
    sortOrder: 1,
    badgeTr: "%30",
    badgeEn: "30% OFF",
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },
  {
    id: "nav-1-1-2",
    titleTr: "Tişört & Atlet",
    titleEn: "T-Shirts & Tops",
    url: "/category/kadin?sub=tisort",
    section: "MEGA_MENU",
    parentId: "nav-1-1",
    sortOrder: 2,
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },
  // Promotional Card inside Kadın MegaMenu
  {
    id: "nav-1-promo",
    titleTr: "Yaz Koleksiyonu",
    titleEn: "Summer Collection",
    url: "/category/kadin",
    section: "MEGA_MENU",
    parentId: "nav-1",
    sortOrder: 99,
    badgeTr: "ÖZEL FIRSAT",
    badgeEn: "SPECIAL OFFER",
    deviceVisibility: "DESKTOP",
    itemType: "PROMO_CARD",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
    descriptionTr: "En trend kadın modellerini keşfet, indirimli fiyatları kaçırma!",
    descriptionEn: "Explore trending styles and limited-time deals.",
    ctaTextTr: "Alışverişe Başla",
    ctaTextEn: "Shop Now",
    targetUrl: "/category/kadin",
    isActive: true,
  },

  // Erkek Root
  {
    id: "nav-2",
    titleTr: "Erkek",
    titleEn: "Men",
    url: "/category/erkek",
    section: "MEGA_MENU",
    sortOrder: 2,
    badgeTr: "FIRSAT",
    badgeEn: "DEAL",
    deviceVisibility: "ALL",
    itemType: "CATEGORY",
    isActive: true,
  },
  {
    id: "nav-2-1",
    titleTr: "Giyim & Ayakkabı",
    titleEn: "Apparel & Shoes",
    url: "/category/erkek?cat=giyim",
    section: "MEGA_MENU",
    parentId: "nav-2",
    sortOrder: 1,
    deviceVisibility: "ALL",
    itemType: "HEADING",
    isActive: true,
  },
  {
    id: "nav-2-1-1",
    titleTr: "Gömlekler & Pololar",
    titleEn: "Shirts & Polos",
    url: "/category/erkek?sub=gomlek",
    section: "MEGA_MENU",
    parentId: "nav-2-1",
    sortOrder: 1,
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },

  // Header Quick Links
  {
    id: "nav-h-1",
    titleTr: "Çok Satanlar",
    titleEn: "Bestsellers",
    url: "/bestsellers",
    section: "HEADER",
    sortOrder: 1,
    badgeTr: "SICAK",
    badgeEn: "HOT",
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },
  {
    id: "nav-h-2",
    titleTr: "Flaş İndirimler",
    titleEn: "Flash Deals",
    url: "/deals",
    section: "HEADER",
    sortOrder: 2,
    badgeTr: "%50",
    badgeEn: "50% OFF",
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },
  {
    id: "nav-h-3",
    titleTr: "Kuponlu Ürünler",
    titleEn: "Coupons",
    url: "/coupons",
    section: "HEADER",
    sortOrder: 3,
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },
  {
    id: "nav-h-4",
    titleTr: "Cadde'de Satıcı Ol",
    titleEn: "Become a Seller",
    url: "/seller/apply",
    section: "HEADER",
    sortOrder: 4,
    badgeTr: "KAZAN",
    badgeEn: "EARN",
    deviceVisibility: "DESKTOP",
    itemType: "LINK",
    isActive: true,
  },

  // Footer Link Columns
  {
    id: "nav-f-1",
    titleTr: "Kurumsal Bilgiler",
    titleEn: "Corporate Info",
    url: "/about",
    section: "FOOTER",
    sortOrder: 1,
    deviceVisibility: "ALL",
    itemType: "HEADING",
    isActive: true,
  },
  {
    id: "nav-f-1-1",
    titleTr: "Hakkımızda",
    titleEn: "About Us",
    url: "/about",
    section: "FOOTER",
    parentId: "nav-f-1",
    sortOrder: 1,
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },
  {
    id: "nav-f-1-2",
    titleTr: "Kariyer",
    titleEn: "Careers",
    url: "/careers",
    section: "FOOTER",
    parentId: "nav-f-1",
    sortOrder: 2,
    deviceVisibility: "ALL",
    itemType: "LINK",
    isActive: true,
  },

  // Mobile Drawer Specific Quick Link
  {
    id: "nav-m-1",
    titleTr: "Öne Çıkan Kampanyalar",
    titleEn: "Featured Campaigns",
    url: "/deals",
    section: "MOBILE_DRAWER",
    sortOrder: 1,
    badgeTr: "FLAŞ",
    badgeEn: "FLASH",
    deviceVisibility: "MOBILE",
    itemType: "LINK",
    isActive: true,
  },
];

export default function AdminNavigationPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<NavSection>("MEGA_MENU");
  const [search, setSearch] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NavigationItem>>({});
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchNavItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/navigation?includeAll=true");
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          return;
        }
      }
      setItems(DEFAULT_SAMPLE_NAV_ITEMS);
    } catch (e) {
      console.warn("Navigation fetch error, using sample data:", e);
      setItems(DEFAULT_SAMPLE_NAV_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavItems();
  }, []);

  // Filter items by active section tab
  const currentTabItems = useMemo(() => {
    return items.filter((item) => item.section === activeTab);
  }, [items, activeTab]);

  // Level 1: Root items for the active tab
  const rootItems = useMemo(() => {
    return currentTabItems
      .filter((item) => !item.parentId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [currentTabItems]);

  // Direct children map for fast lookup
  const getChildrenOf = (parentId: string) => {
    return currentTabItems
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  };

  // Compute depth level of any item (1, 2, or 3)
  const getItemDepth = (itemId?: string | null): number => {
    if (!itemId) return 0;
    const parent = items.find((i) => i.id === itemId);
    if (!parent) return 1;
    return 1 + getItemDepth(parent.parentId);
  };

  // Valid potential parent items (only depth 0 or 1, so max nesting depth is 3)
  const validParentOptions = useMemo(() => {
    return currentTabItems.filter((candidate) => {
      if (candidate.id === editingItem.id) return false;
      const depth = getItemDepth(candidate.id);
      return depth < 3; // depth 1 or 2 can be parents
    });
  }, [currentTabItems, editingItem.id]);

  const toggleNodeCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAll = () => setCollapsedNodes({});
  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    for (const item of currentTabItems) {
      all[item.id] = true;
    }
    setCollapsedNodes(all);
  };

  const handleOpenAdd = (defaultParentId?: string, defaultType: NavItemType = "LINK") => {
    const siblings = defaultParentId ? getChildrenOf(defaultParentId) : rootItems;
    setEditingItem({
      titleTr: "",
      titleEn: "",
      url: "/",
      section: activeTab,
      parentId: defaultParentId || null,
      sortOrder: siblings.length + 1,
      badgeTr: "",
      badgeEn: "",
      isActive: true,
      deviceVisibility: "ALL",
      itemType: defaultType,
      imageUrl: "",
      descriptionTr: "",
      descriptionEn: "",
      ctaTextTr: "",
      ctaTextEn: "",
      targetUrl: "",
      scheduleStartAt: "",
      scheduleEndAt: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setEditingItem({
      ...item,
      scheduleStartAt: item.scheduleStartAt ? new Date(item.scheduleStartAt).toISOString().slice(0, 16) : "",
      scheduleEndAt: item.scheduleEndAt ? new Date(item.scheduleEndAt).toISOString().slice(0, 16) : "",
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (item: NavigationItem) => {
    try {
      setActionLoading(true);
      const duplicatePayload = {
        ...item,
        id: undefined,
        titleTr: `${item.titleTr} (Kopya)`,
        titleEn: `${item.titleEn} (Copy)`,
        sortOrder: (item.sortOrder || 0) + 1,
      };

      const res = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatePayload),
      });

      if (res.ok) {
        showFeedback(isEn ? "Item duplicated successfully" : "Öğe başarıyla çoğaltıldı");
        await fetchNavItems();
      }
    } catch (err) {
      console.error("Duplicate navigation item error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.titleTr || !editingItem.url) return;

    try {
      setActionLoading(true);
      const payload = {
        ...editingItem,
        titleEn: editingItem.titleEn || editingItem.titleTr,
        sortOrder: Number(editingItem.sortOrder || 1),
        parentId: editingItem.parentId || null,
        section: editingItem.section || activeTab,
        deviceVisibility: editingItem.deviceVisibility || "ALL",
        itemType: editingItem.itemType || "LINK",
        scheduleStartAt: editingItem.scheduleStartAt ? new Date(editingItem.scheduleStartAt).toISOString() : null,
        scheduleEndAt: editingItem.scheduleEndAt ? new Date(editingItem.scheduleEndAt).toISOString() : null,
      };

      if (editingItem.id) {
        const res = await fetch(`/api/navigation/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch("/api/navigation", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        showFeedback(isEn ? "Navigation item updated" : "Menü öğesi güncellendi");
      } else {
        const res = await fetch("/api/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const created: NavigationItem = {
            ...(payload as NavigationItem),
            id: `nav-${Date.now()}`,
          };
          setItems([...items, created]);
        }
        showFeedback(isEn ? "Navigation item created" : "Yeni menü öğesi oluşturuldu");
      }

      await fetchNavItems();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save navigation item error:", err);
      showFeedback(isEn ? "Failed to save item" : "Menü öğesi kaydedilemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (item: NavigationItem) => {
    const nextState = !item.isActive;
    try {
      setActionLoading(true);
      await fetch(`/api/navigation/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: nextState }),
      });
      setItems(items.map((i) => (i.id === item.id ? { ...i, isActive: nextState } : i)));
      showFeedback(
        nextState
          ? isEn ? "Item activated" : "Menü öğesi aktif edildi"
          : isEn ? "Item disabled" : "Menü öğesi devre dışı bırakıldı"
      );
    } catch (err) {
      console.error("Toggle active error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(isEn ? `Delete "${title}" and all its sub-links?` : `"${title}" ve tüm alt bağlantılarını silmek istediğinize emin misiniz?`)) return;
    try {
      setActionLoading(true);
      await fetch(`/api/navigation/${id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== id && i.parentId !== id));
      showFeedback(isEn ? "Navigation item deleted" : "Menü öğesi silindi");
      await fetchNavItems();
    } catch (err) {
      console.error("Delete navigation item error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveItem = async (itemList: NavigationItem[], currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= itemList.length) return;

    const current = itemList[currentIndex];
    const target = itemList[targetIndex];

    try {
      setActionLoading(true);
      const reorderPayload = {
        items: [
          { id: current.id, sortOrder: target.sortOrder },
          { id: target.id, sortOrder: current.sortOrder },
        ],
      };

      await fetch("/api/navigation/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reorderPayload),
      });

      // Update state locally
      const updated = items.map((i) => {
        if (i.id === current.id) return { ...i, sortOrder: target.sortOrder };
        if (i.id === target.id) return { ...i, sortOrder: current.sortOrder };
        return i;
      });
      setItems(updated);
      showFeedback(isEn ? "Hierarchy order updated" : "Sıralama güncellendi");
    } catch (err) {
      console.error("Move item error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Schedule status calculator
  const getScheduleStatus = (start?: string | null, end?: string | null) => {
    if (!start && !end) return null;
    const now = new Date();
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    if (startDate && startDate > now) {
      return { label: isEn ? "Scheduled" : "Zamanlandı", color: "bg-blue-100 text-blue-800" };
    }
    if (endDate && endDate < now) {
      return { label: isEn ? "Expired" : "Süresi Doldu", color: "bg-rose-100 text-rose-800" };
    }
    return { label: isEn ? "Live" : "Yayında", color: "bg-emerald-100 text-emerald-800" };
  };

  // Search filter
  const matchesSearch = (item: NavigationItem): boolean => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Boolean(
      item.titleTr.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q) ||
      (item.badgeTr && item.badgeTr.toLowerCase().includes(q))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{isEn ? "Visual Navigation & Mega-Menu Studio" : "Görsel Menü & Mega-Menü Tasarımcısı"}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      {currentTabItems.length} {isEn ? "Items" : "Öğe"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {isEn
                      ? "Govern 3-level mega menu hierarchies, quick header links, campaign badges, promotional cards, and mobile drawers."
                      : "3 seviyeli mega menü hiyerarşisi, hızlı linkler, rozetler, promosyon kartları ve mobil çekmeceyi dinamik yönetin."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  className="border-slate-300 hover:bg-slate-50 text-slate-800 font-bold"
                >
                  <Eye className="w-4 h-4 mr-1.5 text-indigo-600" />
                  <span>{isEn ? "Live Preview" : "Canlı Önizleme"}</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAdd()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{isEn ? "Add Nav Item" : "Yeni Menü Öğesi"}</span>
                </Button>
              </div>
            </div>

            {/* Navigation Section Tabs (Mega Menu, Header, Mobile Drawer, Footer) */}
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("MEGA_MENU")}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "MEGA_MENU"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>{isEn ? "Mega Menu" : "Mega Menü"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "MEGA_MENU").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("HEADER")}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "HEADER"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>{isEn ? "Header Links" : "Header Linkleri"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "HEADER").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("MOBILE_DRAWER")}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "MOBILE_DRAWER"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{isEn ? "Mobile Drawer" : "Mobil Menü"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "MOBILE_DRAWER").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("FOOTER")}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "FOOTER"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>{isEn ? "Footer Columns" : "Footer Sütunları"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "FOOTER").length}
                </span>
              </button>
            </div>

            {/* Tree Container & Controls */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isEn ? "Search items, URLs, badges..." : "Başlık, URL veya rozet ara..."}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {isEn ? "Expand All" : "Tümünü Aç"}
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {isEn ? "Collapse All" : "Tümünü Kapat"}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                  {isEn ? "Loading navigation hierarchy..." : "Navigasyon ağacı yükleniyor..."}
                </div>
              ) : rootItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">
                    {isEn ? "No navigation items found in this section" : "Bu bölümde henüz menü öğesi bulunmuyor"}
                  </p>
                  <Button
                    onClick={() => handleOpenAdd()}
                    size="sm"
                    className="mt-3 bg-indigo-600 text-white text-xs font-bold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>{isEn ? "Add First Root Item" : "İlk Ana Başlığı Ekle"}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {rootItems.filter(matchesSearch).map((parent, pIdx) => {
                    const level2Children = getChildrenOf(parent.id);
                    const isCollapsed = collapsedNodes[parent.id];
                    const schedStatus = getScheduleStatus(parent.scheduleStartAt, parent.scheduleEndAt);

                    return (
                      <div
                        key={parent.id}
                        className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-indigo-300 transition-colors shadow-2xs"
                      >
                        {/* Level 1: Parent Item Header Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={pIdx === 0 || actionLoading}
                                onClick={() => handleMoveItem(rootItems, pIdx, "up")}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                                title={isEn ? "Move Up" : "Yukarı Taşı"}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={pIdx === rootItems.length - 1 || actionLoading}
                                onClick={() => handleMoveItem(rootItems, pIdx, "down")}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                                title={isEn ? "Move Down" : "Aşağı Taşı"}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Collapse button */}
                            {level2Children.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleNodeCollapse(parent.id)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                                />
                              </button>
                            )}

                            <span className="w-6 h-6 rounded bg-slate-200 text-slate-800 text-[11px] font-black flex items-center justify-center shrink-0">
                              {parent.sortOrder}
                            </span>

                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-sm text-slate-900">
                                  {isEn ? parent.titleEn : parent.titleTr}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  ({isEn ? parent.titleTr : parent.titleEn})
                                </span>

                                {parent.badgeTr && (
                                  <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase border border-indigo-200">
                                    {isEn ? parent.badgeEn || parent.badgeTr : parent.badgeTr}
                                  </span>
                                )}

                                {parent.itemType && parent.itemType !== "LINK" && (
                                  <span className="bg-slate-200 text-slate-700 font-bold text-[9px] px-1.5 py-0.2 rounded uppercase">
                                    {parent.itemType}
                                  </span>
                                )}

                                {parent.deviceVisibility && parent.deviceVisibility !== "ALL" && (
                                  <span className="bg-slate-100 text-slate-600 font-medium text-[9px] px-1.5 py-0.2 rounded flex items-center gap-1 border border-slate-200">
                                    {parent.deviceVisibility === "DESKTOP" ? <Monitor className="w-2.5 h-2.5" /> : <Smartphone className="w-2.5 h-2.5" />}
                                    {parent.deviceVisibility}
                                  </span>
                                )}

                                {schedStatus && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${schedStatus.color}`}>
                                    {schedStatus.label}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-indigo-600 font-mono">
                                <Link2 className="w-3 h-3 text-slate-400" />
                                <span>{parent.url}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenAdd(parent.id, "HEADING")}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isEn ? "Add Sub-group (L2)" : "Alt Grup Ekle (L2)"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAdd(parent.id, "PROMO_CARD")}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg border border-amber-200 flex items-center gap-1 transition-colors"
                              title={isEn ? "Add Promo Banner" : "Promosyon Kartı Ekle"}
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>{isEn ? "Promo" : "Kart"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(parent)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                parent.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {parent.isActive ? (isEn ? "ACTIVE" : "AKTİF") : (isEn ? "DISABLED" : "PASİF")}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(parent)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                              title={isEn ? "Duplicate" : "Çoğalt"}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(parent)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                              title={isEn ? "Edit" : "Düzenle"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(parent.id, parent.titleTr)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                              title={isEn ? "Delete" : "Sil"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Level 2: Sub-groups */}
                        {!isCollapsed && level2Children.length > 0 && (
                          <div className="pl-6 pt-3 border-t border-slate-200 flex flex-col gap-3">
                            {level2Children.map((l2, l2Idx) => {
                              const level3Children = getChildrenOf(l2.id);
                              const isL2Promo = l2.itemType === "PROMO_CARD" || l2.imageUrl;

                              return (
                                <div
                                  key={l2.id}
                                  className={`rounded-lg p-3 flex flex-col gap-2 border transition-colors ${
                                    isL2Promo
                                      ? "bg-amber-50/50 border-amber-200"
                                      : "bg-white border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {/* L2 Reorder */}
                                      <div className="flex flex-col gap-0.5">
                                        <button
                                          type="button"
                                          disabled={l2Idx === 0 || actionLoading}
                                          onClick={() => handleMoveItem(level2Children, l2Idx, "up")}
                                          className="p-0.5 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                        >
                                          <ArrowUp className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={l2Idx === level2Children.length - 1 || actionLoading}
                                          onClick={() => handleMoveItem(level2Children, l2Idx, "down")}
                                          className="p-0.5 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                        >
                                          <ArrowDown className="w-2.5 h-2.5" />
                                        </button>
                                      </div>

                                      <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                        L2
                                      </span>

                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs text-slate-900">
                                          {isEn ? l2.titleEn : l2.titleTr}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                          ({isEn ? l2.titleTr : l2.titleEn})
                                        </span>

                                        {l2.badgeTr && (
                                          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[8px] px-1 py-0.2 rounded uppercase">
                                            {isEn ? l2.badgeEn || l2.badgeTr : l2.badgeTr}
                                          </span>
                                        )}

                                        {isL2Promo && (
                                          <span className="bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded flex items-center gap-1">
                                            <ImageIcon className="w-2.5 h-2.5" />
                                            PROMO CARD
                                          </span>
                                        )}

                                        <span className="text-slate-400 font-mono text-[11px]">{l2.url}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 self-end sm:self-center">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAdd(l2.id, "LINK")}
                                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded border border-slate-200 flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>{isEn ? "Add Item (L3)" : "Bağlantı Ekle (L3)"}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenEdit(l2)}
                                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItem(l2.id, l2.titleTr)}
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Level 3: Nested Child Links */}
                                  {level3Children.length > 0 && (
                                    <div className="pl-6 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                      {level3Children.map((l3, l3Idx) => (
                                        <div
                                          key={l3.id}
                                          className="bg-slate-50 border border-slate-200 rounded p-2 flex items-center justify-between gap-2 text-xs"
                                        >
                                          <div className="flex items-center gap-1.5 truncate">
                                            <span className="text-[9px] font-black text-slate-400">L3</span>
                                            <span className="font-medium text-slate-800 truncate">
                                              {isEn ? l3.titleEn : l3.titleTr}
                                            </span>
                                            {l3.badgeTr && (
                                              <span className="bg-rose-50 text-rose-600 text-[8px] font-black px-1 rounded uppercase shrink-0">
                                                {isEn ? l3.badgeEn || l3.badgeTr : l3.badgeTr}
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEdit(l3)}
                                              className="p-0.5 text-indigo-600 hover:bg-indigo-50 rounded"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteItem(l3.id, l3.titleTr)}
                                              className="p-0.5 text-rose-500 hover:bg-rose-50 rounded"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? (isEn ? "Edit Navigation Item" : "Menü Öğesini Düzenle") : (isEn ? "Add Navigation Item" : "Yeni Menü Öğesi Ekle")}
      >
        <form onSubmit={handleSaveItem} className="flex flex-col gap-4 text-xs p-1 max-h-[75vh] overflow-y-auto">
          {/* Titles TR / EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Turkish Title *" : "Türkçe Başlık *"}</label>
              <input
                type="text"
                required
                value={editingItem.titleTr || ""}
                onChange={(e) => setEditingItem({ ...editingItem, titleTr: e.target.value })}
                placeholder="Örn: Kadın Giyim & Elbise"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "English Title *" : "İngilizce Başlık *"}</label>
              <input
                type="text"
                required
                value={editingItem.titleEn || ""}
                onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                placeholder="Ex: Women Apparel & Dresses"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* URL and Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Destination URL *" : "Hedef URL *"}</label>
              <input
                type="text"
                required
                value={editingItem.url || ""}
                onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                placeholder="/category/kadin"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Section Location *" : "Menü Konumu *"}</label>
              <select
                value={editingItem.section || activeTab}
                onChange={(e) => setEditingItem({ ...editingItem, section: e.target.value as any })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              >
                <option value="MEGA_MENU">{isEn ? "Header Mega Menu" : "Header Mega Menü"}</option>
                <option value="HEADER">{isEn ? "Header Quick Links" : "Header Hızlı Bağlantılar"}</option>
                <option value="MOBILE_DRAWER">{isEn ? "Mobile Drawer Menu" : "Mobil Menü Çekmecesi"}</option>
                <option value="FOOTER">{isEn ? "Footer Columns" : "Footer Sütun Linkleri"}</option>
              </select>
            </div>
          </div>

          {/* Parent Item and Item Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">
                {isEn ? "Parent Hierarchy (Max 3 Levels)" : "Üst Menü / Kategori (Maks. 3 Seviye)"}
              </label>
              <select
                value={editingItem.parentId || ""}
                onChange={(e) => setEditingItem({ ...editingItem, parentId: e.target.value || null })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="">{isEn ? "None (Top Level Root Item - L1)" : "Yok (Ana Seviye Başlık - L1)"}</option>
                {validParentOptions.map((r) => {
                  const depth = getItemDepth(r.id);
                  const prefix = depth === 1 ? "• " : "  ↳ ";
                  return (
                    <option key={r.id} value={r.id}>
                      {prefix} {r.titleTr} ({r.titleEn}) [L{depth}]
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Item Type" : "Öğe Türü"}</label>
              <select
                value={editingItem.itemType || "LINK"}
                onChange={(e) => setEditingItem({ ...editingItem, itemType: e.target.value as any })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="LINK">{isEn ? "Standard Link" : "Standart Bağlantı"}</option>
                <option value="CATEGORY">{isEn ? "Category Landing" : "Kategori Sayfası"}</option>
                <option value="BRAND">{isEn ? "Brand Collection" : "Marka Koleksiyonu"}</option>
                <option value="HEADING">{isEn ? "Section Heading Group" : "Alt Grup Başlığı"}</option>
                <option value="PROMO_CARD">{isEn ? "Promotional Image Card" : "Promosyon Kartı (Banner)"}</option>
              </select>
            </div>
          </div>

          {/* Campaign Badge Controls */}
          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>{isEn ? "Campaign Badge Text" : "Kampanya Rozeti"}</span>
              <span className="text-[10px] text-slate-400 font-normal">{isEn ? "Optional highlight label" : "İsteğe bağlı vurgu etiketi"}</span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {BADGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, badgeTr: p.tr, badgeEn: p.en })}
                  className={`text-[9px] font-black px-2 py-0.5 rounded cursor-pointer transition-transform hover:scale-105 ${p.color}`}
                >
                  {isEn ? p.en : p.tr}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEditingItem({ ...editingItem, badgeTr: "", badgeEn: "" })}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                {isEn ? "Clear" : "Temizle"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={editingItem.badgeTr || ""}
                onChange={(e) => setEditingItem({ ...editingItem, badgeTr: e.target.value })}
                placeholder="Örn: YENİ, %40, SICAK"
                className="h-8 px-2.5 bg-white border border-slate-200 rounded font-medium outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                value={editingItem.badgeEn || ""}
                onChange={(e) => setEditingItem({ ...editingItem, badgeEn: e.target.value })}
                placeholder="Ex: NEW, 40% OFF, HOT"
                className="h-8 px-2.5 bg-white border border-slate-200 rounded font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Device Visibility & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Device Visibility" : "Cihaz Görünürlüğü"}</label>
              <select
                value={editingItem.deviceVisibility || "ALL"}
                onChange={(e) => setEditingItem({ ...editingItem, deviceVisibility: e.target.value as any })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="ALL">{isEn ? "All Devices (Desktop & Mobile)" : "Tüm Cihazlar (Masaüstü & Mobil)"}</option>
                <option value="DESKTOP">{isEn ? "Desktop Only" : "Sadece Masaüstü"}</option>
                <option value="MOBILE">{isEn ? "Mobile Only" : "Sadece Mobil"}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Sort Order (Priority)" : "Sıralama Sırası"}</label>
              <input
                type="number"
                value={editingItem.sortOrder ?? 1}
                onChange={(e) => setEditingItem({ ...editingItem, sortOrder: parseInt(e.target.value) || 1 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Time Scheduling Controls */}
          <div className="flex flex-col gap-1.5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isEn ? "Time-Scheduled Activation (Optional)" : "Zaman Ayarlı Yayınlanma (Opsiyonel)"}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-500 font-semibold">{isEn ? "Start Timestamp" : "Başlangıç Tarihi"}</span>
                <input
                  type="datetime-local"
                  value={editingItem.scheduleStartAt || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, scheduleStartAt: e.target.value })}
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px]"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-500 font-semibold">{isEn ? "End Timestamp" : "Bitiş Tarihi"}</span>
                <input
                  type="datetime-local"
                  value={editingItem.scheduleEndAt || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, scheduleEndAt: e.target.value })}
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Promotional Card Configuration (if promo card or has image) */}
          {(editingItem.itemType === "PROMO_CARD" || editingItem.imageUrl) && (
            <div className="flex flex-col gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <label className="font-bold text-amber-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>{isEn ? "Promotional Image Card Settings" : "Promosyon Kartı Ayarları"}</span>
              </label>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-700">{isEn ? "Banner Image URL" : "Görsel URL'si"}</span>
                <input
                  type="text"
                  value={editingItem.imageUrl || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-1483985988355-763728e1935b"
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingItem.descriptionTr || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionTr: e.target.value })}
                  placeholder="Açıklama (TR): %50'ye varan sezon indirimleri"
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px]"
                />
                <input
                  type="text"
                  value={editingItem.descriptionEn || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                  placeholder="Description (EN): Up to 50% seasonal discounts"
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingItem.ctaTextTr || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, ctaTextTr: e.target.value })}
                  placeholder="CTA Buton (TR): Şimdi Keşfet"
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px]"
                />
                <input
                  type="text"
                  value={editingItem.ctaTextEn || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, ctaTextEn: e.target.value })}
                  placeholder="CTA Button (EN): Shop Now"
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-[11px]"
                />
              </div>
            </div>
          )}

          {/* Active status toggle */}
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={editingItem.isActive ?? true}
                onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>{isEn ? "Active and visible to customers" : "Aktif ve müşterilere görünür olsun"}</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="font-bold"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isEn ? "Save Navigation Item" : "Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Storefront Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={isEn ? "Storefront Navigation Live Preview" : "Canlı Navigasyon Önizlemesi"}
      >
        <div className="flex flex-col gap-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between p-2 bg-slate-100 rounded-lg">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-colors ${
                  previewViewport === "desktop" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1200px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-colors ${
                  previewViewport === "mobile" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isEn ? "Section: " : "Bölüm: "} <b>{activeTab}</b>
            </span>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="bg-slate-900/5 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            {activeTab === "HEADER" && (
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3 overflow-x-auto">
                <span className="font-black text-sm text-slate-900 shrink-0">CADDE STORE</span>
                <div className="flex items-center gap-2">
                  {rootItems
                    .filter((i) => i.isActive && (previewViewport === "desktop" ? i.deviceVisibility !== "MOBILE" : i.deviceVisibility !== "DESKTOP"))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="py-1 px-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 font-bold flex items-center gap-1 shrink-0"
                      >
                        <span>{isEn ? item.titleEn : item.titleTr}</span>
                        {item.badgeTr && (
                          <span className="bg-rose-500 text-white text-[8px] font-black px-1 rounded uppercase">
                            {isEn ? item.badgeEn || item.badgeTr : item.badgeTr}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === "MEGA_MENU" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  {rootItems.map((r, idx) => (
                    <span
                      key={r.id}
                      className={`text-xs font-black px-3 py-1 rounded-md ${
                        idx === 0 ? "bg-primary-light text-primary" : "text-slate-700"
                      }`}
                    >
                      {isEn ? r.titleEn : r.titleTr}
                    </span>
                  ))}
                </div>

                {rootItems[0] && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {getChildrenOf(rootItems[0].id).map((sub) => (
                      <div key={sub.id} className="flex flex-col gap-1.5">
                        <span className="font-extrabold text-xs text-primary uppercase">{isEn ? sub.titleEn : sub.titleTr}</span>
                        <ul className="flex flex-col gap-1 text-[11px] text-slate-600">
                          {getChildrenOf(sub.id).map((l3) => (
                            <li key={l3.id} className="flex items-center justify-between">
                              <span>{isEn ? l3.titleEn : l3.titleTr}</span>
                              {l3.badgeTr && (
                                <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1 rounded">
                                  {isEn ? l3.badgeEn || l3.badgeTr : l3.badgeTr}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(activeTab === "FOOTER" || activeTab === "MOBILE_DRAWER") && (
              <div className="bg-slate-900 text-slate-300 p-4 rounded-lg flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {rootItems.map((col) => (
                    <div key={col.id} className="flex flex-col gap-1.5">
                      <span className="font-bold text-white uppercase text-[11px]">{isEn ? col.titleEn : col.titleTr}</span>
                      <ul className="flex flex-col gap-1 text-[11px] text-slate-400">
                        {getChildrenOf(col.id).map((child) => (
                          <li key={child.id}>{isEn ? child.titleEn : child.titleTr}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
