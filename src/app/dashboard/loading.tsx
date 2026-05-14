export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-muted animate-pulse" />
        ))}
      </div>

      {/* Collections */}
      <div className="space-y-4">
        <div className="h-6 w-28 rounded-md bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-muted animate-pulse" />
          ))}
        </div>
      </div>

      {/* Recent items */}
      <div className="space-y-4">
        <div className="h-6 w-28 rounded-md bg-muted animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
