export function NFTCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
      <div className="aspect-square animate-pulse bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <NFTCardSkeleton key={i} />
      ))}
    </div>
  )
}
