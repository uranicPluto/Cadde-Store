"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DetailedProductMock } from "../catalog/product-repository";

const RECENTLY_VIEWED_STORAGE_KEY = "cadde-store-recently-viewed";
const MAX_RECENT_ITEMS = 8;

interface RecentlyViewedContextType {
  recentlyViewed: DetailedProductMock[];
  addRecentlyViewed: (product: DetailedProductMock) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<DetailedProductMock[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (saved) {
        setRecentlyViewed(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load recently viewed from localStorage", e);
    }
  }, []);

  const addRecentlyViewed = (product: DetailedProductMock) => {
    const filtered = recentlyViewed.filter((item) => item.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    setRecentlyViewed(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recently viewed to localStorage", e);
      }
    }
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = (): RecentlyViewedContextType => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
};
