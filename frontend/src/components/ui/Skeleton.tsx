import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Base shimmer block */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:400%_100%] animate-shimmer dark:from-slate-700 dark:via-slate-600 dark:to-slate-700",
        className
      )}
      style={style}
    />
  );
}

/** Full-width card skeleton with header + content lines */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white p-6 space-y-4", className)}>
      <Skeleton className="h-5 w-1/3" />
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/** KPI stat card skeleton */
export function StatSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white p-5 space-y-3 dark:bg-slate-800 dark:border-slate-700/60", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/** Chart area skeleton */
export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white p-6 space-y-4 dark:bg-slate-800 dark:border-slate-700/60", className)}>
      <Skeleton className="h-5 w-40" />
      <div className="h-64 flex items-end gap-1.5 px-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${25 + Math.random() * 60}%` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

/** Table row skeleton */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === 0 ? "w-20" : "flex-1")} />
      ))}
    </div>
  );
}

/** Full table skeleton with header + rows */
export function TableSkeleton({ rows = 8, cols = 5, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white overflow-hidden dark:bg-slate-800 dark:border-slate-700/60", className)}>
      <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 border-b border-slate-200/80 dark:bg-slate-700/50 dark:border-slate-700/60">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === 0 ? "w-16" : "flex-1")} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
}

/** Dashboard page skeleton */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <CardSkeleton className="h-80" />
      </div>
      {/* Table */}
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

/** Stock list / Market page skeleton */
export function MarketSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <TableSkeleton rows={10} cols={6} />
    </div>
  );
}

/** Portfolio page skeleton */
export function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton className="lg:col-span-1" />
        <TableSkeleton rows={6} cols={4} className="lg:col-span-2" />
      </div>
    </div>
  );
}

/** Stock detail page skeleton */
export function StockDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-8 w-32 ml-auto" />
          <Skeleton className="h-5 w-24 rounded-full ml-auto" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton className="h-96" />
          <div className="grid grid-cols-2 gap-6">
            <CardSkeleton />
            <ChartSkeleton className="h-52" />
          </div>
        </div>
        <div className="space-y-6">
          <CardSkeleton className="h-80" />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
