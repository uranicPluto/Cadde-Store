import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills" | "contained";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = "underline",
  className,
}) => {
  return (
    <div className={cn("w-full overflow-x-auto no-scrollbar border-b border-slate-200", className)}>
      <nav className="flex items-center gap-2 min-w-max">
        {items.map((tab) => {
          const isActive = tab.id === activeId;

          if (variant === "pills") {
            return (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5",
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-text-muted hover:bg-slate-200 hover:text-text-main",
                  tab.disabled && "opacity-40 cursor-not-allowed hover:bg-slate-100 hover:text-text-muted"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-text-main"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                "py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 relative",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-main hover:border-slate-300",
                tab.disabled && "opacity-40 cursor-not-allowed hover:text-text-muted hover:border-transparent"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-bold",
                    isActive ? "bg-primary-light text-primary" : "bg-slate-100 text-text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
