/**
 * Solution Scene - Section 3
 *
 * Reveals Libertas as the answer. Establishes what it is.
 * Duration: 360 frames (12s).
 *
 * Frame breakdown (scene-relative):
 * - 0-90: Boot sequence (connecting, loading URL)
 * - 90-120: URL reveal with glow: `libertas.fgu.tech`
 * - 120-250: Website hero recreation (scanline reveal)
 * - 250-360: Homepage pull-back reveal with signal cards
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
  Easing,
  Audio,
  staticFile,
} from 'remotion';
import { colors } from '../../../utils/colors';
import { fontFamilies, displayStyle, terminalStyle } from '../../../utils/fonts';
import { TypewriterText } from '../components/TypewriterText';
import { MatrixRain } from '../components/MatrixRain';
import { Scanlines } from '../components/Scanlines';

// =============================================================================
// TIMING CONSTANTS (scene-relative frames)
// =============================================================================

/** Boot sequence - terminal typing */
const BOOT_START = 0;
const BOOT_LINE_1_START = 10;
const BOOT_LINE_2_START = 35;
const BOOT_LINE_3_START = 60;

/** URL reveal */
const URL_REVEAL_START = 90;

/** Website hero recreation */
const HERO_REVEAL_START = 120;
const HERO_SCANLINE_DURATION = 60;

/** Homepage pull-back */
const PULLBACK_START = 250;

/** Value proposition cards */
const VALUE_PROPS_START = 500;
const VALUE_PROP_STAGGER = 50; // Increased stagger between cards

// =============================================================================
// AUDIO PATHS
// =============================================================================

const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
  voSolution: 'audio/vo/vo-solution.mp3',
  sfx: {
    crtOn: 'audio/sfx/crt-on.wav',
    success: 'audio/sfx/success.wav',
    type1: 'audio/sfx/type-1.wav',
    type2: 'audio/sfx/type-2.wav',
    type3: 'audio/sfx/type-3.wav',
  },
} as const;

// =============================================================================
// DATA
// =============================================================================

interface ValueProp {
  label: string;
  icon: 'lock' | 'eye' | 'book';
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  { label: 'NO GATEKEEPERS', icon: 'lock', description: 'Open access to freedom tech intel' },
  { label: 'NO CENSORSHIP', icon: 'eye', description: 'Decentralized, uncensorable publishing' },
  { label: 'FULLY OPEN', icon: 'book', description: 'All data and code permissionless' },
];

/** Signal cards with country flags */
interface SignalCard {
  title: string;
  score: number;
  topic: string;
  flag: string; // Emoji flag
  country: string;
}

const SIGNAL_CARDS: SignalCard[] = [
  { title: 'Iran Digital Blackout', score: 95, topic: 'censorship-resistance', flag: '🇮🇷', country: 'Iran' },
  { title: 'Uganda Mesh Warning', score: 92, topic: 'comms', flag: '🇺🇬', country: 'Uganda' },
  { title: 'Bhutan Blockchain', score: 87, topic: 'sovereignty', flag: '🇧🇹', country: 'Bhutan' },
  { title: 'Venezuela VPN Surge', score: 89, topic: 'privacy', flag: '🇻🇪', country: 'Venezuela' },
  { title: 'Turkey Signal Ban', score: 91, topic: 'comms', flag: '🇹🇷', country: 'Turkey' },
  { title: 'Myanmar Internet Cut', score: 94, topic: 'censorship-resistance', flag: '🇲🇲', country: 'Myanmar' },
];

// =============================================================================
// TYPES
// =============================================================================

export interface SolutionSceneProps {
  /** Enable debug overlay showing frame numbers */
  debug?: boolean;
}

// =============================================================================
// AUDIO COMPONENT (Scene-specific timing)
// =============================================================================

