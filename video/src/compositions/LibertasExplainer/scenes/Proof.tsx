/**
 * Proof Scene - Section 5 (1:20 - 1:40)
 *
 * Shows real content examples from Libertas proving the system is working.
 * Features four terminal-style content cards that slide/replace each other,
 * ending in a 2x2 grid with "FREEDOM TECH SIGNALS" overlay.
 * Duration: 600 frames (20s).
 *
 * Frame breakdown (scene-relative):
 * - 0-90: "NEW SIGNALS" title with green glow
 * - 90-210: Iran internet blackout card
 * - 210-300: Uganda mesh network warning card (replaces Iran)
 * - 300-390: Bhutan blockchain sovereignty card (replaces Uganda)
 * - 390-480: EFF copyright censorship card (replaces Bhutan)
 * - 480-600: All 4 cards shrink into 2x2 grid + "FREEDOM TECH SIGNALS" overlay
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
} from 'remotion';
import {
  ACCENT_PRIMARY,
  BG_PRIMARY,
  BG_TERTIARY,
  FG_PRIMARY,
  FG_SECONDARY,
  FG_TERTIARY,
} from '../../../utils/colors';
import { fontFamilies, displayStyle, terminalStyle } from '../../../utils/fonts';
import { MatrixRain } from '../components/MatrixRain';
import { Scanlines } from '../components/Scanlines';
import { GlitchTransition } from '../components/GlitchEffect';

// =============================================================================
// TIMING CONSTANTS (scene-relative frames)
// =============================================================================

/** Title "NEW SIGNALS" appears */
const TITLE_START = 0;
const TITLE_DURATION = 90;

/** Iran card */
const IRAN_START = 90;
const IRAN_DURATION = 120;

/** Uganda card */
const UGANDA_START = 210;
const UGANDA_DURATION = 90;

/** Bhutan card */
const BHUTAN_START = 300;
const BHUTAN_DURATION = 90;

/** EFF card */
const EFF_START = 390;
const EFF_DURATION = 90;

/** Grid view with all cards */
const GRID_START = 480;

/** Total scene duration */
const SCENE_DURATION = 600;

// =============================================================================
// AUDIO PATHS
// =============================================================================

const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
  voProof: 'audio/vo/vo-proof.mp3',
  sfx: {
    success: 'audio/sfx/success.wav',
    glitch: 'audio/sfx/glitch.wav',
  },
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface ProofSceneProps {
  debug?: boolean;
}

interface SignalCard {
  header: string;
  lines: string[];
  relevance?: number;
  credibility?: number;
  topics: string[];
  flag: string; // Emoji flag
  country: string;
}

// =============================================================================
// SIGNAL CARD DATA
// =============================================================================

const SIGNAL_CARDS: SignalCard[] = [
  {
    header: 'SIGNAL: IRAN INTERNET BLACKOUT',
    lines: [
      '> 2,403+ killed during protests',
      '> Total digital darkness',
      '> Satellite internet jammed',
    ],
    relevance: 95,
    credibility: 88,
    topics: ['censorship-resistance', 'comms'],
    flag: '🇮🇷',
    country: 'Iran',
  },
  {
    header: 'SIGNAL: UGANDA MESH NETWORK WARNING',
    lines: [
      '> Government warns against Bitchat',
      '> Offline Bitcoin + encrypted messaging',
      '> Proof the tools are working',
    ],
    relevance: 92,
    credibility: 75,
    topics: ['comms', 'bitcoin'],
    flag: '🇺🇬',
    country: 'Uganda',
  },
  {
    header: 'SIGNAL: BHUTAN BLOCKCHAIN SOVEREIGNTY',
    lines: [
      '> Nation-state validator operations',
      '> Bitcoin mining + digital ID',
    ],
    topics: ['sovereignty', 'bitcoin'],
    flag: '🇧🇹',
    country: 'Bhutan',
  },
  {
    header: 'SIGNAL: COPYRIGHT AS CENSORSHIP',
    lines: [
      '> Statutory damages fuel over-censoring',
      '> Legal frameworks weaponized',
    ],
    topics: ['censorship-resistance'],
    flag: '🇺🇸',
    country: 'USA',
  },
];

