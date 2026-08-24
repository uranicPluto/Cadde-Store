"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  ShoppingBag,
  ArrowRight,
  Bookmark,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function AdminAiAssistantPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleGenerate = async (presetPrompt?: string) => {
    const textToUse = presetPrompt || prompt;
    if (!textToUse.trim()) return;

    setLoading(true);
    setProposal(null);
    try {
      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToUse }),
      });

      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
        showNotice("success", isEn ? "Campaign proposal generated!" : "AI kampanya önerisi üretildi!");
      }
    } catch (e) {
      console.error("AI error:", e);
      showNotice("error", isEn ? "Failed to generate proposal." : "AI önerisi oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!proposal) return;
    try {
      const res = await fetch("/api/cms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: proposal.titleTR,
          description: "AI Generated Campaign Block",
          type: proposal.type,
          configJson: proposal.configJson,
        }),
      });
      if (res.ok) {
        showNotice(
          "success",
          isEn ? "Saved to Section Templates!" : "Şablon Kütüphanesine kaydedildi!"
        );
      }
    } catch (e) {
      console.error("Save template error:", e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-900 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />

        {/* Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              {isEn ? "AI Merchandising & Campaign Assistant" : "AI Vitrin & Kampanya Asistanı"}
            </h1>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`px-6 py-2 flex items-center justify-between text-xs font-bold shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
                : "bg-rose-50 text-rose-900 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback.text}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* Studio Workspace */}
        <div className="flex-1 grid grid-cols-12 gap-5 p-6 min-h-0 overflow-y-auto bg-slate-100 max-w-7xl w-full mx-auto">
          {/* Prompt Generator Input (6 cols) */}
          <div className="col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                {isEn ? "Describe your campaign idea" : "Kampanya fikrinizi doğal dille yazın"}
              </h2>
              <p className="text-slate-500 text-[11px]">
                {isEn
                  ? "AI will synthesize banners, product sourcing rules, badges, discounts, and layout blocks."
                  : "AI otomatik olarak banner başlıkları, ürün kuralları, indirim rozetleri ve vitrin düzeni oluşturur."}
              </p>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isEn
                  ? "e.g. Create a summer dress collection with 8 bestselling products, 40% discount badges, and a vibrant beach hero banner."
                  : "Örn: Yaz modası için kadın elbiselerinde en çok satan 8 ürünü %40 indirimle sergileyen plaj temalı bir vitrin bloğu oluştur."
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-indigo-600 resize-none text-xs"
            />

            {/* Presets */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                {isEn ? "Suggested Prompts:" : "Örnek Kampanya Fikirleri:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Kadın Yaz Elbise Koleksiyonu & Fırsatlar",
                  "Erkek Sokak Stili & Şıklık Günleri",
                  "Bluetooth Kulaklık & Teknoloji İndirimleri",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setPrompt(item);
                      handleGenerate(item);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] transition-colors text-left"
                  >
                    {item} &rarr;
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 mt-2 h-10"
            >
              <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? (isEn ? "Generating with AI..." : "AI Kampanyayı Üretiyor...") : isEn ? "Generate Campaign Proposal" : "AI Kampanya Bloğunu Oluştur"}</span>
            </Button>
          </div>

          {/* Generated Proposal Output (6 cols) */}
          <div className="col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900">
                {isEn ? "Generated Campaign Block" : "Üretilen Kampanya Bloğu"}
              </h2>
              {proposal && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  READY
                </span>
              )}
            </div>

            {proposal ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{proposal.titleTR}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {proposal.type}
                    </span>
                  </div>
                  <span className="text-slate-600 text-xs">{proposal.configJson?.subtitleTR}</span>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-500">CTA:</span>
                    <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                      {proposal.configJson?.ctaTextTR} &rarr; {proposal.configJson?.ctaUrl}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-indigo-950">Dinamik Ürün Kuralı:</span>
                  <span className="text-indigo-800 text-[11px]">
                    Kaynak: <strong>{proposal.configJson?.productRules?.source}</strong> • Kategori: <strong>{proposal.configJson?.productRules?.categorySlug}</strong> • Limit: <strong>8 Ürün</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isEn ? "Save to Templates" : "Şablon Olarak Kaydet"}</span>
                  </button>

                  <Link href="/admin/cms" className="flex-1">
                    <Button className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs">
                      <span>{isEn ? "Go to Homepage Studio" : "Studio'ya Git"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-slate-300" />
                <span className="font-bold">
                  {isEn ? "No campaign generated yet." : "Henüz bir kampanya üretilmedi."}
                </span>
                <p className="text-slate-400 text-xs max-w-xs">
                  {isEn
                    ? "Enter an idea on the left and click Generate to see the structured campaign block."
                    : "Soldaki alana bir kampanya fikri yazıp 'Oluştur' butonuna basınız."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
