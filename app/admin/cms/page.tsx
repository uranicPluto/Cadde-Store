"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { SectionItem, SectionType } from "@/lib/cms/cms-types";
import { getDefaultBaselineSections } from "@/lib/cms/cms-service";
import { HomepageNavigatorTree } from "@/components/admin/homepage-studio/homepage-navigator-tree";
import { HomepageCanvas } from "@/components/admin/homepage-studio/homepage-canvas";
import { SectionSettingsInspector } from "@/components/admin/homepage-studio/section-settings-inspector";
import { SectionLibraryModal } from "@/components/admin/homepage-studio/section-library-modal";
import { SectionPreviewModal } from "@/components/admin/homepage-studio/section-preview-modal";
import { VersionHistoryModal } from "@/components/admin/homepage-studio/version-history-modal";
import {
  Sliders,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Rocket,
  History,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminHomepageStudioPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  // Studio State
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [history, setHistory] = useState<SectionItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [isDraftDirty, setIsDraftDirty] = useState<boolean>(false);

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | undefined>(undefined);
  const [previewSection, setPreviewSection] = useState<SectionItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const showNotice = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Initial Load of Draft & Versions
  const loadStudioData = useCallback(async () => {
    setLoading(true);
    try {
      // Load Draft
      const res = await fetch("/api/cms/homepage/draft");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
          setHistory([data.sections]);
          setHistoryIndex(0);
          setSelectedSectionId(data.sections[0]?.id || null);
        } else {
          const defaults = getDefaultBaselineSections();
          setSections(defaults);
          setHistory([defaults]);
          setHistoryIndex(0);
          setSelectedSectionId(defaults[0]?.id || null);
        }
      }

      // Load Version Number
      const verRes = await fetch("/api/cms/homepage/versions");
      if (verRes.ok) {
        const verData = await verRes.json();
        if (Array.isArray(verData.versions) && verData.versions.length > 0) {
          setCurrentVersion(verData.versions[0].versionNumber);
        }
      }
    } catch (e) {
      console.error("Failed to load Homepage Studio:", e);
      const defaults = getDefaultBaselineSections();
      setSections(defaults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudioData();
  }, [loadStudioData]);

  // 2. History & State Mutations (Undo/Redo)
  const pushState = (newSections: SectionItem[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newSections);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setSections(newSections);
    setIsDraftDirty(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setSections(history[prevIndex]);
      setIsDraftDirty(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setSections(history[nextIndex]);
      setIsDraftDirty(true);
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history, sections]);

  // 3. Section Mutations
  const handleUpdateSection = (updated: SectionItem) => {
    const next = sections.map((s) => (s.id === updated.id ? updated : s));
    pushState(next);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...sections];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    next.forEach((s, idx) => (s.orderIndex = idx));
    pushState(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const next = [...sections];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    next.forEach((s, idx) => (s.orderIndex = idx));
    pushState(next);
  };

  const handleToggleActive = (id: string) => {
    const next = sections.map((s) =>
      s.id === id ? { ...s, active: s.active === false } : s
    );
    pushState(next);
  };

  const handleDuplicateSection = (sec: SectionItem) => {
    const clonedId = `sec-${Date.now()}`;
    const clone: SectionItem = {
      ...sec,
      id: clonedId,
      titleTR: `${sec.titleTR} (Kopya)`,
      titleEN: `${sec.titleEN} (Copy)`,
      orderIndex: sec.orderIndex + 1,
      banners: (sec.banners || []).map((b, idx) => ({
        ...b,
        id: `ban-${Date.now()}-${idx}`,
        sectionId: clonedId,
      })),
    };
    const targetIdx = sections.findIndex((s) => s.id === sec.id);
    const next = [...sections];
    next.splice(targetIdx + 1, 0, clone);
    next.forEach((s, idx) => (s.orderIndex = idx));
    pushState(next);
    setSelectedSectionId(clonedId);
    showNotice("success", isEn ? "Section duplicated." : "Bölüm çoğaltıldı.");
  };

  const handleDeleteSection = (id: string) => {
    if (
      !confirm(
        isEn
          ? "Are you sure you want to delete this section?"
          : "Bu bölümü silmek istediğinize emin misiniz?"
      )
    ) {
      return;
    }
    const next = sections.filter((s) => s.id !== id);
    next.forEach((s, idx) => (s.orderIndex = idx));
    pushState(next);
    if (selectedSectionId === id) {
      setSelectedSectionId(next[0]?.id || null);
    }
    showNotice("success", isEn ? "Section removed." : "Bölüm kaldırıldı.");
  };

  const handleAddSectionFromLibrary = (
    type: SectionType,
    titleTR: string,
    titleEN: string,
    initialConfig?: any
  ) => {
    const newId = `sec-${Date.now()}`;
    const newSection: SectionItem = {
      id: newId,
      titleTR,
      titleEN,
      type,
      orderIndex: insertIndex !== undefined ? insertIndex : sections.length,
      active: true,
      configJson: initialConfig || {
        subtitleTR: "Özel seçilmiş koleksiyon ve fırsatlar",
        subtitleEN: "Specially curated collection and deals",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [],
    };

    const next = [...sections];
    if (insertIndex !== undefined && insertIndex >= 0) {
      next.splice(insertIndex, 0, newSection);
    } else {
      next.push(newSection);
    }
    next.forEach((s, idx) => (s.orderIndex = idx));
    pushState(next);
    setSelectedSectionId(newId);
    showNotice("success", isEn ? "Section added to layout." : "Yeni bölüm eklendi.");
  };

  // 4. Save Draft
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const res = await fetch("/api/cms/homepage/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) {
        setIsDraftDirty(false);
        showNotice("success", isEn ? "Draft saved successfully!" : "Taslak başarıyla kaydedildi!");
      } else {
        showNotice("error", isEn ? "Failed to save draft." : "Taslak kaydedilemedi.");
      }
    } catch (e) {
      console.error("Save draft error:", e);
      showNotice("error", isEn ? "Error saving draft." : "Taslak kaydedilirken hata oluştu.");
    } finally {
      setSavingDraft(false);
    }
  };

  // 5. Publish to Live Storefront
  const handlePublish = async () => {
    if (
      !confirm(
        isEn
          ? "Deploy these changes to the LIVE storefront now?"
          : "Bu vitrin düzenini şimdi CANLI mağazada yayınlamak istiyor musunuz?"
      )
    ) {
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch("/api/cms/homepage/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections,
          changeSummary: isEn ? "Homepage Visual Studio Publish" : "Admin Vitrin Güncellemesi",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentVersion(data.versionNumber);
        setIsDraftDirty(false);
        showNotice(
          "success",
          isEn
            ? `Published successfully! Live Version: v${data.versionNumber}`
            : `Başarıyla yayınlandı! Canlı Sürüm: v${data.versionNumber}`
        );
      } else {
        showNotice("error", isEn ? "Failed to publish." : "Yayınlama başarısız oldu.");
      }
    } catch (e) {
      console.error("Publish error:", e);
      showNotice("error", isEn ? "Error publishing homepage." : "Yayınlama sırasında hata oluştu.");
    } finally {
      setPublishing(false);
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans antialiased text-slate-900">
      {/* Admin Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />

        {/* Studio Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
          {/* Left: Studio Identity & Version Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-slate-900 tracking-tight">
                    {isEn ? "HOMEPAGE STUDIO" : "VİTRİN & ANASAYFA STÜDYOSU"}
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                    LIVE v{currentVersion}
                  </span>
                  {isDraftDirty && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                      {isEn ? "UNSAVED DRAFT" : "KAYDEDİLMEMİŞ TASLAK"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Undo / Redo */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
              <button
                type="button"
                disabled={historyIndex <= 0}
                onClick={handleUndo}
                title={isEn ? "Undo (Ctrl+Z)" : "Geri Al (Ctrl+Z)"}
                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={historyIndex >= history.length - 1}
                onClick={handleRedo}
                title={isEn ? "Redo (Ctrl+Y)" : "Yinele (Ctrl+Y)"}
                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center: Viewport Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewport === "desktop"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isEn ? "Desktop" : "Masaüstü"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewport === "tablet"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (768px)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewport === "mobile"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil (390px)</span>
            </button>
          </div>

          {/* Right: Actions (Templates, History, Live Preview, Save Draft, Publish) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <History className="w-3.5 h-3.5" />
              <span>{isEn ? "Versions" : "Sürümler"}</span>
            </button>

            <Link href="/preview/homepage" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>{isEn ? "Live Preview" : "Önizleme"}</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              disabled={savingDraft}
              onClick={handleSaveDraft}
              className="rounded-xl text-xs font-bold border-slate-300 hover:bg-slate-100"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>{savingDraft ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Draft" : "Taslağı Kaydet"}</span>
            </Button>

            <Button
              size="sm"
              disabled={publishing}
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{publishing ? (isEn ? "Publishing..." : "Yayınlanıyor...") : isEn ? "Publish Live" : "Canlıya Al"}</span>
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

        {/* 3-Column Studio Workspace */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden bg-slate-100">
          {/* Left Column: Homepage Navigator Tree (3 cols) */}
          <div className="col-span-3 h-full min-h-0">
            <HomepageNavigatorTree
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={setSelectedSectionId}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleActive={handleToggleActive}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              onOpenPreview={setPreviewSection}
              onOpenLibrary={(idx) => {
                setInsertIndex(idx);
                setIsLibraryOpen(true);
              }}
              isEn={isEn}
            />
          </div>

          {/* Center Column: Live Responsive Canvas (6 cols) */}
          <div className="col-span-5 h-full min-h-0">
            <HomepageCanvas
              sections={sections}
              selectedSectionId={selectedSectionId}
              viewport={viewport}
              onSelectSection={setSelectedSectionId}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              onOpenPreview={setPreviewSection}
              onOpenLibrary={(idx) => {
                setInsertIndex(idx);
                setIsLibraryOpen(true);
              }}
              isEn={isEn}
            />
          </div>

          {/* Right Column: Contextual Section Settings Inspector (4 cols) */}
          <div className="col-span-4 h-full min-h-0">
            <SectionSettingsInspector
              section={selectedSection}
              onUpdateSection={handleUpdateSection}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              onOpenSectionPreview={setPreviewSection}
              isEn={isEn}
            />
          </div>
        </div>
      </div>

      {/* Section Library & Templates Modal */}
      <SectionLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => {
          setIsLibraryOpen(false);
          setInsertIndex(undefined);
        }}
        onSelectSection={handleAddSectionFromLibrary}
        insertIndex={insertIndex}
        isEn={isEn}
      />

      {/* Individual Section Preview Modal */}
      <SectionPreviewModal
        isOpen={!!previewSection}
        onClose={() => setPreviewSection(null)}
        section={previewSection}
        isEn={isEn}
      />

      {/* Version History & Rollback Modal */}
      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestoreSuccess={() => {
          loadStudioData();
          showNotice(
            "success",
            isEn ? "Previous version restored successfully!" : "Önceki sürüm başarıyla geri yüklendi!"
          );
        }}
        isEn={isEn}
      />
    </div>
  );
}
