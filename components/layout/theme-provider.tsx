"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  AppearanceSettingsDTO,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  deriveCssVariables,
  HeaderConfig,
  FooterConfig,
} from "@/lib/appearance/appearance-repository";

interface ThemeContextType {
  settings: AppearanceSettingsDTO;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  cssVariables: Record<string, string>;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
  updateLocalPreview: (override: Partial<AppearanceSettingsDTO>) => void;
}

const defaultInitialDTO: AppearanceSettingsDTO = {
  ...DEFAULT_APPEARANCE_SETTINGS,
  updatedAt: new Date().toISOString(),
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultInitialDTO,
  headerConfig: DEFAULT_HEADER_CONFIG,
  footerConfig: DEFAULT_FOOTER_CONFIG,
  cssVariables: deriveCssVariables(defaultInitialDTO),
  isLoading: false,
  refreshTheme: async () => {},
  updateLocalPreview: () => {},
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialSettings?: AppearanceSettingsDTO;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<AppearanceSettingsDTO>(
    initialSettings || defaultInitialDTO
  );
  const [isLoading, setIsLoading] = useState(!initialSettings);

  const applyCssVariables = useCallback((currentSettings: AppearanceSettingsDTO) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const vars = deriveCssVariables(currentSettings);

    for (const [key, value] of Object.entries(vars)) {
      if (value) {
        root.style.setProperty(key, value);
      }
    }
  }, []);

  const refreshTheme = useCallback(async () => {
    try {
      const res = await fetch("/api/appearance");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          applyCssVariables(data.settings);
        }
      }
    } catch (err) {
      console.warn("[ThemeProvider] Could not fetch appearance settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [applyCssVariables]);

  const updateLocalPreview = useCallback((override: Partial<AppearanceSettingsDTO>) => {
    setSettings((prev) => {
      const merged: AppearanceSettingsDTO = {
        ...prev,
        ...override,
        headerConfig: {
          ...prev.headerConfig,
          ...(override.headerConfig || {}),
        },
        footerConfig: {
          ...prev.footerConfig,
          ...(override.footerConfig || {}),
        },
      };
      applyCssVariables(merged);
      return merged;
    });
  }, [applyCssVariables]);

  useEffect(() => {
    applyCssVariables(settings);
    refreshTheme();
  }, [applyCssVariables, refreshTheme]);

  const headerConfig = settings.headerConfig || DEFAULT_HEADER_CONFIG;
  const footerConfig = settings.footerConfig || DEFAULT_FOOTER_CONFIG;
  const cssVariables = deriveCssVariables(settings);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        headerConfig,
        footerConfig,
        cssVariables,
        isLoading,
        refreshTheme,
        updateLocalPreview,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}

export function useAppearance() {
  return useContext(ThemeContext);
}
