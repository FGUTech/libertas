/**
 * FlowNode Component
 *
 * Animated node for workflow diagrams. Displays a rounded rectangle
 * with label, optional icon, and spring entry animation. Used in the
 * Workflow scene (Section 4) to show the Libertas pipeline stages.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { fontFamilies } from '../../../utils/fonts';
import {
  ACCENT_PRIMARY,
  ACCENT_AMBER,
  BG_TERTIARY,
  FG_PRIMARY,
} from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface FlowNodeProps {
  /** Node label (e.g., "SOURCES", "CLASSIFY") */
  label: string;
  /** Optional icon character or emoji */
  icon?: string;
  /** Node accent color (default: green) */
  accentColor?: string;
  /** Node width in pixels (default: 180) */
  width?: number;
  /** Node height in pixels (default: 60) */
  height?: number;
  /** Frame at which node appears */
  startFrame?: number;
  /** X position of node center */
  x: number;
  /** Y position of node center */
  y: number;
  /** Font size for label (default: 20) */
  fontSize?: number;
  /** Show pulsing glow effect (default: false) */
  pulsing?: boolean;
  /** Animation entry direction (default: 'scale') */
  entryStyle?: 'scale' | 'fade' | 'slideUp' | 'slideDown';
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default node dimensions */
const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 60;
const DEFAULT_FONT_SIZE = 20;

/** Border radius for rounded rectangle */
const BORDER_RADIUS = 8;

/** Animation spring config */
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.5,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const FlowNode: React.FC<FlowNodeProps> = ({
  label,
  icon,
  accentColor = ACCENT_PRIMARY,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  startFrame = 0,
  x,
  y,
  fontSize = DEFAULT_FONT_SIZE,
  pulsing = false,
  entryStyle = 'scale',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate animation progress
  const isVisible = frame >= startFrame;
  const animationProgress = isVisible
    ? spring({
        frame: frame - startFrame,
        fps,
        config: SPRING_CONFIG,
      })
    : 0;

  // Calculate opacity
  const opacity = interpolate(
    animationProgress,
    [0, 1],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Calculate entry transform based on style
  const getEntryTransform = () => {
    switch (entryStyle) {
      case 'scale':
        return `scale(${animationProgress})`;
      case 'slideUp': {
        const slideUpOffset = interpolate(animationProgress, [0, 1], [30, 0]);
        return `translateY(${slideUpOffset}px)`;
      }
      case 'slideDown': {
        const slideDownOffset = interpolate(animationProgress, [0, 1], [-30, 0]);
        return `translateY(${slideDownOffset}px)`;
      }
      case 'fade':
      default:
        return 'none';
    }
  };

  // Pulsing glow calculation
  const glowIntensity = pulsing
    ? 10 + Math.sin((frame / fps) * Math.PI * 2) * 8
    : 0;

  const glowStyle = pulsing
    ? { boxShadow: `0 0 ${glowIntensity}px ${accentColor}60` }
    : {};

  // Position style (centered on x, y)
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: x - width / 2,
    top: y - height / 2,
    width,
    height,
  };

  return (
    <div
      style={{
        ...positionStyle,
        opacity,
        transform: getEntryTransform(),
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: BG_TERTIARY,
          border: `2px solid ${accentColor}`,
          borderRadius: BORDER_RADIUS,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          ...glowStyle,
        }}
      >
        {icon && (
          <span
            style={{
              fontSize: fontSize + 4,
              lineHeight: 1,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontFamily: fontFamilies.mono,
            fontWeight: 500,
            fontSize,
            color: FG_PRIMARY,
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Preset configurations for common node types
 */
export const nodePresets = {
  /** Standard workflow stage node */
  stage: {
    width: 180,
    height: 60,
    entryStyle: 'scale' as const,
  },

  /** Source input node (slightly larger) */
  source: {
    width: 200,
    height: 70,
    entryStyle: 'scale' as const,
  },

  /** Digest node with amber accent */
  digest: {
    width: 180,
    height: 60,
    accentColor: ACCENT_AMBER,
    pulsing: true,
    entryStyle: 'scale' as const,
  },

  /** Compact node for tight layouts */
  compact: {
    width: 140,
    height: 50,
    fontSize: 16,
    entryStyle: 'scale' as const,
  },

  /** Large node for emphasis */
  large: {
    width: 220,
    height: 80,
    fontSize: 24,
    entryStyle: 'scale' as const,
  },
} as const;

/**
 * Get preset node props by name
 */
export function getNodePreset(
  preset: keyof typeof nodePresets
): Partial<FlowNodeProps> {
  return nodePresets[preset];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get node edge positions for arrow connections
 * Returns positions for top, bottom, left, right edges
 */
export function getNodeEdgePositions(
  x: number,
  y: number,
  width: number = DEFAULT_WIDTH,
  height: number = DEFAULT_HEIGHT
): {
  top: { x: number; y: number };
  bottom: { x: number; y: number };
  left: { x: number; y: number };
  right: { x: number; y: number };
} {
  return {
    top: { x, y: y - height / 2 },
    bottom: { x, y: y + height / 2 },
    left: { x: x - width / 2, y },
    right: { x: x + width / 2, y },
  };
}

/**
 * Calculate animation end frame for a node
 */
export function getNodeAnimationEndFrame(startFrame: number): number {
  // Spring animation typically settles around 20-25 frames
  return startFrame + 25;
}

export default FlowNode;
