import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="@container/dashboard w-full space-y-6 lg:space-y-8 animate-in fade-in">
      <Skeleton className="h-[clamp(180px,28vw,240px)] w-full rounded-2xl" />

      <div className="grid gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:grid-rows-[auto_1fr]">
        <Skeleton className="aspect-[21/9] min-h-[220px] w-full rounded-2xl xl:col-start-1 xl:row-start-1" />
        <Skeleton className="h-[420px] w-full rounded-2xl order-first xl:order-none xl:col-start-2 xl:row-start-1 xl:row-span-2" />
        <div className="space-y-4 xl:col-start-1 xl:row-start-2">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <Skeleton className="h-40 w-full rounded-xl" />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
