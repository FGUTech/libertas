import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDigestBySlug, getAllDigests } from "@/lib/posts";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ShareButtons } from "@/components/ShareButtons";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { ReadingProgress } from "@/components/ReadingProgress";
import type { Topic } from "@/types";

interface DigestPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DigestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const digest = getDigestBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";

  if (!digest) {
    return {
      title: "Digest Not Found",
    };
  }

  const digestUrl = `${baseUrl}/digests/${digest.slug}`;

  return {
    title: `${digest.title} | Libertas Weekly Digest`,
    description: digest.executiveTldr,
    keywords: [...digest.topTopics, "weekly digest", "freedom tech"],
    alternates: {
      canonical: digestUrl,
    },
    openGraph: {
      title: digest.title,
      description: digest.executiveTldr,
      type: "article",
      url: digestUrl,
      publishedTime: digest.publishedAt,
      tags: digest.topTopics,
    },
    twitter: {
      card: "summary_large_image",
      title: digest.title,
      description: digest.executiveTldr,
    },
  };
}

export async function generateStaticParams() {
  const digests = getAllDigests();
  return digests.map((digest) => ({
    slug: digest.slug,
  }));
}

export default async function DigestPage({ params }: DigestPageProps) {
  const { slug } = await params;
  const digest = getDigestBySlug(slug);

  if (!digest) {
    notFound();
  }

  // Build the full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";
  const digestUrl = `${baseUrl}/digests/${digest.slug}`;

  // Breadcrumb data for structured data
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Signals", url: `${baseUrl}/posts` },
    { name: digest.title, url: digestUrl },
  ];

  return (
    <div className="matrix-bg min-h-screen">
      {/* JSON-LD Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Reading Progress */}
      <ReadingProgress />

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <article className="max-w-4xl mx-auto">
            {/* Back link */}
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-small text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] mb-8 transition-colors"
            >
              <ChevronLeftIcon />
              Back to all signals
            </Link>

            {/* Digest Badge */}
            <div className="mb-4">
              <span className="tag tag-digest inline-flex items-center gap-2">
                <DigestIcon />
                Weekly Digest
              </span>
            </div>

            {/* Title */}
            <h1 className="text-hero mb-4 text-[var(--accent-amber)]">{digest.title}</h1>

            {/* Period */}
            <p className="text-body text-[var(--fg-tertiary)] mb-6">
              {formatDateRange(digest.periodStart, digest.periodEnd)}
            </p>

            {/* Executive TL;DR */}
            <div className="mb-8 p-6 bg-[var(--bg-digest)] border border-[var(--accent-amber)] rounded-lg">
              <h2 className="text-h3 text-[var(--accent-amber)] mb-3">TL;DR</h2>
              <p className="text-body text-[var(--fg-secondary)] leading-relaxed">
                {digest.executiveTldr}
              </p>
            </div>

            {/* Metadata */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-small text-[var(--fg-tertiary)]">
                <InsightCountIcon />
                <span>{digest.insightCount} insights covered</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {digest.topTopics.map((topic) => (
                  <TopicBadge key={topic} topic={topic} />
                ))}
              </div>
            </div>

            {/* Share buttons */}
            <div className="mb-12 pb-8 border-b border-[var(--border-subtle)]">
              <ShareButtons title={digest.title} url={digestUrl} />
            </div>

            {/* Main Content Sections */}
            <div className="prose-container">
              {digest.sections.map((section, index) => (
                <section key={index} className="mb-12">
                  <h2 className="text-h2 text-[var(--fg-primary)] mb-4">{section.title}</h2>
                  <div className="prose-libertas">
                    <MarkdownRenderer content={section.contentMarkdown} />
                  </div>
                </section>
              ))}
            </div>

            {/* Emerging Patterns */}
            {digest.emergingPatterns && digest.emergingPatterns.length > 0 && (
              <section className="mt-12 mb-12 p-6 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                <h2 className="text-h2 text-[var(--accent-amber)] mb-6 flex items-center gap-2">
                  <PatternIcon />
                  Emerging Patterns
                </h2>
                <ul className="space-y-4">
                  {digest.emergingPatterns.map((pattern, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-[var(--accent-amber)] mt-1">{">"}</span>
                      <span className="text-body text-[var(--fg-secondary)]">
                        {pattern.pattern}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Looking Ahead */}
            {digest.lookingAhead && digest.lookingAhead.length > 0 && (
              <section className="mt-12 mb-12 p-6 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                <h2 className="text-h2 text-[var(--accent-amber)] mb-6 flex items-center gap-2">
                  <LookingAheadIcon />
                  Looking Ahead
                </h2>
                <ul className="space-y-3">
                  {digest.lookingAhead.map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-[var(--accent-amber)]">{">"}</span>
                      <span className="text-body text-[var(--fg-secondary)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Share again at bottom */}
            <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
              <ShareButtons title={digest.title} url={digestUrl} />
            </div>

            {/* Back to feed */}
            <div className="mt-12">
              <Link
                href="/posts"
                className="btn btn-secondary"
              >
                <ChevronLeftIcon />
                Back to all signals
              </Link>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8">
        <div className="container">
          <div className="flex items-center justify-between text-small text-[var(--fg-tertiary)]">
            <span>
              <span className="text-[var(--accent-amber)]">{">"}</span> built by{" "}
              <a
                href="https://github.com/FGUTech"
                className="text-[var(--fg-secondary)] hover:text-[var(--accent-amber)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freedom Go Up
              </a>
            </span>
            <span className="tag">No tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to format date range
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const startFormatted = start.toLocaleDateString("en-US", options);
  const endFormatted = end.toLocaleDateString("en-US", { ...options, year: "numeric" });

  return `${startFormatted} - ${endFormatted}`;
}

// Topic badge component
function TopicBadge({ topic }: { topic: Topic }) {
  const accentTopics = ["bitcoin", "zk", "censorship-resistance", "privacy", "sovereignty"];
  const isAccent = accentTopics.includes(topic);

  return (
    <span className={`tag ${isAccent ? "tag-accent" : ""}`}>
      {topic}
    </span>
  );
}

// Icons
function ChevronLeftIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function DigestIcon() {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function InsightCountIcon() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function PatternIcon() {
  return (
    <svg
      className="icon icon-lg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function LookingAheadIcon() {
  return (
    <svg
      className="icon icon-lg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
