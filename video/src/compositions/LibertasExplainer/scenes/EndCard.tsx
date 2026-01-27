/**
 * EndCard Scene - Section 7 (1:55 - 2:00)
 *
 * Clean logo ending with brand retention. Libertas logo centered with
 * URL below, subtle glow pulse, matrix rain fading out, and cursor blink.
 * Duration: 150 frames (5s).
 *
 * Frame breakdown (scene-relative):
 * - 0-120: Logo and URL visible with pulsing glow, matrix rain fades
 * - 120-150: Logo glows brighter, fade to black
 * - 150: Pure black (#0a0a0a)
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
} from 'remotion';
import {
  ACCENT_PRIMARY,
  BG_PRIMARY,
  FG_TERTIARY,
} from '../../../utils/colors';
import { fontFamilies, displayStyle, terminalStyle } from '../../../utils/fonts';
import { MatrixRain } from '../components/MatrixRain';
import { Scanlines } from '../components/Scanlines';

// =============================================================================
// TIMING CONSTANTS (scene-relative frames)
// =============================================================================

/** Logo and URL display phase */
const LOGO_START = 0;

/** Final fade to black begins */
const FADE_START = 120;

/** Music fade out completes (scene-relative: 120 frames = 4s into scene) */
const MUSIC_FADE_END = 120;

/** Total scene duration */
const SCENE_DURATION = 150;

/** Cursor blink interval in frames (0.5s on, 0.5s off = 1s cycle) */
const CURSOR_BLINK_FRAMES = 15;

// =============================================================================
// AUDIO PATHS
// =============================================================================

const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface EndCardSceneProps {
  debug?: boolean;
}

// =============================================================================
// AUDIO COMPONENT
// =============================================================================

const EndCardAudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Music fades out: starts at normal volume, fades to 0 by MUSIC_FADE_END
  const musicVolume = interpolate(
    frame,
    [0, MUSIC_FADE_END],
    [0.12, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <>
      {/* Background music - section starts at 115s into track, fades out */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={musicVolume}
        startFrom={115 * fps}
      />
    </>
  );
};

// =============================================================================
// LOGO COMPONENT
// =============================================================================

interface LogoDisplayProps {
  progress: number;
  glowIntensity: number;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({ progress, glowIntensity }) => {
  if (progress <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: progress,
      }}
    >
      {/* Libertas logo */}
      <div
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity}px ${ACCENT_PRIMARY}) drop-shadow(0 0 ${glowIntensity * 2}px ${ACCENT_PRIMARY}40)`,
        }}
      >
        <Img
          src={staticFile('images/libertas-logo.png')}
          style={{
            width: 280,
            height: 280,
          }}
        />
      </div>

      {/* URL below logo */}
      <div
        style={{
          marginTop: 40,
          ...displayStyle(48),
          color: ACCENT_PRIMARY,
          textShadow: `
            0 0 ${glowIntensity}px ${ACCENT_PRIMARY},
            0 0 ${glowIntensity * 1.5}px ${ACCENT_PRIMARY}60
          `,
          letterSpacing: '0.05em',
        }}
      >
        libertas.fgu.tech
      </div>
    </div>
  );
};

// =============================================================================
// TERMINAL CURSOR COMPONENT
// =============================================================================

interface TerminalCursorProps {
  visible: boolean;
  opacity: number;
}

const TerminalCursor: React.FC<TerminalCursorProps> = ({ visible, opacity }) => {
  if (!visible || opacity <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        opacity,
      }}
    >
      <span
        style={{
          ...terminalStyle(24),
          color: ACCENT_PRIMARY,
        }}
      >
        &gt;
      </span>
      <div
        style={{
          width: 14,
          height: 24,
          backgroundColor: ACCENT_PRIMARY,
          opacity: 0.8,
        }}
      />
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EndCardScene: React.FC<EndCardSceneProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // ANIMATION PROGRESS CALCULATIONS
  // ---------------------------------------------------------------------------

  // Logo opacity - holds then fades in final 30 frames (1s)
  const logoOpacity = interpolate(
    frame,
    [LOGO_START, LOGO_START + 15, FADE_START, SCENE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Glow pulse - 2 second cycle (60 frames at 30fps)
  const glowPulseBase = Math.sin((frame / fps) * Math.PI) * 0.4 + 0.6;

  // In final phase, glow intensifies before fade
  const isInFinalPhase = frame >= FADE_START;
  const finalGlowBoost = isInFinalPhase
    ? interpolate(
        frame,
        [FADE_START, FADE_START + 15, SCENE_DURATION],
        [1, 1.8, 0.5],
        { extrapolateRight: 'clamp' }
      )
    : 1;

  const glowIntensity = 20 * glowPulseBase * finalGlowBoost;

  // Matrix rain opacity - fades out as scene progresses
  const matrixOpacity = interpolate(
    frame,
    [0, 30, FADE_START - 30, FADE_START],
    [0.15, 0.12, 0.08, 0],
    { extrapolateRight: 'clamp' }
  );

  // Blinking cursor - step animation (on for half cycle, off for half cycle)
  const cursorVisible = Math.floor(frame / CURSOR_BLINK_FRAMES) % 2 === 0;
  const cursorOpacity = interpolate(
    frame,
    [0, 15, FADE_START, SCENE_DURATION - 15],
    [0, 0.8, 0.8, 0],
    { extrapolateRight: 'clamp' }
  );

  // Scanlines fade out with everything
  const scanlinesOpacity = interpolate(
    frame,
    [FADE_START, SCENE_DURATION],
    [0.03, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/* Audio layer */}
      <EndCardAudio />

      {/* Matrix rain background - fades out */}
      {matrixOpacity > 0 && (
        <MatrixRain
          opacity={matrixOpacity}
          columnCount={20}
          speedRange={[1.5, 3]}
          seed="endcard-matrix"
          verticalOffset={height / 4}
        />
      )}

      {/* Libertas logo and URL */}
      <LogoDisplay progress={logoOpacity} glowIntensity={glowIntensity} />

      {/* Terminal cursor at bottom */}
      <TerminalCursor visible={cursorVisible} opacity={cursorOpacity} />

      {/* CRT scanlines overlay - fades with content */}
      {scanlinesOpacity > 0 && (
        <Scanlines opacity={scanlinesOpacity} flicker={false} />
      )}

      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            fontFamily: fontFamilies.mono,
            fontSize: 14,
            color: FG_TERTIARY,
            backgroundColor: `${BG_PRIMARY}cc`,
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <div>Frame: {frame}</div>
          <div>Time: {(frame / fps).toFixed(2)}s</div>
          <div>
            Phase:{' '}
            {frame < FADE_START ? 'Logo Display' : 'Fade to Black'}
          </div>
          <div>Logo opacity: {logoOpacity.toFixed(2)}</div>
          <div>Glow: {glowIntensity.toFixed(1)}</div>
          <div>Matrix: {matrixOpacity.toFixed(2)}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default EndCardScene;

/** Timing constants for use in parent composition */
export const ENDCARD_TIMING = {
  duration: SCENE_DURATION,
  logoStart: LOGO_START,
  fadeStart: FADE_START,
  musicFadeEnd: MUSIC_FADE_END,
} as const;
