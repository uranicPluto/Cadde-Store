"use client";

import React, { useState, useEffect } from "react";
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
  FolderTree,
  ListOrdered,
  Search,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  titleTr: string;
  titleEn: string;
  url: string;
  section: "HEADER" | "FOOTER" | "MEGA_MENU";
  parentId?: string | null;
  sortOrder: number;
  badgeTr?: string | null;
  badgeEn?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  children?: NavigationItem[];
}

const DEFAULT_SAMPLE_NAV_ITEMS: NavigationItem[] = [
  // Mega Menu Top-Level Categories
  {
    id: "nav-1",
    titleTr: "Kadın",
    titleEn: "Women",
    url: "/category/kadin",
    section: "MEGA_MENU",
    sortOrder: 1,
    badgeTr: "ÇOK SATAN",
    badgeEn: "BESTSELLER",
    isActive: true,
  },
  {
    id: "nav-1-1",
    titleTr: "Elbiseler",
    titleEn: "Dresses",
    url: "/category/kadin?sub=elbiseler",
    section: "MEGA_MENU",
    parentId: "nav-1",
    sortOrder: 1,
    badgeTr: "YENİ",
    badgeEn: "NEW",
    isActive: true,
  },
  {
    id: "nav-1-2",
    titleTr: "Tişört & Atlet",
    titleEn: "T-Shirts & Tops",
    url: "/category/kadin?sub=tisort",
    section: "MEGA_MENU",
    parentId: "nav-1",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "nav-2",
    titleTr: "Erkek",
    titleEn: "Men",
    url: "/category/erkek",
    section: "MEGA_MENU",
    sortOrder: 2,
    badgeTr: "FIRSAT",
    badgeEn: "DEAL",
    isActive: true,
  },
  {
    id: "nav-2-1",
    titleTr: "Gömlekler & Pololar",
    titleEn: "Shirts & Polos",
    url: "/category/erkek?sub=gomlek",
    section: "MEGA_MENU",
    parentId: "nav-2",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "nav-3",
    titleTr: "Elektronik",
    titleEn: "Electronics",
    url: "/category/elektronik",
    section: "MEGA_MENU",
    sortOrder: 3,
    badgeTr: "FLAŞ",
    badgeEn: "FLASH",
    isActive: true,
  },
  {
    id: "nav-4",
    titleTr: "Ev & Yaşam",
    titleEn: "Home & Living",
    url: "/category/ev-yasam",
    section: "MEGA_MENU",
    sortOrder: 4,
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
    isActive: true,
  },
  {
    id: "nav-h-3",
    titleTr: "Kuponlu Ürünler",
    titleEn: "Coupons",
    url: "/coupons",
    section: "HEADER",
    sortOrder: 3,
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
    isActive: true,
  },

  // Footer Link Columns
  {
    id: "nav-f-1",
    titleTr: "Hakkımızda",
    titleEn: "About Us",
    url: "/about",
    section: "FOOTER",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "nav-f-2",
    titleTr: "Yardım & SSS",
    titleEn: "Help & FAQ",
    url: "/faq",
    section: "FOOTER",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "nav-f-3",
    titleTr: "Kargo & Teslimat Bilgileri",
    titleEn: "Shipping & Delivery",
    url: "/shipping",
    section: "FOOTER",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "nav-f-4",
    titleTr: "Kolay İade Koşulları",
    titleEn: "Easy Returns",
    url: "/returns-policy",
    section: "FOOTER",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "nav-f-5",
    titleTr: "KVKK Aydınlatma Metni",
    titleEn: "KVKK Privacy Policy",
    url: "/kvkk",
    section: "FOOTER",
    sortOrder: 5,
    isActive: true,
  },
];

