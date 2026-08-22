"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { CreditCard, Plus, Trash2, ShieldCheck, CheckCircle2, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedCard {
  id: string;
  cardHolder: string;
  cardNumberMasked: string;
  expiryDate: string;
  bankName: string;
  cardType: "mastercard" | "visa" | "troy";
  isDefault: boolean;
  bgGradient: string;
}

export default function SavedCardsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [cards, setCards] = useState<SavedCard[]>([
    {
      id: "card-1",
      cardHolder: "AHMET YILMAZ",
      cardNumberMasked: "**** **** **** 4242",
      expiryDate: "12/28",
      bankName: "Garanti BBVA Bonus",
      cardType: "mastercard",
      isDefault: true,
      bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
    },
    {
      id: "card-2",
      cardHolder: "AHMET YILMAZ",
      cardNumberMasked: "**** **** **** 8821",
      expiryDate: "08/29",
      bankName: "Yapı Kredi World",
      cardType: "visa",
      isDefault: false,
      bgGradient: "from-slate-800 via-slate-900 to-slate-950",
    },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHolder, setNewHolder] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newBank, setNewBank] = useState("İş Bankası Maximum");
  const [newIsDefault, setNewIsDefault] = useState(false);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolder || !newNumber || !newExpiry) return;

    const newCardObj: SavedCard = {
      id: `card-${Date.now()}`,
      cardHolder: newHolder.toUpperCase(),
      cardNumberMasked: `**** **** **** ${newNumber.replace(/\s+/g, "").slice(-4) || "9999"}`,
      expiryDate: newExpiry,
      bankName: newBank,
      cardType: newNumber.startsWith("4") ? "visa" : "mastercard",
      isDefault: newIsDefault,
      bgGradient: "from-emerald-950 via-slate-900 to-slate-950",
    };

    if (newIsDefault) {
      setCards([newCardObj, ...cards.map((c) => ({ ...c, isDefault: false }))]);
    } else {
      setCards([...cards, newCardObj]);
    }

    setIsModalOpen(false);
    setNewHolder("");
    setNewNumber("");
    setNewExpiry("");
  };

  const handleSetDefault = (cardId: string) => {
    setCards(
      cards.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm(isEn ? "Are you sure you want to delete this saved card?" : "Bu kayıtlı kartı silmek istediğinize emin misiniz?")) {
      setCards(cards.filter((c) => c.id !== cardId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Saved Cards" : "Kayıtlı Kartlarım" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <CreditCard className="w-4 h-4" />
                  <span>{isEn ? "Payment Wallet" : "Ödeme Cüzdanı"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Saved Credit & Debit Cards" : "Kayıtlı Kredi & Banka Kartlarım"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Manage your saved payment cards for fast, 1-click 3D Secure checkout."
                    : "Tek tıkla hızlı ve güvenli 3D Secure ödeme yapmak için kayıtlı kartlarınızı yönetin."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? "Add New Card" : "Yeni Kart Ekle"}</span>
              </button>
            </div>

            {/* PCI-DSS Security Banner */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-emerald-900">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-emerald-950">
                  {isEn ? "256-Bit SSL & PCI-DSS Level 1 Protected" : "256-Bit SSL & PCI-DSS Seviye 1 Güvenlik Koruması"}
                </span>
                <span className="text-[11px] text-emerald-800/90 font-medium">
                  {isEn
                    ? "Your full card details and CVV security numbers are never stored on our servers. All transactions are securely routed through Masterpass / BKM Express 3D Secure."
                    : "Kartınızın güvenlik numarası (CVV) asla saklanmaz. Tüm işlemler banka altyapısı ve 3D Secure güvencesiyle gerçekleşir."}
                </span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "relative rounded-2xl p-6 text-white shadow-md flex flex-col justify-between h-52 bg-gradient-to-br border border-white/10 overflow-hidden",
                    card.bgGradient
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-slate-200">
                      {card.bankName}
                    </span>
                    {card.isDefault && (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Varsayılan Kart</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 my-auto">
                    <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-slate-100">
                      {card.cardNumberMasked}
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                        Kart Sahibi
                      </span>
                      <span className="text-xs font-bold tracking-wide">{card.cardHolder}</span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                        Son Kullanma
                      </span>
                      <span className="text-xs font-bold font-mono">{card.expiryDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(card.id)}
                          className="text-[10px] font-extrabold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                        >
                          Varsayılan Yap
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(card.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Add Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {isEn ? "Add Payment Card" : "Yeni Kart Ekle"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCard} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-800">
                  {isEn ? "Cardholder Full Name" : "Kart Üzerindeki İsim"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={newHolder}
                  onChange={(e) => setNewHolder(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-semibold uppercase"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-800">
                  {isEn ? "Card Number" : "Kart Numarası"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="5526 1234 5678 9012"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    {isEn ? "Expiry Date" : "Son Kullanma (AA/YY)"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-mono font-bold text-center"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    {isEn ? "Bank / Provider" : "Banka Adı"}
                  </label>
                  <select
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-semibold"
                  >
                    <option value="Garanti BBVA">Garanti BBVA</option>
                    <option value="Yapı Kredi">Yapı Kredi</option>
                    <option value="İş Bankası Maximum">İş Bankası Maximum</option>
                    <option value="Akbank Axess">Akbank Axess</option>
                    <option value="QNB Finansbank">QNB Finansbank</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary"
                />
                <span>{isEn ? "Set as default payment card" : "Varsayılan ödeme kartım olarak kaydet"}</span>
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Vazgeç"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isEn ? "Save Card" : "Kartı Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
