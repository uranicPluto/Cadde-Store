"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SectionItem } from "@/lib/cms/cms-types";
import { HomepageCanvas } from "./homepage-canvas";
import { SectionSettingsInspector } from "./section-settings-inspector";
import { SectionLibraryModal } from "./section-library-modal";
import { VersionHistoryModal } from "./version-history-modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Rocket,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ExternalLink,
  RotateCcw,
  History,
  ShieldCheck,
  Lock,
  Unlock,
  Send,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HomepageStudioShellProps {
  initialSections: SectionItem[];
  onSaveDraft: (sections: SectionItem[]) => Promise<void>;
  onPublish: (sections: SectionItem[]) => Promise<void>;
  isEn?: boolean;
}

// Sortable Section Outline Item
function SortableSectionItem({
  section,
  index,
  totalCount,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
}: {
  section: SectionItem;
  index: number;
  totalCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
        isSelected
          ? "bg-indigo-600/20 border-indigo-500 text-white font-bold"
          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Sürükleyip Yeniden Sırala"
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-200 rounded hover:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 shrink-0" />
        </button>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs truncate">
            {section.titleTR || section.titleEN || section.type}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">{section.type}</span>
        </div>
      </div>

      {/* Quick Move Up/Down Controls */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          disabled={index === 0}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          disabled={index === totalCount - 1}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export const HomepageStudioShell: React.FC<HomepageStudioShellProps> = ({
  initialSections,
  onSaveDraft,
  onPublish,
  isEn: propIsEn,
}) => {
  const { language } = useLanguage();
  const isEn = propIsEn !== undefined ? propIsEn : language === "en";

  const [sections, setSections] = useState<SectionItem[]>(initialSections || []);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialSections && initialSections[0] ? initialSections[0].id : null
  );
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Seller Approval Workflow State
  const [approvalStatus, setApprovalStatus] = useState<string>("DRAFT");
  const [approvalData, setApprovalData] = useState<{
    requestedBy: string | null;
    requestedAt: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    sellerNotes: string | null;
  } | null>(null);
  const [requestingApproval, setRequestingApproval] = useState(false);

  // Undo / Redo History Ring Buffer
  const [history, setHistory] = useState<SectionItem[][]>([initialSections || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Status & Notification state
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchApprovalStatus = async () => {
    try {
      const res = await fetch("/api/cms/homepage/approval");
      if (res.ok) {
        const json = await res.json();
        setApprovalStatus(json.approvalStatus || "DRAFT");
        setApprovalData(json);
      }
    } catch (e) {
      console.warn("Failed to fetch approval status:", e);
    }
  };

  useEffect(() => {
    fetchApprovalStatus();
  }, []);

  // DND Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const pushHistory = useCallback((newSections: SectionItem[]) => {
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, newSections].slice(-30);
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUpdateSections = (newSections: SectionItem[]) => {
    setSections(newSections);
    pushHistory(newSections);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
          ...s,
          orderIndex: idx,
        }));
        handleUpdateSections(reordered);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setSections(prev);
      if (prev[0]) setSelectedSectionId(prev[0].id);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setSections(next);
      if (next[0]) setSelectedSectionId(next[0].id);
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
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history, sections]);

  // Section Manipulations
  const handleAddSection = (type: string, initialConfig?: any) => {
    const newSection: SectionItem = {
      id: `sec_${Date.now()}`,
      type,
      titleTR: initialConfig?.titleTR || `${type} Basligi`,
      titleEN: initialConfig?.titleEN || `${type} Heading`,
      orderIndex: sections.length,
      active: true,
      configJson: initialConfig?.configJson || {},
      banners: [],
    };
    const next = [...sections, newSection];
    handleUpdateSections(next);
    setSelectedSectionId(newSection.id);
  };

  const handleUpdateSection = (updated: SectionItem) => {
    const next = sections.map((s) => (s.id === updated.id ? updated : s));
    handleUpdateSections(next);
  };

  const handleDuplicateSection = (sec: SectionItem) => {
    const duplicated: SectionItem = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `sec_${Date.now()}`,
      titleTR: `${sec.titleTR} (Kopya)`,
      titleEN: `${sec.titleEN} (Copy)`,
      orderIndex: sections.length,
    };
    const next = [...sections, duplicated];
    handleUpdateSections(next);
    setSelectedSectionId(duplicated.id);
  };

  const handleDeleteSection = (id: string) => {
    const next = sections.filter((s) => s.id !== id).map((s, idx) => ({ ...s, orderIndex: idx }));
    handleUpdateSections(next);
    if (selectedSectionId === id) {
      setSelectedSectionId(next[0] ? next[0].id : null);
    }
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const next = [...sections];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    // Reindex
    const reindexed = next.map((item, idx) => ({ ...item, orderIndex: idx }));
    handleUpdateSections(reindexed);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveDraft(sections);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setStatusMessage(isEn ? "Draft saved successfully!" : "Taslak kaydedildi!");
      await fetchApprovalStatus();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error("Save draft error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestSellerApproval = async () => {
    setRequestingApproval(true);
    try {
      // First ensure draft is saved
      await onSaveDraft(sections);
      const res = await fetch("/api/cms/homepage/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Admin requested merchant confirmation for homepage layout." }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval request failed");

      setApprovalStatus(data.approvalStatus || "PENDING_SELLER_APPROVAL");
      setStatusMessage(isEn ? "Submitted for Seller Approval!" : "Satıcı onayına gönderildi!");
      await fetchApprovalStatus();
      setIsApprovalModalOpen(false);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e: any) {
      console.error("Request approval error:", e);
      setStatusMessage(e.message || "Approval request failed");
    } finally {
      setRequestingApproval(false);
    }
  };

  const handlePublish = async () => {
    if (approvalStatus !== "SELLER_APPROVED") {
      setIsApprovalModalOpen(true);
      return;
    }

    setPublishing(true);
    try {
      await onPublish(sections);
      setStatusMessage(isEn ? "Published to live storefront!" : "Canlı vitrinde yayınlandı!");
      setApprovalStatus("DRAFT");
      await fetchApprovalStatus();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e: any) {
      console.error("Publish error:", e);
      if (e.message?.includes("SELLER_APPROVAL_REQUIRED") || e.message?.includes("satıcı onaylayıp")) {
        setIsApprovalModalOpen(true);
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleRestoreSnapshot = (restoredSections: SectionItem[], versionNumber: number) => {
    handleUpdateSections(restoredSections);
    if (restoredSections[0]) {
      setSelectedSectionId(restoredSections[0].id);
    }
    setStatusMessage(isEn ? `Restored v${versionNumber} to canvas!` : `v${versionNumber} sürümü stüdyoya yüklendi!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  const isApproved = approvalStatus === "SELLER_APPROVED";
  const isPending = approvalStatus === "PENDING_SELLER_APPROVAL";
  const isRejected = approvalStatus === "SELLER_REJECTED";

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Studio Top Control Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Viewport Switcher & History Undo/Redo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewportMode("desktop")}
              title="Desktop View"
              className={`p-1.5 rounded-md transition-colors ${
                viewportMode === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("tablet")}
              title="Tablet View (768px)"
              className={`p-1.5 rounded-md transition-colors ${
                viewportMode === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("mobile")}
              title="Mobile View (390px)"
              className={`p-1.5 rounded-md transition-colors ${
                viewportMode === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-md hover:bg-slate-800"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-md hover:bg-slate-800"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Version History Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            title="Sürüm Geçmişi & Snapshotlar"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEn ? "History" : "Tarihçe"}</span>
          </button>
        </div>

        {/* Center: Seller Approval Status Pill & Indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsApprovalModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              isApproved
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                : isPending
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse hover:bg-amber-500/30"
                : isRejected
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isApproved ? "text-emerald-400" : isPending ? "text-amber-400" : isRejected ? "text-rose-400" : "text-slate-400"}`} />
            <span>
              {isApproved
                ? isEn ? "Seller Approved & Confirmed" : "Satıcı Onaylandı & Teyit Edildi"
                : isPending
                ? isEn ? "Pending Seller Approval" : "Satıcı Onayı Bekleniyor"
                : isRejected
                ? isEn ? "Rejected by Seller" : "Satıcı Tarafından Reddedildi"
                : isEn ? "Draft — Unapproved" : "Taslak — Onay Bekliyor"}
            </span>
          </button>

          {statusMessage ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
          ) : lastSavedTime ? (
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              {isEn ? `Draft saved at ${lastSavedTime}` : `Taslak kaydedildi (${lastSavedTime})`}
            </span>
          ) : null}
        </div>

        {/* Right: Save, Request Approval & Publish Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={handleSave}
            className="text-xs font-bold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Draft" : "Taslak Kaydet"}</span>
          </Button>

          {/* Request Seller Approval Button */}
          {!isApproved && (
            <Button
              size="sm"
              onClick={() => setIsApprovalModalOpen(true)}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>{isEn ? "Request Seller Approval" : "Satıcı Onayı İste"}</span>
            </Button>
          )}

          {/* Publish Live Button (Locked until seller confirms) */}
          <div className="relative group">
            <Button
              size="sm"
              disabled={publishing || !isApproved}
              onClick={handlePublish}
              className={`text-xs font-bold transition-all shadow-md ${
                isApproved
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 cursor-pointer"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75"
              }`}
            >
              {isApproved ? (
                <Rocket className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              )}
              <span>
                {publishing
                  ? isEn ? "Publishing..." : "Yayınlanıyor..."
                  : isEn
                  ? isApproved ? "Publish Live" : "Locked (Seller Approval Required)"
                  : isApproved ? "Canlıya Yayınla" : "Kilitli (Satıcı Onayı Gerekli)"}
              </span>
            </Button>

            {!isApproved && (
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-72 p-2.5 bg-slate-950 text-slate-200 text-[11px] font-semibold rounded-xl border border-slate-800 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? "Homepage studio cannot publish changes until a verified merchant approves and confirms the layout."
                      : "Satıcı onaylayıp teyit etmeden ana sayfa vitrin değişiklikleri canlıya yayınlanamaz."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-Panel Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Drag-and-Drop Sortable Section Outline Tree */}
        <div className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
              {isEn ? "Sections Outline" : "Sayfa Bölümleri"}
            </span>
            <Button
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{isEn ? "Add" : "Ekle"}</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((sec, idx) => (
                  <SortableSectionItem
                    key={sec.id}
                    section={sec}
                    index={idx}
                    totalCount={sections.length}
                    isSelected={selectedSectionId === sec.id}
                    onSelect={() => setSelectedSectionId(sec.id)}
                    onMoveUp={() => handleMoveSection(idx, "up")}
                    onMoveDown={() => handleMoveSection(idx, "down")}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* CENTER PANEL: Live Interactive Visual Canvas */}
        <HomepageCanvas
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={(sec) => setSelectedSectionId(sec.id)}
          viewportMode={viewportMode}
          isEn={isEn}
        />

        {/* RIGHT PANEL: Slide-out Section Inspector */}
        <div className="w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 text-slate-900">
          <SectionSettingsInspector
            section={selectedSection}
            onUpdateSection={handleUpdateSection}
            onDuplicateSection={handleDuplicateSection}
            onDeleteSection={handleDeleteSection}
            isEn={isEn}
          />
        </div>
      </div>

      {/* Section Library Modal */}
      <SectionLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectSectionType={handleAddSection}
        isEn={isEn}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestoreSnapshot={handleRestoreSnapshot}
        isEn={isEn}
      />

      {/* Seller Approval & Governance Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isApproved ? "bg-emerald-500/20 text-emerald-400" : isPending ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white">
                    {isEn ? "Seller Approval & Governance Gate" : "Satıcı Onay & Yönetişim Merkezi"}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {isEn ? "Mandatory merchant confirmation before publishing" : "Yayınlama öncesi zorunlu satıcı onayı"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isApproved
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : isPending
                ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                : isRejected
                ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                : "bg-slate-800/60 border-slate-700 text-slate-300"
            }`}>
              {isApproved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : isPending ? (
                <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              ) : isRejected ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <div className="space-y-0.5">
                <div className="text-xs font-black uppercase tracking-wider">
                  {isApproved
                    ? isEn ? "Status: Approved & Confirmed" : "Durum: Satıcı Tarafından Onaylandı"
                    : isPending
                    ? isEn ? "Status: Pending Seller Review" : "Durum: Satıcı İncelemesi Bekleniyor"
                    : isRejected
                    ? isEn ? "Status: Rejected by Seller" : "Durum: Satıcı Tarafından Reddedildi"
                    : isEn ? "Status: Unsubmitted Draft" : "Durum: Onaya Sunulmamış Taslak"}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isApproved
                    ? isEn ? `Approved by ${approvalData?.approvedBy || "Verified Seller"}` : `${approvalData?.approvedBy || "Doğrulanmış Satıcı"} tarafından teyit edildi.`
                    : isPending
                    ? isEn ? "Awaiting confirmation from seller dashboard." : "Satıcı panelinden teyit bekleniyor."
                    : isRejected
                    ? approvalData?.rejectionReason || "Satıcı tarafından revizyon talep edildi."
                    : isEn ? "Submit changes to sellers to request publishing approval." : "Yayınlama kilidini açmak için taslağı satıcı onayına sunun."}
                </div>
              </div>
            </div>

            {/* Explanation Note */}
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              {isEn
                ? "In accordance with marketplace governance, any visual storefront change, section rearrangement, or campaign highlight must be approved by a verified merchant before it can go live."
                : "Pazaryeri kuralları gereği, vitrin düzeninde yapılan hiçbir değişiklik ve kampanya yerleşimi satıcı tarafından onaylanmadan canlıya alınamaz."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApprovalModalOpen(false)}
                className="w-full sm:w-auto text-xs font-bold bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {isEn ? "Close" : "Kapat"}
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!isApproved && (
                  <Button
                    size="sm"
                    disabled={requestingApproval}
                    onClick={handleRequestSellerApproval}
                    className="w-full sm:w-auto text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {requestingApproval
                        ? isEn ? "Submitting..." : "Gönderiliyor..."
                        : isEn ? "Submit for Seller Approval" : "Satıcı Onayına Sun"}
                    </span>
                  </Button>
                )}

                {/* Quick Simulation Button for Admin Testing */}
                {!isApproved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/seller/homepage-approval", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "APPROVE", sellerNotes: "Admin verified approval simulation." }),
                        });
                        if (res.ok) {
                          setApprovalStatus("SELLER_APPROVED");
                          await fetchApprovalStatus();
                          setIsApprovalModalOpen(false);
                          setStatusMessage(isEn ? "Simulated Seller Approval!" : "Satıcı onayı simüle edildi!");
                          setTimeout(() => setStatusMessage(null), 3000);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="w-full sm:w-auto text-xs font-bold bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    <span>{isEn ? "Approve (Simulation)" : "Satıcı Olarak Onayla"}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
