import type { ContentItem, Topic, Post, Digest } from "@/types";
import { isDigest } from "@/types";

interface ContentCardProps {
  item: ContentItem;
}

// Legacy alias for backwards compatibility
interface PostCardProps {
  post: Post;
}

const topicColors: Record<Topic, string> = {
  bitcoin: "tag-accent",
  zk: "tag-accent",
  "censorship-resistance": "tag-accent",
  comms: "",
  payments: "",
  identity: "",
  privacy: "tag-accent",
  surveillance: "",
  activism: "",
  sovereignty: "tag-accent",
};

/**
 * ContentCard - Unified card component for posts and digests
 */
export function ContentCard({ item }: ContentCardProps) {
  if (isDigest(item)) {
    return <DigestCard digest={item} />;
  }
  return <PostCardInner post={item} />;
}

/**
 * PostCard - Legacy component for backwards compatibility
 */
export function PostCard({ post }: PostCardProps) {
  return <PostCardInner post={post} />;
}

/**
 * Internal post card renderer
 */
function PostCardInner({ post }: { post: Post }) {
  const primaryTopic = post.topics[0];

  return (
    <article className="card group cursor-pointer transition-all duration-200 hover:border-[var(--border-default)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {primaryTopic && (
          <span className={`tag ${topicColors[primaryTopic] || ""}`}>
            {primaryTopic}
          </span>
        )}
        <span className="text-small text-[var(--fg-tertiary)]">
          {formatDate(post.publishedAt)}
        </span>
      </div>
      <h3 className="text-h3 mb-2 transition-colors group-hover:text-[var(--accent-primary)]">
        {post.title}
      </h3>
      <p className="text-body line-clamp-2 text-[var(--fg-secondary)]">
        {post.summary}
      </p>
      <div className="mt-4 flex items-center gap-4 text-small text-[var(--fg-tertiary)]">
        <span className="flex items-center gap-1">
          <ScoreIcon />
          <span>{post.freedomRelevanceScore}% relevance</span>
        </span>
        {post.citations.length > 0 && (
          <span className="flex items-center gap-1">
            <CitationIcon />
            <span>{post.citations.length} sources</span>
          </span>
        )}
      </div>
    </article>
  );
}

/**
 * DigestCard - Card component specifically for weekly digests
 */
function DigestCard({ digest }: { digest: Digest }) {
  const topicsToShow = digest.topTopics.slice(0, 3);

  return (
    <article className="card group cursor-pointer transition-all duration-200 border-[var(--accent-amber)] hover:border-[var(--accent-amber-hover)] bg-[var(--bg-digest)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="tag tag-digest">
          <DigestIcon />
          Weekly Digest
        </span>
        <span className="text-small text-[var(--fg-tertiary)]">
          {formatDateRange(digest.periodStart, digest.periodEnd)}
        </span>
      </div>
      <h3 className="text-h3 mb-2 transition-colors group-hover:text-[var(--accent-amber)]">
        {digest.title}
      </h3>
      <p className="text-body line-clamp-2 text-[var(--fg-secondary)]">
        {digest.executiveTldr}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-small text-[var(--fg-tertiary)]">
        <span className="flex items-center gap-1">
          <InsightCountIcon />
          <span>{digest.insightCount} insights</span>
        </span>
        {topicsToShow.length > 0 && (
          <span className="flex items-center gap-1">
            <TopicsIcon />
            <span>{topicsToShow.join(", ")}</span>
          </span>
        )}
      </div>
    </article>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  // Same month
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  // Different months
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

function ScoreIcon() {
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
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function CitationIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function DigestIcon() {
  return (
    <svg
      className="icon icon-sm mr-1"
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

function TopicsIcon() {
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
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
