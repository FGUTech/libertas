import Link from "next/link";
import { ContentCard } from "@/components/PostCard";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { HeroSection } from "@/components/HeroSection";
import { getAllContent, getAllPosts, isPost } from "@/lib/posts";
import type { Post, ContentItem } from "@/types";

export default function Home() {
  // Load all content sorted by time-decayed relevance (score - days old)
  const now = Date.now();
  const content = getAllContent()
    .sort((a: ContentItem, b: ContentItem) => {
      const scoreA = isPost(a)
        ? a.freedomRelevanceScore - (now - new Date(a.publishedAt).getTime()) / 864e5
        : -Infinity;
      const scoreB = isPost(b)
        ? b.freedomRelevanceScore - (now - new Date(b.publishedAt).getTime()) / 864e5
        : -Infinity;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 6);

  // Get posts with geo data for the hero signal map (up to 15 most recent)
  const heroPosts: Post[] = getAllPosts()
    .filter((p) => p.geo && p.geo.length > 0)
    .slice(0, 25);

  return (
    <div className="matrix-bg min-h-screen">
      {/* JSON-LD Structured Data */}
      <WebsiteJsonLd />

      {/* Hero Section */}
      <HeroSection posts={heroPosts} />

      {/* Recent Posts Section */}
      <section className="recent-signals py-14 md:py-16">
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
                className="block h-full"
              >
                <ContentCard item={item} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container container-narrow">
          <div className="card card-glow text-center">
            <h2 className="text-h2 mb-4">Have a Signal to Share?</h2>
            <p className="text-body mb-6 text-[var(--fg-secondary)]">
              Submit stories, project ideas, or feedback about freedom tech and libertas.
              All submissions are reviewed and relevant insights are published.
            </p>
            <Link href="/intake" className="btn btn-primary">
              Submit Now
            </Link>
          </div>
        </div>
      </section>

      {/* Feeds Section */}
      <section className="border-t border-[var(--border-subtle)] py-12 md:py-16">
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
              Works with any feed reader. No tracking of users.
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
