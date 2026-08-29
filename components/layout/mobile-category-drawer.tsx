"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/drawer";
import { getMockNavigationCategories, CategoryData } from "@/lib/navigation-data";
import { ChevronDown, ChevronRight, Flame, User, HelpCircle, Store, Tag, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export interface MobileNavItem {
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
  children?: MobileNavItem[];
}

export interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedInMock?: boolean;
  onLoginToggleMock?: () => void;
}

export const MobileCategoryDrawer: React.FC<MobileCategoryDrawerProps> = ({
  isOpen,
  onClose,
  isLoggedInMock = false,
  onLoginToggleMock,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [navCategories, setNavCategories] = useState<CategoryData[]>(
    getMockNavigationCategories(language)
  );
  const [customMobileTree, setCustomMobileTree] = useState<MobileNavItem[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>("cat-kadin");
  const [expandedSubGroup, setExpandedSubGroup] = useState<string | null>(null);

  useEffect(() => {
    async function loadMobileNav() {
      try {
        const res = await fetch(`/api/navigation?lang=${language}&device=MOBILE`);
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setNavCategories(data.categories);
        }

        if (data.tree && Array.isArray(data.tree) && data.tree.length > 0) {
          // Check for MOBILE_DRAWER or MEGA_MENU items
          const mobileItems = data.tree.filter(
            (n: any) =>
              (n.section === "MOBILE_DRAWER" || n.section === "MEGA_MENU") &&
              (n.deviceVisibility === "ALL" || n.deviceVisibility === "MOBILE" || !n.deviceVisibility)
          );
          if (mobileItems.length > 0) {
            setCustomMobileTree(mobileItems);
          }
        }
      } catch (err) {
        setNavCategories(getMockNavigationCategories(language));
      }
    }

    loadMobileNav();
  }, [language]);

  const toggleCategory = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  const toggleSubGroup = (id: string) => {
    setExpandedSubGroup(expandedSubGroup === id ? null : id);
  };

  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null));
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (onLoginToggleMock) onLoginToggleMock();
    onClose();
    window.location.reload();
  };

  const hasCustomTree = customMobileTree.length > 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      title={`Cadde Store ${t("common.account")}`}
      footer={
        <div className="flex flex-col gap-2 w-full text-xs">
          <Link
            href="/seller"
            onClick={onClose}
            className="flex items-center gap-2 p-2 font-bold text-amber-600 bg-amber-50 rounded transition-colors hover:bg-amber-100"
          >
            <Store className="w-4 h-4" /> {t("common.becomeSeller")}
          </Link>
          <Link
            href="/help"
            onClick={onClose}
            className="flex items-center gap-2 p-2 text-text-muted hover:text-slate-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> {t("common.customerService")}
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm pb-6">
        {/* User Status Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-light border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-text-main truncate">
                {user ? `${user.firstName} ${user.lastName}` : (isLoggedInMock ? "Ahmet Yılmaz" : t("header.welcomeUser"))}
              </span>
              <span className="text-[10px] text-text-muted truncate">
                {user ? user.email : (isLoggedInMock ? "Elite" : t("header.userSubtitle"))}
              </span>
            </div>
          </div>
          {user || isLoggedInMock ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs px-2.5 py-1 shrink-0"
            >
              {t("header.signOut")}
            </Button>
          ) : (
            <Link href="/login" onClick={onClose}>
              <Button
                variant="primary"
                size="sm"
                className="text-xs px-3 py-1 bg-primary font-bold shrink-0"
              >
                {t("common.signIn")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Language Switcher Section */}
        <LanguageSwitcher variant="mobile" />

        {/* Categories Header */}
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-text-muted px-1">
            {t("search.categorySuggestions")}
          </h4>

          {/* Accordion Category List */}
          <div className="flex flex-col border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white overflow-hidden shadow-2xs">
            {hasCustomTree ? (
              customMobileTree.map((node) => {
                const isExpanded = expandedCat === node.id;
                const nodeTitle = isEn ? node.titleEn || node.titleTr : node.titleTr;
                const badgeText = isEn ? node.badgeEn || node.badgeTr : node.badgeTr;
                const hasChildren = node.children && node.children.length > 0;

                return (
                  <div key={node.id} className="flex flex-col">
                    <div className="flex items-center justify-between p-3 text-xs font-bold text-text-main hover:bg-slate-50 transition-colors">
                      <Link
                        href={node.url}
                        onClick={onClose}
                        className="flex items-center gap-2 flex-1 truncate hover:text-primary"
                      >
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{nodeTitle}</span>
                        {badgeText && (
                          <span className="bg-rose-50 border border-rose-200 text-rose-600 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                            {badgeText}
                          </span>
                        )}
                      </Link>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(node.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                          aria-label="Expand subcategory"
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              isExpanded && "rotate-180 text-primary"
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {/* Level 2 Sub-groups & Level 3 Items */}
                    {isExpanded && hasChildren && (
                      <div className="bg-slate-50/80 p-3 border-t border-slate-100 flex flex-col gap-3 animate-in fade-in-50 duration-150">
                        {node.children!.map((subGroup) => {
                          const subTitle = isEn ? subGroup.titleEn || subGroup.titleTr : subGroup.titleTr;
                          const subBadge = isEn ? subGroup.badgeEn || subGroup.badgeTr : subGroup.badgeTr;
                          const hasLevel3 = subGroup.children && subGroup.children.length > 0;

                          // If promotional card inside sub-group
                          if (subGroup.itemType === "PROMO_CARD" || subGroup.imageUrl) {
                            return (
                              <div
                                key={subGroup.id}
                                className="relative rounded-lg overflow-hidden p-3 text-white bg-slate-900 shadow-sm"
                              >
                                <img
                                  src={subGroup.imageUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80"}
                                  alt={subTitle}
                                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-600 opacity-75 mix-blend-multiply" />
                                <div className="relative z-10 flex flex-col gap-1">
                                  <span className="font-extrabold text-xs text-white">{subTitle}</span>
                                  {subGroup.descriptionTr && (
                                    <span className="text-[10px] text-slate-100 line-clamp-1">
                                      {isEn ? subGroup.descriptionEn : subGroup.descriptionTr}
                                    </span>
                                  )}
                                  <Link
                                    href={subGroup.targetUrl || subGroup.url}
                                    onClick={onClose}
                                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-slate-900 bg-amber-400 px-2 py-0.5 rounded w-fit"
                                  >
                                    <span>{isEn ? subGroup.ctaTextEn || "Explore" : subGroup.ctaTextTr || "İncele"}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={subGroup.id} className="flex flex-col gap-1.5 bg-white p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between">
                                <Link
                                  href={subGroup.url}
                                  onClick={onClose}
                                  className="font-bold text-xs text-slate-900 hover:text-primary flex items-center gap-1.5"
                                >
                                  <span>{subTitle}</span>
                                  {subBadge && (
                                    <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-bold px-1 py-0.2 rounded">
                                      {subBadge}
                                    </span>
                                  )}
                                </Link>

                                {hasLevel3 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleSubGroup(subGroup.id)}
                                    className="text-slate-400 p-0.5"
                                  >
                                    <ChevronDown
                                      className={cn(
                                        "w-3.5 h-3.5 transition-transform",
                                        expandedSubGroup === subGroup.id && "rotate-180"
                                      )}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Level 3 items */}
                              {hasLevel3 && (expandedSubGroup === subGroup.id || !expandedSubGroup) && (
                                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                                  {subGroup.children!.map((l3) => {
                                    const l3Title = isEn ? l3.titleEn || l3.titleTr : l3.titleTr;
                                    const l3Badge = isEn ? l3.badgeEn || l3.badgeTr : l3.badgeTr;

                                    return (
                                      <Link
                                        key={l3.id}
                                        href={l3.url}
                                        onClick={onClose}
                                        className="hover:text-primary py-0.5 truncate flex items-center gap-1"
                                      >
                                        <span className="truncate">{l3Title}</span>
                                        {l3Badge && (
                                          <span className="text-[7px] bg-rose-50 text-rose-600 px-1 rounded">
                                            {l3Badge}
                                          </span>
                                        )}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              navCategories.map((cat) => {
                const isExpanded = expandedCat === cat.id;
                const categoryName = t(`categories.${cat.slug}`) || cat.name;

                return (
                  <div key={cat.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "flex items-center justify-between p-3 text-xs font-bold text-text-main hover:bg-slate-50 text-left transition-colors",
                        isExpanded && "bg-slate-50 text-primary"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                        <span>{categoryName}</span>
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-text-subtle transition-transform", isExpanded && "rotate-180")} />
                    </button>

                    {/* Subcategories Expansion */}
                    {isExpanded && (
                      <div className="bg-slate-50/80 p-3 border-t border-slate-100 flex flex-col gap-3 animate-in fade-in-50 duration-150">
                        {cat.subcategories.map((sub, sIdx) => (
                          <div key={sIdx} className="flex flex-col gap-1">
                            <span className="font-bold text-xs text-text-main border-b border-slate-200 pb-1">
                              {sub.name}
                            </span>
                            <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs text-text-muted">
                              {sub.items.map((item, iIdx) => (
                                <Link
                                  key={iIdx}
                                  href={`/category/${cat.slug}`}
                                  onClick={onClose}
                                  className="hover:text-primary py-0.5 truncate"
                                >
                                  {item}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
