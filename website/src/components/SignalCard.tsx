'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { Post } from '@/types';
import { topicToSignalColor } from '@/lib/signal-colors';
import { CountryFlags } from '@/components/CountryFlag';

interface SignalCardProps {
  /** Post(s) at this map location */
  posts: Post[];
  /** Pixel position of the marker relative to the hero section */
  position: { x: number; y: number };
  /** Called when user wants to navigate to a post */
  onNavigate: (slug: string) => void;
  /** Called when mouse enters the card (keeps it open) */
  onMouseEnter: () => void;
  /** Called when mouse leaves the card (closes it) */
  onMouseLeave: () => void;
}

const MAX_VISIBLE = 3;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * SignalCard — popover preview shown when hovering a signal marker
 * on the hero world map. Displays post title, primary topic, date,
 * country flags, and freedom relevance score. Clicking navigates.
 */
export function SignalCard({
  posts,
  position,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: SignalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ top: boolean; left: boolean }>({
    top: false,
    left: false,
  });

  // Determine optimal card placement to keep it within the viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setPlacement({
      top: rect.bottom > vh,
      left: rect.right > vw,
    });
  }, [position]);

  const visiblePosts = posts.slice(0, MAX_VISIBLE);
  const overflow = posts.length - MAX_VISIBLE;

  // Compute the CSS translate to flip the card when it would overflow
  const translateX = placement.left ? 'calc(-100% - 12px)' : '12px';
  const translateY = placement.top ? 'calc(-100% - 12px)' : '12px';

  return (
    <motion.div
      ref={cardRef}
      className="signal-card"
      role="tooltip"
      aria-label="Signal preview"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(${translateX}, ${translateY})`,
        transformOrigin: placement.top
          ? placement.left
            ? 'bottom right'
            : 'bottom left'
          : placement.left
            ? 'top right'
            : 'top left',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <div className="signal-card-inner">
        {visiblePosts.map((post) => {
          const primaryTopic = post.topics[0];
          const hasGeo = post.geo && post.geo.length > 0;

          return (
            <button
              key={post.id}
              className="signal-card-item"
              onClick={() => onNavigate(post.slug)}
              type="button"
            >
              {/* Header row: topic tag + date + flags */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {primaryTopic && (
                  <span className={`tag tag-signal-${topicToSignalColor(primaryTopic)}`}>
                    {primaryTopic}
                  </span>
                )}
                <span className="text-xs text-[var(--fg-tertiary)] flex items-center gap-1.5">
                  {hasGeo && (
                    <CountryFlags locations={post.geo!} size="sm" max={2} />
                  )}
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              {/* Title */}
              <h4 className="signal-card-title">{post.title}</h4>

              {/* Freedom relevance score badge */}
              <div className="flex items-center gap-1 mt-1">
                <SignalIcon />
                <span
                  className={`text-xs ${
                    post.freedomRelevanceScore >= 90
                      ? `text-[var(--signal-${primaryTopic ? topicToSignalColor(primaryTopic) : 'green'})]`
                      : 'text-[var(--fg-tertiary)]'
                  }`}
                  style={
                    post.freedomRelevanceScore >= 90
                      ? { textShadow: `0 0 6px color-mix(in srgb, var(--signal-${primaryTopic ? topicToSignalColor(primaryTopic) : 'green'}) 40%, transparent)` }
                      : undefined
                  }
                >
                  {post.freedomRelevanceScore}% signal
                </span>
              </div>
            </button>
          );
        })}

        {overflow > 0 && (
          <div className="signal-card-overflow">
            +{overflow} more signal{overflow !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </motion.div>
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
