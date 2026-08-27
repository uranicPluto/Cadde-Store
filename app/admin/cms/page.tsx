"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { HomepageStudioShell } from "@/components/admin/homepage-studio/homepage-studio-shell";
import { SectionItem } from "@/lib/cms/cms-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { Sliders, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminHomepageCmsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/sections");
      const data = await res.json();
      if (data.sections && Array.isArray(data.sections)) {
        setSections(data.sections);
      }
    } catch (e) {
      console.warn("Failed to fetch CMS sections:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSaveDraft = async (updatedSections: SectionItem[]) => {
    try {
      const res = await fetch("/api/cms/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });
      if (!res.ok) throw new Error("Save draft failed");
    } catch (e) {
      console.error("Save draft error:", e);
      throw e;
    }
  };

  const handlePublish = async (updatedSections: SectionItem[]) => {
    try {
      const res = await fetch("/api/cms/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });
      if (!res.ok) throw new Error("Publish failed");
    } catch (e) {
      console.error("Publish error:", e);
      throw e;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
        <AdminSidebar className="w-64 shrink-0 hidden md:flex" />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Sliders className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-600">
              {isEn ? "Loading Homepage Studio..." : "Vitrin Stüdyosu Yükleniyor..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100 text-slate-900">
        <AdminHeader />

        <div className="flex-1 overflow-hidden">
          <HomepageStudioShell
            initialSections={sections}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isEn={isEn}
          />
        </div>
      </div>
    </div>
  );
}