const SolutionAudio: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Background music - ducked */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={0.12}
        startFrom={25 * fps} // Start 25 seconds into the track (where this scene begins)
      />

      {/* Voiceover - starts at frame 90 (after boot sequence) */}
      {/* Scene shortened - removed classifies/analyzes/publishes section */}
      <Sequence from={90 as number} durationInFrames={270} name="VO: Solution">
        <Audio
          src={staticFile(AUDIO_FILES.voSolution)}
          volume={1.0}
        />
      </Sequence>

      {/* CRT On SFX - boot sequence */}
      <Sequence durationInFrames={75} name="SFX: CRT On">
        <Audio src={staticFile(AUDIO_FILES.sfx.crtOn)} volume={0.6} />
      </Sequence>

      {/* Typing SFX */}
      <Sequence from={BOOT_LINE_1_START} durationInFrames={15} name="SFX: Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={0.5} />
      </Sequence>
      <Sequence from={BOOT_LINE_2_START} durationInFrames={15} name="SFX: Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={0.5} />
      </Sequence>
      <Sequence from={BOOT_LINE_3_START} durationInFrames={15} name="SFX: Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={0.5} />
      </Sequence>

      {/* Success chime - URL reveal */}
      <Sequence from={URL_REVEAL_START + 15} durationInFrames={90} name="SFX: Success">
        <Audio src={staticFile(AUDIO_FILES.sfx.success)} volume={0.4} />
      </Sequence>
    </>
  );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Boot sequence terminal lines
 */
const BootSequence: React.FC<{ frame: number }> = ({ frame }) => {
  const bootLines = [
    { text: 'connecting...', startFrame: BOOT_LINE_1_START },
    { text: 'establishing secure channel...', startFrame: BOOT_LINE_2_START },
    { text: 'loading libertas.fgu.tech', startFrame: BOOT_LINE_3_START },
  ];

  // Fade out boot sequence when URL reveal starts
  const bootOpacity = interpolate(
    frame,
    [URL_REVEAL_START - 15, URL_REVEAL_START],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (frame >= URL_REVEAL_START) return null;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: bootOpacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingLeft: 100,
          width: '80%',
          maxWidth: 1200,
        }}
      >
        {bootLines.map((line, index) => (
          frame >= line.startFrame && (
            <TypewriterText
              key={index}
              text={line.text}
              startFrame={line.startFrame}
              msPerChar={40}
              prompt="> "
              color={colors.accent.primary}
              fontSize={42}
              showCursor={index === bootLines.length - 1 || frame < bootLines[index + 1]?.startFrame}
              style={{
                textShadow: `0 0 10px ${colors.accent.primary}40`,
              }}
            />
          )
        ))}
      </div>
    </AbsoluteFill>
  );
};

/**
 * URL reveal with glow effect (shorter duration: 90-120)
 */
const URLReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const relativeFrame = frame - URL_REVEAL_START;
  if (relativeFrame < 0) return null;

  // Scale spring animation
  const scale = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 15, stiffness: 100, mass: 0.6 },
    from: 0.8,
    to: 1,
  });

  // Opacity fade in
  const opacity = interpolate(
    relativeFrame,
    [0, 10],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Glow intensity
  const glowPulse = interpolate(relativeFrame, [0, 15], [0, 25], { extrapolateRight: 'clamp' });

  // Fade out when hero starts
  const fadeOut = interpolate(
    frame,
    [HERO_REVEAL_START - 10, HERO_REVEAL_START],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (frame >= HERO_REVEAL_START) return null;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: opacity * fadeOut,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          ...displayStyle(96),
          color: colors.accent.primary,
          letterSpacing: '0.02em',
          textShadow: `
            0 0 ${glowPulse}px ${colors.accent.primary},
            0 0 ${glowPulse * 2}px ${colors.accent.primary}60,
            0 0 ${glowPulse * 3}px ${colors.accent.primary}30
          `,
        }}
      >
        libertas.fgu.tech
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scanline reveal effect
 */
