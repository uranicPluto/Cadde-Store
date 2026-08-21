import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = "success",
  title,
  message,
  onClose,
}) => {
  const styles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-950",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: "bg-sky-50 border-sky-200 text-sky-950",
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
    },
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full transition-all animate-in slide-in-from-top-2 duration-200",
        styles[type].bg
      )}
    >
      {styles[type].icon}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold leading-snug">{title}</h4>
        {message && <p className="text-xs mt-1 text-slate-600 leading-normal">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
