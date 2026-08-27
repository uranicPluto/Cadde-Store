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
      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
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
          title="S�r�kleyip Yeniden Sirala"
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

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          title="Yukari Tasi"
          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalCount - 1}
          title="Asagi Tasi"
          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded"
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

  // Undo / Redo History Ring Buffer
  const [history, setHistory] = useState<SectionItem[][]>([initialSections || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Status & Notification state
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      configJson: initialConfig || {},
      banners: [],
    };
    const updated = [...sections, newSection];
    handleUpdateSections(updated);
    setSelectedSectionId(newSection.id);
  };

  const handleUpdateSection = (updated: SectionItem) => {
    const next = sections.map((s) => (s.id === updated.id ? updated : s));
    handleUpdateSections(next);
  };

  const handleDuplicateSection = (sec: SectionItem) => {
    const duplicated: SectionItem = {
      ...sec,
      id: `sec_${Date.now()}`,
      titleTR: `${sec.titleTR || sec.type} (Kopya)`,
      titleEN: `${sec.titleEN || sec.type} (Copy)`,
      orderIndex: sec.orderIndex + 1,
    };
    const next = [...sections, duplicated];
    handleUpdateSections(next);
    setSelectedSectionId(duplicated.id);
  };

  const handleDeleteSection = (id: string) => {
    const next = sections.filter((s) => s.id !== id);
    handleUpdateSections(next);
    if (selectedSectionId === id) {
      setSelectedSectionId(next[0] ? next[0].id : null);
    }
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
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
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error("Save draft error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublish(sections);
      setStatusMessage(isEn ? "Published to live storefront!" : "Canli vitrinde yayinlandi!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error("Publish error:", e);
    } finally {
      setPublishing(false);
    }
  };

  const handleRestoreSnapshot = (restoredSections: SectionItem[], versionNumber: number) => {
    handleUpdateSections(restoredSections);
    if (restoredSections[0]) {
      setSelectedSectionId(restoredSections[0].id);
    }
    setStatusMessage(isEn ? `Restored v${versionNumber} to canvas!` : `v${versionNumber} s�r�m� st�dyoya y�klendi!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Studio Top Control Bar */}
      <div className="h-12 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
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
            title="S�r�m Ge�misi & Snapshotlar"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEn ? "History" : "Tarih�e"}</span>
          </button>
        </div>

        {/* Center: Save / Status Indicators */}
        <div className="flex items-center gap-2">
          {statusMessage ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
          ) : lastSavedTime ? (
            <span className="text-[11px] text-slate-400">
              {isEn ? `Draft saved at ${lastSavedTime}` : `Taslak kaydedildi (${lastSavedTime})`}
            </span>
          ) : null}
        </div>

        {/* Right: Save & Publish Action Buttons */}
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

          <Button
            size="sm"
            disabled={publishing}
            onClick={handlePublish}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
          >
            <Rocket className="w-3.5 h-3.5 mr-1.5" />
            <span>{publishing ? (isEn ? "Publishing..." : "Yayinlaniyor...") : isEn ? "Publish Live" : "Canliya Yayinla"}</span>
          </Button>
        </div>
      </div>

      {/* 3-Panel Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Drag-and-Drop Sortable Section Outline Tree */}
        <div className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
              {isEn ? "Sections Outline" : "Sayfa B�l�mleri"}
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
    </div>
  );
};
