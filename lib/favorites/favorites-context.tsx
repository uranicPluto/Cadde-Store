"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const FAVORITES_STORAGE_KEY = "cadde-store-favorites";

interface FavoritesContextType {
  favorites: string[]; // array of product IDs
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoriteCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(["p1", "p2", "p3", "p7"]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
    }
  }, []);

  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavs));
      } catch (e) {
        console.error("Failed to save favorites to localStorage", e);
      }
    }
  };

  const toggleFavorite = (productId: string) => {
    const isFav = favorites.includes(productId);
    const updated = isFav
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    saveFavorites(updated);
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoriteCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
