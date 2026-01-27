/**
 * Hook Scene - Section 1 (0:00 - 0:05)
 *
 * Terminal boot sequence opening. Captures attention with blinking cursor,
 * typewriter text, and Matrix rain reveal. Duration: 150 frames (5s).
 *
 * Frame breakdown:
 * - 0-30: Black screen, cursor fade in and blink
 * - 30-90: Typewriter types "> initializing libertas..."
 * - 90-150: Matrix rain begins, data hum audio
 * - 140-150: Glitch transition to Problem scene
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Easing,
  Sequence,
  staticFile,
} from 'remotion';
import { Audio } from '@remotion/media';
import { colors } from '../../../utils/colors';
import { fontFamilies } from '../../../utils/fonts';
import { TypewriterText } from '../components/TypewriterText';
import { MatrixRain } from '../components/MatrixRain';
import { GlitchTransition } from '../components/GlitchEffect';
import { Scanlines } from '../components/Scanlines';

// =============================================================================
// TIMING CONSTANTS
// =============================================================================

/** Frame when cursor starts fading in */
const CURSOR_FADE_START = 0;

/** Duration of cursor fade in (0.3s at 30fps) */
const CURSOR_FADE_DURATION = 9;

/** Frame when cursor starts blinking (0.5s into scene) */
const CURSOR_BLINK_START = 15;

/** Frame when typing begins */
const TYPING_START_FRAME = 30;

/** Frame when Matrix rain begins */
const MATRIX_RAIN_START = 75;

/** Frame when glitch transition starts (just before scene end) */
const GLITCH_START_FRAME = 140;

/** Duration of glitch transition in frames */
const GLITCH_DURATION = 10;

/** Cursor blink interval in frames (0.5s on, 0.5s off = 1s cycle) */
const CURSOR_BLINK_INTERVAL = 15;

/** Audio file paths */
const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
  sfx: {
    type1: 'audio/sfx/type-1.wav',
    type2: 'audio/sfx/type-2.wav',
    type3: 'audio/sfx/type-3.wav',
    dataHum: 'audio/sfx/data-hum.wav',
    glitch: 'audio/sfx/glitch.wav',
  },
} as const;

// =============================================================================
// AUDIO COMPONENT
// =============================================================================

/**
 * Audio for Hook scene standalone preview
 * Uses scene-relative timing (frame 0 = start of Hook)
 */
