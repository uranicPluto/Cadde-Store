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
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (savedLang === "tr" || savedLang === "en") {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      document.documentElement.lang = DEFAULT_LANGUAGE;
    }

    const savedCurr = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency;
    if (savedCurr === "TRY" || savedCurr === "USD") {
      setCurrencyState(savedCurr);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
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
