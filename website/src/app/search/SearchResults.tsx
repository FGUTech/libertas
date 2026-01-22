'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { SearchInput } from '@/components/SearchInput';
import { DateRangeFilter } from './DateRangeFilter';
import { searchContent, type SearchResult } from '@/lib/search';
import type { Topic, ContentItem } from '@/types';
import { TOPICS, isPost, isDigest } from '@/types';

const RESULTS_PER_PAGE = 12;

type SortOption = 'relevance' | 'newest' | 'oldest';

const topicLabels: Record<Topic, string> = {
  bitcoin: 'Bitcoin',
  zk: 'ZK Proofs',
  'censorship-resistance': 'Anti-Censorship',
  comms: 'Communications',
  payments: 'Payments',
  identity: 'Identity',
  privacy: 'Privacy',
  surveillance: 'Surveillance',
  activism: 'Activism',
  sovereignty: 'Sovereignty',
};

interface SearchResultsProps {
  content: ContentItem[];
}

export function SearchResults({ content }: SearchResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read state from URL params
  const query = searchParams.get('q') || '';
  const selectedTopics = useMemo(() => {
    const topics = searchParams.get('topics');
    if (!topics) return [] as Topic[];
    return topics.split(',').filter((t): t is Topic => TOPICS.includes(t as Topic));
  }, [searchParams]);
  const dateFrom = searchParams.get('from') || '';
  const dateTo = searchParams.get('to') || '';
  const sortBy = (searchParams.get('sort') as SortOption) || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (except page itself)
      if (!('page' in updates)) {
        params.delete('page');
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(
    (newQuery: string) => {
      updateParams({ q: newQuery || null });
    },
    [updateParams]
  );

  const handleTopicToggle = useCallback(
    (topic: Topic) => {
      const newTopics = selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic];
      updateParams({ topics: newTopics.length > 0 ? newTopics.join(',') : null });
    },
    [selectedTopics, updateParams]
  );

  const handleDateRangeChange = useCallback(
    (from: string, to: string) => {
      updateParams({ from: from || null, to: to || null });
    },
    [updateParams]
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      updateParams({ sort: sort === 'relevance' ? null : sort });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page === 1 ? null : page.toString() });
    },
    [updateParams]
  );

  const handleClearAll = useCallback(() => {
    updateParams({ q: null, topics: null, from: null, to: null, sort: null, page: null });
  }, [updateParams]);

  // Perform search
  const results = useMemo(() => {
    return searchContent(content, {
      query,
      topics: selectedTopics,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy,
    });
  }, [content, query, selectedTopics, dateFrom, dateTo, sortBy]);

  // Pagination
  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  const hasActiveFilters = query || selectedTopics.length > 0 || dateFrom || dateTo;

  return (
    <div className={isPending ? 'opacity-70 transition-opacity' : ''}>
      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          initialQuery={query}
          placeholder="Search for Bitcoin, privacy, ZK proofs..."
          onSearch={handleSearch}
          autoSubmit
          debounceMs={300}
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Topic Filter */}
        <TopicFilter
          selectedTopics={selectedTopics}
          onTopicToggle={handleTopicToggle}
        />

        {/* Date Range and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateRangeChange}
          />
          <SortSelect value={sortBy} onChange={handleSortChange} />
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-small text-[var(--fg-tertiary)]">
          {results.length === 0
            ? query
              ? `No results found for "${query}"`
              : 'Enter a search term or select filters'
            : `Found ${results.length} result${results.length === 1 ? '' : 's'}${
                query ? ` for "${query}"` : ''
              }`}
        </p>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-small text-[var(--fg-tertiary)] hover:text-[var(--accent-primary)]"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {paginatedResults.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {paginatedResults.map((result) => (
              <SearchResultCard key={result.item.id} result={result} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        query && <EmptyState query={query} onClear={() => handleSearch('')} />
      )}
    </div>
  );
}

// Topic Filter Component
interface TopicFilterProps {
  selectedTopics: Topic[];
  onTopicToggle: (topic: Topic) => void;
}

function TopicFilter({ selectedTopics, onTopicToggle }: TopicFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-small text-[var(--fg-tertiary)] mr-1">Topics:</span>
      {TOPICS.map((topic) => {
        const isSelected = selectedTopics.includes(topic);
        return (
          <button
            key={topic}
            onClick={() => onTopicToggle(topic)}
            className={`tag cursor-pointer transition-all ${
              isSelected
                ? 'tag-accent'
                : 'hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]'
            }`}
          >
            {topicLabels[topic]}
          </button>
        );
      })}
    </div>
  );
}

// Sort Select Component
interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-small text-[var(--fg-tertiary)]">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="input py-1.5 px-3 w-auto min-w-[140px] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8"
      >
        <option value="relevance">Most relevant</option>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}

// Search Result Card Component
interface SearchResultCardProps {
  result: SearchResult;
}

function SearchResultCard({ result }: SearchResultCardProps) {
  const { item, matchedFields, highlights } = result;

  // Determine the link path and get appropriate data based on content type
  const linkPath = isPost(item) ? `/posts/${item.slug}` : `/digests/${item.slug}`;
  const summary = isPost(item) ? item.summary : item.executiveTldr;
  const topics = isPost(item) ? item.topics : item.topTopics;
  const contentTypeLabel = isDigest(item) ? 'Digest' : null;

  return (
    <Link href={linkPath} className="block group">
      <article className={`p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all ${
        isDigest(item)
          ? 'bg-[var(--bg-digest)] hover:bg-[var(--bg-tertiary)]'
          : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
      }`}>
        {/* Content Type Badge and Title */}
        <div className="flex items-start gap-2 mb-2">
          {contentTypeLabel && (
            <span className="tag text-xs py-0.5 px-1.5 bg-[var(--accent-amber-muted)] text-[var(--accent-amber)] border-[var(--accent-amber)]">
              {contentTypeLabel}
            </span>
          )}
          <h2 className={`text-lg font-medium text-[var(--fg-primary)] transition-colors ${
            isDigest(item)
              ? 'group-hover:text-[var(--accent-amber)]'
              : 'group-hover:text-[var(--accent-primary)]'
          }`}>
            {highlights.title ? (
              <span dangerouslySetInnerHTML={{ __html: highlights.title }} />
            ) : (
              item.title
            )}
          </h2>
        </div>

        {/* Summary with highlights */}
        <p className="text-[var(--fg-secondary)] text-sm mb-3 line-clamp-2">
          {highlights.summary ? (
            <span dangerouslySetInnerHTML={{ __html: highlights.summary }} />
          ) : (
            summary
          )}
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--fg-tertiary)]">
          {/* Date */}
          <time dateTime={item.publishedAt}>
            {new Date(item.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>

          {/* Matched fields indicator */}
          {matchedFields.length > 0 && (
            <span className="flex items-center gap-1">
              <MatchIcon className="w-3.5 h-3.5" />
              Matched in {matchedFields.join(', ')}
            </span>
          )}

          {/* Topics */}
          <div className="flex gap-1.5 ml-auto">
            {topics.slice(0, 3).map((topic) => (
              <span key={topic} className="tag text-xs py-0.5 px-1.5">
                {topicLabels[topic]}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="text-[var(--fg-tertiary)]">+{topics.length - 3}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = useMemo(() => {
    const items: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        items.push(i);
      }
      if (currentPage < totalPages - 2) items.push('ellipsis');
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-[var(--fg-tertiary)]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[40px] h-10 rounded-md font-medium transition-colors ${
              page === currentPage
                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
}

// Empty State Component
interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <SearchIcon className="w-12 h-12 mx-auto mb-4 text-[var(--fg-tertiary)]" />
      <h3 className="text-lg font-medium text-[var(--fg-primary)] mb-2">
        No results found
      </h3>
      <p className="text-[var(--fg-secondary)] mb-4">
        We couldn&apos;t find anything matching &quot;{query}&quot;
      </p>
      <div className="text-sm text-[var(--fg-tertiary)] space-y-1">
        <p>Try:</p>
        <ul className="list-disc list-inside">
          <li>Using different keywords</li>
          <li>Removing some filters</li>
          <li>Checking for typos</li>
        </ul>
      </div>
      <button
        onClick={onClear}
        className="mt-4 px-4 py-2 text-sm font-medium text-[var(--accent-primary)] hover:underline"
      >
        Clear search
      </button>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MatchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
