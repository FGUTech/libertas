/**
 * TerminalCard Component
 *
 * Box-drawing character card for displaying content in terminal style.
 * Uses Unicode box drawing characters (┌ ─ ┐ │ └ ┘) for borders.
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
  /** Card width in characters (default: 45) */
  widthChars?: number;
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

/** Box drawing characters */
const BOX = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
} as const;

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
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build horizontal border line with corners
 */
function buildHorizontalLine(
  leftChar: string,
  rightChar: string,
  width: number
): string {
  return leftChar + BOX.horizontal.repeat(width - 2) + rightChar;
}

/**
 * Pad a line to fit within the card width
 */
function padLine(content: string, width: number): string {
  const innerWidth = width - 4; // Account for "│ " and " │"
  const paddedContent = content.slice(0, innerWidth).padEnd(innerWidth);
  return `${BOX.vertical} ${paddedContent} ${BOX.vertical}`;
}

/**
 * Build an empty line for spacing
 */
function emptyLine(width: number): string {
  return padLine('', width);
}

/**
 * Format badges as a single line: [LABEL: value] [LABEL: value]
 */
function formatBadges(badges: Badge[]): string {
  const badgeStrings = badges.map((b) => `[${b.label}: ${b.value}]`);
  return badgeStrings.join(' ');
}

// =============================================================================
// COMPONENT
// =============================================================================