// =============================================================================
// AUDIO COMPONENT
// =============================================================================

const ProofAudio: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Background music - section starts at 80s into track */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={0.12}
        startFrom={80 * fps}
      />

      {/* Voiceover - starts at title end */}
      <Sequence from={TITLE_START + 30} name="VO: Proof">
        <Audio
          src={staticFile(AUDIO_FILES.voProof)}
          volume={1.0}
        />
      </Sequence>

      {/* Success SFX on title */}
      <Sequence from={20} durationInFrames={60} name="SFX: Success">
        <Audio src={staticFile(AUDIO_FILES.sfx.success)} volume={0.4} />
      </Sequence>

      {/* Glitch SFX on card transitions */}
      <Sequence from={UGANDA_START - 5} durationInFrames={30} name="SFX: Glitch 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={0.25} />
      </Sequence>
      <Sequence from={BHUTAN_START - 5} durationInFrames={30} name="SFX: Glitch 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={0.25} />
      </Sequence>
      <Sequence from={EFF_START - 5} durationInFrames={30} name="SFX: Glitch 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={0.25} />
      </Sequence>
    </>
  );
};

// =============================================================================
// TITLE COMPONENT
// =============================================================================

interface TitleProps {
  progress: number;
}

const LiveTitle: React.FC<TitleProps> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (progress <= 0) return null;

  const scale = spring({
    frame: frame - TITLE_START,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const glowPulse = 1 + Math.sin((frame / fps) * Math.PI * 3) * 0.3;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: progress,
      }}
    >
      <div
        style={{
          ...displayStyle(96),
          color: ACCENT_PRIMARY,
          textShadow: `
            0 0 ${20 * glowPulse}px ${ACCENT_PRIMARY},
            0 0 ${40 * glowPulse}px ${ACCENT_PRIMARY}60,
            0 0 ${60 * glowPulse}px ${ACCENT_PRIMARY}30
          `,
          transform: `scale(${scale})`,
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}
      >
        NEW SIGNALS
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// TERMINAL SIGNAL CARD COMPONENT
// =============================================================================

interface SignalCardDisplayProps {
  card: SignalCard;
  progress: number;
  slideFrom?: 'left' | 'right';
  compact?: boolean;
  position?: { x: number; y: number };
}

const SignalCardDisplay: React.FC<SignalCardDisplayProps> = ({
  card,
  progress,
  slideFrom = 'left',
  compact = false,
  position,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (progress <= 0) return null;

  const slideOffset = interpolate(
    progress,
    [0, 1],
    [slideFrom === 'left' ? -150 : 150, 0],
    { extrapolateRight: 'clamp' }
  );

  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const scale = compact ? 0.6 : 1;
  const fontSize = compact ? 18 : 24;
  const width = compact ? 380 : 580;
  const padding = compact ? 16 : 24;

  // Pulsing border glow for full-size cards
  const glowIntensity = !compact
    ? 15 + Math.sin((frame / fps) * Math.PI * 2) * 10
    : 8;

  const containerStyle: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        opacity,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        opacity,
        transform: `translateX(${slideOffset}px)`,
      };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width,
          backgroundColor: `${BG_TERTIARY}e8`,
          border: `2px solid ${ACCENT_PRIMARY}`,
          borderRadius: 8,
          padding,
          boxShadow: `0 0 ${glowIntensity}px ${ACCENT_PRIMARY}40`,
        }}
      >
        {/* Header with flag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: compact ? 8 : 12,
            marginBottom: compact ? 8 : 16,
          }}
        >
          <div
            style={{
              ...terminalStyle(fontSize + 4),
              color: FG_PRIMARY,
              letterSpacing: '0.02em',
              flex: 1,
            }}
          >
            {card.header}
          </div>
          <span style={{ fontSize: compact ? 36 : 56 }}>{card.flag}</span>
        </div>

        {/* Body lines */}
        <div style={{ marginBottom: compact ? 8 : 16 }}>
          {card.lines.map((line, i) => (
            <div
              key={i}
              style={{
                ...terminalStyle(fontSize),
                color: FG_SECONDARY,
                marginBottom: compact ? 4 : 8,
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Badges */}
        {(card.relevance || card.credibility) && (
          <div
            style={{
              display: 'flex',
              gap: compact ? 8 : 16,
              marginBottom: compact ? 6 : 12,
            }}
          >
            {card.relevance && (
              <span
                style={{
                  ...terminalStyle(fontSize - 2),
                  color: ACCENT_PRIMARY,
                }}
              >
                [RELEVANCE: {card.relevance}]
              </span>
            )}
            {card.credibility && (
              <span
                style={{
                  ...terminalStyle(fontSize - 2),
                  color: ACCENT_PRIMARY,
                }}
              >
                [CREDIBILITY: {card.credibility}]
              </span>
            )}
          </div>
        )}

        {/* Topics */}
        <div
          style={{
            ...terminalStyle(fontSize - 4),
            color: FG_TERTIARY,
          }}
        >
          topics: {card.topics.join(', ')}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// GRID VIEW COMPONENT
// =============================================================================

interface GridViewProps {
  progress: number;
}

const GridView: React.FC<GridViewProps> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (progress <= 0) return null;

  const gridScale = spring({
    frame: frame - GRID_START,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  // Text appears after cards settle
  const textProgress = interpolate(
    progress,
    [0.5, 1],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const textGlow = 1 + Math.sin((frame / fps) * Math.PI * 2) * 0.2;

  // Grid positions (2x2 centered)
  const gridPositions = [
    { x: 960 - 220 - 190, y: 540 - 160 - 100 }, // top-left
    { x: 960 + 220 - 190, y: 540 - 160 - 100 }, // top-right
    { x: 960 - 220 - 190, y: 540 + 160 - 100 }, // bottom-left
    { x: 960 + 220 - 190, y: 540 + 160 - 100 }, // bottom-right
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Cards in grid */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${gridScale})`,
          transformOrigin: 'center center',
        }}
      >
        {SIGNAL_CARDS.map((card, index) => (
          <SignalCardDisplay
            key={index}
            card={card}
            progress={1}
            compact={true}
            position={gridPositions[index]}
          />
        ))}
      </div>

      {/* Overlay text */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: textProgress,
        }}
      >
        <div
          style={{
            ...displayStyle(56),
            color: ACCENT_PRIMARY,
            textShadow: `
              0 0 ${20 * textGlow}px ${ACCENT_PRIMARY},
              0 0 ${40 * textGlow}px ${ACCENT_PRIMARY}40
            `,
            textAlign: 'center',
            letterSpacing: '0.08em',
          }}
        >
          FREEDOM TECH SIGNALS
        </div>
        <div
          style={{
            ...terminalStyle(28),
            color: FG_SECONDARY,
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Compiled. Published. Open to all.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ProofScene: React.FC<ProofSceneProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // ANIMATION PROGRESS CALCULATIONS
  // ---------------------------------------------------------------------------

  // Title progress (fades out as Iran card comes in)
  const titleProgress = interpolate(
    frame,
    [TITLE_START, TITLE_START + 30, TITLE_START + TITLE_DURATION - 15, TITLE_START + TITLE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Individual card progress (each card visible during its window)
  const iranProgress = interpolate(
    frame,
    [IRAN_START, IRAN_START + 20, IRAN_START + IRAN_DURATION - 15, IRAN_START + IRAN_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const ugandaProgress = interpolate(
    frame,
    [UGANDA_START, UGANDA_START + 20, UGANDA_START + UGANDA_DURATION - 15, UGANDA_START + UGANDA_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const bhutanProgress = interpolate(
    frame,
    [BHUTAN_START, BHUTAN_START + 20, BHUTAN_START + BHUTAN_DURATION - 15, BHUTAN_START + BHUTAN_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const effProgress = interpolate(
    frame,
    [EFF_START, EFF_START + 20, EFF_START + EFF_DURATION - 15, EFF_START + EFF_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Grid view progress
  const gridProgress = interpolate(
    frame,
    [GRID_START, GRID_START + 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Determine if we're in sequential card phase
  const isSequentialPhase = frame >= IRAN_START && frame < GRID_START;

  // Matrix rain opacity
  const matrixOpacity = interpolate(
    frame,
    [0, 30, GRID_START, GRID_START + 60],
    [0.2, 0.25, 0.25, 0.35],
    { extrapolateRight: 'clamp' }
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/* Audio layer */}
      <ProofAudio />

      {/* Matrix rain background */}
      <MatrixRain
        opacity={matrixOpacity}
        columnCount={30}
        speedRange={[2, 5]}
        seed="proof-matrix"
        verticalOffset={height / 3}
      />

      {/* Title: "NEW SIGNALS" */}
      <LiveTitle progress={titleProgress} />

      {/* Sequential card display with glitch transitions */}
      {isSequentialPhase && (
        <AbsoluteFill>
          {/* Iran card */}
          <GlitchTransition
            startFrame={IRAN_START + IRAN_DURATION - 10}
            durationFrames={8}
            intensity={0.5}
          >
            <SignalCardDisplay
              card={SIGNAL_CARDS[0]}
              progress={iranProgress}
              slideFrom="left"
            />
          </GlitchTransition>

          {/* Uganda card */}
          <GlitchTransition
            startFrame={UGANDA_START + UGANDA_DURATION - 10}
            durationFrames={8}
            intensity={0.5}
          >
            <SignalCardDisplay
              card={SIGNAL_CARDS[1]}
              progress={ugandaProgress}
              slideFrom="right"
            />
          </GlitchTransition>

          {/* Bhutan card */}
          <GlitchTransition
            startFrame={BHUTAN_START + BHUTAN_DURATION - 10}
            durationFrames={8}
            intensity={0.5}
          >
            <SignalCardDisplay
              card={SIGNAL_CARDS[2]}
              progress={bhutanProgress}
              slideFrom="left"
            />
          </GlitchTransition>

          {/* EFF card */}
          <GlitchTransition
            startFrame={EFF_START + EFF_DURATION - 10}
            durationFrames={8}
            intensity={0.5}
          >
            <SignalCardDisplay
              card={SIGNAL_CARDS[3]}
              progress={effProgress}
              slideFrom="right"
            />
          </GlitchTransition>
        </AbsoluteFill>
      )}

      {/* Grid view with all 4 cards */}
      <GridView progress={gridProgress} />

      {/* CRT scanlines overlay */}
      <Scanlines opacity={0.04} flicker={false} />

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
            backgroundColor: `${BG_TERTIARY}cc`,
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <div>Frame: {frame}</div>
          <div>Time: {(frame / fps).toFixed(2)}s</div>
          <div>
            Phase:{' '}
            {frame < IRAN_START
              ? 'Title'
              : frame < UGANDA_START
                ? 'Iran'
                : frame < BHUTAN_START
                  ? 'Uganda'
                  : frame < EFF_START
                    ? 'Bhutan'
                    : frame < GRID_START
                      ? 'EFF'
                      : 'Grid'}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default ProofScene;

/** Timing constants for use in parent composition */
export const PROOF_TIMING = {
  duration: SCENE_DURATION,
  titleStart: TITLE_START,
  iranStart: IRAN_START,
  ugandaStart: UGANDA_START,
  bhutanStart: BHUTAN_START,
  effStart: EFF_START,
  gridStart: GRID_START,
} as const;
