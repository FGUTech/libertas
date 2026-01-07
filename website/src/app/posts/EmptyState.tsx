"use client";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-[var(--fg-tertiary)]">
        <EmptyIcon />
      </div>

      {hasFilters ? (
        <>
          <h3 className="text-h3 mb-2">No matching posts</h3>
          <p className="text-body text-[var(--fg-secondary)] mb-6 max-w-md">
            No posts match your current filters. Try adjusting your selection or
            clear all filters to see all posts.
          </p>
          <button onClick={onClearFilters} className="btn btn-secondary">
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-h3 mb-2">No posts yet</h3>
          <p className="text-body text-[var(--fg-secondary)] mb-6 max-w-md">
            We&apos;re working on publishing freedom tech research. Check back
            soon or subscribe to our feeds.
          </p>
          <div className="flex gap-4">
            <a href="/feed.xml" className="btn btn-secondary">
              RSS Feed
            </a>
            <a href="/feed.json" className="btn btn-ghost">
              JSON Feed
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg
      className="w-16 h-16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}
