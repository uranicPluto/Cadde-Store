"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Filter, RotateCcw, ChevronDown, ChevronUp, Star, Truck, ShieldCheck, Tag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface FilterState {
  categories: string[];
  subcategories: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  minRating: number;
  fastDeliveryOnly: boolean;
  freeShippingOnly: boolean;
  selectedColors: string[];
  selectedSizes: string[];
  selectedMaterials: string[];
}

export interface FilterSidebarProps {
  categorySlug?: string;
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface CategoryFilterConfig {
  title: string;
  subcategories: string[];
  brands: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  materials: string[];
  specLabel?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categorySlug, onFilterChange, className }) => {
  const { t, currency, language } = useLanguage();
  const isEn = language === "en";
  const currLabel = currency === "USD" ? "$" : "TL";

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    brands: [],
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    fastDeliveryOnly: false,
    freeShippingOnly: false,
    selectedColors: [],
    selectedSizes: [],
    selectedMaterials: [],
  });

  // Section Collapsible States
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // CATEGORY-SPECIFIC RESEARCHED FILTER CONFIGURATIONS
  const getCategoryConfig = (slug?: string): CategoryFilterConfig => {
    const s = slug?.toLowerCase().trim() || "all";

    if (s === "women" || s === "kadin") {
      return {
        title: isEn ? "Women's Fashion Filters" : "Kadın Giyim Filtreleri",
        subcategories: isEn
          ? ["Dresses", "T-Shirts & Tops", "Coats & Jackets", "Trousers & Jeans", "Skirts", "Knitwear & Cardigans", "Blouses"]
          : ["Elbiseler", "Tişörtler & Bluzlar", "Ceket & Mont", "Pantolon & Jean", "Etekler", "Triko & Hırka", "Bluzlar"],
        brands: ["Zara", "Mango", "Stradivarius", "Pull&Bear", "Bershka", "H&M", "Koton", "IPEKYOL", "Twist", "Oysho"],
        sizes: ["XS", "S", "M", "L", "XL", "34", "36", "38", "40", "42"],
        colors: [
          { name: isEn ? "Burgundy" : "Bordo", hex: "#701a24" },
          { name: isEn ? "Cream" : "Krem", hex: "#f5f5dc" },
          { name: isEn ? "White" : "Beyaz", hex: "#ffffff" },
          { name: isEn ? "Black" : "Siyah", hex: "#000000" },
          { name: isEn ? "Brown" : "Kahverengi", hex: "#654321" },
          { name: isEn ? "Blue" : "Mavi", hex: "#2563eb" },
          { name: isEn ? "Ecru" : "Ekru", hex: "#c2b280" },
          { name: isEn ? "Pink" : "Pembe", hex: "#ec4899" },
        ],
        materials: isEn
          ? ["100% Cotton", "Linen", "Chiffon", "Satin", "Wool Blend", "Faux Leather", "Denim", "Knitwear"]
          : ["%100 Pamuk", "Keten", "Şifon", "Saten", "Kaşe Yün", "Suni Deri", "Denim", "Triko"],
        specLabel: isEn ? "Fabric & Material" : "Kumaş & Materyal",
      };
    }

    if (s === "men" || s === "erkek") {
      return {
        title: isEn ? "Men's Fashion Filters" : "Erkek Giyim Filtreleri",
        subcategories: isEn
          ? ["T-Shirts", "Shirts", "Trousers & Chinos", "Sweatshirts & Hoodies", "Coats & Jackets", "Suits", "Sportswear"]
          : ["Tişörtler", "Gömlekler", "Pantolon & Chino", "Sweatshirt & Hoodie", "Ceket & Mont", "Takım Elbise", "Spor Giyim"],
        brands: ["Zara", "Massimo Dutti", "Nike", "Pull&Bear", "Lacoste", "Levi's", "Adidas", "Beymen", "Mavi", "Jack & Jones"],
        sizes: ["S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38"],
        colors: [
          { name: isEn ? "Black" : "Siyah", hex: "#000000" },
          { name: isEn ? "White" : "Beyaz", hex: "#ffffff" },
          { name: isEn ? "Navy" : "Lacivert", hex: "#1e3a8a" },
          { name: isEn ? "Grey" : "Gri", hex: "#6b7280" },
          { name: isEn ? "Brown" : "Kahverengi", hex: "#5c4033" },
          { name: isEn ? "Green" : "Yeşil", hex: "#15803d" },
          { name: isEn ? "Khaki" : "Haki", hex: "#556b2f" },
        ],
        materials: isEn
          ? ["Combed Cotton", "Linen", "Fleece", "Wool Blend", "Genuine Sheepskin", "Pique Cotton", "Denim"]
          : ["%100 Pamuk", "Keten", "Şardonlu Pamuk", "Kaşe Yün", "Hakiki Deri", "Pike Pamuk", "Denim"],
        specLabel: isEn ? "Fabric Type" : "Kumaş Tipi",
      };
    }

    if (s === "electronics" || s === "elektronik") {
      return {
        title: isEn ? "Electronics & Tech Filters" : "Elektronik & Teknoloji Filtreleri",
        subcategories: isEn
          ? ["Smartphones", "Headphones", "Smart TVs", "Laptops", "Smartwatches", "Robot Vacuums", "Tablets"]
          : ["Cep Telefonları", "Kulaklıklar", "Televizyonlar", "Bilgisayarlar & Laptop", "Akıllı Saatler", "Robot Süpürgeler", "Tabletler"],
        brands: ["Apple", "Samsung", "Sony", "Asus", "LG", "Xiaomi", "Dyson", "Philips", "Lenovo", "Bose"],
        sizes: ["128 GB", "256 GB", "512 GB", "1 TB", "8 GB RAM", "12 GB RAM", "16 GB RAM", "18 GB RAM"],
        colors: [
          { name: isEn ? "Natural Titanium" : "Doğal Titanyum", hex: "#9a9a9a" },
          { name: isEn ? "Space Black" : "Uzay Siyahı", hex: "#111111" },
          { name: isEn ? "White" : "Beyaz", hex: "#ffffff" },
          { name: isEn ? "Sky Blue" : "Gök Mavi", hex: "#38bdf8" },
        ],
        materials: isEn
          ? ["A17 Pro / M3 Pro", "OLED evo / QLED 4K", "Active Noise Canceling (ANC)", "120Hz Refresh", "5G Cellular", "4000Pa Suction"]
          : ["A17 Pro / M3 Pro", "OLED evo / QLED 4K", "Aktif Gürültü Engelleme (ANC)", "120Hz Ekran", "5G Bağlantı", "4000Pa Emiş"],
        specLabel: isEn ? "Key Features & Panel" : "Özellik & Ekran Tipi",
      };
    }

    if (s === "shoes-bags" || s === "ayakkabi-canta") {
      return {
        title: isEn ? "Shoes & Bags Filters" : "Ayakkabı & Çanta Filtreleri",
        subcategories: isEn
          ? ["Sneakers & Running", "Handbags & Totes", "Boots & Ankle Boots", "Heels", "Backpacks", "Wallets"]
          : ["Spor Ayakkabı & Sneaker", "Omuz Çantası", "Bot & Çizme", "Topuklu Ayakkabı", "Sırt Çantası", "Cüzdan"],
        brands: ["Nike", "Adidas", "Puma", "Converse", "Pierre Cardin", "Nine West", "Calvin Klein", "Vans", "Skechers"],
        sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
        colors: [
          { name: isEn ? "Black" : "Siyah", hex: "#000000" },
          { name: isEn ? "White" : "Beyaz", hex: "#ffffff" },
          { name: isEn ? "Red" : "Kırmızı", hex: "#dc2626" },
          { name: isEn ? "Tan / Brown" : "Taba / Kahve", hex: "#8b4513" },
          { name: isEn ? "Nude / Beige" : "Ten / Bej", hex: "#d2b48c" },
        ],
        materials: isEn
          ? ["Genuine Leather", "Faux Leather", "Suede", "Canvas", "Air Cushion", "EVA Rubber"]
          : ["Hakiki Deri", "Suni Deri", "Süet", "Bez / Kanvas", "Air Hava Yastıklı", "Kauçuk Taban"],
        specLabel: isEn ? "Upper & Sole Material" : "Malzeme & Taban",
      };
    }

    if (s === "home-living" || s === "ev-yasam") {
      return {
        title: isEn ? "Home & Living Filters" : "Ev & Yaşam Filtreleri",
        subcategories: isEn
          ? ["Cookware Sets", "Airfryers & Fryers", "Home Decor", "Kitchen Tools", "Bedding & Bedspreads"]
          : ["Tencere Setleri", "Airfryer & Fritöz", "Ev Dekorasyon", "Mutfak Gereçleri", "Nevresim & Yatak"],
        brands: ["Karaca", "Tefal", "Philips", "Schafer", "Emsan", "English Home", "Madame Coco", "Korkmaz", "IKEA"],
        sizes: ["2.5 Litre", "3.5 Litre", "5.5 Litre", "6.5 Litre", "2 Person", "4 Person", "6 Person"],
        colors: [
          { name: isEn ? "Inox / Silver" : "İnoks / Gümüş", hex: "#94a3b8" },
          { name: isEn ? "Black" : "Siyah", hex: "#000000" },
          { name: isEn ? "White" : "Beyaz", hex: "#ffffff" },
          { name: isEn ? "Rose Gold" : "Rose Gold", hex: "#b76e79" },
        ],
        materials: isEn
          ? ["Bio Granit", "Cast Iron", "18/10 Stainless Steel", "Borosilicate Glass", "Porcelain"]
          : ["Bio Granit", "Döküm Demir", "18/10 Paslanmaz Çelik", "Borosilikat Cam", "Porselen"],
        specLabel: isEn ? "Material & Coating" : "Malzeme & Kaplama",
      };
    }

    if (s === "beauty-care" || s === "kozmetik") {
      return {
        title: isEn ? "Beauty & Care Filters" : "Kozmetik & Bakım Filtreleri",
        subcategories: isEn
          ? ["Skincare & Serums", "Perfumes & EDP", "Haircare & Oils", "Makeup", "Bath & Body"]
          : ["Cilt Bakımı & Serum", "Parfüm & EDP", "Saç Bakımı & Yağlar", "Makyaj", "Duş & Vücut"],
        brands: ["L'Oreal Paris", "La Roche-Posay", "The Ordinary", "Estée Lauder", "Yves Rocher", "Nivea", "CeraVe", "Bibimcos", "Embeauty"],
        sizes: ["30 ml", "50 ml", "100 ml", "160g", "250 ml", "400 ml"],
        colors: [
          { name: isEn ? "Clear" : "Şeffaf", hex: "#e2e8f0" },
          { name: isEn ? "Natural Tone" : "Doğal Ton", hex: "#fde68a" },
        ],
        materials: isEn
          ? ["Hyaluronic Acid", "Vitamin C", "Collagen & Prebiotics", "9-Active Serum", "Keratin", "Niacinamide"]
          : ["Hyaluronik Asit", "C Vitamini", "Kolajen & Prebiyotik", "9-Aktifli Serum", "Keratin", "Niasinamid"],
        specLabel: isEn ? "Active Ingredient" : "Etken Madde",
      };
    }

    if (s === "sports-outdoor" || s === "spor") {
      return {
        title: isEn ? "Sports & Outdoor Filters" : "Spor & Outdoor Filtreleri",
        subcategories: isEn
          ? ["Fitness & Gym", "Camping & Hiking", "Sportswear", "Bikes & Roller Skates", "Sports Equipment"]
          : ["Fitness & Egzersiz", "Kamp & Outdoor", "Spor Giyim", "Bisiklet & Paten", "Spor Ekipmanı"],
        brands: ["Decathlon", "Columbia", "The North Face", "Salomon", "Puma", "Under Armour", "Nike", "Adidas"],
        sizes: ["S", "M", "L", "XL", "40", "41", "42", "43", "44"],
        colors: [
          { name: isEn ? "Black" : "Siyah", hex: "#000000" },
          { name: isEn ? "Neon Orange" : "Neon Turuncu", hex: "#f97316" },
          { name: isEn ? "Navy" : "Lacivert", hex: "#1d4ed8" },
        ],
        materials: isEn
          ? ["Waterproof Gore-Tex", "Windproof Thermal", "Breathable Mesh", "UV Protection"]
          : ["Su Geçirmez Gore-Tex", "Rüzgar Korumalı Termal", "Nefes Alabilir Mesh", "UV Korumalı"],
        specLabel: isEn ? "Technical Specs" : "Teknik Özellikler",
      };
    }

    if (s === "supermarket") {
      return {
        title: isEn ? "Supermarket Filters" : "Süpermarket Filtreleri",
        subcategories: isEn
          ? ["Staple Foods & Grains", "Snacks & Chocolates", "Beverages & Coffee", "Cleaning & Detergent"]
          : ["Temel Gıda & Bakliyat", "Atıştırmalık & Çikolata", "İçecekler & Kahve", "Temizlik & Deterjan"],
        brands: ["Ülker", "Eti", "Nescafe", "Lipton", "Pınar", "Yayla", "Fairy", "Ariel", "MOMORDİCA"],
        sizes: ["250 ml", "500g", "1 kg", "2 kg", "5 Litre", "12 Pack"],
        colors: [],
        materials: isEn
          ? ["Organic", "Gluten-Free", "Sugar-Free", "Vegan", "Halal Certified"]
          : ["Organik", "Glütensiz", "Şekersiz", "Vegan", "Helal Sertifikalı"],
        specLabel: isEn ? "Dietary Preference" : "Beslenme & Diyet Tipi",
      };
    }

    // Default General Catalog Filters
    return {
      title: isEn ? "All Catalog Filters" : "Tüm Katalog Filtreleri",
      subcategories: [
        t("categories.kadin"),
        t("categories.erkek"),
        t("categories.ayakkabi-canta"),
        t("categories.elektronik"),
        t("categories.ev-yasam"),
        t("categories.kozmetik"),
      ],
      brands: ["Nike", "Zara", "Apple", "Samsung", "Karaca", "Mango", "Polo Club", "L'Oreal", "Adidas", "Puma"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "128 GB", "256 GB"],
      colors: [
        { name: isEn ? "Black" : "Siyah", hex: "#000000" },
        { name: isEn ? "White" : "Beyaz", hex: "#ffffff" },
        { name: isEn ? "Red" : "Kırmızı", hex: "#ef4444" },
        { name: isEn ? "Blue" : "Mavi", hex: "#3b82f6" },
      ],
      materials: ["%100 Pamuk", "Keten", "Hakiki Deri", "Bio Granit", "A17 Pro", "Hyaluronik Asit"],
      specLabel: isEn ? "Product Features" : "Ürün Özellikleri",
    };
  };

  const config = getCategoryConfig(categorySlug);

  const handleSubcategoryToggle = (sub: string) => {
    const updated = filters.subcategories.includes(sub)
      ? filters.subcategories.filter((s) => s !== sub)
      : [...filters.subcategories, sub];
    const newFilters = { ...filters, subcategories: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    const newFilters = { ...filters, brands: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSizeToggle = (sz: string) => {
    const updated = filters.selectedSizes.includes(sz)
      ? filters.selectedSizes.filter((s) => s !== sz)
      : [...filters.selectedSizes, sz];
    const newFilters = { ...filters, selectedSizes: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleColorToggle = (col: string) => {
    const updated = filters.selectedColors.includes(col)
      ? filters.selectedColors.filter((c) => c !== col)
      : [...filters.selectedColors, col];
    const newFilters = { ...filters, selectedColors: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleMaterialToggle = (mat: string) => {
    const updated = filters.selectedMaterials.includes(mat)
      ? filters.selectedMaterials.filter((m) => m !== mat)
      : [...filters.selectedMaterials, mat];
    const newFilters = { ...filters, selectedMaterials: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      categories: [],
      subcategories: [],
      brands: [],
      minPrice: "",
      maxPrice: "",
      minRating: 0,
      fastDeliveryOnly: false,
      freeShippingOnly: false,
      selectedColors: [],
      selectedSizes: [],
      selectedMaterials: [],
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  return (
    <div className={cn("w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-5 text-sm shadow-sm select-none", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span>{config.title}</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("filters.reset")}</span>
        </button>
      </div>

      {/* Subcategory Specific Filter Section */}
      {config.subcategories.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("subcategories")}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
              {isEn ? "Subcategories" : "Alt Kategoriler"}
            </h4>
            {collapsed["subcategories"] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
          {!collapsed["subcategories"] && (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {config.subcategories.map((sub) => (
                <Checkbox
                  key={sub}
                  label={sub}
                  checked={filters.subcategories.includes(sub)}
                  onChange={() => handleSubcategoryToggle(sub)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brand Specific Filter Section */}
      {config.brands.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("brands")}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
              {t("filters.brands")}
            </h4>
            {collapsed["brands"] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
          {!collapsed["brands"] && (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {config.brands.map((b) => (
                <Checkbox
                  key={b}
                  label={b}
                  checked={filters.brands.includes(b)}
                  onChange={() => handleBrandToggle(b)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range Filter */}
      <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
        <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
          {t("filters.priceRange", { currency: currLabel })}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("filters.minPrice", { currency: currLabel })}
            value={filters.minPrice}
            onChange={(e) => {
              const newFilters = { ...filters, minPrice: e.target.value };
              setFilters(newFilters);
              onFilterChange?.(newFilters);
            }}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-semibold"
          />
          <span className="text-slate-300 font-bold">-</span>
          <input
            type="number"
            placeholder={t("filters.maxPrice", { currency: currLabel })}
            value={filters.maxPrice}
            onChange={(e) => {
              const newFilters = { ...filters, maxPrice: e.target.value };
              setFilters(newFilters);
              onFilterChange?.(newFilters);
            }}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-semibold"
          />
        </div>
      </div>

      {/* Category Size / Dimension Filter */}
      {config.sizes.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("sizes")}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
              {isEn ? "Size / Dimension" : "Beden / Ölçü / Hafıza"}
            </h4>
            {collapsed["sizes"] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
          {!collapsed["sizes"] && (
            <div className="flex flex-wrap gap-1.5">
              {config.sizes.map((sz) => {
                const isSelected = filters.selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSizeToggle(sz)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#f27a1a] text-white border-[#f27a1a] shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                    )}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Color Visual Swatches Filter */}
      {config.colors.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("colors")}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
              {isEn ? "Color Options" : "Renk Seçenekleri"}
            </h4>
            {collapsed["colors"] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
          {!collapsed["colors"] && (
            <div className="flex flex-wrap gap-2">
              {config.colors.map((c) => {
                const isSelected = filters.selectedColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColorToggle(c.name)}
                    title={c.name}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Category Researched Material / Spec Filter */}
      {config.materials.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("materials")}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
              {config.specLabel || (isEn ? "Specifications" : "Teknik Özellikler")}
            </h4>
            {collapsed["materials"] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
          {!collapsed["materials"] && (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {config.materials.map((mat) => (
                <Checkbox
                  key={mat}
                  label={mat}
                  checked={filters.selectedMaterials.includes(mat)}
                  onChange={() => handleMaterialToggle(mat)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advantage & Delivery Options Filter */}
      <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
        <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
          {t("filters.deliveryOptions")}
        </h4>
        <Checkbox
          label={t("filters.fastDelivery")}
          checked={filters.fastDeliveryOnly}
          onChange={(e) => {
            const newFilters = { ...filters, fastDeliveryOnly: e.target.checked };
            setFilters(newFilters);
            onFilterChange?.(newFilters);
          }}
        />
        <Checkbox
          label={t("filters.freeShipping")}
          checked={filters.freeShippingOnly}
          onChange={(e) => {
            const newFilters = { ...filters, freeShippingOnly: e.target.checked };
            setFilters(newFilters);
            onFilterChange?.(newFilters);
          }}
        />
        <button
          type="button"
          onClick={() => {
            const newRating = filters.minRating === 4.5 ? 0 : 4.5;
            const newFilters = { ...filters, minRating: newRating };
            setFilters(newFilters);
            onFilterChange?.(newFilters);
          }}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer w-fit mt-1",
            filters.minRating === 4.5
              ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400"
          )}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{isEn ? "4.5+ Rated Products" : "4.5 ve Üzeri Puanlılar"}</span>
        </button>
      </div>
    </div>
  );
};
