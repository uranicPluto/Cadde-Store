import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "left" | "right" | "bottom";
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    left: "top-0 left-0 bottom-0 w-full max-w-sm border-r animate-in slide-in-from-left duration-200",
    right: "top-0 right-0 bottom-0 w-full max-w-md border-l animate-in slide-in-from-right duration-200",
    bottom: "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl border-t animate-in slide-in-from-bottom duration-200",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "fixed z-10 bg-white shadow-2xl flex flex-col border-slate-200",
          positionClasses[position]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          {title ? (
            <h3 className="text-base font-bold text-text-main">{title}</h3>
          ) : <div />}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-text-main hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">{footer}</div>
        )}
      </div>
    </div>
  );
};
