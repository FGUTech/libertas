/**
 * TypewriterText Component
 *
 * Terminal-style typewriter text effect with character-by-character reveal
 * and blinking cursor. Uses JetBrains Mono font with Matrix green default color.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamilies } from '../../../utils/fonts';
import { ACCENT_PRIMARY } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface TypewriterTextProps {
  /** The text to type out */
  text: string;
  /** Frame at which typing begins */
  startFrame: number;
  /** Milliseconds per character (default: 50ms = 20 chars/sec) */
  msPerChar?: number;
  /** Show blinking cursor at end (default: true) */
  showCursor?: boolean;
  /** Prompt prefix before text (default: none, use "> " for terminal style) */
  prompt?: string;
  /** Text color (default: #00ff41 Matrix green) */
  color?: string;
  /** Font size in pixels (default: 32) */
  fontSize?: number;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Cursor blink interval in frames (0.5s on, 0.5s off = 1s cycle) */
const CURSOR_BLINK_FRAMES = 15; // 0.5s at 30fps

// =============================================================================
// COMPONENT
// =============================================================================

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame,
  msPerChar = 50,
  showCursor = true,
  prompt = '',
  color = ACCENT_PRIMARY,
  fontSize = 32,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert ms per char to chars per frame
  // msPerChar = 50 means 1000/50 = 20 chars per second = 20/30 = 0.667 chars per frame
  const charsPerSecond = 1000 / msPerChar;
  const charsPerFrame = charsPerSecond / fps;

  // Calculate how many characters to show
  const elapsedFrames = Math.max(0, frame - startFrame);
  const charCount = Math.min(Math.floor(elapsedFrames * charsPerFrame), text.length);

  // Get the visible text using string slice
  const visibleText = text.slice(0, charCount);

  // Blinking cursor: step animation (on for half cycle, off for half cycle)
  const cursorVisible = Math.floor(frame / CURSOR_BLINK_FRAMES) % 2 === 0;

  // Cursor should only show after typing starts and if enabled
  const showCursorNow = showCursor && frame >= startFrame && cursorVisible;

  // Check if typing is complete
  const typingComplete = charCount >= text.length;

  return (
    <div
      style={{
        fontFamily: fontFamilies.mono,
        fontWeight: 400,
        fontSize,
        color,
        whiteSpace: 'pre-wrap',
        lineHeight: 1.4,
        ...style,
      }}
    >
      {/* Prompt prefix - always fully visible */}
      {prompt && (
        <span style={{ opacity: frame >= startFrame ? 1 : 0 }}>{prompt}</span>
      )}

      {/* Typewriter text */}
      <span>{visibleText}</span>

      {/* Blinking cursor */}
      {showCursorNow && (
        <span
          style={{
            display: 'inline-block',
            width: fontSize * 0.6,
            height: fontSize,
            backgroundColor: color,
            marginLeft: 2,
            verticalAlign: 'text-bottom',
            // Cursor gets slightly dimmer after typing completes for subtle effect
            opacity: typingComplete ? 0.8 : 1,
          }}
        />
      )}
    </div>
  );
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Calculate the frame when typing will complete for a given text
 * Useful for sequencing subsequent elements
 */
export function getTypingEndFrame(
  text: string,
  startFrame: number,
  msPerChar: number = 50,
  fps: number = 30
): number {
  const charsPerSecond = 1000 / msPerChar;
  const totalFrames = Math.ceil((text.length / charsPerSecond) * fps);
  return startFrame + totalFrames;
}

/**
 * Calculate typing duration in frames for a given text
 */
export function getTypingDuration(
  text: string,
  msPerChar: number = 50,
  fps: number = 30
): number {
  const charsPerSecond = 1000 / msPerChar;
  return Math.ceil((text.length / charsPerSecond) * fps);
}

export default TypewriterText;
