/* ─── Skeleton UI Components ─────────────────────────────────────────────────
   Reusable shimmer-effect placeholders for loading states.
   Usage: Render instead of actual content while data is fetching.
─────────────────────────────────────────────────────────────────────────── */

import React from "react";

/* ─── Base shimmer element ───────────────────────────────────────────────── */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-warm-beige/70 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent ${className}`}
    />
  );
}

/* ─── Product Card Skeleton ──────────────────────────────────────────────── */
export function ProductCardSkeleton() {
  return (
    <div className="bg-cream border border-warm-beige/60 rounded-2xl overflow-hidden shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Body */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Product Grid Skeleton (renders N cards) ────────────────────────────── */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Product Detail Skeleton ────────────────────────────────────────────── */
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start pt-10">
      {/* Left — image */}
      <Skeleton className="aspect-square w-full rounded-3xl" />

      {/* Right — info */}
      <div className="space-y-6">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-5 h-5 rounded" />
          ))}
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-px w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-14 w-36 rounded-xl" />
          <Skeleton className="h-14 flex-1 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
