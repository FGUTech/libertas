import { Suspense } from "react";
import { PostsFeed } from "./PostsFeed";
import { PostsFeedSkeleton } from "./PostsFeedSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Signals",
  description:
    "Browse all published freedom tech research and insights. Filter by topic, sort by relevance or date.",
  openGraph: {
    title: "All Signals | Libertas",
    description:
      "Browse published research and insights on freedom tech, privacy, and censorship resistance.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "All Signals | Libertas",
    description:
      "Browse published research and insights on freedom tech, privacy, and censorship resistance.",
  },
};

export default function PostsPage() {
  return (
    <div className="matrix-bg min-h-screen">
      {/* Main Content */}
      <main className="py-8 md:py-12">
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
    </div>
  );
}
