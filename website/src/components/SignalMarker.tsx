'use client';

import type { SignalColor } from '@/lib/signal-colors';

interface SignalMarkerProps {
  /** Pixel x position relative to the hero section */
  x: number;
  /** Pixel y position relative to the hero section */
  y: number;
  /** Number of signals at this location */
  postCount: number;
  /** Called when user hovers over the marker */
  onHoverStart: () => void;
  /** Called when user stops hovering the marker */
  onHoverEnd: () => void;
  /** Called when marker is clicked — navigates to the post */
  onClick: () => void;
  /** Whether this marker's preview card is currently showing */
  isActive: boolean;
  /** Index used for staggering animation delay */
  index?: number;
  /** Topic-derived signal color */
  colorKey?: SignalColor;
  /** Freedom relevance score (0-100) for intensity modulation */
  freedomRelevanceScore?: number;
}

export function SignalMarker({
  x,
  y,
  postCount,
  onHoverStart,
  onHoverEnd,
  onClick,
  isActive,
  index = 0,
  colorKey = 'green',
  freedomRelevanceScore,
}: SignalMarkerProps) {
  // Continuous opacity: score 100 → 1.0, score 70 → 0.4, clamped
  const opacity =
    freedomRelevanceScore !== undefined
      ? Math.min(1, Math.max(0.4, 0.4 + ((freedomRelevanceScore - 70) / 30) * 0.6))
      : undefined;

  return (
    <button
      className={`signal-marker signal-marker-${colorKey}${isActive ? ' signal-marker-active' : ''}`}
      style={{
        left: x,
        top: y,
        animationDelay: `${index * 0.4}s`,
        ...(opacity !== undefined && { opacity }),
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      aria-label={`${postCount} signal${postCount !== 1 ? 's' : ''} at this location`}
    />
  );
}
