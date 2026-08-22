"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Headphones, Send, Bot, User, Sparkles, Package, RotateCcw, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: () => void }[];
}

export default function CaddeAssistantPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: isEn
        ? "Hello Ahmet! I am your 7/24 Cadde Store Digital Assistant. How can I assist you today?"
        : "Merhaba Ahmet Bey! Ben 7/24 Cadde Store Dijital Asistanınızım. Size nasıl yardımcı olabilirim?",
      timestamp: "Şimdi",
      quickActions: [
        { label: "📦 Kargom Nerede?", action: () => handleSendPrompt("Kargom nerede?") },
        { label: "🔄 Kolay İade Başlat", action: () => handleSendPrompt("İade işlemi nasıl yapılır?") },
        { label: "🧾 E-Fatura Görüntüle", action: () => handleSendPrompt("Sipariş faturamı nereden görebilirim?") },
        { label: "💬 Canlı Destek Temsilcisi", action: () => handleSendPrompt("Müşteri temsilcisine bağlanmak istiyorum.") },
      ],
    },
  ]);

  const handleSendPrompt = (promptText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: "Şimdi",
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let botResponse = "";
      const pLower = promptText.toLowerCase();

      if (pLower.includes("kargo") || pLower.includes("nerede")) {
        botResponse = isEn
          ? "Your last order #CS-98421 was dispatched with Yurtiçi Kargo (Tracking: 1982736152). Estimated delivery is tomorrow between 10:00 - 14:00."
          : "Son verdiğiniz #CS-98421 numaralı siparişiniz Yurtiçi Kargo'ya teslim edilmiştir (Takip No: 1982736152). Tahmini teslimat yarın 10:00 - 14:00 arasındadır.";
      } else if (pLower.includes("iade")) {
        botResponse = isEn
          ? "You have 14 days of free return rights. Go to 'My Orders' > Select your product > Click 'Start Easy Return' to generate your free return shipping code."
          : "14 gün içinde ücretsiz iade hakkınız bulunmaktadır. 'Siparişlerim' sayfasına gidip ürünün yanındaki 'Kolay İade Başlat' butonuna tıklayarak ücretsiz kargo iade kodunuzu oluşturabilirsiniz.";
      } else if (pLower.includes("fatura")) {
        botResponse = isEn
          ? "All e-invoices are automatically generated upon dispatch and sent to ahmet.yilmaz@cadde-store.com. You can also download PDF from the order details page."
          : "E-faturalarınız sipariş kargolandığında sistemde otomatik oluşturulup ahmet.yilmaz@cadde-store.com adresinize iletilmektedir. Ayrıca Sipariş Detayı sayfasından 'Faturayı İndir' butonunu kullanabilirsiniz.";
      } else if (pLower.includes("temsilci") || pLower.includes("canlı")) {
        botResponse = isEn
          ? "Connecting you to our senior live customer specialist... (Current estimated queue time: 30 seconds)."
          : "Sizi yetkili müşteri temsilcimize aktarıyorum... (Tahmini bekleme süresi: 30 saniye). Lütfen bu sayfadan ayrılmayınız.";
      } else {
        botResponse = isEn
          ? "I have logged your request. You can also reach our 24/7 dedicated telephone support at +90 850 300 00 00."
          : "Talebinizi aldım ve kaydettim. Ayrıca 7/24 müşteri destek hattımız 0850 300 00 00 üzerinden de bize dilediğiniz an ulaşabilirsiniz.";
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "bot",
        text: botResponse,
        timestamp: "Şimdi",
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleSendPrompt(inputVal);
    setInputVal("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Cadde Assistant 24/7" : "Cadde Asistanı 24/7" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-5">
            {/* Assistant Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-[#f27a1a] to-amber-500 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Headphones className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">Cadde Asistanı 24/7</h1>
                    <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Çevrim İçi
                    </span>
                  </div>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {isEn
                      ? "Instant automated answers for orders, cargo tracking, returns, and live support connection."
                      : "Siparişleriniz, kargo durumu, iade işlemleri ve tüm sorularınız için 7/24 anında yanıt alın."}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Chat Window */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
              {/* Chat Messages Log */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar flex flex-col gap-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-3 max-w-[85%] sm:max-w-[75%]",
                      m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-2xs text-xs font-bold",
                        m.sender === "bot" ? "bg-[#f27a1a]" : "bg-slate-900"
                      )}
                    >
                      {m.sender === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div
                        className={cn(
                          "p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs",
                          m.sender === "bot"
                            ? "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs"
                            : "bg-[#f27a1a] text-white rounded-tr-xs"
                        )}
                      >
                        {m.text}
                      </div>

                      {/* Quick Action Buttons */}
                      {m.quickActions && m.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {m.quickActions.map((qa, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={qa.action}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f27a1a] border border-orange-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleFormSubmit}
                className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={isEn ? "Type your question here..." : "Sorunuzu buraya yazın..."}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-xl bg-[#f27a1a] hover:bg-[#d9660d] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