const ScanlineReveal: React.FC<{
  frame: number;
  startFrame: number;
  duration: number;
  children: React.ReactNode;
}> = ({ frame, startFrame, duration, children }) => {
  const relativeFrame = frame - startFrame;
  if (relativeFrame < 0) return null;

  // Scanline position (0 to 100%)
  const scanlineProgress = interpolate(
    relativeFrame,
    [0, duration],
    [0, 100],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Content with clip mask */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 ${100 - scanlineProgress}% 0)`,
        }}
      >
        {children}
      </div>

      {/* Scanline bar */}
      {scanlineProgress < 100 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scanlineProgress}%`,
            height: 4,
            backgroundColor: colors.accent.primary,
            boxShadow: `0 0 20px ${colors.accent.primary}, 0 0 40px ${colors.accent.primary}60`,
          }}
        />
      )}
    </div>
  );
};

/**
 * Website hero recreation (120-250)
 */
const WebsiteHero: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const relativeFrame = frame - HERO_REVEAL_START;
  if (relativeFrame < 0) return null;

  // Terminal prompt blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Element stagger delays
  const terminalDelay = 0;
  const headlineDelay = 30;
  const subheadDelay = 45;

  // Fade out when pullback starts
  const fadeOut = interpolate(
    frame,
    [PULLBACK_START - 20, PULLBACK_START],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (frame >= PULLBACK_START) return null;

  return (
    <ScanlineReveal
      frame={frame}
      startFrame={HERO_REVEAL_START}
      duration={HERO_SCANLINE_DURATION}
    >
      <AbsoluteFill
        style={{
          backgroundColor: colors.bg.primary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 80,
          opacity: fadeOut,
        }}
      >
        {/* Terminal prompt - changed to "researching" */}
        <div
          style={{
            ...terminalStyle(36),
            color: colors.accent.primary,
            opacity: relativeFrame > terminalDelay
              ? spring({
                  frame: relativeFrame - terminalDelay,
                  fps,
                  config: { damping: 20, stiffness: 100 },
                })
              : 0,
          }}
        >
          {'> researching'}
          {cursorVisible && (
            <span
              style={{
                display: 'inline-block',
                width: 20,
                height: 36,
                backgroundColor: colors.accent.primary,
                marginLeft: 4,
                verticalAlign: 'text-bottom',
              }}
            />
          )}
        </div>

        {/* Main headline */}
        <div
          style={{
            ...displayStyle(84),
            color: colors.fg.primary,
            textAlign: 'center',
            maxWidth: 1200,
            opacity: relativeFrame > headlineDelay
              ? spring({
                  frame: relativeFrame - headlineDelay,
                  fps,
                  config: { damping: 20, stiffness: 100 },
                })
              : 0,
          }}
        >
          Freedom Tech{' '}
          <span style={{ color: colors.accent.primary }}>Research Engine</span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            ...terminalStyle(32),
            color: colors.fg.secondary,
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.6,
            opacity: relativeFrame > subheadDelay
              ? spring({
                  frame: relativeFrame - subheadDelay,
                  fps,
                  config: { damping: 20, stiffness: 100 },
                })
              : 0,
          }}
        >
          Automated intelligence on censorship, surveillance, and digital resistance
        </div>
      </AbsoluteFill>
    </ScanlineReveal>
  );
};


/**
 * Homepage pull-back reveal (250-500)
 */
