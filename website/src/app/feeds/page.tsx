import type { Metadata } from "next";
import { CopyButton } from './CopyButton';

export const metadata: Metadata = {
  title: "RSS & JSON Feeds",
  description:
    "Access Libertas content programmatically via RSS and JSON feeds. No accounts, no API keys, no tracking. Subscribe with any feed reader.",
  openGraph: {
    title: "RSS & JSON Feeds | Libertas",
    description:
      "Access Libertas content programmatically. No accounts, no API keys, no tracking.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RSS & JSON Feeds | Libertas",
    description:
      "Access Libertas content programmatically. No accounts, no API keys, no tracking.",
  },
};

// Feed URLs - static files served from public/
const FEED_URLS = {
  rss: '/rss.xml',
  json: '/feed.json',
};

export default function FeedsPage() {
  return (
    <div className="matrix-bg min-h-screen">
      <main className="container container-narrow py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-mono text-[var(--accent-primary)]">{'>'} feeds</span>
            <span className="terminal-cursor inline-block h-4 w-2 bg-[var(--accent-primary)]" />
          </div>

          <h1 className="text-h1 mb-4">RSS &amp; JSON Feeds</h1>

          <p className="text-body text-[var(--fg-secondary)]">
            Access Libertas content programmatically. No accounts, no API keys, no tracking.
            Subscribe with any feed reader or integrate directly into your applications.
          </p>
        </div>

        {/* Feed Status */}
        <FeedStatus />

        {/* Available Feeds */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Available Feeds</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <FeedCard
              title="RSS 2.0"
              description="Standard RSS feed compatible with all major feed readers. Great for Feedly, Inoreader, and newsreader apps."
              url={FEED_URLS.rss}
              icon={<RssIcon />}
              format="XML"
            />

            <FeedCard
              title="JSON Feed"
              description="Modern JSON Feed format for easy programmatic access. Ideal for custom integrations and applications."
              url={FEED_URLS.json}
              icon={<JsonIcon />}
              format="JSON"
            />
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Usage Examples</h2>

          <div className="space-y-6">
            <CodeExample
              title="cURL"
              description="Fetch feeds from the command line"
              code={`# RSS Feed
curl -s ${FEED_URLS.rss}

# JSON Feed
curl -s ${FEED_URLS.json} | jq .`}
              language="bash"
            />

            <CodeExample
              title="JavaScript / TypeScript"
              description="Fetch and parse the JSON feed in your application"
              code={`// Fetch the JSON feed
const response = await fetch('${FEED_URLS.json}');
const feed = await response.json();

// Access posts
feed.items.forEach(item => {
  console.log(item.title);
  console.log(item.url);
  console.log(item.content_text);
});`}
              language="javascript"
            />

            <CodeExample
              title="Python"
              description="Parse the RSS feed with feedparser"
              code={`import feedparser

# Parse the RSS feed
feed = feedparser.parse('${FEED_URLS.rss}')

# Access posts
for entry in feed.entries:
    print(entry.title)
    print(entry.link)
    print(entry.summary)`}
              language="python"
            />

            <CodeExample
              title="n8n Workflow"
              description="Ingest Libertas posts into your n8n automation"
              code={`// HTTP Request Node configuration
{
  "url": "${FEED_URLS.json}",
  "method": "GET",
  "responseFormat": "json"
}

// Then use Item Lists node to iterate over feed.items`}
              language="json"
            />
          </div>
        </section>

        {/* Feed Readers */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Popular Feed Readers</h2>

          <div className="card">
            <p className="text-body mb-4 text-[var(--fg-secondary)]">
              Copy the RSS feed URL and add it to your preferred reader:
            </p>

            <div className="mb-6">
              <CopyableUrl url={FEED_URLS.rss} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReaderLink name="Feedly" url="https://feedly.com" />
              <ReaderLink name="Inoreader" url="https://inoreader.com" />
              <ReaderLink name="NewsBlur" url="https://newsblur.com" />
              <ReaderLink name="Miniflux" url="https://miniflux.app" />
              <ReaderLink name="FreshRSS" url="https://freshrss.org" />
              <ReaderLink name="NetNewsWire" url="https://netnewswire.com" />
            </div>
          </div>
        </section>

        {/* JSON Feed Schema */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">JSON Feed Schema</h2>

          <div className="card">
            <p className="text-body mb-4 text-[var(--fg-secondary)]">
              The JSON feed follows the{' '}
              <a
                href="https://jsonfeed.org/version/1.1"
                target="_blank"
                rel="noopener noreferrer"
                className="citation"
              >
                JSON Feed 1.1 specification
              </a>
              {' '}with Libertas-specific extensions:
            </p>

            <div className="code-block">
              <pre className="text-sm">{`{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Libertas",
  "home_page_url": "https://libertas.fgu.tech",
  "feed_url": "https://libertas.fgu.tech/feed.json",
  "items": [
    {
      "id": "unique-post-id",
      "url": "https://libertas.fgu.tech/posts/example-post",
      "title": "Post Title",
      "content_text": "Plain text content...",
      "content_html": "<p>HTML content...</p>",
      "date_published": "2026-01-07T12:00:00Z",
      "tags": ["bitcoin", "privacy"],
      "_libertas": {
        "topics": ["bitcoin", "sovereignty"],
        "freedom_relevance_score": 85,
        "credibility_score": 90,
        "citations": [...]
      }
    }
  ]
}`}</pre>
            </div>
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="pb-8">
          <div className="card card-glow">
            <h3 className="mb-3 flex items-center gap-2 text-h3">
              <LockIcon />
              Privacy Commitment
            </h3>
            <ul className="space-y-2 text-sm text-[var(--fg-secondary)]">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                No tracking pixels in feed content
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                No analytics or usage monitoring
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                No authentication required
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                Open source feed generation
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

// =============================================================================
// Components
// =============================================================================

function FeedStatus() {
  // In production, this would check actual feed availability
  const status = {
    rss: { available: true, lastUpdated: new Date().toISOString() },
    json: { available: true, lastUpdated: new Date().toISOString() },
  };

  return (
    <div className="mb-8 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--success)]/20">
            <StatusDot status="online" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--fg-primary)]">Feeds Online</p>
            <p className="text-xs text-[var(--fg-tertiary)]">
              All feeds are operational
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-mono text-xs text-[var(--fg-tertiary)]">Last updated</p>
          <p className="text-mono text-xs text-[var(--fg-secondary)]">
            {new Date(status.rss.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FeedCardProps {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  format: string;
}

function FeedCard({ title, description, url, icon, format }: FeedCardProps) {
  return (
    <div className="card group transition-all hover:border-[var(--accent-primary)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
          {icon}
        </div>
        <span className="tag">{format}</span>
      </div>

      <h3 className="text-h3 mb-2">{title}</h3>
      <p className="mb-4 text-sm text-[var(--fg-secondary)]">{description}</p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary w-full"
      >
        <ExternalLinkIcon />
        Open Feed
      </a>
    </div>
  );
}

interface CodeExampleProps {
  title: string;
  description: string;
  code: string;
  language: string;
}

function CodeExample({ title, description, code, language }: CodeExampleProps) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-h3">{title}</h3>
          <p className="text-sm text-[var(--fg-tertiary)]">{description}</p>
        </div>
        <span className="tag tag-accent">{language}</span>
      </div>
      <div className="code-block">
        <pre className="text-sm">{code}</pre>
      </div>
    </div>
  );
}

function CopyableUrl({ url }: { url: string }) {
  const fullUrl = `https://libertas.fgu.tech${url}`;

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded-md bg-[var(--bg-secondary)] px-3 py-2 text-mono text-sm text-[var(--accent-primary)]">
        {fullUrl}
      </code>
      <CopyButton text={fullUrl} />
    </div>
  );
}


interface ReaderLinkProps {
  name: string;
  url: string;
}

function ReaderLink({ name, url }: ReaderLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--fg-secondary)] transition-all hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]"
    >
      {name}
      <ExternalLinkIcon />
    </a>
  );
}

function StatusDot({ status }: { status: 'online' | 'offline' | 'degraded' }) {
  const colors = {
    online: 'bg-[var(--success)]',
    offline: 'bg-[var(--error)]',
    degraded: 'bg-[var(--warning)]',
  };

  return (
    <span className={`inline-block h-3 w-3 rounded-full ${colors[status]}`} />
  );
}

// =============================================================================
// Icons
// =============================================================================

function RssIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

function JsonIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
      <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`icon icon-sm text-[var(--success)] ${className || ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  );
}