export const TerminalCard: React.FC<TerminalCardProps> = ({
  header,
  body,
  badges = [],
  footerText,
  accentColor = 'green',
  widthChars = 45,
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

  // Build card lines
  const lines: string[] = [];

  // Top border
  lines.push(buildHorizontalLine(BOX.topLeft, BOX.topRight, widthChars));

  // Header
  lines.push(padLine(header, widthChars));

  // Empty line after header
  lines.push(emptyLine(widthChars));

  // Body lines
  for (const line of body) {
    lines.push(padLine(line, widthChars));
  }

  // Empty line before footer if we have badges or footer text
  if (badges.length > 0 || footerText) {
    lines.push(emptyLine(widthChars));
  }

  // Badges line
  if (badges.length > 0) {
    lines.push(padLine(formatBadges(badges), widthChars));
  }

  // Footer text (e.g., topics)
  if (footerText) {
    lines.push(padLine(footerText, widthChars));
  }

  // Bottom border
  lines.push(buildHorizontalLine(BOX.bottomLeft, BOX.bottomRight, widthChars));

  // Pulsing glow calculation
  const glowIntensity = pulsingBorder
    ? 15 + Math.sin((frame / fps) * Math.PI * 2) * 10 // Pulses between 5px and 25px
    : 0;

  const glowStyle = pulsingBorder
    ? { boxShadow: `0 0 ${glowIntensity}px ${borderColor}40` }
    : {};

  return (
    <div
      style={{
        opacity,
        transform: getSlideTransform(),
        ...style,
      }}
    >
      <pre
        style={{
          fontFamily: fontFamilies.mono,
          fontWeight: 400,
          fontSize,
          lineHeight: 1.3,
          margin: 0,
          padding: 16,
          backgroundColor: `${BG_TERTIARY}e0`, // Slightly transparent
          borderRadius: 4,
          color: borderColor,
          whiteSpace: 'pre',
          ...glowStyle,
        }}
      >
        {lines.map((line, index) => {
          // First and last lines are borders (always accent color)
          // Header line gets special treatment
          // Badge values could be highlighted
          const isHeader = index === 1;
          const isBorder = index === 0 || index === lines.length - 1;
          const isBadgeLine =
            badges.length > 0 && line.includes('[') && line.includes(']');

          if (isBorder) {
            return (
              <span key={index} style={{ color: borderColor }}>
                {line}
                {'\n'}
              </span>
            );
          }

          if (isHeader) {
            // Header line - use pre-formatted line with styled segments
            return (
              <span key={index} style={{ whiteSpace: 'pre' }}>
                <span style={{ color: borderColor }}>{line.slice(0, 2)}</span>
                <span style={{ color: FG_PRIMARY, fontWeight: 500 }}>{line.slice(2, -2)}</span>
                <span style={{ color: borderColor }}>{line.slice(-2)}</span>
                {'\n'}
              </span>
            );
          }

          if (isBadgeLine) {
            // Badge line - render with colored badges, preserve spacing
            const innerContent = line.slice(2, -2); // Content between borders
            const rightPadding = innerContent.length - innerContent.trimEnd().length;
            return (
              <span key={index} style={{ whiteSpace: 'pre' }}>
                <span style={{ color: borderColor }}>{line.slice(0, 2)}</span>
                <span>
                  {renderBadgesWithColors(innerContent.trimEnd(), badges, borderColor)}
                </span>
                <span style={{ color: borderColor }}>
                  {' '.repeat(rightPadding)}{line.slice(-2)}
                </span>
                {'\n'}
              </span>
            );
          }

          // Regular body line - render full line to preserve alignment
          // The line format is: "│ content... │" with proper padding
          return (
            <span key={index} style={{ whiteSpace: 'pre' }}>
              <span style={{ color: borderColor }}>{line.slice(0, 2)}</span>
              <span style={{ color: FG_SECONDARY }}>{line.slice(2, -2)}</span>
              <span style={{ color: borderColor }}>{line.slice(-2)}</span>
              {'\n'}
            </span>
          );
        })}
      </pre>
    </div>
  );
};

// =============================================================================
// BADGE RENDERING HELPER
// =============================================================================

/**
 * Render badges string with individual colors for each badge
 */
function renderBadgesWithColors(
  badgeString: string,
  badges: Badge[],
  defaultColor: string
): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let remaining = badgeString;
  let keyIndex = 0;

  for (const badge of badges) {
    const badgeText = `[${badge.label}: ${badge.value}]`;
    const badgeIndex = remaining.indexOf(badgeText);

    if (badgeIndex > 0) {
      // Add any text before this badge
      elements.push(
        <span key={keyIndex++} style={{ color: FG_SECONDARY }}>
          {remaining.slice(0, badgeIndex)}
        </span>
      );
    }

    if (badgeIndex >= 0) {
      // Add the badge with its color
      const color = badge.color ?? defaultColor;
      elements.push(
        <span key={keyIndex++} style={{ color }}>
          {badgeText}
        </span>
      );
      remaining = remaining.slice(badgeIndex + badgeText.length);
    }
  }

  // Add any remaining text
  if (remaining) {
    elements.push(
      <span key={keyIndex++} style={{ color: FG_SECONDARY }}>
        {remaining}
      </span>
    );
  }

  return <>{elements}</>;
}

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
    widthChars: 45,
    slideFrom: 'left' as const,
  },

  /** Alert/warning card with amber border */
  alert: {
    accentColor: 'amber' as const,
    widthChars: 45,
    slideFrom: 'right' as const,
    pulsingBorder: true,
  },

  /** Error/critical card with red border */
  critical: {
    accentColor: 'red' as const,
    widthChars: 45,
    slideFrom: 'bottom' as const,
    pulsingBorder: true,
  },

  /** Compact card for smaller displays */
  compact: {
    widthChars: 35,
    fontSize: 20,
    slideFrom: 'left' as const,
  },

  /** Wide card for detailed content */
  wide: {
    widthChars: 55,
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
  const lineHeight = fontSize * 1.3;
  const padding = 32; // 16px top + 16px bottom

  // Lines: top border + header + empty + body lines + (empty + badges?) + (footer?) + bottom border
  let totalLines = 3 + bodyLines + 1; // top, header, empty, body, bottom
  if (hasBadges || hasFooterText) totalLines += 1; // empty before footer
  if (hasBadges) totalLines += 1;
  if (hasFooterText) totalLines += 1;

  return Math.ceil(totalLines * lineHeight + padding);
}

/**
 * Calculate animation end frame for a card
 */
export function getCardAnimationEndFrame(startFrame: number): number {
  // Spring animation typically settles around 20-30 frames
  return startFrame + Math.ceil(ANIMATION_DURATION * 1.5);
}

export default TerminalCard;
