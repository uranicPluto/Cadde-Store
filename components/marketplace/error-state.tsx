import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertOctagon, WifiOff, ShieldAlert, FileQuestion, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export type ErrorStateType =
  | "generic"
  | "product-unavailable"
  | "network"
  | "permission-denied"
  | "not-found";

export interface ErrorStateProps {
  type?: ErrorStateType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = "generic",
  title,
  description,
  onRetry,
  className,
}) => {
  const { t } = useLanguage();

  const presets = {
    generic: {
      icon: <AlertOctagon className="w-12 h-12 text-rose-500 stroke-[1.5]" />,
      defaultTitle: t("errorStates.genericTitle"),
      defaultDesc: t("errorStates.genericDesc"),
    },
    "product-unavailable": {
      icon: <FileQuestion className="w-12 h-12 text-amber-500 stroke-[1.5]" />,
      defaultTitle: t("emptyStates.noProductsTitle"),
      defaultDesc: t("emptyStates.noProductsDesc"),
    },
    network: {
      icon: <WifiOff className="w-12 h-12 text-rose-500 stroke-[1.5]" />,
      defaultTitle: t("errorStates.networkTitle"),
      defaultDesc: t("errorStates.networkDesc"),
    },
    "permission-denied": {
      icon: <ShieldAlert className="w-12 h-12 text-amber-600 stroke-[1.5]" />,
      defaultTitle: t("errorStates.genericTitle"),
      defaultDesc: t("errorStates.genericDesc"),
    },
    "not-found": {
      icon: <FileQuestion className="w-12 h-12 text-slate-400 stroke-[1.5]" />,
      defaultTitle: t("errorStates.notFoundTitle"),
      defaultDesc: t("errorStates.notFoundDesc"),
    },
  };

  const currentPreset = presets[type];

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto shadow-xs",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
        {currentPreset.icon}
      </div>

      <h3 className="text-lg font-bold text-text-main mb-1">
        {title || currentPreset.defaultTitle}
      </h3>
      <p className="text-sm text-text-muted leading-relaxed mb-6">
        {description || currentPreset.defaultDesc}
      </p>

      {onRetry && (
        <Button variant="primary" size="md" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> {t("errorStates.retry")}
        </Button>
      )}
    </div>
  );
};
