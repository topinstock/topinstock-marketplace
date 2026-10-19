'use client';

import React from 'react';

interface ProductGridSkeletonProps {
  count?: number;
}

export default function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] sm:gap-4 md:gap-5 animate-in fade-in duration-200">
      {items.map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-xs"
        >
          {/* Media Image Shimmer (Fashion 3:4) */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 animate-shimmer" />

          {/* Details Shimmer */}
          <div className="p-2.5 sm:p-4 flex flex-col flex-1 space-y-2 sm:space-y-2.5">
            {/* Vendor tag skeleton */}
            <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-slate-100 rounded-md animate-shimmer" />

            {/* Title 2-lines skeleton */}
            <div className="space-y-1.5">
              <div className="h-3 sm:h-3.5 w-full bg-slate-100 rounded-md animate-shimmer" />
              <div className="h-3 sm:h-3.5 w-3/4 bg-slate-100 rounded-md animate-shimmer" />
            </div>

            {/* Rating stars skeleton */}
            <div className="h-2.5 sm:h-3 w-14 sm:w-16 bg-slate-100 rounded-md animate-shimmer" />

            {/* Price line skeleton */}
            <div className="pt-1.5 sm:pt-2 mt-auto">
              <div className="h-4 sm:h-5 w-24 sm:w-28 bg-slate-100 rounded-md animate-shimmer" />
            </div>

            {/* Add to Cart button skeleton */}
            <div className="h-8 sm:h-9 w-full bg-slate-100/80 rounded-lg sm:rounded-xl mt-1.5 sm:mt-2 animate-shimmer" />

            {/* Trust badges skeleton */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="h-2.5 w-14 sm:w-16 bg-slate-100/70 rounded animate-shimmer" />
              <div className="h-2.5 w-14 sm:w-16 bg-slate-100/70 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
