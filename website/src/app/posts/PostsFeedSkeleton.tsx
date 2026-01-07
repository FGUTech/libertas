export function PostsFeedSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Filters skeleton */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-4 w-10 rounded bg-[var(--bg-tertiary)]" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-6 w-16 rounded-full bg-[var(--bg-tertiary)]"
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-[var(--bg-tertiary)]" />
          <div className="h-8 w-32 rounded bg-[var(--bg-tertiary)]" />
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-6">
        <div className="h-4 w-40 rounded bg-[var(--bg-tertiary)]" />
      </div>

      {/* Posts grid skeleton */}
      <div className="grid-posts">
        {[...Array(6)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="card">
      {/* Tags and date */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-[var(--bg-elevated)]" />
        <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]" />
      </div>

      {/* Title */}
      <div className="mb-2 space-y-2">
        <div className="h-5 w-full rounded bg-[var(--bg-elevated)]" />
        <div className="h-5 w-3/4 rounded bg-[var(--bg-elevated)]" />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-[var(--bg-elevated)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--bg-elevated)]" />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-4">
        <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]" />
        <div className="h-4 w-16 rounded bg-[var(--bg-elevated)]" />
      </div>
    </div>
  );
}
