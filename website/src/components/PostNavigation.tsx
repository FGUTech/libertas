import Link from "next/link";
import type { Post } from "@/types";

interface PostNavigationProps {
  previous: Post | null;
  next: Post | null;
}

export function PostNavigation({ previous, next }: PostNavigationProps) {
  return (
    <nav className="flex flex-col sm:flex-row gap-4 sm:justify-between border-t border-[var(--border-subtle)] pt-8">
      {previous ? (
        <Link
          href={`/posts/${previous.slug}`}
          className="group flex-1 flex items-start gap-3 p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
        >
          <ChevronLeftIcon />
          <div className="min-w-0">
            <span className="text-small text-[var(--fg-tertiary)] block mb-1">
              Previous
            </span>
            <span className="text-body text-[var(--fg-secondary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
              {previous.title}
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="group flex-1 flex items-start gap-3 p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors sm:text-right sm:flex-row-reverse"
        >
          <ChevronRightIcon />
          <div className="min-w-0">
            <span className="text-small text-[var(--fg-tertiary)] block mb-1">
              Next
            </span>
            <span className="text-body text-[var(--fg-secondary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
              {next.title}
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="icon text-[var(--fg-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors flex-shrink-0 mt-1"
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

function ChevronRightIcon() {
  return (
    <svg
      className="icon text-[var(--fg-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors flex-shrink-0 mt-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
