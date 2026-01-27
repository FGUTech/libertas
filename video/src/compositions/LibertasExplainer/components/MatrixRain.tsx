/**
 * MatrixRain Component
 *
 * Falling green code rain effect for backgrounds. Creates the iconic Matrix
 * digital rain with katakana, numbers, and symbols falling at variable speeds.
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, random } from 'remotion';
import { fontFamilies } from '../../../utils/fonts';
import { ACCENT_PRIMARY, ACCENT_SECONDARY } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface MatrixRainProps {
  /** Number of columns to render (default: 40) */
  columnCount?: number;
  /** Overall opacity of the effect (default: 0.8) */
  opacity?: number;
  /** Speed range for columns [min, max] in pixels per frame (default: [2, 8]) */
  speedRange?: [number, number];
  /** Character set to use (default: includes katakana, numbers, symbols) */
  charset?: string;
  /** Seed for deterministic randomness (default: 'matrix-rain') */
  seed?: string;
}

interface RainColumn {
  /** X position (0-1 normalized) */
  x: number;
  /** Speed in pixels per frame */
  speed: number;
  /** Starting Y offset (for stagger) */
  startOffset: number;
  /** Characters in this column */
  chars: string[];
  /** Brightness factor (faster = brighter for depth) */
  brightness: number;
  /** Font size for this column */
  fontSize: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default character set: Katakana + numbers + symbols */
const DEFAULT_CHARSET =
  // Half-width Katakana
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  // Numbers
  '0123456789' +
  // Symbols
  '!@#$%^&*()_+-=[]{}|;:,.<>?/~`' +
  // Latin characters for variety
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Number of characters per column */
const CHARS_PER_COLUMN = 25;

/** Character change interval in frames (randomizes characters periodically) */
const CHAR_CHANGE_INTERVAL = 4;

// =============================================================================
// COMPONENT
// =============================================================================

export const MatrixRain: React.FC<MatrixRainProps> = ({
  columnCount = 40,
  opacity = 0.8,
  speedRange = [2, 8],
  charset = DEFAULT_CHARSET,
  seed = 'matrix-rain',
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate deterministic columns once
  const columns = useMemo((): RainColumn[] => {
    const cols: RainColumn[] = [];
    const [minSpeed, maxSpeed] = speedRange;

    for (let i = 0; i < columnCount; i++) {
      // Use deterministic random for reproducible renders
      const colSeed = `${seed}-col-${i}`;
      const speed = minSpeed + random(colSeed + '-speed') * (maxSpeed - minSpeed);
      const startOffset = random(colSeed + '-offset') * height * 2; // Stagger starts
      const brightness = 0.3 + (speed - minSpeed) / (maxSpeed - minSpeed) * 0.7; // Faster = brighter

      // Generate characters for this column
      const chars: string[] = [];
      for (let j = 0; j < CHARS_PER_COLUMN; j++) {
        const charIndex = Math.floor(random(`${colSeed}-char-${j}`) * charset.length);
        chars.push(charset[charIndex]);
      }

      // Variable font sizes for depth (faster = larger = closer)
      const fontSize = 14 + Math.floor((speed - minSpeed) / (maxSpeed - minSpeed) * 10);

      cols.push({
        x: i / columnCount,
        speed,
        startOffset,
        chars,
        brightness,
        fontSize,
      });
    }

    return cols;
  }, [columnCount, speedRange, charset, seed, height]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        opacity,
        pointerEvents: 'none',
      }}
    >
      {columns.map((column, colIndex) => (
        <RainColumnRenderer
          key={colIndex}
          column={column}
          colIndex={colIndex}
          frame={frame}
          width={width}
          height={height}
          charset={charset}
          seed={seed}
        />
      ))}
    </div>
  );
};

// =============================================================================
// COLUMN RENDERER
// =============================================================================

interface RainColumnRendererProps {
  column: RainColumn;
  colIndex: number;
  frame: number;
  width: number;
  height: number;
  charset: string;
  seed: string;
}

const RainColumnRenderer: React.FC<RainColumnRendererProps> = ({
  column,
  colIndex,
  frame,
  width,
  height,
  charset,
  seed,
}) => {
  const { x, speed, startOffset, chars, brightness, fontSize } = column;

  // Calculate column position
  const xPos = x * width;

  // Calculate current Y position of the column head
  // Column loops when it goes off screen
  const totalTravel = height + fontSize * CHARS_PER_COLUMN;
  const rawY = (frame * speed + startOffset) % totalTravel;
  const headY = rawY - fontSize * CHARS_PER_COLUMN + height;

  // Generate the characters to display
  // Periodically mutate some characters for the "code changing" effect
  const charChangeOffset = Math.floor(frame / CHAR_CHANGE_INTERVAL);

  return (
    <div
      style={{
        position: 'absolute',
        left: xPos,
        top: headY,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: fontFamilies.mono,
        fontSize,
        fontWeight: 400,
        lineHeight: 1,
      }}
    >
      {chars.map((baseChar, charIndex) => {
        // Occasionally swap characters for animation effect
        const shouldChange =
          (charIndex + charChangeOffset) % 7 === 0 &&
          random(`${seed}-change-${colIndex}-${charIndex}-${charChangeOffset}`) > 0.5;

        const displayChar = shouldChange
          ? charset[
              Math.floor(
                random(`${seed}-newchar-${colIndex}-${charIndex}-${charChangeOffset}`) *
                  charset.length
              )
            ]
          : baseChar;

        // Calculate opacity based on position in column
        // Head (first char) is brightest, trailing chars fade
        const fadePosition = charIndex / CHARS_PER_COLUMN;
        const charOpacity = brightness * (1 - fadePosition * 0.9);

        // First character is brighter (the "head" of the rain)
        const isHead = charIndex === 0;
        const color = isHead ? '#ffffff' : ACCENT_PRIMARY;

        // Skip rendering very dim characters for performance
        if (charOpacity < 0.05) {
          return null;
        }

        return (
          <span
            key={charIndex}
            style={{
              color,
              opacity: isHead ? brightness : charOpacity,
              textShadow: isHead
                ? `0 0 10px ${ACCENT_PRIMARY}, 0 0 20px ${ACCENT_PRIMARY}`
                : `0 0 5px ${ACCENT_SECONDARY}`,
            }}
          >
            {displayChar}
          </span>
        );
      })}
    </div>
  );
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates a lighter-weight version of MatrixRain for performance-critical scenes
 * by reducing column count and character mutations
 */
export function getOptimizedMatrixRainProps(
  performanceLevel: 'high' | 'medium' | 'low' = 'medium'
): Partial<MatrixRainProps> {
  switch (performanceLevel) {
    case 'high':
      return { columnCount: 50, opacity: 0.9 };
    case 'medium':
      return { columnCount: 35, opacity: 0.7 };
    case 'low':
      return { columnCount: 20, opacity: 0.5 };
  }
}

export default MatrixRain;
