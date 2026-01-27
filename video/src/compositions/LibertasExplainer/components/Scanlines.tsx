/**
 * Scanlines Component
 *
 * CRT monitor scanline effect for retro aesthetic. Creates subtle horizontal
 * lines that overlay content, simulating the look of old CRT monitors.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { BG_PRIMARY } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface ScanlinesProps {
  /** Spacing between scanlines in pixels (default: 2) */
  lineSpacing?: number;
  /** Overall opacity of the scanlines (default: 0.04, range 0-1) */
  opacity?: number;
  /** Color of the scanlines (default: black #0a0a0a) */
  lineColor?: string;
  /** Enable subtle flicker animation (default: false) */
  flicker?: boolean;
  /** Flicker intensity - how much opacity varies (default: 0.3, range 0-1) */
  flickerIntensity?: number;
  /** Flicker speed - lower is slower (default: 0.5) */
  flickerSpeed?: number;
  /** Seed for deterministic flicker (default: 'scanlines') */
  seed?: string;
  /** Enable moving scanline bar effect (default: false) */
  movingBar?: boolean;
  /** Height of moving bar in pixels (default: 60) */
  movingBarHeight?: number;
  /** Opacity of moving bar (default: 0.03) */
  movingBarOpacity?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const Scanlines: React.FC<ScanlinesProps> = ({
  lineSpacing = 2,
  opacity = 0.04,
  lineColor = BG_PRIMARY,
  flicker = false,
  flickerIntensity = 0.3,
  flickerSpeed = 0.5,
  seed = 'scanlines',
  movingBar = false,
  movingBarHeight = 60,
  movingBarOpacity = 0.03,
}) => {
  const frame = useCurrentFrame();
  const { height, fps } = useVideoConfig();

  // Calculate flicker effect
  let currentOpacity = opacity;
  if (flicker) {
    // Use deterministic random based on frame for reproducible flicker
    // Sample at intervals based on flickerSpeed
    const flickerFrame = Math.floor(frame * flickerSpeed);
    const flickerValue = random(`${seed}-flicker-${flickerFrame}`);

    // Vary opacity within the flicker intensity range
    const flickerRange = opacity * flickerIntensity;
    currentOpacity = opacity - flickerRange / 2 + flickerValue * flickerRange;
  }

  // Calculate moving bar position (loops through screen height)
  // Bar moves slowly down the screen, creating a CRT refresh effect
  const barCycleFrames = fps * 4; // Complete cycle every 4 seconds
  const barProgress = (frame % barCycleFrames) / barCycleFrames;
  const barY = interpolate(barProgress, [0, 1], [-movingBarHeight, height]);

  // Create the scanline pattern using repeating linear gradient
  // This is more performant than rendering individual lines
  const scanlineGradient = `repeating-linear-gradient(
    0deg,
    ${lineColor} 0px,
    ${lineColor} 1px,
    transparent 1px,
    transparent ${lineSpacing}px
  )`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* Main scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: scanlineGradient,
          opacity: currentOpacity,
        }}
      />

      {/* Moving refresh bar (optional) */}
      {movingBar && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: barY,
            width: '100%',
            height: movingBarHeight,
            background: `linear-gradient(
              180deg,
              transparent 0%,
              rgba(255, 255, 255, ${movingBarOpacity}) 50%,
              transparent 100%
            )`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Preset configurations for common scanline effects
 */
export const scanlinePresets = {
  /** Subtle effect - barely visible, good for most scenes */
  subtle: {
    opacity: 0.03,
    lineSpacing: 2,
    flicker: false,
  },

  /** Standard CRT look with slight flicker */
  standard: {
    opacity: 0.05,
    lineSpacing: 2,
    flicker: true,
    flickerIntensity: 0.2,
    flickerSpeed: 0.3,
  },

  /** Heavy retro effect for dramatic moments */
  heavy: {
    opacity: 0.08,
    lineSpacing: 3,
    flicker: true,
    flickerIntensity: 0.4,
    flickerSpeed: 0.5,
    movingBar: true,
  },

  /** VHS-style with prominent moving bar */
  vhs: {
    opacity: 0.04,
    lineSpacing: 2,
    flicker: true,
    flickerIntensity: 0.5,
    flickerSpeed: 0.8,
    movingBar: true,
    movingBarHeight: 80,
    movingBarOpacity: 0.05,
  },
} as const;

/**
 * Get preset scanline props by name
 */
export function getScanlinePreset(
  preset: keyof typeof scanlinePresets
): Partial<ScanlinesProps> {
  return scanlinePresets[preset];
}

export default Scanlines;
