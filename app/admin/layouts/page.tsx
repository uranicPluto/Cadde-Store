"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { Layers, Check, Sliders, Eye, GripVertical, CheckCircle2 } from "lucide-react";

export default function AdminLayoutsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [productBlocks, setProductBlocks] = useState([
    { id: "b1", nameTr: "Ürün Görsel Galerisi & Zoom", active: true },
    { id: "b2", nameTr: "Başlık, Marka & Değerlendirme Puanı", active: true },
    { id: "b3", nameTr: "Fiyat, İndirim & Taksit Seçenekleri", active: true },
    { id: "b4", nameTr: "Beden & Renk Varyant Seçici", active: true },
    { id: "b5", nameTr: "Satıcı Bilgi Kartı & Puanı", active: true },
    { id: "b6", nameTr: "Sepete Ekle & Hemen Al Butonları", active: true },
    { id: "b7", nameTr: "Teslimat & Kargo Tahmin Rozeti", active: true },
    { id: "b8", nameTr: "Ürün Açıklaması & Teknik Özellikler", active: true },
    { id: "b9", nameTr: "Müşteri Yorumları & Fotoğraflı İncelemeler", active: true },
    { id: "b10", nameTr: "Benzer & Önerilen Ürünler Şeridi", active: true },
  ]);

  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setProductBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
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
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Page Layout Builders" : "Sayfa Düzenleri & Blok Yapılandırıcısı"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Configure detail blocks, visibility, and arrangement for Product and Category storefront templates."
                    : "Ürün detay ve Kategori sayfalarında yer alan bileşen bloklarını ve sıralamasını yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{saved ? (isEn ? "Saved!" : "Kaydedildi!") : isEn ? "Save Layout" : "Düzeni Kaydet"}</span>
            </Button>
          </div>

          {/* Product Detail Layout Blocks */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-black text-sm text-slate-900">
                {isEn ? "Product Detail Page Blocks" : "Ürün Detay Sayfası Blokları"}
              </span>
              <span className="text-[11px] text-slate-400">Blokları açıp kapatabilir veya sıralayabilirsiniz</span>
            </div>

            <div className="space-y-2">
              {productBlocks.map((block, idx) => (
                <div
                  key={block.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    block.active ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-100/50 border-slate-200/60 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                    <span className="text-xs font-bold">{idx + 1}. {block.nameTr}</span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={block.active}
                      onChange={() => handleToggle(block.id)}
                      className="rounded text-indigo-600"
                    />
                    <span>{block.active ? "Aktif" : "Gizli"}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