const HookAudio: React.FC = () => {
  const { fps } = useVideoConfig();

  // Music volume fades in over first 2 seconds
  const getMusicVolume = (f: number) => {
    const fadeInFrames = fps * 2;
    if (f < fadeInFrames) {
      return 0.35 * (f / fadeInFrames);
    }
    return 0.35;
  };

  return (
    <>
      {/* Background music - fades in */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={getMusicVolume}
      />

      {/* Typing sounds - staggered during typewriter (frames 30-90) */}
      <Sequence from={TYPING_START_FRAME} durationInFrames={15} name="SFX: Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={0.5} />
      </Sequence>
      <Sequence from={TYPING_START_FRAME + 6} durationInFrames={15} name="SFX: Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={0.5} />
      </Sequence>
      <Sequence from={TYPING_START_FRAME + 12} durationInFrames={15} name="SFX: Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={0.5} />
      </Sequence>
      <Sequence from={TYPING_START_FRAME + 18} durationInFrames={15} name="SFX: Type 1b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={0.5} />
      </Sequence>
      <Sequence from={TYPING_START_FRAME + 24} durationInFrames={15} name="SFX: Type 2b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={0.5} />
      </Sequence>
      <Sequence from={TYPING_START_FRAME + 30} durationInFrames={15} name="SFX: Type 3b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={0.5} />
      </Sequence>

      {/* Data hum - starts with Matrix rain */}
      <Sequence from={MATRIX_RAIN_START} name="SFX: Data Hum">
        <Audio src={staticFile(AUDIO_FILES.sfx.dataHum)} volume={0.15} loop />
      </Sequence>

      {/* Glitch transition sound */}
      <Sequence from={GLITCH_START_FRAME} durationInFrames={30} name="SFX: Glitch">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={0.5} />
      </Sequence>
    </>
  );
};

// =============================================================================
// TYPES
// =============================================================================

export interface HookSceneProps {
  /** Text to type (default: "initializing libertas...") */
  text?: string;
  /** Enable debug overlay showing frame numbers */
  debug?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const HookScene: React.FC<HookSceneProps> = ({
  text = 'initializing libertas...',
  debug = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // CURSOR ANIMATION
  // ---------------------------------------------------------------------------

  // Cursor opacity: fade in from 0 to 1 over CURSOR_FADE_DURATION frames
  const cursorFadeOpacity = interpolate(
    frame,
    [CURSOR_FADE_START, CURSOR_FADE_START + CURSOR_FADE_DURATION],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.ease),
    }
  );

  // Cursor blink: step animation (on for half interval, off for half)
  const blinkCycle = Math.floor((frame - CURSOR_BLINK_START) / CURSOR_BLINK_INTERVAL);
  const cursorVisible = frame < CURSOR_BLINK_START || blinkCycle % 2 === 0;

  // Hide standalone cursor once typing begins (TypewriterText has its own cursor)
  const showStandaloneCursor = frame < TYPING_START_FRAME;

  // ---------------------------------------------------------------------------
  // MATRIX RAIN ANIMATION
  // ---------------------------------------------------------------------------

  // Matrix rain fades in starting at MATRIX_RAIN_START
  const matrixOpacity = interpolate(
    frame,
    [MATRIX_RAIN_START, MATRIX_RAIN_START + 30],
    [0, 0.4],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.ease),
    }
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <GlitchTransition
      startFrame={GLITCH_START_FRAME}
      durationFrames={GLITCH_DURATION}
      intensity={0.7}
      sliceCount={10}
    >
      <AbsoluteFill
        style={{
          backgroundColor: colors.bg.primary,
        }}
      >
        {/* Audio layer - music and SFX for Hook scene */}
        <HookAudio />

        {/* Matrix rain background - appears at frame 75 */}
        {frame >= MATRIX_RAIN_START && (
          <MatrixRain
            opacity={matrixOpacity}
            columnCount={30}
            speedRange={[3, 8]}
            seed="hook-matrix"
            verticalOffset={540}
          />
        )}

        {/* Main content container - centered terminal prompt */}
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '80%',
              maxWidth: 1200,
              paddingLeft: 100, // Offset from center for terminal aesthetic
            }}
          >
            {/* Standalone blinking cursor (before typing starts) */}
            {showStandaloneCursor && cursorVisible && (
              <div
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 48,
                  backgroundColor: colors.accent.primary,
                  opacity: cursorFadeOpacity,
                  boxShadow: `0 0 10px ${colors.accent.primary}, 0 0 20px ${colors.accent.primary}40`,
                }}
              />
            )}

            {/* Typewriter text (starts at frame 30) */}
            {frame >= TYPING_START_FRAME && (
              <TypewriterText
                text={text}
                startFrame={TYPING_START_FRAME}
                msPerChar={50}
                prompt="> "
                color={colors.accent.primary}
                fontSize={48}
                showCursor={true}
                style={{
                  textShadow: `0 0 10px ${colors.accent.primary}40`,
                }}
              />
            )}
          </div>
        </AbsoluteFill>

        {/* CRT scanlines overlay - subtle throughout */}
        <Scanlines opacity={0.03} flicker={false} />

        {/* Debug overlay */}
        {debug && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              fontFamily: fontFamilies.mono,
              fontSize: 14,
              color: colors.fg.tertiary,
              backgroundColor: `${colors.bg.secondary}cc`,
              padding: '8px 12px',
              borderRadius: 4,
            }}
          >
            <div>Frame: {frame}</div>
            <div>Time: {(frame / fps).toFixed(2)}s</div>
            <div>Cursor: {cursorVisible ? 'ON' : 'OFF'}</div>
            <div>Matrix: {frame >= MATRIX_RAIN_START ? 'ON' : 'OFF'}</div>
          </div>
        )}
      </AbsoluteFill>
    </GlitchTransition>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default HookScene;

/** Timing constants for use in parent composition */
export const HOOK_TIMING = {
  /** Total duration of Hook scene in frames */
  duration: 150,
  /** Frame when typing starts */
  typingStart: TYPING_START_FRAME,
  /** Frame when Matrix rain starts */
  matrixStart: MATRIX_RAIN_START,
  /** Frame when glitch transition starts */
  glitchStart: GLITCH_START_FRAME,
} as const;
