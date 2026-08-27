"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { HomepageStudioShell } from "@/components/admin/homepage-studio/homepage-studio-shell";
import { SectionItem } from "@/lib/cms/cms-types";
import { ArrowLeft, Layers, Sliders, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCustomPageBuilder() {
  const params = useParams();
  const pageId = params?.id as string;
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      const data = await res.json();
      if (data.page) {
        setPage(data.page);
        const parsed = typeof data.page.sectionsJson === "string"
          ? JSON.parse(data.page.sectionsJson || "[]")
          : data.page.sectionsJson || [];
        setSections(parsed);
      }
    } catch (e) {
      console.warn("Failed to fetch custom page:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) fetchPage();
  }, [pageId]);

  const handleSaveDraft = async (updatedSections: SectionItem[]) => {
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionsJson: JSON.stringify(updatedSections),
          status: "DRAFT",
        }),
      });
      if (!res.ok) throw new Error("Save page draft failed");
    } catch (e) {
      console.error("Save draft error:", e);
      throw e;
    }
  };

  const handlePublish = async (updatedSections: SectionItem[]) => {
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionsJson: JSON.stringify(updatedSections),
          status: "PUBLISHED",
        }),
      });
      if (!res.ok) throw new Error("Publish page failed");
    } catch (e) {
      console.error("Publish error:", e);
      throw e;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Sliders className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-bold text-slate-400">
            {isEn ? "Loading Page Builder..." : "Sayfa Editörü Yükleniyor..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="h-12 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-white">{page?.titleTr || "Sayfa"}</span>
            <span className="font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
              /p/{page?.slug}
            </span>
          </div>
        </div>

        {page?.slug && (
          <Link
            href={`/p/${page.slug}`}
            target="_blank"
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
          >
            <span>{isEn ? "Open Live URL" : "Canlı Sayfayı Aç"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Main Studio Shell */}
      <div className="flex-1 overflow-hidden">
        <HomepageStudioShell
          initialSections={sections}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          isEn={isEn}
        />
      </div>
    </div>
  );
}
