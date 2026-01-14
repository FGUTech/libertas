'use client';

import { useState, useRef, useEffect } from 'react';

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangeFilter({ dateFrom, dateTo, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(dateFrom);
  const [localTo, setLocalTo] = useState(dateTo);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local state with props
  useEffect(() => {
    setLocalFrom(dateFrom);
    setLocalTo(dateTo);
  }, [dateFrom, dateTo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onChange(localFrom, localTo);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFrom('');
    setLocalTo('');
    onChange('', '');
    setIsOpen(false);
  };

  const handlePreset = (preset: 'week' | 'month' | '3months' | 'year') => {
    const now = new Date();
    let from: Date;

    switch (preset) {
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const fromStr = from.toISOString().split('T')[0];
    const toStr = now.toISOString().split('T')[0];

    setLocalFrom(fromStr);
    setLocalTo(toStr);
    onChange(fromStr, toStr);
    setIsOpen(false);
  };

  const hasDateFilter = dateFrom || dateTo;
  const displayLabel = hasDateFilter
    ? `${dateFrom || 'Any'} → ${dateTo || 'Any'}`
    : 'Any time';

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <span className="text-small text-[var(--fg-tertiary)]">Date:</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
            hasDateFilter
              ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-muted)]'
              : 'border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm">{displayLabel}</span>
          <ChevronIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg z-50 min-w-[280px]">
          {/* Quick Presets */}
          <div className="mb-4">
            <p className="text-xs text-[var(--fg-tertiary)] mb-2">Quick select</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreset('week')}
                className="px-2 py-1 text-xs rounded border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)] transition-colors"
              >
                Last 7 days
              </button>
              <button
                onClick={() => handlePreset('month')}
                className="px-2 py-1 text-xs rounded border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)] transition-colors"
              >
                Last 30 days
              </button>
              <button
                onClick={() => handlePreset('3months')}
                className="px-2 py-1 text-xs rounded border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)] transition-colors"
              >
                Last 3 months
              </button>
              <button
                onClick={() => handlePreset('year')}
                className="px-2 py-1 text-xs rounded border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)] transition-colors"
              >
                Last year
              </button>
            </div>
          </div>

          {/* Custom Range */}
          <div className="mb-4">
            <p className="text-xs text-[var(--fg-tertiary)] mb-2">Custom range</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--fg-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                placeholder="From"
              />
              <span className="text-[var(--fg-tertiary)]">→</span>
              <input
                type="date"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--fg-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                placeholder="To"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleClear}
              className="text-sm text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 text-sm font-medium bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
