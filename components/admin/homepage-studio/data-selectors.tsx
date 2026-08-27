"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Check,
  Package,
  Grid,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Star,
  Award,
  Zap,
  Tag,
  Clock,
  Heart,
  Gift,
} from "lucide-react";

export const ICON_OPTIONS = [
  { name: "ShieldCheck", icon: ShieldCheck, label: "Orijinal Ürün" },
  { name: "Truck", icon: Truck, label: "Hızlı Teslimat" },
  { name: "CreditCard", icon: CreditCard, label: "Güvenli Ödeme" },
  { name: "RotateCcw", icon: RotateCcw, label: "Kolay İade" },
  { name: "Star", icon: Star, label: "Yüksek Puan" },
  { name: "Award", icon: Award, label: "Resmi Marka" },
  { name: "Zap", icon: Zap, label: "Flaş Fırsat" },
  { name: "Tag", icon: Tag, label: "İndirim" },
  { name: "Clock", icon: Clock, label: "7/24 Destek" },
  { name: "Heart", icon: Heart, label: "Favori" },
  { name: "Gift", icon: Gift, label: "Hediye Çeki" },
  { name: "Sparkles", icon: Sparkles, label: "Özel Koleksiyon" },
];

export const IconPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  selectedIcon?: string;
  isEn?: boolean;
}> = ({ isOpen, onClose, onSelectIcon, selectedIcon, isEn = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Select Badge Icon" : "Rozet İkonu Seç"}
      size="md"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-2">
        {ICON_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedIcon === opt.name;

          return (
            <button
              key={opt.name}
              type="button"
              onClick={() => {
                onSelectIcon(opt.name);
                onClose();
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold truncate max-w-full">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export const ProductSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onSave: (ids: string[]) => void;
  isEn?: boolean;
}> = ({ isOpen, onClose, selectedProductIds, onSave, isEn = false }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedProductIds || []);

  const mockProducts = [
    { id: "p1", name: "Nike Air Max Pulse", category: "Ayakkabı", price: "4.299 TL" },
    { id: "p2", name: "Oversize Pamuklu Gömlek", category: "Giyim", price: "799 TL" },
    { id: "p3", name: "Apple AirPods Pro 2", category: "Elektronik", price: "8.499 TL" },
    { id: "p4", name: "Dyson V15 Şarjlı Süpürge", category: "Ev & Yaşam", price: "24.999 TL" },
    { id: "p5", name: "Stanley Termos 1.3L", category: "Spor & Outdoor", price: "1.899 TL" },
    { id: "p6", name: "L'Oréal C Vitamini Serumu", category: "Kozmetik", price: "450 TL" },
  ];

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Select Manual Products" : "Manuel Ürünleri Seç"}
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search products..." : "Ürün adı veya kategori ara..."}
            className="pl-9 text-xs"
          />
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
          {mockProducts.map((p) => {
            const isChecked = selected.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-900">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.category} • {p.price}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-medium">
            {selected.length} {isEn ? "products selected" : "ürün seçildi"}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onSave(selected);
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isEn ? "Apply Selection" : "Seçimi Kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const CategorySelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryIds: string[];
  onSave: (ids: string[]) => void;
  isEn?: boolean;
}> = ({ isOpen, onClose, selectedCategoryIds, onSave, isEn = false }) => {
  const [selected, setSelected] = useState<string[]>(selectedCategoryIds || []);

  const categories = [
    { id: "c1", name: "Kadın Giyim & Moda" },
    { id: "c2", name: "Erkek Giyim & Moda" },
    { id: "c3", name: "Ayakkabı & Çanta" },
    { id: "c4", name: "Elektronik & Aksesuar" },
    { id: "c5", name: "Ev, Yaşam & Mutfak" },
    { id: "c6", name: "Kozmetik & Kişisel Bakım" },
    { id: "c7", name: "Spor & Outdoor" },
    { id: "c8", name: "Süpermarket & Gıda" },
  ];

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Select Categories" : "Kategorileri Seç"}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
          {categories.map((c) => {
            const isChecked = selected.includes(c.id);

            return (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-xs text-slate-900">{c.name}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-medium">
            {selected.length} {isEn ? "categories selected" : "kategori seçildi"}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onSave(selected);
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isEn ? "Apply Selection" : "Seçimi Kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
