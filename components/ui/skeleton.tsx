import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-slate-200 rounded", className)}
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded border border-slate-200 p-2.5 flex flex-col gap-2 w-full">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-3/4 rounded-sm" />
      {/* Brand */}
      <Skeleton className="h-3 w-1/3 mt-1" />
      {/* Title */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      {/* Rating */}
      <Skeleton className="h-3 w-1/2 mt-1" />
      {/* Price */}
      <Skeleton className="h-5 w-2/5 mt-2" />
      {/* Button */}
      <Skeleton className="h-9 w-full rounded mt-2" />
    </div>
  );
};

export const BannerSkeleton: React.FC = () => {
  return <Skeleton className="w-full h-48 sm:h-64 md:h-80 rounded-lg" />;
};

export const BrandCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded p-3 flex flex-col items-center gap-2">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
};

export const StoreCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col gap-3 p-4">
      <Skeleton className="w-full h-24 rounded" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 w-full">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
};
