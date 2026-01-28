/**
 * CTA Scene - Section 6 (1:40 - 1:55)
 *
 * Call to action with URL and prompts. Directs viewers to the website
 * with a clear, memorable CTA.
 * Duration: 450 frames (15s).
 *
 * Frame breakdown (scene-relative):
 * - 0-150: URL types in with strong green glow
 * - 150-300: Terminal prompts type in below URL
 * - 300-450: FGU branding "Built by Cypherpunks"
 */

import React from 'react';
import { Audio } from '@remotion/media';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
  staticFile,
} from 'remotion';
import {
  ACCENT_PRIMARY,
  BG_PRIMARY,
  FG_PRIMARY,
  FG_TERTIARY,
} from '../../../utils/colors';
import { fontFamilies, displayStyle } from '../../../utils/fonts';
import {
  AUDIO_FILES,
  MUSIC_VOLUME_DUCKED,
  VO_VOLUME,
  SFX_VOLUME_TYPING,
} from '../../../utils/audio';
import { MatrixRain } from '../components/MatrixRain';
import { Scanlines } from '../components/Scanlines';
import { TypewriterText, getTypingEndFrame } from '../components/TypewriterText';

// =============================================================================
// TIMING CONSTANTS (scene-relative frames)
// =============================================================================

/** URL typing phase */
const URL_START = 15; // Small delay before typing starts
const URL_TEXT = 'libertas.fgu.tech';
// URL typing ends at ~frame 36 (15 start + 21 frames for 17 chars at 40ms/char)

/** Terminal prompts phase - starts 5 frames after URL typing ends */
const PROMPTS_START = 41;
const PROMPT_STAGGER = 45; // 1.5s between each prompt

/** FGU branding phase */
const BRANDING_START = 200;

/** Total scene duration */
const SCENE_DURATION = 450;

// =============================================================================
// TYPES
// =============================================================================

export interface CTASceneProps {
  debug?: boolean;
}

// =============================================================================
// TERMINAL PROMPTS DATA
// =============================================================================

const TERMINAL_PROMPTS = [
  'explore the signals',
  'subscribe to feeds',
  'submit intel',
];

// =============================================================================
// AUDIO COMPONENT
// =============================================================================

/**
 * Audio for CTA scene
 *
 * Audio levels (adjusted per feedback):
 * - Music ducked: -24dB = 0.063 linear (VO is playing)
 * - VO: 0dB = 1.0 linear
 * - Typing SFX: -6dB = 0.501 linear (louder)
 */
const CTAAudio: React.FC = () => {
  // Volume callbacks (must be functions, not direct values)
  const musicVol = () => MUSIC_VOLUME_DUCKED;
  const voVol = () => VO_VOLUME;
  const typeVol = () => SFX_VOLUME_TYPING;

  return (
    <>
      {/* Background music - looped */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={musicVol}
        loop
      />

      {/* Voiceover - starts after URL typing */}
      <Sequence from={30} name="VO: CTA">
        <Audio
          src={staticFile(AUDIO_FILES.vo.cta)}
          volume={voVol}
        />
      </Sequence>

      {/* URL typing sounds - staggered every 6 frames like AudioTrack */}
      <Sequence from={URL_START} durationInFrames={15} name="SFX: Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={URL_START + 6} durationInFrames={15} name="SFX: Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={URL_START + 12} durationInFrames={15} name="SFX: Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>
      <Sequence from={URL_START + 18} durationInFrames={15} name="SFX: Type 1b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>

      {/* Prompt 1 typing sounds */}
      <Sequence from={PROMPTS_START} durationInFrames={15} name="SFX: Prompt1 Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={PROMPTS_START + 6} durationInFrames={15} name="SFX: Prompt1 Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={PROMPTS_START + 12} durationInFrames={15} name="SFX: Prompt1 Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>

      {/* Prompt 2 typing sounds */}
      <Sequence from={PROMPTS_START + PROMPT_STAGGER} durationInFrames={15} name="SFX: Prompt2 Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={PROMPTS_START + PROMPT_STAGGER + 6} durationInFrames={15} name="SFX: Prompt2 Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={PROMPTS_START + PROMPT_STAGGER + 12} durationInFrames={15} name="SFX: Prompt2 Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>

      {/* Prompt 3 typing sounds */}
      <Sequence from={PROMPTS_START + PROMPT_STAGGER * 2} durationInFrames={15} name="SFX: Prompt3 Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={PROMPTS_START + PROMPT_STAGGER * 2 + 6} durationInFrames={15} name="SFX: Prompt3 Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={PROMPTS_START + PROMPT_STAGGER * 2 + 12} durationInFrames={15} name="SFX: Prompt3 Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>
    </>
  );
};

// =============================================================================
// URL TYPING COMPONENT
// =============================================================================

interface URLTypingProps {
  frame: number;
  fps: number;
}

const URLTyping: React.FC<URLTypingProps> = ({ frame, fps }) => {
  // Pulsing glow effect after typing completes
  const urlTypingEnd = getTypingEndFrame(URL_TEXT, URL_START, 40, fps);
  const isTypingComplete = frame >= urlTypingEnd;

  const glowPulse = isTypingComplete
    ? 1 + Math.sin((frame / fps) * Math.PI * 2) * 0.3
    : 1;

  const baseGlow = isTypingComplete ? 25 : 15;

  // Hide standalone cursor once typing begins (TypewriterText has its own)
  const showStandaloneCursor = frame < URL_START;
  const standaloneCursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          textShadow: `
            0 0 ${baseGlow * glowPulse}px ${ACCENT_PRIMARY},
            0 0 ${baseGlow * glowPulse * 2}px ${ACCENT_PRIMARY}60,
            0 0 ${baseGlow * glowPulse * 3}px ${ACCENT_PRIMARY}30
          `,
        }}
      >
        {/* Standalone blinking cursor (before typing starts) */}
        {showStandaloneCursor && standaloneCursorVisible && (
          <div
            style={{
              display: 'inline-block',
              width: 20,
              height: 72,
              backgroundColor: ACCENT_PRIMARY,
              boxShadow: `0 0 10px ${ACCENT_PRIMARY}, 0 0 20px ${ACCENT_PRIMARY}40`,
            }}
          />
        )}

        {/* URL typewriter text */}
        {frame >= URL_START && (
          <TypewriterText
            text={URL_TEXT}
            startFrame={URL_START}
            msPerChar={40}
            prompt=""
            color={ACCENT_PRIMARY}
            fontSize={72}
            showCursor={!isTypingComplete}
            style={{
              ...displayStyle(72),
              letterSpacing: '0.02em',
            }}
          />
        )}

      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// TERMINAL PROMPTS COMPONENT
