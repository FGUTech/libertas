import type { Post, Topic } from "@/types";
import { CountryFlag } from "@/components/CountryFlag";

interface PostMetadataProps {
  post: Post;
  readingTime?: number;
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

export function PostMetadata({ post, readingTime }: PostMetadataProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Topics */}
      <div className="flex flex-wrap items-center gap-2">
        {post.topics.map((topic) => (
          <span key={topic} className={`tag ${topicColors[topic] || ""}`}>
            {topic}
          </span>
        ))}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-small text-[var(--fg-tertiary)]">
        {/* Date */}
        <span className="flex items-center gap-2">
          <CalendarIcon />
          <time dateTime={post.publishedAt}>{formattedDate}</time>
        </span>

        {/* Author */}
        {post.author && (
          <span className="flex items-center gap-2">
            <AuthorIcon />
            <span>{post.author}</span>
          </span>
        )}

        {/* Citations */}
        <span className="flex items-center gap-2">
          <CitationIcon />
          <span>{post.citations.length} sources</span>
        </span>
      </div>

      {/* Scores and Reading Time */}
      <div className="flex flex-wrap items-center gap-4 text-small">
        <ScoreBadge
          label="Freedom Signal"
          score={post.freedomRelevanceScore}
          icon={<SignalIcon />}
        />
        <ScoreBadge
          label="Credibility"
          score={post.credibilityScore}
          icon={<CredibilityIcon />}
        />
        {readingTime !== undefined && (
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md">
            <span className="text-[var(--fg-tertiary)]"><ClockIcon /></span>
            <span className="text-[var(--fg-secondary)]">{readingTime} min read</span>
          </div>
        )}
      </div>

      {/* Geo tags if present */}
      {post.geo && post.geo.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <GeoIcon />
          {post.geo.map((location) => (
            <span key={location} className="tag !text-[14px] inline-flex items-center gap-2 py-1.5 px-3">
              <CountryFlag location={location} size="lg" />
              {location}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface ScoreBadgeProps {
  label: string;
  score: number;
  icon: React.ReactNode;
}

function ScoreBadge({ label, score, icon }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-[var(--success)]";
    if (score >= 70) return "text-[var(--accent-primary)]";
    if (score >= 50) return "text-[var(--warning)]";
    return "text-[var(--error)]";
  };

  const isHighScore = score >= 90;

  return (
    <div
      className={`flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md transition-shadow ${
        isHighScore ? "shadow-[0_0_12px_rgba(0,255,65,0.3)] border border-[var(--accent-primary)]/30" : ""
      }`}
    >
      <span className={isHighScore ? "text-[var(--accent-primary)]" : "text-[var(--fg-tertiary)]"}>{icon}</span>
      <span className="text-[var(--fg-secondary)]">{label}:</span>
      <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
    </div>
  );
}

function CalendarIcon() {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function AuthorIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

function CredibilityIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function GeoIcon() {
  return (
    <svg
      className="icon icon-sm text-[var(--fg-tertiary)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