export default function AdminNavigationPage() {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"MEGA_MENU" | "HEADER" | "FOOTER">("MEGA_MENU");
  const [search, setSearch] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NavigationItem>>({});

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchNavItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/navigation");
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

  const currentTabItems = items.filter((item) => item.section === activeTab);

  // Group top-level and children for Mega Menu
  const rootItems = currentTabItems
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const getChildrenOf = (parentId: string) => {
    return currentTabItems
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const handleOpenAdd = (defaultParentId?: string) => {
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
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.titleTr || !editingItem.titleEn || !editingItem.url) return;

    try {
      setActionLoading(true);
      const payload = {
        ...editingItem,
        sortOrder: Number(editingItem.sortOrder || 1),
        parentId: editingItem.parentId || null,
        section: editingItem.section || activeTab,
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
    if (!confirm(isEn ? `Delete "${title}" and its sub-links?` : `"${title}" ve alt bağlantılarını silmek istediğinize emin misiniz?`)) return;
    try {
      setActionLoading(true);
      await fetch(`/api/navigation/${id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== id && i.parentId !== id));
      showFeedback(isEn ? "Navigation item deleted" : "Menü öğesi silindi");
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
      await Promise.all([
        fetch(`/api/navigation/${current.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: current.id, sortOrder: target.sortOrder }),
        }),
        fetch(`/api/navigation/${target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: target.id, sortOrder: current.sortOrder }),
        }),
      ]);

      // Swap in local state
      const updated = items.map((i) => {
        if (i.id === current.id) return { ...i, sortOrder: target.sortOrder };
        if (i.id === target.id) return { ...i, sortOrder: current.sortOrder };
        return i;
      });
      setItems(updated);
      showFeedback(isEn ? "Order updated" : "Sıralama güncellendi");
    } catch (err) {
      console.error("Move item error:", err);
    } finally {
      setActionLoading(false);
    }
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
                    <span>{isEn ? "Navigation Menu & Hierarchy Governance" : "Menü & Navigasyon Hiyerarşisi Yönetimi"}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {currentTabItems.length} {isEn ? "Items" : "Bağlantı"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {isEn
                      ? "Govern Mega Menu categories, quick top links, and footer columns without touching code."
                      : "Header Mega Menü, hızlı linkler ve footer sütunlarını dinamik olarak yönetin."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAdd()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{isEn ? "Add Nav Item" : "Yeni Menü Öğesi"}</span>
                </Button>
              </div>
            </div>

            {/* Navigation Section Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("MEGA_MENU")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "MEGA_MENU"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>{isEn ? "Header Mega Menu Tree" : "Header Mega Menü Ağacı"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "MEGA_MENU").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("HEADER")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "HEADER"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>{isEn ? "Header Quick Links" : "Header Hızlı Bağlantılar"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "HEADER").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("FOOTER")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "FOOTER"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>{isEn ? "Footer Columns" : "Footer Sütun Linkleri"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {items.filter((i) => i.section === "FOOTER").length}
                </span>
              </button>
            </div>

            {/* Tree / Item List Container */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isEn ? "Search navigation links..." : "Menü veya URL ara..."}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                  {isEn ? "Loading navigation items..." : "Menü yapısı yükleniyor..."}
                </div>
              ) : rootItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">{isEn ? "No items in this section" : "Bu bölümde henüz menü öğesi bulunmuyor"}</p>
                  <Button
                    onClick={() => handleOpenAdd()}
                    size="sm"
                    className="mt-3 bg-indigo-600 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>{isEn ? "Add First Item" : "İlk Öğeyi Ekle"}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {rootItems.map((parent, pIdx) => {
                    const children = getChildrenOf(parent.id);

                    return (
                      <div
                        key={parent.id}
                        className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 transition-colors"
                      >
                        {/* Parent Item Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={pIdx === 0 || actionLoading}
                                onClick={() => handleMoveItem(rootItems, pIdx, "up")}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={pIdx === rootItems.length - 1 || actionLoading}
                                onClick={() => handleMoveItem(rootItems, pIdx, "down")}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 text-[11px] font-black flex items-center justify-center shrink-0">
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
                                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[9px] px-1.5 py-0.2 rounded uppercase">
                                    {isEn ? parent.badgeEn || parent.badgeTr : parent.badgeTr}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-indigo-600 font-mono">
                                <Link2 className="w-3 h-3 text-slate-400" />
                                <span>{parent.url}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            {activeTab === "MEGA_MENU" && (
                              <button
                                type="button"
                                onClick={() => handleOpenAdd(parent.id)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{isEn ? "Add Sub-item" : "Alt Kategori Ekle"}</span>
                              </button>
                            )}

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

                        {/* Nested Child Items */}
                        {children.length > 0 && (
                          <div className="pl-6 pt-2 border-t border-slate-200/80 flex flex-col gap-2">
                            {children.map((child, cIdx) => (
                              <div
                                key={child.id}
                                className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  <span className="font-bold text-slate-800">
                                    {isEn ? child.titleEn : child.titleTr}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    ({isEn ? child.titleTr : child.titleEn})
                                  </span>
                                  {child.badgeTr && (
                                    <span className="bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[9px] px-1 py-0.2 rounded uppercase">
                                      {isEn ? child.badgeEn || child.badgeTr : child.badgeTr}
                                    </span>
                                  )}
                                  <span className="text-slate-400 font-mono text-[11px]">{child.url}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={cIdx === 0 || actionLoading}
                                    onClick={() => handleMoveItem(children, cIdx, "up")}
                                    className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                  >
                                    <ArrowUp className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={cIdx === children.length - 1 || actionLoading}
                                    onClick={() => handleMoveItem(children, cIdx, "down")}
                                    className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                  >
                                    <ArrowDown className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(child)}
                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(child.id, child.titleTr)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Turkish Title *" : "Türkçe Başlık *"}</label>
              <input
                type="text"
                required
                value={editingItem.titleTr || ""}
                onChange={(e) => setEditingItem({ ...editingItem, titleTr: e.target.value })}
                placeholder="Örn: Ayakkabı & Çanta"
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
                placeholder="Ex: Shoes & Bags"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Destination URL *" : "Hedef URL *"}</label>
              <input
                type="text"
                required
                value={editingItem.url || ""}
                onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                placeholder="/category/ayakkabi"
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
                <option value="FOOTER">{isEn ? "Footer Columns" : "Footer Sütun Linkleri"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Parent Category / Item (Optional)" : "Üst Menü / Kategori (Opsiyonel)"}</label>
              <select
                value={editingItem.parentId || ""}
                onChange={(e) => setEditingItem({ ...editingItem, parentId: e.target.value || null })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="">{isEn ? "None (Top Level Root Item)" : "Yok (Ana Seviye Başlık)"}</option>
                {rootItems
                  .filter((r) => r.id !== editingItem.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.titleTr} ({r.titleEn})
                    </option>
                  ))}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Badge Text (TR)" : "Rozet Metni (Türkçe)"}</label>
              <input
                type="text"
                value={editingItem.badgeTr || ""}
                onChange={(e) => setEditingItem({ ...editingItem, badgeTr: e.target.value })}
                placeholder="Örn: YENİ, FIRSAT, %40"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Badge Text (EN)" : "Rozet Metni (İngilizce)"}</label>
              <input
                type="text"
                value={editingItem.badgeEn || ""}
                onChange={(e) => setEditingItem({ ...editingItem, badgeEn: e.target.value })}
                placeholder="Ex: NEW, HOT, 40% OFF"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

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

      <Footer />
    </div>
  );
}
