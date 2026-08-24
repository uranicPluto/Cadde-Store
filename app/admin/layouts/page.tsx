"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { LayoutBlockItem, PageLayoutType } from "@/lib/layouts/layout-repository";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings,
  Save,
  RotateCcw,
  Package,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function AdminLayoutsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<PageLayoutType>("PRODUCT");
  const [blocks, setBlocks] = useState<LayoutBlockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchLayout = async (type: PageLayoutType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/layouts/${type}`);
      if (res.ok) {
        const data = await res.json();
        if (data.layout?.blocks) {
          setBlocks(data.layout.blocks);
          setSelectedBlockId(data.layout.blocks[0]?.id || null);
        }
      }
    } catch (e) {
      console.error("Fetch layout error:", e);
      showNotice("error", isEn ? "Failed to load layout." : "Düzen yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout(activeTab);
  }, [activeTab]);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...blocks];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    next.forEach((b, idx) => (b.orderIndex = idx));
    setBlocks(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const next = [...blocks];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    next.forEach((b, idx) => (b.orderIndex = idx));
    setBlocks(next);
  };

  const handleToggleEnabled = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/layouts/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, isCustom: true }),
      });

      if (res.ok) {
        showNotice(
          "success",
          isEn
            ? `${activeTab === "PRODUCT" ? "Product" : "Category"} layout saved successfully!`
            : `${activeTab === "PRODUCT" ? "Ürün Detay" : "Kategori"} sayfası düzeni başarıyla kaydedildi!`
        );
      } else {
        showNotice("error", isEn ? "Failed to save layout." : "Düzen kaydedilemedi.");
      }
    } catch (e) {
      console.error("Save layout error:", e);
      showNotice("error", isEn ? "Error saving layout." : "Düzen kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        isEn
          ? "Reset this layout to system defaults?"
          : "Bu sayfa düzenini sistem varsayılanlarına sıfırlamak istediğinize emin misiniz?"
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/layouts/${activeTab}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.layout?.blocks) {
          setBlocks(data.layout.blocks);
        }
        showNotice(
          "success",
          isEn ? "Layout reset to defaults." : "Düzen varsayılanlara sıfırlandı."
        );
      }
    } catch (e) {
      console.error("Reset layout error:", e);
    } finally {
      setSaving(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-900 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />

        {/* Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                {isEn ? "Page Layout Builders" : "Sayfa Blok & Düzen Oluşturucu"}
              </h1>
            </div>

            {/* Page Type Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 ml-4">
              <button
                type="button"
                onClick={() => setActiveTab("PRODUCT")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === "PRODUCT"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{isEn ? "Product Detail Page" : "Ürün Detay Sayfası"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("CATEGORY")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === "CATEGORY"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isEn ? "Category Landing Page" : "Kategori Sayfası"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={activeTab === "PRODUCT" ? "/product/ipek-sifon-elbise" : "/category/kadin"}
              target="_blank"
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                <span>{isEn ? "Preview Live Page" : "Canlıda Gör"}</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
              className="rounded-xl text-xs font-bold border-slate-300 hover:bg-slate-100 text-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>{isEn ? "Reset Defaults" : "Varsayılana Dön"}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Layout" : "Düzeni Kaydet"}</span>
            </Button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`px-6 py-2 flex items-center justify-between text-xs font-bold shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
                : "bg-rose-50 text-rose-900 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Studio Workspace */}
        <div className="flex-1 grid grid-cols-12 gap-5 p-5 min-h-0 overflow-hidden bg-slate-100">
          {/* Left Column: Blocks Sequence Tree (7 cols) */}
          <div className="col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-extrabold text-slate-900 text-sm">
                {isEn ? "Block Sequence & Structure" : "Sayfa Blok Sıralaması & Yapısı"}
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                {blocks.filter((b) => b.enabled).length} / {blocks.length} {isEn ? "active blocks" : "aktif blok"}
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-2">
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  {isEn ? "Loading layout..." : "Düzen yükleniyor..."}
                </div>
              ) : (
                blocks.map((block, idx) => {
                  const isSelected = selectedBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-600 shadow-xs ring-1 ring-indigo-600"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      } ${!block.enabled ? "opacity-40 grayscale" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex flex-col text-slate-400 gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveUp(idx);
                            }}
                            className="hover:text-slate-900 disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === blocks.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveDown(idx);
                            }}
                            className="hover:text-slate-900 disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 text-xs truncate">
                            {isEn ? block.titleEn : block.titleTr}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {block.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEnabled(block.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                            block.enabled
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {block.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{block.enabled ? (isEn ? "Enabled" : "Aktif") : isEn ? "Disabled" : "Gizli"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Block Inspector & Options (5 cols) */}
          <div className="col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-extrabold text-slate-900 text-sm">
                {isEn ? "Block Configuration" : "Blok Özelleştirme"}
              </span>
              {selectedBlock && (
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {selectedBlock.type}
                </span>
              )}
            </div>

            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              {selectedBlock ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Block Title (TR)" : "Blok Başlığı (TR)"}</label>
                    <input
                      type="text"
                      value={selectedBlock.titleTr}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.id === selectedBlock.id ? { ...b, titleTr: e.target.value } : b
                          )
                        )
                      }
                      className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Block Title (EN)" : "Blok Başlığı (EN)"}</label>
                    <input
                      type="text"
                      value={selectedBlock.titleEn}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.id === selectedBlock.id ? { ...b, titleEn: e.target.value } : b
                          )
                        )
                      }
                      className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      {isEn ? "Behavior & Visibility" : "Görünüm & Davranış"}
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      {isEn
                        ? "This block automatically adapts to customer device viewports and displays authoritative data from the database catalog."
                        : "Bu blok müşteri cihazına göre otomatik uyum sağlar ve doğrudan veritabanı kataloğundaki canlı verileri sergiler."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  {isEn ? "Select a block to inspect" : "Özelliklerini görmek için bir blok seçin"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
