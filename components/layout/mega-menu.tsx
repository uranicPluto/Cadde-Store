"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CategoryData, getMockNavigationCategories } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { ChevronRight, Flame, Sparkles, ArrowRight, Tag, Gift, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface MegaMenuTreeItem {
  id: string;
  titleTr: string;
  titleEn: string;
  url: string;
  section: string;
  parentId?: string | null;
  sortOrder: number;
  badgeTr?: string | null;
  badgeEn?: string | null;
  isActive: boolean;
  deviceVisibility?: string;
  itemType?: string;
  imageUrl?: string | null;
  descriptionTr?: string | null;
  descriptionEn?: string | null;
  ctaTextTr?: string | null;
  ctaTextEn?: string | null;
  targetUrl?: string | null;
  children?: MegaMenuTreeItem[];
}

export interface MegaMenuProps {
  category?: CategoryData;
  allCategories?: CategoryData[];
  customTree?: MegaMenuTreeItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  allCategories,
  customTree,
  isOpen,
  onClose,
  className,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>(
    allCategories || getMockNavigationCategories(language)
  );
  const [navTree, setNavTree] = useState<MegaMenuTreeItem[]>(customTree || []);

  useEffect(() => {
    if (allCategories && allCategories.length > 0) {
      setCategoriesList(allCategories);
    }
    if (customTree && customTree.length > 0) {
      setNavTree(customTree);
    }

    async function loadNavigation() {
      try {
        const res = await fetch(`/api/navigation?lang=${language}&section=MEGA_MENU&device=DESKTOP`);
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories);
        } else if (!allCategories) {
          setCategoriesList(getMockNavigationCategories(language));
        }

        if (data.tree && Array.isArray(data.tree) && data.tree.length > 0) {
          const megaTree = data.tree.filter((node: any) => node.section === "MEGA_MENU");
          if (megaTree.length > 0) {
            setNavTree(megaTree);
          }
        }
      } catch (err) {
        if (!allCategories) {
          setCategoriesList(getMockNavigationCategories(language));
        }
      }
    }

