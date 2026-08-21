import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: any) => void;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Seçiniz...",
  isMulti = false,
  isSearchable = false,
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    if (isMulti) {
      const nextValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(nextValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (isMulti) {
      onChange?.(selectedValues.filter((v) => v !== val));
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5" ref={containerRef}>
      {label && <label className="text-xs font-semibold text-text-main">{label}</label>}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full min-h-[40px] px-3 py-2 text-sm rounded border bg-white text-left flex items-center justify-between gap-2 transition-all outline-none",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            error && "border-error focus:border-error focus:ring-error/20 bg-error-bg/30",
            disabled && "bg-slate-100 text-text-muted cursor-not-allowed opacity-75",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {selectedValues.length === 0 && (
              <span className="text-text-subtle">{placeholder}</span>
            )}

            {!isMulti && selectedValues.length > 0 && (
              <span className="text-text-main font-medium">
                {options.find((o) => o.value === selectedValues[0])?.label || selectedValues[0]}
              </span>
            )}

            {isMulti &&
              selectedValues.map((val) => {
                const opt = options.find((o) => o.value === val);
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 bg-slate-100 text-text-main text-xs px-2 py-0.5 rounded font-medium border border-slate-200"
                  >
                    {opt?.label || val}
                    <X
                      className="w-3 h-3 hover:text-red-500 cursor-pointer"
                      onClick={(e) => removeValue(e, val)}
                    />
                  </span>
                );
              })}
          </div>

          <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", isOpen && "rotate-180")} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto p-1 text-sm">
            {isSearchable && (
              <div className="p-1.5 sticky top-0 bg-white border-b border-slate-100 mb-1">
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border rounded text-xs">
                  <Search className="w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ara..."
                    className="w-full bg-transparent outline-none text-text-main placeholder:text-text-subtle"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-muted text-center">Sonuç bulunamadı</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "px-3 py-2 rounded cursor-pointer flex items-center justify-between transition-colors text-text-main hover:bg-slate-100",
                      isSelected && "bg-primary-light text-primary font-medium"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <span className="text-xs text-error font-medium">{error}</span>}
    </div>
  );
};
