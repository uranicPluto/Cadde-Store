"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Compass, Plus, Trash2, Check, GripVertical, ExternalLink } from "lucide-react";

export default function AdminNavigationPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [menuItems, setMenuItems] = useState([
    { id: "m1", titleTr: "Kadın", url: "/category/kadin", active: true },
    { id: "m2", titleTr: "Erkek", url: "/category/erkek", active: true },
    { id: "m3", titleTr: "Ayakkabı & Çanta", url: "/category/ayakkabi-canta", active: true },
    { id: "m4", titleTr: "Elektronik", url: "/category/elektronik", active: true },
    { id: "m5", titleTr: "Ev & Yaşam", url: "/category/ev-yasam", active: true },
    { id: "m6", titleTr: "Fırsatlar & Kampanyalar", url: "/deals", active: true },
  ]);

  const [newItem, setNewItem] = useState({ titleTr: "", url: "" });
  const [saved, setSaved] = useState(false);

  const handleAddItem = () => {
    if (!newItem.titleTr || !newItem.url) return;
    setMenuItems((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, titleTr: newItem.titleTr, url: newItem.url, active: true },
    ]);
    setNewItem({ titleTr: "", url: "" });
  };

  const handleDelete = (id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Visual Navigation & Mega-Menus" : "Menü & Navigasyon Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage header primary navigation, category mega-menu dropdowns, and footer link columns."
                    : "Ana gezinme menüsünü, kategori mega menülerini ve alt bilgi linklerini yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{saved ? (isEn ? "Saved!" : "Kaydedildi!") : isEn ? "Save Navigation" : "Menüyü Kaydet"}</span>
            </Button>
          </div>

          {/* Add Menu Item */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate-700">Menü Başlığı</label>
              <Input
                value={newItem.titleTr}
                onChange={(e) => setNewItem({ ...newItem, titleTr: e.target.value })}
                placeholder="Örn: Süper İndirimler"
                className="text-xs"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate-700">Hedef URL</label>
              <Input
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder="/deals veya /category/..."
                className="text-xs font-mono"
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Ekle</span>
            </Button>
          </div>

          {/* Menu Items List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-3">
              Ana Gezinme Menü Öğeleri
            </span>

            {menuItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-900">{idx + 1}. {item.titleTr}</span>
                  <span className="font-mono text-[11px] text-slate-400">{item.url}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
