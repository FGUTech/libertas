"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import type { PostCitation } from "@/types";

interface CitationListProps {
  citations: PostCitation[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="border-t border-[var(--border-subtle)] pt-8 mt-12">
        <h3 className="text-h3 mb-6 flex items-center gap-2">
          <SourceIcon />
          Sources ({citations.length})
        </h3>
        <ol className="space-y-4">
          {citations.map((citation, index) => (
            <CitationItem key={citation.url} citation={citation} index={index} />
          ))}
        </ol>
      </div>
    </Tooltip.Provider>
  );
}

interface CitationItemProps {
  citation: PostCitation;
  index: number;
}

function CitationItem({ citation, index }: CitationItemProps) {
  const formattedDate = new Date(citation.accessedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li className="flex gap-4">
      <span className="text-mono text-[var(--accent-primary)] flex-shrink-0 w-6">
        [{index + 1}]
      </span>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1"
          >
            <span className="text-body text-[var(--fg-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              {citation.title}
            </span>
            <span className="text-small text-[var(--fg-tertiary)] block mt-1">
              {citation.source} — Accessed {formattedDate}
            </span>
            <span className="text-small text-[var(--fg-tertiary)] block mt-1 truncate opacity-60">
              {citation.url}
            </span>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-4 shadow-lg max-w-sm z-50"
            sideOffset={8}
            side="top"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLinkIcon />
                <span className="text-small font-semibold text-[var(--fg-primary)]">
                  {citation.source}
                </span>
              </div>
              <p className="text-small text-[var(--fg-secondary)]">
                {citation.title}
              </p>
              <p className="text-small text-[var(--fg-tertiary)] truncate">
                {citation.url}
              </p>
            </div>
            <Tooltip.Arrow className="fill-[var(--bg-elevated)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </li>
  );
}

function SourceIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ExternalLinkIcon() {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
