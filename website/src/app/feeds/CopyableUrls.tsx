'use client';

import { useEffect, useState } from 'react';
import { CopyButton } from './CopyButton';

const FEED_PATHS = {
  insights: {
    rss: '/insights-rss.xml',
    json: '/insights-feed.json',
  },
  digests: {
    rss: '/digests-rss.xml',
    json: '/digests-feed.json',
  },
};

export function CopyableUrls() {
  const [baseUrl, setBaseUrl] = useState('https://libertas.fgu.tech');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const insightsRssUrl = `${baseUrl}${FEED_PATHS.insights.rss}`;
  const digestsRssUrl = `${baseUrl}${FEED_PATHS.digests.rss}`;

  return (
    <div className="space-y-3 mb-6">
      <div>
        <p className="text-xs text-[var(--fg-tertiary)] mb-1">Insights (daily updates)</p>
        <CopyableUrl url={insightsRssUrl} />
      </div>
      <div>
        <p className="text-xs text-[var(--fg-tertiary)] mb-1">Weekly Digests</p>
        <CopyableUrl url={digestsRssUrl} />
      </div>
    </div>
  );
}

function CopyableUrl({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded-md bg-[var(--bg-secondary)] px-3 py-2 text-mono text-sm text-[var(--accent-primary)] overflow-x-auto">
        {url}
      </code>
      <CopyButton text={url} />
    </div>
  );
}
