import type { ContentItem, Post, Digest } from "@/types";
import { isDigest } from "@/types";
import { topicToSignalColor } from "@/lib/signal-colors";
import { CountryFlags } from "@/components/CountryFlag";
import { FormattedDate, FormattedDateRange } from "@/components/FormattedDate";

interface ContentCardProps {
  item: ContentItem;
}

// Legacy alias for backwards compatibility
interface PostCardProps {
  post: Post;
}

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
  const hasGeo = post.geo && post.geo.length > 0;

  return (
    <article className="card group flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:border-[var(--border-default)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {primaryTopic && (
          <span className={`tag tag-signal-${topicToSignalColor(primaryTopic)}`}>
            {primaryTopic}
          </span>
        )}
        <span className="text-sm text-[var(--fg-tertiary)] flex items-center gap-2">
          {hasGeo && <CountryFlags locations={post.geo!} size="md" max={2} />}
          <FormattedDate date={post.publishedAt} />
        </span>
      </div>
      <h3 className="text-h3 mb-2 line-clamp-3 transition-colors group-hover:text-[var(--accent-primary)]">
        {post.title}
      </h3>
      <p className="text-body mb-auto line-clamp-2 text-[var(--fg-secondary)]">
        {post.summary}
      </p>
      <div className="mt-4 flex items-center gap-4 text-small text-[var(--fg-tertiary)]">
        <span
          className={`flex items-center gap-1 ${
            post.freedomRelevanceScore >= 90
              ? "text-[var(--accent-primary)]"
              : ""
          }`}
          style={
            post.freedomRelevanceScore >= 90
              ? { textShadow: "0 0 6px rgba(0, 255, 65, 0.4)" }
              : undefined
          }
        >
          <SignalIcon />
          <span>{post.freedomRelevanceScore}% freedom signal</span>
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
    <article className="card group flex h-full cursor-pointer flex-col overflow-hidden border-[var(--accent-amber)] bg-[var(--bg-digest)] transition-all duration-200 hover:border-[var(--accent-amber-hover)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="tag tag-digest">
          <DigestIcon />
          Weekly Digest
        </span>
        <span className="text-small text-[var(--fg-tertiary)]">
          <FormattedDateRange start={digest.periodStart} end={digest.periodEnd} />
        </span>
      </div>
      <h3 className="text-h3 mb-2 line-clamp-3 transition-colors group-hover:text-[var(--accent-amber)]">
        {digest.title}
      </h3>
      <p className="text-body mb-auto line-clamp-2 text-[var(--fg-secondary)]">
        {digest.tldr}
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


function SignalIcon() {
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
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 20V4" />
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
