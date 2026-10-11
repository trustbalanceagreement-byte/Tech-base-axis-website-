import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
}

/**
 * Primitive Skeleton component with obsidian dark theme and crimson-tinted shimmer.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  style,
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
    circular: 'rounded-full',
  }[variant];

  return (
    <div
      className={`bg-neutral-900/80 border border-neutral-800/60 animate-skeleton-shimmer ${variantClasses} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * High-fidelity Skeleton for Projects Grid Cards
 */
export const ProjectCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="obsidian-card rounded-2xl p-7 border border-neutral-800 flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Header Status Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Skeleton className="h-6 w-28 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Media Box */}
        <Skeleton className={`w-full mb-4 rounded-xl ${compact ? 'aspect-[16/10]' : 'aspect-video'}`} />

        {/* Title & Subtitle */}
        <Skeleton className="h-7 w-3/4 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-1/2 mb-4 rounded" />

        {/* Description Lines */}
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 mb-6">
          <div className="space-y-1.5 flex flex-col items-center">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="space-y-1.5 flex flex-col items-center">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="space-y-1.5 flex flex-col items-center">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>

        {/* Architecture bullets */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-4/5 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-3/5 rounded" />
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-neutral-800/80">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Service & Package Pricing Cards
 */
export const PackageCardSkeleton: React.FC = () => {
  return (
    <div className="glassmorphism-card rounded-2xl p-7 border border-neutral-800 flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Tier badge & Category */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Package Title */}
        <Skeleton className="h-7 w-2/3 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-full mb-6 rounded" />

        {/* Price & Turnaround */}
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/80 mb-6 flex justify-between items-center">
          <div>
            <Skeleton className="h-3 w-16 mb-2 rounded" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-14 mb-2 rounded ml-auto" />
            <Skeleton className="h-4 w-20 rounded ml-auto" />
          </div>
        </div>

        {/* Deliverables list */}
        <div className="space-y-3 mb-6">
          <Skeleton className="h-3.5 w-24 mb-3 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
              <Skeleton className="h-3.5 w-5/6 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Select button */}
      <Skeleton className="h-11 w-full rounded-xl mt-4" />
    </div>
  );
};

/**
 * Skeleton for Admin Inquiries and Projects Table Rows
 */
export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-3.5 w-3/4 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Full Page Skeleton layout representing Tech Base Axis structure during initial load
 */
export const FullPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      {/* Top Banner / Hero Skeleton */}
      <div className="obsidian-card rounded-2xl p-8 sm:p-12 border border-neutral-800 relative overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-14 sm:h-20 w-11/12 rounded-xl" />
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-5 w-2/3 rounded" />
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Skeleton className="h-12 w-44 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      </div>
    </div>
  );
};
