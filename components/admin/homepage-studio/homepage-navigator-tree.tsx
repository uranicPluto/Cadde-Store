"use client";

import React from "react";
import { SectionItem } from "@/lib/cms/cms-types";
import {
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
  Edit2,
  ExternalLink,
} from "lucide-react";

interface HomepageNavigatorTreeProps {
  sections: SectionItem[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onEditSection: (section: SectionItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleActive: (id: string) => void;
  onDuplicateSection: (section: SectionItem) => void;
  onDeleteSection: (id: string) => void;
  onOpenPreview: (section: SectionItem) => void;
  onOpenLibrary: (insertIndex?: number) => void;
  isEn?: boolean;
}

export const HomepageNavigatorTree: React.FC<HomepageNavigatorTreeProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onEditSection,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onDuplicateSection,
  onDeleteSection,
  onOpenPreview,
  onOpenLibrary,
  isEn = false,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-full overflow-hidden text-xs">
      {/* Navigator Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="font-extrabold text-slate-900 text-sm">
            {isEn ? "Page Structure" : "Sayfa Yapısı"}
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full font-mono">
          {sections.length} {isEn ? "blocks" : "blok"}
        </span>
      </div>

      {/* Navigator Tree List */}
      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-1.5">
        {sections.map((sec, idx) => {
          const isSelected = selectedSectionId === sec.id;
          const isActive = sec.active !== false;

          return (
            <div
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              onDoubleClick={() => onEditSection(sec)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                isSelected
                  ? "bg-indigo-50/90 border-indigo-600 shadow-xs ring-1 ring-indigo-600"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              {/* Left Grip & Info */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex flex-col text-slate-400 gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(idx);
                    }}
                    className="hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(idx);
                    }}
                    className="hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-bold text-xs truncate ${
                      isSelected ? "text-indigo-950" : isActive ? "text-slate-800" : "text-slate-400 line-through"
                    }`}
                  >
                    {isEn ? sec.titleEN || sec.titleTR : sec.titleTR || sec.titleEN}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {sec.type}
                    </span>
                    {!isActive && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                        {isEn ? "Hidden" : "Gizli"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection(sec);
                  }}
                  title={isEn ? "Edit Settings" : "Ayarları Düzenle"}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(sec.id);
                  }}
                  title={isActive ? (isEn ? "Hide" : "Gizle") : isEn ? "Show" : "Göster"}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50"
                >
                  {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSection(sec);
                  }}
                  title={isEn ? "Duplicate" : "Çoğalt"}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(sec.id);
                  }}
                  title={isEn ? "Delete" : "Sil"}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigator Footer: Add Section */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => onOpenLibrary()}
          className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isEn ? "Add New Section" : "Yeni Bölüm Ekle"}</span>
        </button>
      </div>
    </div>
  );
};
