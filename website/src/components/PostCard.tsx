import type { Post, Topic } from "@/types";

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

export function PostCard({ post }: PostCardProps) {
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