    loadNavigation();
  }, [allCategories, customTree, language]);

  // Handle selection of active top-level item
  const initialCat = category || categoriesList[0] || getMockNavigationCategories(language)[0];
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCat?.id || "cat-kadin");

  useEffect(() => {
    if (category?.id) {
      setSelectedCatId(category.id);
    } else if (navTree.length > 0) {
      setSelectedCatId(navTree[0].id);
    } else if (categoriesList.length > 0) {
      setSelectedCatId(categoriesList[0].id);
    }
  }, [category, categoriesList, navTree]);

  if (!isOpen) return null;

  // Check if we are rendering custom navigation tree or category fallback
  const hasCustomTree = navTree.length > 0;
  const activeCustomRoot = navTree.find((n) => n.id === selectedCatId) || navTree[0];
  const activeCat = categoriesList.find((c) => c.id === selectedCatId) || initialCat;

  // Helper slug generator for subcategory items
  const getSubSlug = (itemStr: string) => {
    const map: Record<string, string> = {
      Dresses: "dresses",
      Elbiseler: "dresses",
      "T-Shirts & Tank Tops": "tshirts",
      "Tişört & Atlet": "tshirts",
      "Coats & Jackets": "jackets",
      "Ceket & Mont": "jackets",
      Sneakers: "sneakers",
      "Spor Ayakkabı": "sneakers",
      "Shoulder Bags": "bags",
      "Omuz Çantası": "bags",
      Smartphones: "smartphones",
      "Cep Telefonları": "smartphones",
      Headphones: "headphones",
      Kulaklıklar: "headphones",
      "Cookware Sets": "cookware",
      "Tencere Setleri": "cookware",
      Skincare: "skincare",
      "Cilt Bakımı": "skincare",
    };
    return map[itemStr] || itemStr.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };

  // Promo card extraction from custom tree or active category
  const promoCardItem = hasCustomRootPromo(activeCustomRoot) || null;

  function hasCustomRootPromo(rootNode?: MegaMenuTreeItem) {
    if (!rootNode) return null;
    if (rootNode.itemType === "PROMO_CARD" || rootNode.imageUrl) {
      return rootNode;
    }
    // Search children
    for (const child of rootNode.children || []) {
      if (child.itemType === "PROMO_CARD" || child.imageUrl) {
        return child;
      }
      for (const grandChild of child.children || []) {
        if (grandChild.itemType === "PROMO_CARD" || grandChild.imageUrl) {
          return grandChild;
        }
      }
    }
    return null;
  }

  return (
    <div
      onMouseLeave={onClose}
      className={cn(
        "absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 border-t border-slate-100",
        className
      )}
    >
      <div className="max-w-wide mx-auto flex min-h-[380px] max-h-[540px]">
        {/* LEFT SIDEBAR PANEL: All Main Categories List */}
        <div className="w-60 bg-white border-r border-slate-100 py-3 flex flex-col shrink-0 overflow-y-auto max-h-[520px]">
          {hasCustomTree ? (
            navTree.map((node) => {
              const isSelected = node.id === activeCustomRoot?.id;
              const nodeTitle = isEn ? node.titleEn || node.titleTr : node.titleTr;
              const badgeText = isEn ? node.badgeEn || node.badgeTr : node.badgeTr;

              return (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setSelectedCatId(node.id)}
                  onClick={() => setSelectedCatId(node.id)}
                  className={cn(
                    "w-full px-5 py-2.5 text-left text-xs font-bold transition-all flex items-center justify-between group cursor-pointer",
                    isSelected
                      ? "bg-[#fff5ee] text-primary font-black"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Tag className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                    <span className="truncate">{nodeTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {badgeText && (
                      <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        {badgeText}
                      </span>
                    )}
                    {isSelected && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : (
            categoriesList.map((cat) => {
              const isSelected = cat.id === activeCat?.id;
              const catName = t(`categories.${cat.slug}`) || cat.name;
              const badgeText = isEn ? cat.badgeEN || (cat.isHot ? "HOT" : null) : cat.badgeTR || (cat.isHot ? "YENİ" : null);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onMouseEnter={() => setSelectedCatId(cat.id)}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={cn(
                    "w-full px-5 py-2.5 text-left text-xs font-bold transition-all flex items-center justify-between group cursor-pointer",
                    isSelected
                      ? "bg-[#fff5ee] text-primary font-black"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                    <span>{catName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {badgeText && (
                      <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        {badgeText}
                      </span>
                    )}
                    {isSelected && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* RIGHT PANEL: Multi-Column Subcategories & Promotional Banner */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[520px]">
          {hasCustomTree && activeCustomRoot ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* Level 2 Sub-groups */}
              {activeCustomRoot.children && activeCustomRoot.children.length > 0 ? (
                activeCustomRoot.children
                  .filter((child) => child.itemType !== "PROMO_CARD")
                  .map((subGroup) => {
                    const subGroupTitle = isEn ? subGroup.titleEn || subGroup.titleTr : subGroup.titleTr;
                    const subGroupBadge = isEn ? subGroup.badgeEn || subGroup.badgeTr : subGroup.badgeTr;

                    return (
                      <div key={subGroup.id} className="flex flex-col gap-2">
                        {/* Subcategory Header */}
                        <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center justify-between">
                          <Link
                            href={subGroup.url}
                            onClick={onClose}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>{subGroupTitle}</span>
                            {subGroupBadge && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.2 rounded">
                                {subGroupBadge}
                              </span>
                            )}
                          </Link>
                        </h4>

                        {/* Level 3 Child items */}
                        {subGroup.children && subGroup.children.length > 0 && (
                          <ul className="flex flex-col gap-1.5 pt-1 text-xs text-slate-700 font-medium">
                            {subGroup.children
                              .filter((c) => c.itemType !== "PROMO_CARD")
                              .map((item) => {
                                const itemTitle = isEn ? item.titleEn || item.titleTr : item.titleTr;
                                const itemBadge = isEn ? item.badgeEn || item.badgeTr : item.badgeTr;

                                return (
                                  <li key={item.id}>
                                    <Link
                                      href={item.url}
                                      onClick={onClose}
                                      className="hover:text-primary hover:font-bold transition-colors leading-tight flex items-center justify-between py-0.5"
                                    >
                                      <span>{itemTitle}</span>
                                      {itemBadge && (
                                        <span className="bg-rose-50 border border-rose-200 text-rose-600 text-[8px] font-black px-1 rounded uppercase">
                                          {itemBadge}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-3 flex flex-col gap-3 py-6">
                  <h3 className="font-black text-base text-slate-800">
                    {isEn ? activeCustomRoot.titleEn : activeCustomRoot.titleTr}
                  </h3>
                  <Link
                    href={activeCustomRoot.url}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                  >
                    <span>{isEn ? "Browse all in this collection" : "Bu koleksiyondaki tüm ürünleri incele"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Promotional Card from Custom Item */}
              {promoCardItem && (
                <div className="hidden lg:flex flex-col justify-between p-4 rounded-xl overflow-hidden relative text-white bg-slate-900 border border-slate-200 shadow-sm min-h-[190px]">
                  <img
                    src={promoCardItem.imageUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80"}
                    alt={isEn ? promoCardItem.titleEn : promoCardItem.titleTr}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-600 opacity-80 mix-blend-multiply" />

                  <div className="relative z-10 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{isEn ? (promoCardItem.badgeEn || "FEATURED") : (promoCardItem.badgeTr || "ÖNE ÇIKAN")}</span>
                    </span>
                    <h5 className="font-black text-sm leading-tight text-white">
                      {isEn ? promoCardItem.titleEn : promoCardItem.titleTr}
                    </h5>
                    {(promoCardItem.descriptionTr || promoCardItem.descriptionEn) && (
                      <p className="text-[11px] text-slate-100 font-medium line-clamp-2">
                        {isEn ? promoCardItem.descriptionEn || promoCardItem.descriptionTr : promoCardItem.descriptionTr}
                      </p>
                    )}
                  </div>

                  <Link
                    href={promoCardItem.targetUrl || promoCardItem.url}
                    onClick={onClose}
                    className="relative z-10 mt-3 inline-flex items-center gap-1 text-[11px] font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg w-fit transition-colors shadow-xs"
                  >
                    <span>
                      {isEn
                        ? promoCardItem.ctaTextEn || "Explore Now"
                        : promoCardItem.ctaTextTr || "Hemen Keşfet"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {activeCat?.subcategories?.map((subGroup, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-2">
                  {/* Orange Subcategory Header */}
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center justify-between">
                    <span>{subGroup.name}</span>
                  </h4>

                  {/* View All link */}
                  <Link
                    href={`/category/${activeCat.slug}`}
                    onClick={onClose}
                    className="text-[11px] text-slate-500 hover:text-primary font-semibold transition-colors"
                  >
                    {isEn ? "View all" : "Tümünü Gör"}
                  </Link>

                  {/* Subcategory Items List */}
                  <ul className="flex flex-col gap-1.5 pt-1 text-xs text-slate-700 font-medium">
                    {subGroup.items.map((itemStr, iIdx) => {
                      const itemSlug = getSubSlug(itemStr);
                      return (
                        <li key={iIdx}>
                          <Link
                            href={`/category/${activeCat.slug}/${itemSlug}`}
                            onClick={onClose}
                            className="hover:text-primary hover:font-bold transition-colors leading-tight block py-0.5"
                          >
                            {itemStr}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* Promotional Banner Box inside MegaMenu if present */}
              {activeCat?.promotionalBanner && (
                <div className="hidden lg:flex flex-col justify-between p-4 rounded-xl overflow-hidden relative text-white bg-slate-900 border border-slate-200 shadow-sm min-h-[180px]">
                  <img
                    src={activeCat.promotionalBanner.imageUrl}
                    alt={activeCat.promotionalBanner.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeCat.promotionalBanner.bgGradient || "from-orange-500 to-rose-600"} opacity-75 mix-blend-multiply`} />

                  <div className="relative z-10 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      {isEn ? "Special Offer" : "Özel Fırsat"}
                    </span>
                    <h5 className="font-black text-sm leading-tight text-white">
                      {activeCat.promotionalBanner.title}
                    </h5>
                    <p className="text-[11px] text-slate-100 font-medium line-clamp-2">
                      {activeCat.promotionalBanner.subtitle}
                    </p>
                  </div>

                  <Link
                    href={activeCat.promotionalBanner.link || `/category/${activeCat.slug}`}
                    onClick={onClose}
                    className="relative z-10 mt-3 inline-flex items-center gap-1 text-[11px] font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg w-fit transition-colors"
                  >
                    <span>{activeCat.promotionalBanner.ctaText || (isEn ? "Shop Now" : "Alışverişe Başla")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Featured Brand Badges if available */}
          {activeCat?.popularBrands && activeCat.popularBrands.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-4 mt-4 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? "Featured Popular Brands" : "Öne Çıkan Popüler Markalar"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCat.popularBrands.map((b, idx) => (
                  <Link
                    key={idx}
                    href={`/search?brand=${encodeURIComponent(b)}`}
                    onClick={onClose}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-primary-light hover:text-primary rounded-lg font-bold text-slate-800 transition-colors"
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
