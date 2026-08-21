import React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface RatingProps {
  rating: number; // e.g. 4.8
  maxRating?: number; // default 5
  reviewCount?: number;
  showNumeric?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "compact" | "numeric-only";
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  reviewCount,
  showNumeric = true,
  size = "sm",
  variant = "full",
  className,
}) => {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Generate 5 stars with full/half/empty states
  const stars = Array.from({ length: maxRating }, (_, i) => {
    const starValue = i + 1;
    const isFull = rating >= starValue;
    const isHalf = rating >= starValue - 0.5 && rating < starValue;

    return (
      <div key={i} className="relative">
        <Star className={cn(iconSizes[size], "text-slate-200 fill-slate-200")} />
        {(isFull || isHalf) && (
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: isHalf ? "50%" : "100%" }}
          >
            <Star className={cn(iconSizes[size], "text-amber-400 fill-amber-400")} />
          </div>
        )}
      </div>
    );
  });

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold text-xs", className)}>
        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span>{rating.toFixed(1)}</span>
        {reviewCount !== undefined && (
          <span className="text-text-muted font-normal">({reviewCount})</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      {variant !== "numeric-only" && (
        <div className="flex items-center gap-0.5">{stars}</div>
      )}

      {showNumeric && (
        <span className={cn("font-bold text-text-main", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={cn("text-text-muted font-normal", textSizes[size])}>
          ({reviewCount.toLocaleString("tr-TR")})
        </span>
      )}
    </div>
  );
};
