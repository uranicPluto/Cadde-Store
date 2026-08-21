"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Language, Currency } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export interface LanguageSwitcherProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "desktop",
  className,
}) => {
  const { language, currency, setLanguage, setCurrency, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const handleCurrencySelect = (curr: Currency) => {
    setCurrency(curr);
    setIsOpen(false);
  };

  if (variant === "mobile") {
    return (
      <div className={cn("flex flex-col gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs", className)}>
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">
            {t("common.language")}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage("tr")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded font-bold border transition-colors flex items-center justify-between",
                language === "tr"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-text-main border-slate-200"
              )}
            >
              <span>Türkçe</span>
              {language === "tr" && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded font-bold border transition-colors flex items-center justify-between",
                language === "en"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-text-main border-slate-200"
              )}
            >
              <span>English</span>
              {language === "en" && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200">
          <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">
            {t("common.currency")}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrency("TRY")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded font-semibold border transition-colors flex items-center justify-between",
                currency === "TRY"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-text-main border-slate-200"
              )}
            >
              <span>TRY — ₺</span>
              {currency === "TRY" && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded font-semibold border transition-colors flex items-center justify-between",
                currency === "USD"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-text-main border-slate-200"
              )}
            >
              <span>USD — $</span>
              {currency === "USD" && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Control Button: 🌐 TR / TL ▾ */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Dil ve Para Birimi Seçimi"
        className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors py-0.5 px-1.5 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-[11px] font-semibold"
      >
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span className="uppercase font-bold text-white">{language}</span>
        <span className="text-slate-500">/</span>
        <span className="text-slate-300">{currency === "TRY" ? "TL" : "USD"}</span>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Language & Currency Popup Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 text-xs text-text-main flex flex-col gap-3">
          {/* Dil / Language Section */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-text-muted text-[10px] uppercase tracking-wider">
              {t("common.language")}
            </span>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleLanguageSelect("tr")}
                className={cn(
                  "flex items-center justify-between p-2 rounded hover:bg-slate-100 transition-colors font-medium text-left",
                  language === "tr" && "bg-primary-light text-primary font-bold"
                )}
              >
                <span>Türkçe</span>
                {language === "tr" && <Check className="w-4 h-4 text-primary" />}
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSelect("en")}
                className={cn(
                  "flex items-center justify-between p-2 rounded hover:bg-slate-100 transition-colors font-medium text-left",
                  language === "en" && "bg-primary-light text-primary font-bold"
                )}
              >
                <span>English</span>
                {language === "en" && <Check className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </div>

          {/* Para Birimi / Currency Section */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <span className="font-bold text-text-muted text-[10px] uppercase tracking-wider">
              {t("common.currency")}
            </span>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleCurrencySelect("TRY")}
                className={cn(
                  "flex items-center justify-between p-2 rounded hover:bg-slate-100 transition-colors font-medium text-left",
                  currency === "TRY" && "bg-slate-100 font-bold text-text-main"
                )}
              >
                <span>TRY — ₺ (Türk Lirası)</span>
                {currency === "TRY" && <Check className="w-4 h-4 text-text-main" />}
              </button>
              <button
                type="button"
                onClick={() => handleCurrencySelect("USD")}
                className={cn(
                  "flex items-center justify-between p-2 rounded hover:bg-slate-100 transition-colors font-medium text-left",
                  currency === "USD" && "bg-slate-100 font-bold text-text-main"
                )}
              >
                <span>USD — $ (US Dollar)</span>
                {currency === "USD" && <Check className="w-4 h-4 text-text-main" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
