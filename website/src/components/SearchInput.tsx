'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchInputProps {
  /** Initial search query */
  initialQuery?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show as compact version (for header) */
  compact?: boolean;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Auto-submit on change (with debounce) */
  autoSubmit?: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
}

export function SearchInput({
  initialQuery = '',
  placeholder = 'Search posts...',
  compact = false,
  onSearch,
  autoSubmit = false,
  debounceMs = 300,
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update query when initialQuery changes (e.g., from URL)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const executeSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (onSearch) {
        onSearch(trimmed);
      } else if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push('/search');
      }
    },
    [onSearch, router]
  );

  // Handle input change with optional debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (autoSubmit) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        executeSearch(newQuery);
      }, debounceMs);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    executeSearch(query);
  };

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
    if (autoSubmit) {
      executeSearch('');
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
            isFocused
              ? 'border-[var(--accent-primary)] bg-[var(--bg-tertiary)]'
              : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]'
          }`}
        >
          <SearchIcon className="w-4 h-4 text-[var(--fg-tertiary)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="bg-transparent text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] !outline-none w-24 focus:w-40 transition-all"
            aria-label="Search"
          />
          {!query && (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-[var(--fg-tertiary)] bg-[var(--bg-primary)] rounded border border-[var(--border-subtle)]">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] transition-colors"
              aria-label="Clear search"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
          isFocused
            ? 'border-[var(--accent-primary)] shadow-[0_0_0_1px_var(--accent-primary),0_0_20px_rgba(0,255,65,0.1)]'
            : 'border-[var(--border-default)] bg-[var(--bg-secondary)]'
        }`}
      >
        <SearchIcon className="w-5 h-5 text-[var(--fg-tertiary)] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] !outline-none"
          aria-label="Search"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] transition-colors"
            aria-label="Clear search"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-1.5 text-sm font-medium bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-primary)]/90 transition-colors"
        >
          Search
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--fg-tertiary)]">
        Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded border border-[var(--border-subtle)]">⌘K</kbd> to search from anywhere
      </p>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
