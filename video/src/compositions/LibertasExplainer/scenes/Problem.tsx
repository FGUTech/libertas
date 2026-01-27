/**
 * Problem Scene - Section 2 (0:05 - 0:25)
 *
 * Establishes threat landscape: surveillance, censorship, internet shutdowns.
 * Builds tension and emotional stakes before revealing Libertas as the solution.
 * Duration: 600 frames (20s).
 *
 * NEW Frame breakdown (scene-relative) - Reordered:
 * - 0-150: Quick cuts of threat imagery (4 slides)
 * - 150-240: Iran example card with stats
 * - 240-450: World map with incident markers + counter
 * - 450-600: CRT shutdown effect transition
 */

import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
  Easing,
  random,
  staticFile,
  Img,
  Audio,
} from 'remotion';
import { colors } from '../../../utils/colors';
import { fontFamilies, displayStyle, terminalStyle } from '../../../utils/fonts';
import { TerminalCard } from '../components/TerminalCard';
import { Scanlines } from '../components/Scanlines';
import { GlitchTransition } from '../components/GlitchEffect';
import { MatrixRain } from '../components/MatrixRain';

// =============================================================================
// TIMING CONSTANTS (scene-relative frames) - REORDERED
// =============================================================================

/** Quick cuts section - 4 slides (now first) */
const CUTS_START = 0;
const CUT_DURATION = 38; // ~1.25s per cut
const CUT_HOLD = 30;
const CUT_TRANSITION = 8;

/** Iran card section (now second) */
const IRAN_CARD_START = 150;

/** World map section (now third) */
const MAP_START = 240;
const MAP_FADE_DURATION = 30;
const MARKER_SPAWN_START = 260;

/** Counter appears over map */
const COUNTER_START = 300;

/** CRT shutdown section (last) */
const CRT_SHUTDOWN_START = 450;

// =============================================================================
// AUDIO PATHS
// =============================================================================

const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
  voProblem: 'audio/vo/vo-problem.mp3',
  sfx: {
    warning: 'audio/sfx/warning.wav',
    glitch: 'audio/sfx/glitch.wav',
    crtOff: 'audio/sfx/crt-off.wav',
  },
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface ProblemSceneProps {
  /** Enable debug overlay showing frame numbers */
  debug?: boolean;
}

interface IncidentMarker {
  x: number;
  y: number;
  delay: number;
  size?: number;
}

interface ThreatSlide {
  icon: 'surveillance' | 'blocked' | 'static' | 'locked';
  label: string;
  subtext?: string;
}

// =============================================================================
// DATA
// =============================================================================

/**
 * Incident marker locations - clustered around hotspots
 * Hotspots: Israel, Iran, Uganda, Minnesota (US), Venezuela, Spain
 */
const INCIDENT_MARKERS: IncidentMarker[] = [
  // === IRAN CLUSTER (major hotspot) ===
  { x: 57, y: 42, delay: 0, size: 1.5 },
  { x: 56, y: 44, delay: 4, size: 1.0 },
  { x: 58, y: 40, delay: 8, size: 0.9 },
  { x: 59, y: 45, delay: 12, size: 0.8 },

  // === ISRAEL CLUSTER (major hotspot) ===
  { x: 51, y: 43, delay: 6, size: 1.3 },
  { x: 51.5, y: 44, delay: 10, size: 0.9 },
  { x: 50.5, y: 42, delay: 14, size: 0.8 },

  // === UGANDA CLUSTER (major hotspot) ===
  { x: 50, y: 62, delay: 16, size: 1.3 },
  { x: 49, y: 61, delay: 20, size: 0.9 },
  { x: 51, y: 63, delay: 24, size: 0.8 },

  // === VENEZUELA CLUSTER (major hotspot) ===
  { x: 26, y: 55, delay: 22, size: 1.3 },
  { x: 25, y: 56, delay: 26, size: 0.9 },
  { x: 27, y: 54, delay: 30, size: 0.8 },

  // === SPAIN CLUSTER (major hotspot) ===
  { x: 42, y: 38, delay: 28, size: 1.2 },
  { x: 41, y: 37, delay: 32, size: 0.8 },
  { x: 40, y: 39, delay: 36, size: 0.7 },

  // === MINNESOTA / US CLUSTER (major hotspot) ===
  { x: 18, y: 36, delay: 34, size: 1.2 },
  { x: 17, y: 35, delay: 38, size: 0.8 },
  { x: 19, y: 37, delay: 42, size: 0.7 },

  // === OTHER GLOBAL INCIDENTS ===
  { x: 52, y: 40, delay: 40 }, // Syria
  { x: 53, y: 43, delay: 44 }, // Iraq
  { x: 49, y: 36, delay: 48 }, // Turkey
  { x: 47, y: 50, delay: 50 }, // Egypt
  { x: 42, y: 58, delay: 54 }, // Nigeria
  { x: 52, y: 56, delay: 58 }, // Ethiopia
  { x: 70, y: 40, delay: 60 }, // China - west
  { x: 75, y: 38, delay: 64 }, // China - east
  { x: 78, y: 48, delay: 68 }, // Myanmar
  { x: 86, y: 32, delay: 72 }, // North Korea
  { x: 55, y: 30, delay: 74 }, // Russia - Moscow
  { x: 60, y: 28, delay: 78 }, // Russia - east
  { x: 22, y: 46, delay: 76 }, // Cuba
  { x: 29, y: 58, delay: 80 }, // Brazil
  { x: 51, y: 30, delay: 82 }, // Belarus
];

