/**
 * ScoreBadge Component
 *
 * Displays relevance/credibility scores with visual indicator.
 * Format: [LABEL: XX] with color coding based on score thresholds.
 * Supports optional count-up animation from 0 to target value.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { fontFamilies } from '../../../utils/fonts';
import { ACCENT_PRIMARY, ACCENT_AMBER, ERROR } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface ScoreBadgeProps {
  /** Score label (e.g., "RELEVANCE", "CREDIBILITY") */
  label: string;
  /** Score value (0-100) */
  value: number;
  /** Frame at which badge appears */
  startFrame?: number;
  /** Enable count-up animation from 0 to value (default: false) */
  animate?: boolean;
  /** Animation duration in frames (default: 30 = 1 second at 30fps) */
  animationDuration?: number;
  /** Override automatic color based on score thresholds */
  colorOverride?: string;
  /** Font size in pixels (default: 24) */
  fontSize?: number;
  /** Show background fill (default: false) */
  showBackground?: boolean;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Score thresholds for color coding */
const SCORE_THRESHOLDS = {
  /** Score >= 70 is green */
  high: 70,
  /** Score >= 50 is amber */
  medium: 50,
  /** Score < 50 is red */
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get color based on score value
 * Green (70+), Amber (50-69), Red (<50)
 */
function getScoreColor(value: number): string {
  if (value >= SCORE_THRESHOLDS.high) {
    return ACCENT_PRIMARY; // Matrix green
  }
  if (value >= SCORE_THRESHOLDS.medium) {
    return ACCENT_AMBER; // Amber warning
  }
  return ERROR; // Red error
}

/**
 * Format score value for display (pads single digit with leading zero)
 */
function formatScore(value: number): string {
  const clamped = Math.round(Math.max(0, Math.min(100, value)));
  return clamped.toString().padStart(2, '0');
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  label,
  value,
  startFrame = 0,
  animate = false,
  animationDuration = 30,
  colorOverride,
  fontSize = 24,
  showBackground = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate visibility
  const isVisible = frame >= startFrame;

  // Calculate animated value if animation is enabled
  let displayValue = value;

  if (animate && isVisible) {
    const elapsedFrames = frame - startFrame;

    // Use spring for smooth count-up
    const progress = spring({
      frame: elapsedFrames,
      fps,
      config: {
        damping: 20,
        stiffness: 50,
        mass: 1,
      },
      durationInFrames: animationDuration,
    });

    displayValue = Math.round(progress * value);
  }

  // Get color based on final value (not animated value) for consistency
  const color = colorOverride ?? getScoreColor(value);

  // Entry animation opacity
  const opacity = isVisible
    ? interpolate(
        frame - startFrame,
        [0, 10],
        [0, 1],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  // Entry scale animation
  const scale = isVisible
    ? spring({
        frame: frame - startFrame,
        fps,
        config: {
          damping: 15,
          stiffness: 120,
          mass: 0.5,
        },
      })
    : 0;

  const backgroundStyle = showBackground
    ? {
        backgroundColor: `${color}15`,
        padding: '4px 8px',
        borderRadius: 4,
        border: `1px solid ${color}40`,
      }
    : {};

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: fontFamilies.mono,
        fontWeight: 500,
        fontSize,
        color,
        opacity,
        transform: `scale(${scale})`,
        whiteSpace: 'nowrap',
        ...backgroundStyle,
        ...style,
      }}
    >
      [{label}: {formatScore(displayValue)}]
    </span>
  );
};

// =============================================================================
// MULTI-BADGE COMPONENT
// =============================================================================

export interface ScoreBadgeGroupProps {
  /** Array of badges to display */
  badges: Array<{
    label: string;
    value: number;
    colorOverride?: string;
  }>;
  /** Frame at which badges start appearing */
  startFrame?: number;
  /** Stagger delay between badges in frames (default: 5) */
  stagger?: number;
  /** Enable count-up animation (default: false) */
  animate?: boolean;
  /** Font size in pixels (default: 24) */
  fontSize?: number;
  /** Gap between badges in pixels (default: 16) */
  gap?: number;
  /** Show background fill (default: false) */
  showBackground?: boolean;
  /** Additional inline styles for container */
  style?: React.CSSProperties;
}

/**
 * Render multiple score badges with optional stagger animation
 */
export const ScoreBadgeGroup: React.FC<ScoreBadgeGroupProps> = ({
  badges,
  startFrame = 0,
  stagger = 5,
  animate = false,
  fontSize = 24,
  gap = 16,
  showBackground = false,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap,
        ...style,
      }}
    >
      {badges.map((badge, index) => (
        <ScoreBadge
          key={`${badge.label}-${index}`}
          label={badge.label}
          value={badge.value}
          startFrame={startFrame + index * stagger}
          animate={animate}
          fontSize={fontSize}
          showBackground={showBackground}
          colorOverride={badge.colorOverride}
        />
      ))}
    </div>
  );
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the color for a given score value
 * Useful for external components that need to match badge colors
 */
export { getScoreColor };

/**
 * Calculate total animation duration for a badge group
 */
export function getBadgeGroupDuration(
  badgeCount: number,
  stagger: number = 5,
  animationDuration: number = 30
): number {
  return (badgeCount - 1) * stagger + animationDuration;
}

/**
 * Score thresholds for external reference
 */
export { SCORE_THRESHOLDS };

export default ScoreBadge;
