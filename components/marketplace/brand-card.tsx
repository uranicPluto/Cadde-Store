import React from "react";
import Link from "next/link";
import { BrandMock } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export interface BrandCardProps {
  brand: BrandMock;
  onClick?: (brand: BrandMock) => void;
  className?: string;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick, className }) => {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(brand.name)}`}
      onClick={() => onClick?.(brand)}
      className={cn(
        "group relative bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-between text-center gap-2 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md select-none",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-2 overflow-hidden group-hover:scale-105 transition-transform">
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">
          {brand.name}
        </span>
        {brand.discountText && (
          <span className="text-[10px] text-discount font-semibold bg-discount-bg/50 px-1.5 py-0.5 rounded">
            {brand.discountText}
          </span>
        )}
      </div>
    </Link>
  );
};