/** Threat imagery slides */
const THREAT_SLIDES: ThreatSlide[] = [
  { icon: 'surveillance', label: 'SURVEILLANCE ACTIVE', subtext: 'Global monitoring detected' },
  { icon: 'blocked', label: 'CONNECTION BLOCKED', subtext: 'Access denied by authority' },
  { icon: 'static', label: 'SIGNAL LOST', subtext: 'Total network blackout' },
  { icon: 'locked', label: 'DATA SEIZED', subtext: 'Communications compromised' },
];

// =============================================================================
// AUDIO COMPONENT (Scene-specific timing)
// =============================================================================

/**
 * Audio for Problem scene standalone preview
 * Uses scene-relative timing (frame 0 = start of Problem)
 */
const ProblemAudio: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Background music - ducked */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={0.15}
        startFrom={5 * fps} // Start 5 seconds into the track
      />

      {/* Voiceover - starts at frame 15 (0.5s in, earlier than before) */}
      <Sequence from={15} name="VO: Problem">
        <Audio
          src={staticFile(AUDIO_FILES.voProblem)}
          volume={1.0}
        />
      </Sequence>

      {/* Warning SFX - plays during quick cuts */}
      <Sequence from={30} durationInFrames={60} name="SFX: Warning">
        <Audio src={staticFile(AUDIO_FILES.sfx.warning)} volume={0.3} />
      </Sequence>

      {/* CRT Off SFX */}
      <Sequence from={CRT_SHUTDOWN_START} durationInFrames={60} name="SFX: CRT Off">
        <Audio src={staticFile(AUDIO_FILES.sfx.crtOff)} volume={0.6} />
      </Sequence>
    </>
  );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * World map using downloaded SVG - transparent background, no grid
 */
