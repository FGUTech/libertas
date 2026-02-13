'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { Post } from '@/types';
import { topicToSignalColor } from '@/lib/signal-colors';
import { CountryFlags } from '@/components/CountryFlag';

export interface ContainerBounds {
  width: number;
  height: number;
}

interface SignalCardProps {
  /** Post(s) at this map location */
  posts: Post[];
  /** Pixel position of the marker relative to the hero section */
  position: { x: number; y: number };
  /** Bounds of the hero section container for clamping card position */
  containerBounds?: ContainerBounds;
  /** Called when user wants to navigate to a post */
  onNavigate: (slug: string) => void;
  /** Called when mouse enters the card (keeps it open) */
  onMouseEnter: () => void;
  /** Called when mouse leaves the card (closes it) */
  onMouseLeave: () => void;
}

const MAX_VISIBLE = 3;
const MARKER_OFFSET = 12;
const EDGE_MARGIN = 16;

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
 *
 * On desktop, the card is positioned relative to the marker and clamped
 * within the container bounds. On mobile (<768px), it renders as a
 * centered bottom overlay.
 */
export function SignalCard({
  posts,
  position,
  containerBounds,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: SignalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cardStyle, setCardStyle] = useState<{
    left: number;
    top: number;
    transformOrigin: string;
  }>({
    left: position.x + MARKER_OFFSET,
    top: position.y + MARKER_OFFSET,
    transformOrigin: 'top left',
  });

  // Measure card and compute clamped position before paint
  useLayoutEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) return;

    const el = cardRef.current;
    if (!el) return;

    const cardW = el.offsetWidth;
    const cardH = el.offsetHeight;

    const bounds = containerBounds ?? {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const maxX = bounds.width - EDGE_MARGIN;
    const maxY = bounds.height - EDGE_MARGIN;
    const minX = EDGE_MARGIN;
    const minY = EDGE_MARGIN;

    // Flip threshold: use 80% of container height so cards near the
    // bottom of the map open upward before they'd actually overflow
    const flipMaxY = bounds.height * 0.8;

    // Default placement: bottom-right of marker
    let x = position.x + MARKER_OFFSET;
    let y = position.y + MARKER_OFFSET;
    let flipH = false;
    let flipV = false;

    // Flip horizontally if card overflows right
    if (x + cardW > maxX) {
      x = position.x - MARKER_OFFSET - cardW;
      flipH = true;
    }

    // Flip vertically if card would land in the bottom 20% of container
    if (y + cardH > flipMaxY) {
      y = position.y - MARKER_OFFSET - cardH;
      flipV = true;
    }

    // Clamp to full container bounds even after flipping
    x = Math.max(minX, Math.min(x, maxX - cardW));
    y = Math.max(minY, Math.min(y, maxY - cardH));

    setCardStyle({
      left: x,
      top: y,
      transformOrigin: `${flipV ? 'bottom' : 'top'} ${flipH ? 'right' : 'left'}`,
    });
  }, [position, containerBounds]);

  const visiblePosts = posts.slice(0, MAX_VISIBLE);
  const overflow = posts.length - MAX_VISIBLE;

  const cardContent = (
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
                {post.freedomRelevanceScore}% freedom signal
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
  );

  // Mobile: centered bottom overlay
  if (isMobile) {
    return (
      <motion.div
        ref={cardRef}
        className="signal-card signal-card-mobile"
        role="tooltip"
        aria-label="Freedom signal preview"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {cardContent}
      </motion.div>
    );
  }

  // Desktop: positioned card clamped within container bounds
  return (
    <motion.div
      ref={cardRef}
      className="signal-card"
      role="tooltip"
      aria-label="Freedom signal preview"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        left: cardStyle.left,
        top: cardStyle.top,
        transformOrigin: cardStyle.transformOrigin,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {cardContent}
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
