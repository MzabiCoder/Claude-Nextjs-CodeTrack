function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />;
}

export function DrawerSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-border">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-14" />
      </div>
      <div className="pt-2 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-3 w-24 mt-4" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