const WorldMap: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <AbsoluteFill
      style={{
        opacity,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Img
        src={staticFile('images/world-map.svg')}
        style={{
          width: '95%',
          height: 'auto',
          maxHeight: '85%',
          objectFit: 'contain',
          filter: `brightness(0.4) sepia(1) hue-rotate(70deg) saturate(0.3)`,
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Animated incident marker with pulse effect
 */
const IncidentMarkerDot: React.FC<{
  x: number;
  y: number;
  frame: number;
  appearFrame: number;
  size?: number;
}> = ({ x, y, frame, appearFrame, size = 1 }) => {
  const { fps } = useVideoConfig();
  const relativeFrame = frame - appearFrame;

  if (relativeFrame < 0) return null;

  const scale = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  const pulse = relativeFrame > 15
    ? 1 + Math.sin((relativeFrame - 15) / 10) * 0.3
    : 1;

  const glowOpacity = 0.4 + Math.sin((relativeFrame - 15) / 10) * 0.2;
  const baseSize = 12 * size;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale * pulse})`,
        width: baseSize,
        height: baseSize,
        borderRadius: '50%',
        backgroundColor: colors.semantic.error,
        boxShadow: `
          0 0 ${10 * pulse}px ${colors.semantic.error},
          0 0 ${20 * pulse}px ${colors.semantic.error}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}
        `,
      }}
    />
  );
};

/**
 * Animated counter display - 2025 data
 */
const AnimatedCounter: React.FC<{
  frame: number;
  startFrame: number;
}> = ({ frame, startFrame }) => {
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) return null;

  const counterProgress = interpolate(
    relativeFrame,
    [0, 60],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    }
  );

  const shutdownCount = Math.round(counterProgress * 200);
  const countryCount = Math.round(counterProgress * 28);

  const opacity = interpolate(
    relativeFrame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const scale = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 120,
        left: '50%',
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          ...displayStyle(72),
          color: colors.semantic.error,
          textShadow: `0 0 30px ${colors.semantic.error}60`,
          letterSpacing: '0.05em',
        }}
      >
        {shutdownCount}+ <span style={{ fontSize: 48, color: colors.fg.primary }}>shutdowns</span>
      </div>

      <div
        style={{
          ...displayStyle(48),
          color: colors.fg.secondary,
          marginTop: 8,
        }}
      >
        in <span style={{ color: colors.semantic.error }}>{countryCount}</span> countries
      </div>

      <div
        style={{
          ...terminalStyle(24),
          color: colors.accent.amber,
          marginTop: 16,
          padding: '4px 12px',
          backgroundColor: `${colors.bg.secondary}cc`,
          borderRadius: 4,
          display: 'inline-block',
        }}
      >
        [2025]
      </div>
    </div>
  );
};

/**
 * Threat imagery slide - 1.5x size
 */
const ThreatSlideContent: React.FC<{
  slide: ThreatSlide;
  frame: number;
  startFrame: number;
  duration: number;
}> = ({ slide, frame, startFrame, duration }) => {
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame >= duration) return null;

  const slideIn = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const translateX = interpolate(slideIn, [0, 1], [100, 0]);

  const fadeOut = relativeFrame > duration - 8
    ? interpolate(relativeFrame, [duration - 8, duration], [1, 0])
    : 1;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 60,
        }}
      >
        <div
          style={{
            width: 300,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 60,
          }}
        >
          {renderThreatIcon(slide.icon, relativeFrame)}
        </div>

        <div
          style={{
            ...terminalStyle(84),
            color: colors.semantic.error,
            textShadow: `0 0 30px ${colors.semantic.error}40`,
            letterSpacing: '0.1em',
            marginBottom: 24,
          }}
        >
          {slide.label}
        </div>

        {slide.subtext && (
          <div
            style={{
              ...terminalStyle(42),
              color: colors.fg.secondary,
            }}
          >
            {slide.subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Render threat icon - 1.5x scale
 */
function renderThreatIcon(type: ThreatSlide['icon'], frame: number): React.ReactNode {
  const iconColor = colors.semantic.error;
  const pulse = 1 + Math.sin(frame / 8) * 0.1;

  const baseStyle: React.CSSProperties = {
    transform: `scale(${pulse})`,
    filter: `drop-shadow(0 0 30px ${iconColor}60)`,
  };

  switch (type) {
    case 'surveillance':
      return (
        <svg width="240" height="240" viewBox="0 0 100 100" style={baseStyle}>
          <rect x="25" y="35" width="50" height="35" rx="4" fill={iconColor} />
          <circle cx="50" cy="52" r="12" fill={colors.bg.primary} />
          <circle cx="50" cy="52" r="8" fill={iconColor} opacity="0.6" />
          <path
            d="M 50 65 L 30 95 L 70 95 Z"
            fill={iconColor}
            opacity={0.3 + Math.sin(frame / 5) * 0.2}
          />
          <rect x="45" y="20" width="10" height="18" fill={iconColor} />
          <circle cx="50" cy="18" r="6" fill={iconColor} />
        </svg>
      );

    case 'blocked':
      return (
        <div style={{ ...baseStyle, fontFamily: fontFamilies.mono, fontSize: 30, color: iconColor, textAlign: 'center' }}>
          <div style={{ marginBottom: 24, fontSize: 96 }}>⊘</div>
          <div style={{ padding: '12px 24px', border: `3px solid ${iconColor}`, borderRadius: 6 }}>
            ERR_CONNECTION_REFUSED
          </div>
        </div>
      );

    case 'static':
      return (
        <div
          style={{
            ...baseStyle,
            width: 240,
            height: 180,
            backgroundColor: colors.bg.secondary,
            position: 'relative',
            overflow: 'hidden',
            border: `4px solid ${iconColor}`,
            borderRadius: 12,
          }}
        >
          {Array.from({ length: 300 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${random(`static-${frame}-${i}-x`) * 100}%`,
                top: `${random(`static-${frame}-${i}-y`) * 100}%`,
                width: random(`static-${frame}-${i}-w`) * 12 + 3,
                height: 3,
                backgroundColor: random(`static-${frame}-${i}-c`) > 0.5 ? colors.fg.primary : colors.bg.primary,
                opacity: random(`static-${frame}-${i}-o`) * 0.8 + 0.2,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: fontFamilies.mono,
              fontSize: 21,
              color: iconColor,
            }}
          >
            NO SIGNAL
          </div>
        </div>
      );

    case 'locked':
      return (
        <svg width="210" height="240" viewBox="0 0 70 90" style={baseStyle}>
          <rect x="10" y="40" width="50" height="40" rx="4" fill={iconColor} />
          <path
            d="M 20 40 L 20 25 Q 20 10 35 10 Q 50 10 50 25 L 50 40"
            fill="none"
            stroke={iconColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="35" cy="55" r="6" fill={colors.bg.primary} />
          <rect x="32" y="55" width="6" height="12" fill={colors.bg.primary} />
          <path d="M 0 60 Q 10 55 10 60 Q 10 65 0 60" fill="none" stroke={iconColor} strokeWidth="3" opacity="0.6" />
          <path d="M 70 60 Q 60 55 60 60 Q 60 65 70 60" fill="none" stroke={iconColor} strokeWidth="3" opacity="0.6" />
        </svg>
      );
  }
}