// =============================================================================

interface TerminalPromptsProps {
  progress: number;
}

const TerminalPrompts: React.FC<TerminalPromptsProps> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (progress <= 0) return null;

  // Overall container fade in
  const opacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 260,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        opacity,
      }}
    >
      {TERMINAL_PROMPTS.map((prompt, index) => {
        const promptStartFrame = PROMPTS_START + index * PROMPT_STAGGER;
        const isActive = frame >= promptStartFrame;

        if (!isActive) return null;

        // Calculate when this prompt's typing ends
        const typingEndFrame = getTypingEndFrame(prompt, promptStartFrame, 50, fps);
        const isTypingComplete = frame >= typingEndFrame;

        // Determine which prompt is currently being typed
        const nextPromptStartFrame = index < TERMINAL_PROMPTS.length - 1
          ? PROMPTS_START + (index + 1) * PROMPT_STAGGER
          : Infinity;
        const isCurrentlyTyping = frame >= promptStartFrame && frame < nextPromptStartFrame && !isTypingComplete;

        // Highlight glow when prompt completes typing
        const highlightGlow = isTypingComplete
          ? interpolate(
              frame - typingEndFrame,
              [0, 15, 30],
              [0, 15, 8],
              { extrapolateRight: 'clamp' }
            )
          : 0;

        return (
          <div
            key={index}
            style={{
              textShadow: highlightGlow > 0
                ? `0 0 ${highlightGlow}px ${ACCENT_PRIMARY}60`
                : 'none',
            }}
          >
            <TypewriterText
              text={prompt}
              startFrame={promptStartFrame}
              msPerChar={50}
              prompt="> "
              color={ACCENT_PRIMARY}
              fontSize={36}
              showCursor={isCurrentlyTyping || (index === TERMINAL_PROMPTS.length - 1 && isTypingComplete)}
            />
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// FGU BRANDING COMPONENT
// =============================================================================

interface FGUBrandingProps {
  progress: number;
}

const FGUBranding: React.FC<FGUBrandingProps> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (progress <= 0) return null;

  // Fade in animation
  const opacity = interpolate(
    progress,
    [0, 0.5],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Subtle y slide up
  const translateY = spring({
    frame: frame - BRANDING_START,
    fps,
    config: { damping: 20, stiffness: 100 },
    from: 20,
    to: 0,
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Built by Cypherpunks @ StarkWare */}
      <div
        style={{
          ...displayStyle(36),
          color: FG_PRIMARY,
          letterSpacing: '0.06em',
        }}
      >
        Built by Cypherpunks{' '}
        <span style={{ color: FG_TERTIARY }}>@</span>{' '}
        <span style={{ color: ACCENT_PRIMARY }}>StarkWare</span>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CTAScene: React.FC<CTASceneProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // ANIMATION PROGRESS CALCULATIONS
  // ---------------------------------------------------------------------------

  // Terminal prompts progress (150-300 frames)
  const promptsProgress = interpolate(
    frame,
    [PROMPTS_START, PROMPTS_START + 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // FGU branding progress (300-450 frames)
  const brandingProgress = interpolate(
    frame,
    [BRANDING_START, BRANDING_START + 60],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Matrix rain opacity - starts subtle, gets slightly more visible at end
  const matrixOpacity = interpolate(
    frame,
    [0, 30, BRANDING_START, BRANDING_START + 60],
    [0.15, 0.25, 0.25, 0.2],
    { extrapolateRight: 'clamp' }
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/* Audio layer */}
      <CTAAudio />

      {/* Matrix rain background */}
      <MatrixRain
        opacity={matrixOpacity}
        columnCount={25}
        speedRange={[2, 4]}
        seed="cta-matrix"
        verticalOffset={height / 3}
      />

      {/* URL typing animation */}
      <URLTyping frame={frame} fps={fps} />

      {/* Terminal prompts */}
      <TerminalPrompts progress={promptsProgress} />

      {/* FGU branding */}
      <FGUBranding progress={brandingProgress} />

      {/* CRT scanlines overlay */}
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
            {frame < PROMPTS_START
              ? 'URL Typing'
              : frame < BRANDING_START
                ? 'Terminal Prompts'
                : 'FGU Branding'}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default CTAScene;

/** Timing constants for use in parent composition */
export const CTA_TIMING = {
  duration: SCENE_DURATION,
  urlStart: URL_START,
  promptsStart: PROMPTS_START,
  promptStagger: PROMPT_STAGGER,
  brandingStart: BRANDING_START,
} as const;
