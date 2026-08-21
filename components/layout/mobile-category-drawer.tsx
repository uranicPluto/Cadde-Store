import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { getMockNavigationCategories } from "@/lib/navigation-data";
import { ChevronDown, Flame, User, HelpCircle, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

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
  const navCategories = getMockNavigationCategories(language);
  const [expandedCat, setExpandedCat] = useState<string | null>("cat-kadin");

  const toggleCategory = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      title={`Cadde Store ${t("common.account")}`}
      footer={
        <div className="flex flex-col gap-2 w-full text-xs">
          <a href="#" className="flex items-center gap-2 p-2 font-bold text-amber-600 bg-amber-50 rounded">
            <Store className="w-4 h-4" /> {t("common.becomeSeller")}
          </a>
          <a href="#" className="flex items-center gap-2 p-2 text-text-muted">
            <HelpCircle className="w-4 h-4" /> {t("common.customerService")}
          </a>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        {/* User Status Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary-light border border-primary/30 flex items-center justify-center text-primary font-bold">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-text-main">
                {isLoggedInMock ? "Ahmet Yılmaz" : t("header.welcomeUser")}
              </span>
              <span className="text-[10px] text-text-muted">
                {isLoggedInMock ? "Elite" : t("header.userSubtitle")}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLoginToggleMock}
            className="text-xs px-2.5 py-1"
          >
            {isLoggedInMock ? t("header.signOut") : t("common.signIn")}
          </Button>
        </div>

        {/* Mobile Language Switcher Section */}
        <LanguageSwitcher variant="mobile" />

        {/* Categories Header */}
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-text-muted px-1">
            {t("search.categorySuggestions")}
          </h4>

          {/* Accordion Category List */}
          <div className="flex flex-col border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
            {navCategories.map((cat) => {
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
                              <a
                                key={iIdx}
                                href="#"
                                onClick={onClose}
                                className="hover:text-primary py-0.5 truncate"
                              >
                                {item}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
