import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-xs text-text-muted overflow-x-auto no-scrollbar py-1", className)}
    >
      {/* Home Icon & Text Link - Sends directly to / (Home Page) */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-primary transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{t("breadcrumb.home")}</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-text-main shrink-0" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || "/"}
                className="hover:text-primary transition-colors shrink-0"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
