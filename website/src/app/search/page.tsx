import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from './SearchResults';
import { getAllContent } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Search | Libertas',
  description: 'Search across all Libertas posts and digests for freedom tech topics, Bitcoin, privacy, and more.',
};

function SearchResultsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Search Input Skeleton */}
      <div className="mb-8">
        <div className="h-14 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-[var(--bg-tertiary)] rounded-full" />
          ))}
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-40 bg-[var(--bg-tertiary)] rounded-md" />
          <div className="h-10 w-32 bg-[var(--bg-tertiary)] rounded-md" />
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="h-6 w-3/4 bg-[var(--bg-tertiary)] rounded mb-2" />
            <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded mb-1" />
            <div className="h-4 w-2/3 bg-[var(--bg-tertiary)] rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-[var(--bg-tertiary)] rounded-full" />
              <div className="h-5 w-16 bg-[var(--bg-tertiary)] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  // Load all content (posts + digests) at build/request time
  const content = getAllContent();

  return (
    <main className="container py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-display mb-2">Search</h1>
        <p className="text-[var(--fg-secondary)]">
          Find posts and digests by keyword, topic, or date range
        </p>
      </div>

      {/* Search Results Client Component wrapped in Suspense */}
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults content={content} />
      </Suspense>
    </main>
  );
}
