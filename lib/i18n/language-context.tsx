"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Currency, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, CURRENCY_STORAGE_KEY } from "./config";
import { tr } from "./translations/tr";
import { en } from "./translations/en";

const translations = { tr, en };

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<Currency>("TRY");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let initialLang: Language = DEFAULT_LANGUAGE;

    // Check localStorage first
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLang === "tr" || savedLang === "en") {
        initialLang = savedLang;
      } else {
        // Check cookie
        const match = document.cookie.match(/(^|;)\s*cadde_lang\s*=\s*([^;]+)/);
        if (match && (match[2] === "tr" || match[2] === "en")) {
          initialLang = match[2] as Language;
        }
      }

      setLanguageState(initialLang);
      document.documentElement.lang = initialLang;

      const savedCurr = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency;
      if (savedCurr === "TRY" || savedCurr === "USD") {
        setCurrencyState(savedCurr);
      }

      // Listen to cross-tab storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === LANGUAGE_STORAGE_KEY && (e.newValue === "tr" || e.newValue === "en")) {
          setLanguageState(e.newValue as Language);
          document.documentElement.lang = e.newValue;
        }
        if (e.key === CURRENCY_STORAGE_KEY && (e.newValue === "TRY" || e.newValue === "USD")) {
          setCurrencyState(e.newValue as Currency);
        }
      };

      // Custom window event listener for in-app instant sync
      const handleCustomEvent = (e: any) => {
        if (e.detail === "tr" || e.detail === "en") {
          setLanguageState(e.detail);
          document.documentElement.lang = e.detail;
        }
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("cadde_language_changed", handleCustomEvent);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("cadde_language_changed", handleCustomEvent);
      };
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.cookie = `cadde_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent("cadde_language_changed", { detail: lang }));
    }
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
      document.cookie = `cadde_curr=${curr}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = translations[language] || translations[DEFAULT_LANGUAGE];
    const keys = key.split(".");
    let value: any = currentDict;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to Turkish if key is missing in target language
        let fallbackVal: any = translations[DEFAULT_LANGUAGE];
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          } else {
            return key;
          }
        }
        value = fallbackVal;
        break;
      }
    }

    if (typeof value !== "string") return key;

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        value = value.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, currency, setLanguage, setCurrency, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
