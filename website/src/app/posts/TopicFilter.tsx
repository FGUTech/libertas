"use client";

import { useState } from "react";
import type { Topic } from "@/types";
import { TOPICS } from "@/types";

interface TopicFilterProps {
  selectedTopics: Topic[];
  onTopicToggle: (topic: Topic) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  digestsOnly?: boolean;
  onDigestsOnlyToggle?: () => void;
}

const topicLabels: Record<Topic, string> = {
  bitcoin: "Bitcoin",
  zk: "ZK Proofs",
  "censorship-resistance": "Anti-Censorship",
  comms: "Communications",
  payments: "Payments",
  identity: "Identity",
  privacy: "Privacy",
  surveillance: "Surveillance",
  activism: "Activism",
  sovereignty: "Sovereignty",
};

export function TopicFilter({
  selectedTopics,
  onTopicToggle,
  onClearAll,
  hasActiveFilters,
  digestsOnly,
  onDigestsOnlyToggle,
}: TopicFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show first 5 topics by default, rest when expanded
  const visibleTopics = isExpanded ? TOPICS : TOPICS.slice(0, 5);
  const hiddenCount = TOPICS.length - 5;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-small text-[var(--fg-tertiary)] mr-1">Filter:</span>

      {/* Weekly Digest filter */}
      {onDigestsOnlyToggle && (
        <button
          onClick={onDigestsOnlyToggle}
          className={`tag cursor-pointer transition-all ${
            digestsOnly
              ? "tag-digest"
              : "hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]"
          }`}
        >
          Weekly Digest
        </button>
      )}

      {visibleTopics.map((topic) => {
        const isSelected = selectedTopics.includes(topic);
        return (
          <button
            key={topic}
            onClick={() => onTopicToggle(topic)}
            className={`tag cursor-pointer transition-all ${
              isSelected
                ? "tag-accent"
                : "hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]"
            }`}
          >
            {topicLabels[topic]}
          </button>
        );
      })}

      {!isExpanded && hiddenCount > 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="tag cursor-pointer hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]"
        >
          +{hiddenCount} more
        </button>
      )}

      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="tag cursor-pointer hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]"
        >
          Show less
        </button>
      )}

      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-small text-[var(--fg-tertiary)] hover:text-[var(--accent-primary)] ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