const HomepagePullback: React.FC<{ frame: number }> = ({ frame }) => {
  const relativeFrame = frame - PULLBACK_START;
  if (relativeFrame < 0) return null;

  // Zoom out effect
  const scale = interpolate(
    relativeFrame,
    [0, 90],
    [1.2, 1.0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  // Fade in
  const opacity = interpolate(
    relativeFrame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Fade out near end of scene for smooth transition to Workflow
  const fadeOut = interpolate(
    frame,
    [350, 370],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Terminal prompt blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Content cards stagger
  const showCards = relativeFrame > 45;


  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity: opacity * fadeOut,
        backgroundColor: colors.bg.primary,
      }}
    >
      {/* Website frame container */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 120,
          right: 120,
          bottom: 60,
          border: `2px solid ${colors.accent.primary}30`,
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${colors.accent.primary}20`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              ...terminalStyle(24),
              color: colors.accent.primary,
            }}
          >
            libertas.fgu.tech
          </div>
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero section - changed to "watch signals" */}
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div
              style={{
                ...terminalStyle(24),
                color: colors.accent.primary,
                marginBottom: 12,
              }}
            >
              {'> watch signals'}
              {cursorVisible && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 24,
                    backgroundColor: colors.accent.primary,
                    marginLeft: 4,
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </div>
            <div
              style={{
                ...displayStyle(48),
                color: colors.fg.primary,
              }}
            >
              Freedom Tech <span style={{ color: colors.accent.primary }}>Research Engine</span>
            </div>
          </div>

          {/* Recent Signals section */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...terminalStyle(20),
                color: colors.fg.secondary,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ color: colors.accent.primary }}>{'>'}</span>
              recent_signals
            </div>

            {/* Content cards grid - 6 cards with flags */}
            {showCards && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                }}
              >
                {SIGNAL_CARDS.map((card, index) => {
                  const cardDelay = index * 8;
                  const cardOpacity = relativeFrame > 45 + cardDelay
                    ? interpolate(relativeFrame - 45 - cardDelay, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
                    : 0;

                  return (
                    <div
                      key={index}
                      style={{
                        backgroundColor: `${colors.bg.tertiary}80`,
                        border: `1px solid ${colors.accent.primary}30`,
                        borderRadius: 8,
                        padding: 14,
                        opacity: cardOpacity,
                      }}
                    >
                      {/* Flag and title row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{card.flag}</span>
                        <div
                          style={{
                            ...terminalStyle(14),
                            color: colors.fg.primary,
                            flex: 1,
                          }}
                        >
                          {card.title}
                        </div>
                      </div>
                      {/* Topic and score row */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            ...terminalStyle(11),
                            color: colors.fg.tertiary,
                          }}
                        >
                          {card.topic}
                        </span>
                        <span
                          style={{
                            ...terminalStyle(11),
                            color: colors.accent.primary,
                          }}
                        >
                          [{card.score}]
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// UNUSED COMPONENTS (Value props section removed from render)
// =============================================================================

/**
 * Value proposition icon - larger size
 * @deprecated Not currently used - value props section removed
 */
const _ValuePropIcon: React.FC<{
  type: ValueProp['icon'];
}> = ({ type }) => {
  const iconColor = colors.accent.primary;

  const baseStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 15px ${iconColor}60)`,
  };

  // Larger icons (was 80x80, now 100x100)
  switch (type) {
    case 'lock':
      // Lock with X (no gatekeepers)
      return (
        <svg width="100" height="100" viewBox="0 0 80 80" style={baseStyle}>
          {/* Lock body */}
          <rect x="15" y="35" width="50" height="35" rx="4" fill={iconColor} opacity={0.3} />
          <rect x="15" y="35" width="50" height="35" rx="4" stroke={iconColor} strokeWidth="3" fill="none" />
          {/* Lock shackle */}
          <path
            d="M 25 35 L 25 25 Q 25 12 40 12 Q 55 12 55 25 L 55 35"
            fill="none"
            stroke={iconColor}
            strokeWidth="4"
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* X through it */}
          <line x1="10" y1="10" x2="70" y2="70" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
          <line x1="70" y1="10" x2="10" y2="70" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
        </svg>
      );

    case 'eye':
      // Eye with strike-through (no censorship)
      return (
        <svg width="100" height="100" viewBox="0 0 80 80" style={baseStyle}>
          {/* Eye outline */}
          <ellipse cx="40" cy="40" rx="30" ry="18" fill="none" stroke={iconColor} strokeWidth="3" opacity={0.6} />
          {/* Pupil */}
          <circle cx="40" cy="40" r="10" fill={iconColor} opacity={0.4} />
          <circle cx="40" cy="40" r="6" fill={iconColor} opacity={0.7} />
          {/* Strike-through */}
          <line x1="10" y1="65" x2="70" y2="15" stroke={iconColor} strokeWidth="5" strokeLinecap="round" />
        </svg>
      );

    case 'book':
      // Open book/code (fully open)
      return (
        <svg width="100" height="100" viewBox="0 0 80 80" style={baseStyle}>
          {/* Left page */}
          <path
            d="M 40 15 L 10 20 L 10 65 L 40 60 Z"
            fill={iconColor}
            opacity={0.2}
            stroke={iconColor}
            strokeWidth="2"
          />
          {/* Right page */}
          <path
            d="M 40 15 L 70 20 L 70 65 L 40 60 Z"
            fill={iconColor}
            opacity={0.2}
            stroke={iconColor}
            strokeWidth="2"
          />
          {/* Spine */}
          <line x1="40" y1="15" x2="40" y2="60" stroke={iconColor} strokeWidth="2" />
          {/* Code lines on pages */}
          <line x1="18" y1="30" x2="32" y2="28" stroke={iconColor} strokeWidth="2" opacity={0.6} />
          <line x1="18" y1="38" x2="28" y2="36" stroke={iconColor} strokeWidth="2" opacity={0.6} />
          <line x1="18" y1="46" x2="34" y2="44" stroke={iconColor} strokeWidth="2" opacity={0.6} />
          <line x1="48" y1="28" x2="62" y2="30" stroke={iconColor} strokeWidth="2" opacity={0.6} />
          <line x1="48" y1="36" x2="58" y2="38" stroke={iconColor} strokeWidth="2" opacity={0.6} />
          <line x1="48" y1="44" x2="64" y2="46" stroke={iconColor} strokeWidth="2" opacity={0.6} />
        </svg>
      );
  }
};

/** Fixed card dimensions for consistent sizing - wider for 1-line headers */
const CARD_WIDTH = 420;
const CARD_HEIGHT = 300;
const CARD_GAP = 50;

/**
 * Value proposition card - larger, slower entry, fixed dimensions
 * @deprecated Not currently used - value props section removed
 */
const _ValuePropCard: React.FC<{
  prop: ValueProp;
  frame: number;
  startFrame: number;
  fps: number;
  translateX: number;
}> = ({ prop, frame, startFrame, fps, translateX }) => {
  const relativeFrame = frame - startFrame;

  // Card is always rendered but starts invisible
  const isVisible = relativeFrame >= 0;

  // Slower spring animation for entry (lower stiffness, higher mass)
  const entryProgress = isVisible
    ? spring({
        frame: relativeFrame,
        fps,
        config: { damping: 18, stiffness: 60, mass: 1.0 },
      })
    : 0;

  const translateY = interpolate(entryProgress, [0, 1], [80, 0]);
  const opacity = interpolate(entryProgress, [0, 1], [0, 1]);

  // Glow on appear
  const glowIntensity = isVisible && relativeFrame < 45
    ? interpolate(relativeFrame, [0, 20, 45], [0, 30, 18], { extrapolateRight: 'clamp' })
    : 18 + Math.sin(Math.max(0, relativeFrame - 45) / 25) * 6;

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 40,
        backgroundColor: `${colors.bg.tertiary}e0`,
        borderRadius: 12,
        border: `2px solid ${colors.accent.primary}60`,
        boxShadow: `0 0 ${glowIntensity}px ${colors.accent.primary}40`,
        opacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}
    >
      {/* Icon */}
      <_ValuePropIcon type={prop.icon} />

      {/* Label - smaller font, no letter-spacing to fit on 1 line */}
      <div
        style={{
          ...terminalStyle(28),
          color: colors.accent.primary,
          letterSpacing: '0.05em',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        [{prop.label}]
      </div>

      {/* Description */}
      <div
        style={{
          ...terminalStyle(20),
          color: colors.fg.secondary,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {prop.description}
      </div>
    </div>
  );
};

/**
 * Value propositions section (500-750)
 * Uses absolute positioning to prevent jarring reflow when new cards appear
 * @deprecated Not currently rendered - value props section removed from scene
 */
const _ValuePropsSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < VALUE_PROPS_START) return null;

  // Total width of all cards plus gaps
  const totalWidth = VALUE_PROPS.length * CARD_WIDTH + (VALUE_PROPS.length - 1) * CARD_GAP;

  return (
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
          width: totalWidth,
          height: CARD_HEIGHT,
        }}
      >
        {VALUE_PROPS.map((prop, index) => {
          // Fixed X position for each card - no reflow needed
          const cardX = index * (CARD_WIDTH + CARD_GAP);
          const cardStartFrame = VALUE_PROPS_START + index * VALUE_PROP_STAGGER;

          return (
            <_ValuePropCard
              key={index}
              prop={prop}
              frame={frame}
              startFrame={cardStartFrame}
              fps={fps}
              translateX={cardX}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const SolutionScene: React.FC<SolutionSceneProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // PHASE DETECTION
  // ---------------------------------------------------------------------------

  const isBootPhase = frame >= BOOT_START && frame < URL_REVEAL_START;
  const isURLPhase = frame >= URL_REVEAL_START && frame < HERO_REVEAL_START;
  const isHeroPhase = frame >= HERO_REVEAL_START && frame < PULLBACK_START;
  const isPullbackPhase = frame >= PULLBACK_START;

  // ---------------------------------------------------------------------------
  // MATRIX RAIN OPACITY
  // ---------------------------------------------------------------------------

  const matrixOpacity = interpolate(
    frame,
    [0, 30],
    [0, 0.3],
    { extrapolateRight: 'clamp' }
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      {/* Audio layer */}
      <SolutionAudio />

      {/* Matrix rain background */}
      <MatrixRain
        opacity={matrixOpacity}
        columnCount={30}
        speedRange={[3, 6]}
        seed="solution-matrix"
        verticalOffset={height / 2}
      />

      {/* Boot sequence (0-90) */}
      <BootSequence frame={frame} />

      {/* URL reveal (90-120) */}
      <URLReveal frame={frame} fps={fps} />

      {/* Website hero (120-250) */}
      <WebsiteHero frame={frame} fps={fps} />

      {/* Homepage pullback (250-500) */}
      <HomepagePullback frame={frame} />

      {/* Value props section removed - scene ends at pullback */}

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
            color: colors.fg.tertiary,
            backgroundColor: `${colors.bg.secondary}cc`,
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <div>Frame: {frame}</div>
          <div>Time: {(frame / fps).toFixed(2)}s</div>
          <div>Phase: {
            isBootPhase ? 'Boot Sequence' :
            isURLPhase ? 'URL Reveal' :
            isHeroPhase ? 'Hero Section' :
            isPullbackPhase ? 'Homepage Pullback' : 'Unknown'
          }</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default SolutionScene;

// Export unused components for potential future use
export { _ValuePropsSection as ValuePropsSection };

/** Timing constants for use in parent composition */
export const SOLUTION_TIMING = {
  /** Total duration of Solution scene in frames (removed action words section) */
  duration: 370,
  /** Frame when boot sequence starts */
  bootStart: BOOT_START,
  /** Frame when URL reveal starts */
  urlRevealStart: URL_REVEAL_START,
  /** Frame when hero section starts */
  heroRevealStart: HERO_REVEAL_START,
  /** Frame when pullback starts */
  pullbackStart: PULLBACK_START,
} as const;
