/**
 * HookGif - 480px wide GIF preview of the Hook scene
 *
 * Designed for social media previews and embedding.
 * - 480x270 (16:9 aspect ratio)
 * - 10 second loop (loops Hook scene twice)
 * - No audio (GIF format)
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, Loop } from 'remotion';
import { colors } from '../../utils/colors';
import { fontFamilies } from '../../utils/fonts';
import { MatrixRain } from '../LibertasExplainer/components/MatrixRain';
import { Scanlines } from '../LibertasExplainer/components/Scanlines';

// =============================================================================
// TIMING CONSTANTS (adapted for GIF - no audio)
// =============================================================================

const CURSOR_FADE_DURATION = 9;
const CURSOR_BLINK_START = 15;
const TYPING_START_FRAME = 30;
const MATRIX_RAIN_START = 75;
const CURSOR_BLINK_INTERVAL = 15;

// Single loop duration (5 seconds at 30fps)
const SINGLE_LOOP_FRAMES = 150;

// =============================================================================
// TYPES
// =============================================================================

export interface HookGifProps {
  debug?: boolean;
}

// =============================================================================
// HOOK VISUAL (no audio)
// =============================================================================

const HookVisual: React.FC<{ text: string; debug?: boolean }> = ({
  text = 'initializing libertas...',
  debug = false,
}) => {
  const frame = useCurrentFrame();

  // Cursor fade opacity
  const cursorFadeOpacity = Math.min(1, frame / CURSOR_FADE_DURATION);

  // Cursor blink
  const blinkCycle = Math.floor((frame - CURSOR_BLINK_START) / CURSOR_BLINK_INTERVAL);
  const cursorVisible = frame < CURSOR_BLINK_START || blinkCycle % 2 === 0;

  // Matrix rain opacity
  const matrixOpacity = frame >= MATRIX_RAIN_START
    ? Math.min(0.4, (frame - MATRIX_RAIN_START) / 30 * 0.4)
    : 0;

  // Calculate typewriter progress
  const msPerChar = 50;
  const framesPerChar = Math.ceil((msPerChar / 1000) * 30);
  const charsToShow = frame >= TYPING_START_FRAME
    ? Math.floor((frame - TYPING_START_FRAME) / framesPerChar)
    : 0;
  const fullText = `> ${text}`;
  const visibleText = fullText.slice(0, Math.min(charsToShow + 2, fullText.length)); // +2 for "> "
  const typingComplete = charsToShow >= text.length;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      {/* Matrix rain background */}
      {frame >= MATRIX_RAIN_START && (
        <MatrixRain
          opacity={matrixOpacity}
          columnCount={15}
          speedRange={[3, 8]}
          seed="hook-gif-matrix"
          verticalOffset={135}
        />
      )}

      {/* Main content container - fixed positioning to prevent bounce */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Fixed-size container to prevent layout shifts */}
        <div
          style={{
            width: '85%',
            height: 40,
            position: 'relative',
            marginLeft: 30,
          }}
        >
          {/* Text + cursor container with fixed height */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            {/* Prompt and text */}
            <span
              style={{
                fontFamily: fontFamilies.mono,
                fontSize: 24,
                color: colors.accent.primary,
                textShadow: `0 0 5px ${colors.accent.primary}40`,
                whiteSpace: 'pre',
              }}
            >
              {frame >= TYPING_START_FRAME ? visibleText : ''}
            </span>

            {/* Cursor - uses visibility instead of conditional render to prevent bounce */}
            <div
              style={{
                display: 'inline-block',
                width: 8,
                height: 24,
                backgroundColor: colors.accent.primary,
                opacity: cursorVisible ? (frame >= TYPING_START_FRAME ? 1 : cursorFadeOpacity) : 0,
                boxShadow: `0 0 5px ${colors.accent.primary}`,
                marginLeft: 2,
                // Hide cursor completely when typing is done and blink is off
                visibility: (!typingComplete || cursorVisible) ? 'visible' : 'hidden',
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      {/* CRT scanlines */}
      <Scanlines opacity={0.03} flicker={false} />

      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: 10,
            color: colors.fg.tertiary,
            fontFamily: 'monospace',
          }}
        >
          Frame: {frame} / {SINGLE_LOOP_FRAMES}
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const HookGif: React.FC<HookGifProps> = ({ debug = false }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      {/* Loop the hook visual twice for 10 second GIF */}
      <Loop durationInFrames={SINGLE_LOOP_FRAMES} times={2}>
        <HookVisual text="initializing libertas..." debug={debug} />
      </Loop>
    </AbsoluteFill>
  );
};

export default HookGif;
