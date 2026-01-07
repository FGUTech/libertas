import { Suspense } from "react";
import Link from "next/link";
import { PostsFeed } from "./PostsFeed";
import { PostsFeedSkeleton } from "./PostsFeedSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts | Libertas",
  description:
    "Browse all published freedom tech research and insights. Filter by topic, sort by relevance or date.",
};

export default function PostsPage() {
  return (
    <div className="matrix-bg min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <div className="container py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="text-mono text-[var(--accent-primary)] hover:glow-text transition-all"
            >
              {">"} libertas
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/intake"
                className="btn btn-ghost text-sm"
              >
                Submit Signal
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-h1 mb-2">All Signals</h1>
            <p className="text-body text-[var(--fg-secondary)]">
              Browse published research and insights on freedom tech.
            </p>
          </div>

          <Suspense fallback={<PostsFeedSkeleton />}>
            <PostsFeed />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8">
        <div className="container">
          <div className="flex items-center justify-between text-small text-[var(--fg-tertiary)]">
            <span>
              <span className="text-[var(--accent-primary)]">{">"}</span> built by{" "}
              <a
                href="https://github.com/FGUTech"
                className="text-[var(--fg-secondary)] hover:text-[var(--accent-primary)]"
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
