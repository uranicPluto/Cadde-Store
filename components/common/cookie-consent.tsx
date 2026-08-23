"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CookieConsent: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cadde_cookie_consent");
      const hasCookie = document.cookie.includes("cadde_cookie_consent=");
      if (!stored && !hasCookie) {
        // Small delay for smooth entry animation
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked in private browsing
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("cadde_cookie_consent", "all");
      document.cookie = "cadde_cookie_consent=all; path=/; max-age=31536000; SameSite=Lax";
    } catch (e) {
      console.warn("Storage error saving consent:", e);
    }
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("cadde_cookie_consent", "essential");
      document.cookie = "cadde_cookie_consent=essential; path=/; max-age=31536000; SameSite=Lax";
    } catch (e) {
      console.warn("Storage error saving consent:", e);
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem("cadde_cookie_consent", "dismissed");
    } catch (e) {
      console.warn("Storage error saving consent:", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label={isEn ? "Cookie Consent and Privacy Policy" : "Çerez Politikası ve KVKK Aydınlatması"}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 select-none"
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-800 flex flex-col gap-4">
        {/* Header Title Bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{isEn ? "Cookie Policy & Privacy" : "Çerez Politikası & KVKK"}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {isEn ? "Cadde Store Transparency" : "Cadde Store Güvencesi"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label={isEn ? "Close banner" : "Bildirimi Kapat"}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Text Body */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {isEn
            ? "We use essential and analytical cookies to personalize your shopping experience, analyze site traffic, and support secure checkout. You can adjust your preferences anytime."
            : "Sizlere daha iyi bir alışveriş deneyimi sunmak, site trafiğimizi analiz etmek ve güvenli ödeme süreçlerini sağlamak için çerezler (cookies) kullanıyoruz. Tercihlerinizi dilediğiniz zaman değiştirebilirsiniz."}{" "}
          <Link
            href="/kvkk"
            className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
          >
            {isEn ? "KVKK & Cookie Policy" : "KVKK ve Çerez Politikası"}
          </Link>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAcceptAll}
            className="w-full sm:flex-1 font-black text-xs py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs justify-center cursor-pointer"
          >
            {isEn ? "Accept All" : "Tümünü Kabul Et"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEssentialOnly}
            className="w-full sm:flex-1 font-bold text-xs py-2 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl justify-center cursor-pointer"
          >
            {isEn ? "Essential Only" : "Zorunlu Çerezler"}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
