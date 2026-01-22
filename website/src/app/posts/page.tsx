import { Suspense } from "react";
import { ContentFeed } from "./PostsFeed";
import { PostsFeedSkeleton } from "./PostsFeedSkeleton";
import { getAllContent } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Signals",
  description:
    "Browse all published freedom tech research, insights, and weekly digests. Filter by topic, sort by relevance or date.",
  openGraph: {
    title: "All Signals | Libertas",
    description:
      "Browse published research, insights, and digests on freedom tech, privacy, and censorship resistance.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "All Signals | Libertas",
    description:
      "Browse published research, insights, and digests on freedom tech, privacy, and censorship resistance.",
  },
};

export default function PostsPage() {
  // Load all content (posts + digests) server-side (uses filesystem at build time)
  const content = getAllContent();

  return (
    <div className="matrix-bg min-h-screen">
      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-h1 mb-2">All Signals</h1>
            <p className="text-body text-[var(--fg-secondary)]">
              Browse published research, insights, and weekly digests on freedom tech.
            </p>
          </div>

          <Suspense fallback={<PostsFeedSkeleton />}>
            <ContentFeed items={content} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
