import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className,
}) => {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-text-main",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
          size === "sm" ? "h-5 w-9" : "h-6 w-11",
          checked ? "bg-primary" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out",
            size === "sm"
              ? "h-3.5 w-3.5 translate-y-[3px] translate-x-[3px]"
              : "h-5 w-5 translate-y-[2px] translate-x-[2px]",
            checked && (size === "sm" ? "translate-x-[19px]" : "translate-x-[22px]")
          )}
        />
      </button>

      {label && <span className="font-medium text-text-main">{label}</span>}
    </label>
  );
};
