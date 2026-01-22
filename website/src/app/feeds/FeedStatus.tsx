'use client';

import { useEffect, useState } from 'react';

interface FeedCheckResult {
  available: boolean;
  lastUpdated: string | null;
  error?: string;
}

interface FeedStatusData {
  insights: {
    rss: FeedCheckResult;
    json: FeedCheckResult;
  };
  digests: {
    rss: FeedCheckResult;
    json: FeedCheckResult;
  };
  lastPublished: string | null;
  allOnline: boolean;
  someOnline: boolean;
}

const FEED_URLS = {
  insights: {
    rss: '/insights-rss.xml',
    json: '/insights-feed.json',
  },
  digests: {
    rss: '/digests-rss.xml',
    json: '/digests-feed.json',
  },
};

async function checkFeed(url: string): Promise<FeedCheckResult> {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      return { available: false, lastUpdated: null, error: `HTTP ${response.status}` };
    }

    // For JSON feeds, parse and get the most recent item date
    if (url.endsWith('.json')) {
      const data = await response.json();
      const items = data.items || [];
      if (items.length > 0) {
        // Find the most recent date_published
        const dates = items
          .map((item: { date_published?: string }) => item.date_published)
          .filter(Boolean)
          .map((d: string) => new Date(d).getTime());
        const mostRecent = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;
        return { available: true, lastUpdated: mostRecent };
      }
      return { available: true, lastUpdated: null };
    }

    // For RSS feeds, just check if it loaded successfully
    // We can't easily parse XML in the browser without extra deps
    return { available: true, lastUpdated: null };
  } catch (error) {
    return {
      available: false,
      lastUpdated: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function FeedStatus() {
  const [status, setStatus] = useState<FeedStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAllFeeds() {
      const [insightsRss, insightsJson, digestsRss, digestsJson] = await Promise.all([
        checkFeed(FEED_URLS.insights.rss),
        checkFeed(FEED_URLS.insights.json),
        checkFeed(FEED_URLS.digests.rss),
        checkFeed(FEED_URLS.digests.json),
      ]);

      // Find the most recent publish date across all JSON feeds
      const allDates = [insightsJson.lastUpdated, digestsJson.lastUpdated]
        .filter(Boolean)
        .map(d => new Date(d!).getTime());
      const lastPublished = allDates.length > 0
        ? new Date(Math.max(...allDates)).toISOString()
        : null;

      const allResults = [insightsRss, insightsJson, digestsRss, digestsJson];
      const allOnline = allResults.every(r => r.available);
      const someOnline = allResults.some(r => r.available);

      setStatus({
        insights: { rss: insightsRss, json: insightsJson },
        digests: { rss: digestsRss, json: digestsJson },
        lastPublished,
        allOnline,
        someOnline,
      });
      setIsLoading(false);
    }

    checkAllFeeds();
  }, []);

  const getOverallStatus = (): 'online' | 'degraded' | 'offline' => {
    if (!status) return 'offline';
    if (status.allOnline) return 'online';
    if (status.someOnline) return 'degraded';
    return 'offline';
  };

  const getStatusText = () => {
    const overall = getOverallStatus();
    if (overall === 'online') return 'All feeds are operational';
    if (overall === 'degraded') return 'Some feeds are unavailable';
    return 'Feeds are offline';
  };

  const formatLastPublished = (isoDate: string | null) => {
    if (!isoDate) return 'Unknown';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="mb-8 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
            overallStatus === 'online' ? 'bg-[var(--success)]/20' :
            overallStatus === 'degraded' ? 'bg-[var(--warning)]/20' :
            'bg-[var(--error)]/20'
          }`}>
            {isLoading ? (
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[var(--fg-tertiary)]" />
            ) : (
              <StatusDot status={overallStatus} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--fg-primary)]">
              {isLoading ? 'Checking feeds...' : `Feeds ${overallStatus === 'online' ? 'Online' : overallStatus === 'degraded' ? 'Degraded' : 'Offline'}`}
            </p>
            <p className="text-xs text-[var(--fg-tertiary)]">
              {isLoading ? 'Verifying availability' : getStatusText()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-mono text-xs text-[var(--fg-tertiary)]">Last published</p>
          <p className="text-mono text-xs text-[var(--fg-secondary)]">
            {isLoading ? '...' : formatLastPublished(status?.lastPublished ?? null)}
          </p>
        </div>
      </div>

      {/* Feed availability details */}
      {!isLoading && status && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-4 sm:grid-cols-4">
          <FeedIndicator label="Insights RSS" available={status.insights.rss.available} />
          <FeedIndicator label="Insights JSON" available={status.insights.json.available} />
          <FeedIndicator label="Digests RSS" available={status.digests.rss.available} />
          <FeedIndicator label="Digests JSON" available={status.digests.json.available} />
        </div>
      )}
    </div>
  );
}

function FeedIndicator({ label, available }: { label: string; available: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="relative flex h-2 w-2">
        {available && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${available ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`} />
      </span>
      <span className="text-[var(--fg-tertiary)]">{label}</span>
    </div>
  );
}

function StatusDot({ status }: { status: 'online' | 'offline' | 'degraded' }) {
  const colors = {
    online: 'bg-[var(--success)]',
    offline: 'bg-[var(--error)]',
    degraded: 'bg-[var(--warning)]',
  };

  return (
    <span className="relative flex h-3 w-3">
      {status === 'online' && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${colors[status]} opacity-75`} />
      )}
      <span className={`relative inline-flex h-3 w-3 rounded-full ${colors[status]}`} />
    </span>
  );
}
