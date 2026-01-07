import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";

// Mock data for recent posts - will be replaced with real data fetching
const mockPosts: Post[] = [
  {
    id: "1",
    slug: "bitcoin-mesh-networks-expand-to-rural-communities",
    title: "Bitcoin Mesh Networks Expand to Rural Communities",
    summary:
      "New offline-first Bitcoin transaction protocols are enabling financial sovereignty in areas with limited internet connectivity, using mesh networking and satellite links.",
    content: "",
    publishedAt: "2026-01-05T14:30:00Z",
    tags: ["bitcoin", "mesh-networks", "rural-access"],
    topics: ["bitcoin", "payments", "sovereignty"],
    citations: [
      {
        url: "https://example.com/source1",
        title: "Mesh Network Deployment Report",
        source: "Bitcoin Magazine",
        accessedAt: "2026-01-05T10:00:00Z",
      },
      {
        url: "https://example.com/source2",
        title: "Rural Financial Inclusion Study",
        source: "World Bank",
        accessedAt: "2026-01-05T10:00:00Z",
      },
    ],
    freedomRelevanceScore: 92,
    credibilityScore: 88,
  },
  {
    id: "2",
    slug: "zero-knowledge-proofs-for-private-voting",
    title: "Zero-Knowledge Proofs Enable Private Digital Voting",
    summary:
      "A new ZK-SNARK implementation allows verifiable voting without revealing individual choices, addressing both transparency and privacy concerns in democratic processes.",
    content: "",
    publishedAt: "2026-01-04T09:15:00Z",
    tags: ["zk-proofs", "voting", "democracy"],
    topics: ["zk", "privacy", "identity"],
    citations: [
      {
        url: "https://example.com/source3",
        title: "ZK Voting Protocol Paper",
        source: "ETH Zurich",
        accessedAt: "2026-01-04T08:00:00Z",
      },
    ],
    freedomRelevanceScore: 95,
    credibilityScore: 91,
  },
  {
    id: "3",
    slug: "encrypted-messenger-adoption-surge",
    title: "Encrypted Messenger Adoption Surges in Southeast Asia",
    summary:
      "Signal and Session see record adoption rates following new surveillance legislation, with activists developing localized guides for secure communication practices.",
    content: "",
    publishedAt: "2026-01-03T16:45:00Z",
    tags: ["encryption", "messaging", "activism"],
    topics: ["comms", "privacy", "activism"],
    citations: [
      {
        url: "https://example.com/source4",
        title: "Digital Rights Report 2026",
        source: "EFF",
        accessedAt: "2026-01-03T12:00:00Z",
      },
      {
        url: "https://example.com/source5",
        title: "Messenger Adoption Statistics",
        source: "Signal Foundation",
        accessedAt: "2026-01-03T12:00:00Z",
      },
      {
        url: "https://example.com/source6",
        title: "Regional Security Analysis",
        source: "Access Now",
        accessedAt: "2026-01-03T12:00:00Z",
      },
    ],
    freedomRelevanceScore: 89,
    credibilityScore: 85,
  },
  {
    id: "4",
    slug: "decentralized-identity-standards-finalized",
    title: "W3C Finalizes Decentralized Identity Standards",
    summary:
      "New web standards for self-sovereign identity give users control over their digital credentials without relying on centralized authorities or platforms.",
    content: "",
    publishedAt: "2026-01-02T11:00:00Z",
    tags: ["identity", "w3c", "standards"],
    topics: ["identity", "sovereignty"],
    citations: [
      {
        url: "https://example.com/source7",
        title: "W3C DID Specification",
        source: "W3C",
        accessedAt: "2026-01-02T09:00:00Z",
      },
    ],
    freedomRelevanceScore: 87,
    credibilityScore: 94,
  },
];

export default function Home() {
  return (
    <div className="matrix-bg min-h-screen">
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
            {mockPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <PostCard post={post} />
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
                href="/feed.xml"
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RssIcon />
                RSS Feed
              </a>
              <a
                href="/feed.json"
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
