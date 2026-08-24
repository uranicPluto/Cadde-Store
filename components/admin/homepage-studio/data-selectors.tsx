"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Search, Check, ShoppingCart, Tag, Store, Award, X, Truck, ShieldCheck, CreditCard, RotateCcw, Sparkles, Clock, Gift, Zap, Heart, Headphones, PackageCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// 1. PRODUCT SELECTOR MODAL
interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onSave: (ids: string[]) => void;
  isEn?: boolean;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedProductIds,
  onSave,
  isEn = false,
}) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedProductIds || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedProductIds || []);
      fetchProducts();
    }
  }, [isOpen, selectedProductIds]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nameTR?.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEN?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Select Products for Merchandising" : "Vitrin İçin Ürün Seçin"}
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search by product name, SKU, or brand..." : "Ürün adı, SKU veya marka ile ara..."}
            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        {/* Selected Count Indicator */}
        <div className="flex items-center justify-between text-slate-500 font-bold px-1">
          <span>{selectedIds.length} {isEn ? "products selected" : "ürün seçildi"}</span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-rose-600 hover:underline"
            >
              {isEn ? "Clear All" : "Tümünü Temizle"}
            </button>
          )}
        </div>

        {/* Product List */}
        <div className="max-h-72 overflow-y-auto flex flex-col gap-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
          {loading ? (
            <div className="py-8 text-center text-slate-400 font-bold">{isEn ? "Loading catalog..." : "Katalog yükleniyor..."}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-bold">{isEn ? "No matching products found." : "Eşleşen ürün bulunamadı."}</div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80"}
                      alt={p.nameTR}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 truncate">
                        {isEn ? p.nameEN || p.nameTR : p.nameTR}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-semibold">{p.brand?.name || "Cadde Store"}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600">₺{p.price?.toLocaleString("tr-TR")}</span>
                        <span>•</span>
                        <span>Stok: {p.stock ?? 25}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl font-bold">
            {isEn ? "Cancel" : "Vazgeç"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(selectedIds);
              onClose();
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black"
          >
            {isEn ? "Apply Selection" : "Seçimi Uygula"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 2. CATEGORY SELECTOR MODAL
interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryIds: string[];
  onSave: (ids: string[]) => void;
  isEn?: boolean;
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCategoryIds,
  onSave,
  isEn = false,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCategoryIds || []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedCategoryIds || []);
      fetchCategories();
    }
  }, [isOpen, selectedCategoryIds]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Select Categories" : "Kategori Seçin"}
    >
      <div className="flex flex-col gap-4 text-xs">
        <div className="max-h-72 overflow-y-auto grid grid-cols-2 gap-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
          {categories.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-purple-50 border-purple-600 ring-1 ring-purple-600"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-bold text-slate-800 truncate">
                    {isEn ? c.nameEN || c.nameTR : c.nameTR}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                    isSelected
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl font-bold">
            {isEn ? "Cancel" : "Vazgeç"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(selectedIds);
              onClose();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black"
          >
            {isEn ? "Save Categories" : "Kategorileri Kaydet"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 3. ICON PICKER MODAL
interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  isEn?: boolean;
}

export const ICON_OPTIONS = [
  { name: "Truck", icon: Truck, label: "Hızlı Kargo" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Güvenli Alışveriş" },
  { name: "CreditCard", icon: CreditCard, label: "Taksit İmkânı" },
  { name: "RotateCcw", icon: RotateCcw, label: "Kolay İade" },
  { name: "Sparkles", icon: Sparkles, label: "Fırsat & Avantaj" },
  { name: "Clock", icon: Clock, label: "7/24 Destek" },
  { name: "Gift", icon: Gift, label: "Hediye Paketi" },
  { name: "Zap", icon: Zap, label: "Anında Teslimat" },
  { name: "Heart", icon: Heart, label: "Favori Ürünler" },
  { name: "Headphones", icon: Headphones, label: "Canlı Müşteri Hizmetleri" },
  { name: "PackageCheck", icon: PackageCheck, label: "Orijinal Ürün Garantisi" },
  { name: "Star", icon: Star, label: "Puanlı Müşteri Değerlendirmesi" },
];

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  isEn = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Choose Icon" : "İkon Seçin"}
    >
      <div className="grid grid-cols-3 gap-2 p-1 text-xs">
        {ICON_OPTIONS.map((opt) => {
          const IconComp = opt.icon;
          return (
            <button
              key={opt.name}
              type="button"
              onClick={() => {
                onSelectIcon(opt.name);
                onClose();
              }}
              className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-600 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-slate-700 hover:text-indigo-600"
            >
              <IconComp className="w-6 h-6 text-indigo-600" />
              <span className="text-[10px] font-bold text-center">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