/**
 * CRT Shutdown Effect
 */
const CRTShutdown: React.FC<{
  frame: number;
  startFrame: number;
  children: React.ReactNode;
}> = ({ frame, startFrame, children }) => {
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) {
    return <>{children}</>;
  }

  const phase1End = 45;
  const phase2End = 75;
  const phase3End = 120;

  if (relativeFrame < phase1End) {
    const scaleY = interpolate(
      relativeFrame,
      [0, phase1End],
      [1, 0.01],
      { easing: Easing.in(Easing.quad), extrapolateRight: 'clamp' }
    );
    const brightness = interpolate(relativeFrame, [0, phase1End], [1, 1.5]);

    return (
      <AbsoluteFill style={{ transform: `scaleY(${scaleY})`, filter: `brightness(${brightness})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (relativeFrame < phase2End) {
    const lineWidth = interpolate(
      relativeFrame,
      [phase1End, phase2End],
      [100, 0],
      { easing: Easing.in(Easing.cubic), extrapolateRight: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${lineWidth}%`,
            height: 4,
            backgroundColor: colors.fg.primary,
            boxShadow: `0 0 20px ${colors.fg.primary}, 0 0 40px ${colors.fg.primary}60`,
          }}
        />
      </AbsoluteFill>
    );
  }

  if (relativeFrame < phase3End) {
    const dotSize = interpolate(
      relativeFrame,
      [phase2End, phase3End],
      [20, 0],
      { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' }
    );
    const dotOpacity = interpolate(relativeFrame, [phase2End, phase3End], [1, 0], { extrapolateRight: 'clamp' });

    return (
      <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: colors.fg.primary,
            opacity: dotOpacity,
            boxShadow: `0 0 ${dotSize}px ${colors.fg.primary}`,
          }}
        />
      </AbsoluteFill>
    );
  }

  return <AbsoluteFill style={{ backgroundColor: colors.bg.primary }} />;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ProblemScene: React.FC<ProblemSceneProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // PHASE DETECTION (reordered)
  // ---------------------------------------------------------------------------

  const isCutsPhase = frame >= CUTS_START && frame < IRAN_CARD_START;
  const isIranPhase = frame >= IRAN_CARD_START && frame < MAP_START;
  const isMapPhase = frame >= MAP_START && frame < CRT_SHUTDOWN_START;
  const isCounterPhase = frame >= COUNTER_START && frame < CRT_SHUTDOWN_START;
  const isShutdownPhase = frame >= CRT_SHUTDOWN_START;

  const currentCutIndex = isCutsPhase
    ? Math.min(3, Math.floor((frame - CUTS_START) / CUT_DURATION))
    : -1;

  // ---------------------------------------------------------------------------
  // MAP FADE
  // ---------------------------------------------------------------------------

  const mapOpacity = useMemo(() => {
    const fadeIn = interpolate(
      frame,
      [MAP_START, MAP_START + MAP_FADE_DURATION],
      [0, 1],
      { extrapolateRight: 'clamp' }
    );

    const fadeOut = interpolate(
      frame,
      [CRT_SHUTDOWN_START - 30, CRT_SHUTDOWN_START],
      [1, 0.5],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return Math.min(fadeIn, fadeOut);
  }, [frame]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <CRTShutdown frame={frame} startFrame={CRT_SHUTDOWN_START}>
      <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
        {/* Audio - scene-specific timing */}
        <ProblemAudio />

        {/* Matrix rain background - ALWAYS VISIBLE */}
        <MatrixRain
          opacity={0.2}
          columnCount={35}
          speedRange={[3, 7]}
          seed="problem-matrix"
          verticalOffset={height / 2}
        />

        {/* Quick cuts - threat imagery (FIRST) */}
        {isCutsPhase && (
          <>
            {THREAT_SLIDES.map((slide, index) => (
              <GlitchTransition
                key={index}
                startFrame={CUTS_START + index * CUT_DURATION + CUT_HOLD}
                durationFrames={CUT_TRANSITION}
                intensity={0.6}
              >
                <ThreatSlideContent
                  slide={slide}
                  frame={frame}
                  startFrame={CUTS_START + index * CUT_DURATION}
                  duration={CUT_DURATION}
                />
              </GlitchTransition>
            ))}
          </>
        )}

        {/* Iran example card (SECOND) */}
        {isIranPhase && (
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TerminalCard
              header="IRAN - JANUARY 2024"
              body={[
                '> TOTAL INTERNET BLACKOUT',
                '> 2,403+ PROTESTERS KILLED',
                '> SATELLITE INTERNET JAMMED',
              ]}
              badges={[
                { label: 'CREDIBILITY', value: 88 },
                { label: 'RELEVANCE', value: 95 },
              ]}
              accentColor="red"
              widthChars={45}
              fontSize={26}
              startFrame={IRAN_CARD_START}
              slideFrom="bottom"
              pulsingBorder={true}
            />
          </AbsoluteFill>
        )}

        {/* World map with markers (THIRD) */}
        {isMapPhase && (
          <>
            <WorldMap opacity={mapOpacity} />

            <AbsoluteFill
              style={{
                position: 'absolute',
                left: '2.5%',
                top: '7.5%',
                width: '95%',
                height: '85%',
              }}
            >
              {INCIDENT_MARKERS.map((marker, index) => (
                <IncidentMarkerDot
                  key={index}
                  x={marker.x}
                  y={marker.y}
                  frame={frame - MARKER_SPAWN_START}
                  appearFrame={marker.delay}
                  size={marker.size}
                />
              ))}
            </AbsoluteFill>
          </>
        )}

        {/* Counter animation (over map) */}
        {isCounterPhase && (
          <AnimatedCounter frame={frame} startFrame={COUNTER_START} />
        )}

        {/* CRT scanlines overlay */}
        <Scanlines opacity={0.05} flicker={frame >= CRT_SHUTDOWN_START} />

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
              isCutsPhase ? `Cuts (${currentCutIndex + 1}/4)` :
              isIranPhase ? 'Iran Card' :
              isMapPhase ? 'World Map' :
              isShutdownPhase ? 'CRT Shutdown' : 'Unknown'
            }</div>
          </div>
        )}
      </AbsoluteFill>
    </CRTShutdown>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default ProblemScene;

/** Timing constants for use in parent composition */
export const PROBLEM_TIMING = {
  duration: 528, // Cut 2.4 seconds total (72 frames) of black from end
  cutsStart: CUTS_START,
  iranCardStart: IRAN_CARD_START,
  mapStart: MAP_START,
  counterStart: COUNTER_START,
  crtShutdownStart: CRT_SHUTDOWN_START,
} as const;
