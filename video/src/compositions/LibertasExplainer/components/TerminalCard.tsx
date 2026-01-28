/**
 * TerminalCard Component
 *
 * Terminal-styled card with CSS borders for reliable rendering.
 * Supports header, body lines, and footer badges with score displays.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { fontFamilies } from '../../../utils/fonts';
import {
  ACCENT_PRIMARY,
  ACCENT_AMBER,
  ERROR,
  BG_TERTIARY,
  FG_PRIMARY,
  FG_SECONDARY,
} from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface Badge {
  /** Badge label (e.g., "RELEVANCE", "CREDIBILITY") */
  label: string;
  /** Badge value (e.g., 95, 88) */
  value: number;
  /** Optional color override for badge */
  color?: string;
}

export interface TerminalCardProps {
  /** Header text displayed at top of card */
  header: string;
  /** Array of body lines to display */
  body: string[];
  /** Footer badges with scores (optional) */
  badges?: Badge[];
  /** Additional footer text line (e.g., topics) */
  footerText?: string;
  /** Accent border color (default: green) */
  accentColor?: 'green' | 'amber' | 'red' | string;
  /** Card width in pixels (default: 700) */
  width?: number;
  /** Font size in pixels (default: 24) */
  fontSize?: number;
  /** Frame at which entry animation begins */
  startFrame?: number;
  /** Entry animation direction (default: 'left') */
  slideFrom?: 'left' | 'right' | 'bottom' | 'top';
  /** Show pulsing border glow (default: false) */
  pulsingBorder?: boolean;
  /** Additional inline styles for container */
  style?: React.CSSProperties;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Map accent names to colors */
const ACCENT_COLORS: Record<string, string> = {
  green: ACCENT_PRIMARY,
  amber: ACCENT_AMBER,
  red: ERROR,
};

/** Animation slide distance in pixels */
const SLIDE_DISTANCE = 100;

/** Animation duration in frames */
const ANIMATION_DURATION = 15;

// =============================================================================
// COMPONENT
// =============================================================================

export const TerminalCard: React.FC<TerminalCardProps> = ({
  header,
  body,
  badges = [],
  footerText,
  accentColor = 'green',
  width = 700,
  fontSize = 24,
  startFrame = 0,
  slideFrom = 'left',
  pulsingBorder = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve accent color
  const borderColor = ACCENT_COLORS[accentColor] ?? accentColor;

  // Calculate animation progress
  const animationProgress =
    startFrame > 0
      ? spring({
          frame: frame - startFrame,
          fps,
          config: {
            damping: 15,
            stiffness: 100,
            mass: 0.5,
          },
        })
      : frame >= startFrame
        ? 1
        : 0;

  // Calculate opacity
  const opacity = interpolate(
    animationProgress,
    [0, 1],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Calculate slide offset
  const slideOffset = interpolate(
    animationProgress,
    [0, 1],
    [SLIDE_DISTANCE, 0],
    { extrapolateRight: 'clamp' }
  );

  // Build slide transform based on direction
  const getSlideTransform = () => {
    switch (slideFrom) {
      case 'left':
        return `translateX(${-slideOffset}px)`;
      case 'right':
        return `translateX(${slideOffset}px)`;
      case 'top':
        return `translateY(${-slideOffset}px)`;
      case 'bottom':
        return `translateY(${slideOffset}px)`;
      default:
        return 'none';
    }
  };

  // Pulsing glow calculation
  const glowIntensity = pulsingBorder
    ? 15 + Math.sin((frame / fps) * Math.PI * 2) * 10
    : 0;

  const boxShadow = pulsingBorder
    ? `0 0 ${glowIntensity}px ${borderColor}40, inset 0 0 ${glowIntensity / 2}px ${borderColor}20`
    : 'none';

  return (
    <div
      style={{
        opacity,
        transform: getSlideTransform(),
        ...style,
      }}
    >
      <div
        style={{
          width,
          fontFamily: fontFamilies.mono,
          fontSize,
          backgroundColor: `${BG_TERTIARY}e0`,
          border: `2px solid ${borderColor}`,
          borderRadius: 4,
          boxShadow,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            color: FG_PRIMARY,
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {header}
        </div>

        {/* Body */}
        <div
          style={{
            padding: '0 20px 16px',
            color: FG_SECONDARY,
            lineHeight: 1.5,
          }}
        >
          {body.map((line, index) => (
            <div key={index} style={{ marginBottom: index < body.length - 1 ? 4 : 0 }}>
              {line}
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: `1px solid ${borderColor}40`,
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {badges.map((badge, index) => (
              <span
                key={index}
                style={{
                  color: badge.color ?? borderColor,
                  fontWeight: 500,
                }}
              >
                [{badge.label}: {badge.value}]
              </span>
            ))}
          </div>
        )}

        {/* Footer text */}
        {footerText && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: badges.length === 0 ? `1px solid ${borderColor}40` : 'none',
              color: FG_SECONDARY,
              fontSize: fontSize * 0.85,
            }}
          >
            {footerText}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Preset configurations for common card styles
 */
export const cardPresets = {
  /** Standard insight card with green border */
  insight: {
    accentColor: 'green' as const,
    width: 700,
    slideFrom: 'left' as const,
  },

  /** Alert/warning card with amber border */
  alert: {
    accentColor: 'amber' as const,
    width: 700,
    slideFrom: 'right' as const,
    pulsingBorder: true,
  },

  /** Error/critical card with red border */
  critical: {
    accentColor: 'red' as const,
    width: 700,
    slideFrom: 'bottom' as const,
    pulsingBorder: true,
  },

  /** Compact card for smaller displays */
  compact: {
    width: 500,
    fontSize: 20,
    slideFrom: 'left' as const,
  },

  /** Wide card for detailed content */
  wide: {
    width: 850,
    fontSize: 22,
    slideFrom: 'bottom' as const,
  },
} as const;

/**
 * Get preset card props by name
 */
export function getCardPreset(
  preset: keyof typeof cardPresets
): Partial<TerminalCardProps> {
  return cardPresets[preset];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate the height of a card in pixels (approximate)
 */
export function getCardHeight(
  bodyLines: number,
  hasBadges: boolean,
  hasFooterText: boolean,
  fontSize: number = 24
): number {
  const lineHeight = fontSize * 1.5;
  const headerHeight = fontSize + 32; // padding
  const bodyHeight = bodyLines * lineHeight + 16; // padding
  const badgeHeight = hasBadges ? fontSize + 24 : 0;
  const footerHeight = hasFooterText ? fontSize * 0.85 + 24 : 0;

  return Math.ceil(headerHeight + bodyHeight + badgeHeight + footerHeight);
}

/**
 * Calculate animation end frame for a card
 */
export function getCardAnimationEndFrame(startFrame: number): number {
  return startFrame + Math.ceil(ANIMATION_DURATION * 1.5);
}

export default TerminalCard;
