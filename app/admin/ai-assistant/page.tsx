"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Sparkles, Send, Bot, Check, Layers, Sliders } from "lucide-react";
import Link from "next/link";

export default function AdminAiAssistantPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Merhaba! Ben Cadde Store AI Vitrin ve Ticaret Asistanınızım. Vitrininiz için yeni kampanya blokları, indirim afişleri veya özel koleksiyon vitrinleri önermemi ister misiniz?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!prompt.trim()) return;
    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Talebiniz doğrultusunda 'Sonbahar Trendleri & Özel Koleksiyon' adlı yeni bir Hero ve Ürün Kaydırıcı bloğu hazırladım. Vitrin Stüdyosu'nda taslağınızı inceleyebilirsiniz.",
          suggestion: {
            title: "Sonbahar Trendleri",
            type: "HERO",
          },
        },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "AI Merchandising & Layout Assistant" : "AI Vitrin & Ticaret Asistanı"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Generate promotional layouts, campaign titles, product curation rules, and copy using AI."
                    : "Yapay zeka ile vitrin blokları, kampanya başlıkları ve ürün gruplamaları oluşturun."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex-1 flex flex-col overflow-hidden min-h-[450px]">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.role === "user" ? "bg-slate-900 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {m.role === "user" ? "AD" : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-slate-50 border border-slate-200/80 text-slate-800"
                    }`}
                  >
                    {m.content}

                    {m.suggestion && (
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-900 text-[11px]">{m.suggestion.title}</span>
                        <Link
                          href="/admin/cms"
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Stüdyoda İncele</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                  <span>AI vitrin önerisi hazırlanıyor...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Örn: 20-30 yaş için sneaker ve spor giyim ağırlıklı bir flaş indirim vitrini hazırla..."
                className="text-xs bg-white"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Gönder</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
