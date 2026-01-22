import Link from "next/link";
import { ContentCard } from "@/components/PostCard";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { getAllContent, isPost } from "@/lib/posts";

export default function Home() {
  // Load all content (posts + digests) server-side (uses filesystem, falls back to mock if no content)
  const content = getAllContent().slice(0, 5);

  return (
    <div className="matrix-bg min-h-screen">
      {/* JSON-LD Structured Data */}
      <WebsiteJsonLd />

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-20 md:pb-24 md:pt-32">
        <div className="container container-narrow">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-mono text-[var(--accent-primary)]">
              {">"} initializing
            </span>
            <span className="terminal-cursor inline-block h-5 w-2 bg-[var(--accent-primary)]" />
          </div>

          <h1 className="text-hero mb-6">
            Freedom Tech
            <br />
            <span className="hero-accent">Research Engine</span>
          </h1>

          <p className="text-body mb-8 max-w-xl text-[var(--fg-secondary)]">
            Automated, privacy-preserving research and publishing for
            sovereignty, censorship resistance, and civil liberties. No
            tracking. No gatekeepers. Open source.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/posts" className="btn btn-primary">
              Explore Posts
            </Link>
            <Link href="/intake" className="btn btn-secondary">
              Submit a Signal
            </Link>
          </div>

          {/* Decorative terminal lines */}
          <div className="mt-12 space-y-1 text-mono text-sm text-[var(--fg-tertiary)]">
            <p className="terminal-line">monitoring global signals...</p>
            <p className="terminal-line">classifying freedom relevance...</p>
            <p className="terminal-line">
              publishing insights{" "}
              <span className="text-[var(--accent-primary)]">[OK]</span>
            </p>
          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]" />
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-h2">Recent Signals</h2>
            <Link
              href="/posts"
              className="btn btn-ghost text-sm text-[var(--fg-secondary)] hover:text-[var(--accent-primary)]"
            >
              View all
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid-posts">
            {content.map((item) => (
              <Link
                key={item.id}
                href={isPost(item) ? `/posts/${item.slug}` : `/digests/${item.slug}`}
              >
                <ContentCard item={item} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container container-narrow">
          <div className="card card-glow text-center">
            <h2 className="text-h2 mb-4">Have a Signal to Share?</h2>
            <p className="text-body mb-6 text-[var(--fg-secondary)]">
              Submit stories, project ideas, or feedback about freedom tech. We
              review every submission and publish relevant insights.
            </p>
            <Link href="/intake" className="btn btn-primary">
              Submit Now
            </Link>
          </div>
        </div>
      </section>

      {/* Feeds Section */}
      <section className="border-t border-[var(--border-subtle)] py-16 md:py-24">
        <div className="container container-narrow">
          <div className="text-center">
            <h2 className="text-h2 mb-4">Subscribe to Feeds</h2>
            <p className="text-body mb-8 text-[var(--fg-secondary)]">
              Access our content programmatically. No accounts required.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/insights-rss.xml"
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RssIcon />
                RSS Feed
              </a>
              <a
                href="/insights-feed.json"
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <JsonIcon />
                JSON Feed
              </a>
            </div>

            <p className="mt-6 text-small text-[var(--fg-tertiary)]">
              Works with any feed reader. No tracking, no analytics.
              <br />
              <Link
                href="/feeds"
                className="text-[var(--fg-secondary)] hover:text-[var(--accent-primary)]"
              >
                View feed documentation
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icon Components
function ArrowRightIcon() {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

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
