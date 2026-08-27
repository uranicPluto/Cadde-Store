import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  subtitle,
  badge,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3 hover:border-indigo-300 transition-all group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "text-[11px] font-black flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-50">
          {subtitle && <span>{subtitle}</span>}
          {badge && (
            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
