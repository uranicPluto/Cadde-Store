"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SECTION_SCHEMA_REGISTRY, SectionSchema } from "./section-schema-registry";
import {
  Sparkles,
  ShoppingCart,
  Grid,
  Flame,
  Megaphone,
  Award,
  Store,
  ShieldCheck,
  Search,
  Plus,
  Layers,
  HelpCircle,
  Video,
  FileText,
  Mail,
  Clock,
  Layout,
} from "lucide-react";

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  ShoppingCart,
  Grid,
  Flame,
  Megaphone,
  Award,
  Store,
  ShieldCheck,
  Layers,
  HelpCircle,
  Video,
  FileText,
  Mail,
  Clock,
  Layout,
};

interface SectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSectionType: (type: string, initialData?: any) => void;
  isEn?: boolean;
}

export const SectionLibraryModal: React.FC<SectionLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectSectionType,
  isEn = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "ALL", label: isEn ? "All Sections" : "Tüm Bölümler" },
    { id: "HERO", label: isEn ? "Hero & Banners" : "Hero & Afişler" },
    { id: "PRODUCTS", label: isEn ? "Products & Grids" : "Ürün Vitrinleri" },
    { id: "CATEGORIES", label: isEn ? "Categories" : "Kategoriler" },
    { id: "CAMPAIGNS", label: isEn ? "Campaigns & Sales" : "Kampanyalar" },
    { id: "BRANDS", label: isEn ? "Brands" : "Markalar" },
    { id: "SPONSORS", label: isEn ? "Sponsors" : "Sponsorlar" },
    { id: "CONTENT", label: isEn ? "Content & Stores" : "İçerik & Mağazalar" },
    { id: "TRUST", label: isEn ? "Trust & Badges" : "Güven & Rozetler" },
  ];

  const sectionsList: SectionSchema[] = Object.values(SECTION_SCHEMA_REGISTRY);

  const filteredSections = sectionsList.filter((sec) => {
    const matchesCategory = selectedCategory === "ALL" || sec.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      sec.nameTr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Add Section to Canvas" : "Vitrininize Yeni Bölüm Ekleyin"}
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Search and Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search section templates..." : "Bölüm şablonlarında ara..."}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
          {filteredSections.map((sec) => {
            const Icon = ICON_MAP[sec.iconName] || Layers;

            return (
              <div
                key={sec.type}
                onClick={() => {
                  onSelectSectionType(sec.type, sec.defaultConfig);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {isEn ? sec.nameEn : sec.nameTr}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                      {isEn ? sec.descriptionEn : sec.descriptionTr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  <span>{sec.type}</span>
                  <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <Plus className="w-3 h-3" />
                    <span>{isEn ? "Add" : "Ekle"}</span>
                  </span>
                </div>
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Layers className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <span className="text-xs">{isEn ? "No matching section found." : "Eşleşen bölüm bulunamadı."}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
