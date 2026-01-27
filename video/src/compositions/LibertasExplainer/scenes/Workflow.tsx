/**
 * Workflow Scene - Section 4 (0:50 - 1:20)
 *
 * Animated workflow pipeline demonstration showing how Libertas processes data.
 * Shows the full agentic pipeline from sources to publish/digest/ideas.
 * Duration: 725 frames (24.17s).
 *
 * Frame breakdown (scene-relative):
 * - 0-120: SOURCES node with X-pattern input icons (RSS, Web, Submit, Users)
 *          Dotted orange lines connect icons to SOURCES node center (behind node)
 * - 120-200: CLASSIFY node with YAML-formatted classification output panel
 * - 200-280: SUMMARIZE node with insight card preview
 * - 280-360: PUBLISH node - continuous data flow starts after this
 * - 360-480: DIGEST node (amber accent) - below PUBLISH
 *          Continuous doc flow animation (📄 icons) instead of arrow
 *          Shows "RSS Feeds", "JSON Feeds", "Markdowns" labels
 * - 480-650: IDEAS node with gold glow effect - above PUBLISH
 *          Animation: golden glow backdrop grows like lightbulb moment
 *          Icons around SOURCES start spinning
 * - 650-725: Logo morph on TOP of pipeline (no fade) with "LIBERTAS" text stagger
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
  Img,
  staticFile,
} from 'remotion';
import { ACCENT_PRIMARY, ACCENT_AMBER, BG_PRIMARY, BG_TERTIARY, BG_SECONDARY, FG_PRIMARY, FG_SECONDARY, FG_TERTIARY } from '../../../utils/colors';
import { fontFamilies, terminalStyle } from '../../../utils/fonts';
import { MatrixRain } from '../components/MatrixRain';
import { Scanlines } from '../components/Scanlines';

// =============================================================================
// TIMING CONSTANTS (scene-relative frames)
// =============================================================================

/** SOURCES node appears */
const SOURCES_START = 0;

/** CLASSIFY node and arrow - faster */
const CLASSIFY_START = 120;

/** SUMMARIZE node - earlier */
const SUMMARIZE_START = 200;

/** PUBLISH node */
const PUBLISH_START = 280;

/** DIGEST node */
const DIGEST_START = 360;

/** IDEAS node */
const IDEAS_START = 480;

/** Logo morph transition (2.5s = 75 frames) - no separate full pipeline section */
const LOGO_MORPH_START = 650;

/** Total scene duration (shorter without separate full pipeline section) */
const SCENE_DURATION = 725;

// =============================================================================
// AUDIO PATHS
// =============================================================================

const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
  voEngine: 'audio/vo/vo-engine.mp3',
  sfx: {
    dataHum: 'audio/sfx/data-hum.wav',
    cmdExecute: 'audio/sfx/cmd-execute.wav',
    success: 'audio/sfx/success.wav',
  },
} as const;

// =============================================================================
// LAYOUT CONSTANTS - 1.8X scale (10% smaller than 2x)
// =============================================================================

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2 - 40;

/** Node spacing for horizontal layout - 4 nodes in a row */
const HORIZONTAL_SPACING = 420;

/** Node positions - 4 main nodes in horizontal line, IDEAS above PUBLISH, DIGEST below PUBLISH */
const POSITIONS = {
  // Main row: Sources → Classify → Summarize → Publish
  sources: { x: CENTER_X - HORIZONTAL_SPACING * 1.5, y: CENTER_Y },
  classify: { x: CENTER_X - HORIZONTAL_SPACING * 0.5, y: CENTER_Y },
  summarize: { x: CENTER_X + HORIZONTAL_SPACING * 0.5, y: CENTER_Y },
  publish: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y },
  // IDEAS above PUBLISH, DIGEST below PUBLISH
  ideas: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y - 200 },
  digest: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y + 200 },
} as const;

/** Node dimensions - 1.8x scale (10% smaller than 2x) */
const NODE_WIDTH = 288;
const NODE_HEIGHT = 90;

// =============================================================================
// TYPES
// =============================================================================

export interface WorkflowSceneProps {
  debug?: boolean;
}

interface NodeProps {
  label: string;
  icon?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  accentColor?: string;
  pulsing?: boolean;
  opacity?: number;
  scale?: number;
}

// =============================================================================
// AUDIO COMPONENT
// =============================================================================

const WorkflowAudio: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Background music - section starts at 50s into track */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={0.12}
        startFrom={50 * fps}
      />

      {/* Voiceover - starts at frame 0 of this scene */}
      <Sequence name="VO: Engine">
        <Audio
          src={staticFile(AUDIO_FILES.voEngine)}
          volume={1.0}
        />
      </Sequence>

      {/* Data hum ambient */}
      <Audio
        src={staticFile(AUDIO_FILES.sfx.dataHum)}
        volume={0.15}
        loop
      />

      {/* Command execute SFX at key moments */}
      <Sequence from={CLASSIFY_START + 20} durationInFrames={30} name="SFX: Classify">
        <Audio src={staticFile(AUDIO_FILES.sfx.cmdExecute)} volume={0.4} />
      </Sequence>
      <Sequence from={SUMMARIZE_START + 15} durationInFrames={30} name="SFX: Summarize">
        <Audio src={staticFile(AUDIO_FILES.sfx.cmdExecute)} volume={0.4} />
      </Sequence>
      <Sequence from={PUBLISH_START + 15} durationInFrames={30} name="SFX: Publish">
        <Audio src={staticFile(AUDIO_FILES.sfx.cmdExecute)} volume={0.4} />
      </Sequence>
    </>
  );
};

// =============================================================================
// FLOW NODE COMPONENT - 1.8X SCALED
// =============================================================================

const FlowNode: React.FC<NodeProps> = ({
  label,
  icon,
  x,
  y,
  width = NODE_WIDTH,
  height = NODE_HEIGHT,
  accentColor = ACCENT_PRIMARY,
  pulsing = false,
  opacity = 1,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulsing glow
  const glowIntensity = pulsing
    ? 18 + Math.sin((frame / fps) * Math.PI * 2) * 14
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: BG_TERTIARY,
          border: `3px solid ${accentColor}`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          boxShadow: pulsing ? `0 0 ${glowIntensity}px ${accentColor}60` : `0 0 18px ${accentColor}30`,
        }}
      >
        {icon && (
          <span style={{ fontSize: 42 }}>{icon}</span>
        )}
        <span
          style={{
            ...terminalStyle(32),
            color: FG_PRIMARY,
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// FLOW ARROW COMPONENT - 1.8X SCALED
// =============================================================================

interface ArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  color?: string;
  dashed?: boolean;
}

const FlowArrow: React.FC<ArrowProps> = ({
  from,
  to,
  progress,
  color = ACCENT_PRIMARY,
  dashed = false,
}) => {
  const pathLength = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );
  const dashOffset = pathLength * (1 - progress);

  // Calculate arrowhead angle
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Arrow line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={dashed ? '14 14' : pathLength}
        strokeDashoffset={dashed ? 0 : dashOffset}
        opacity={dashed ? progress * 0.6 : 1}
      />

      {/* Arrowhead */}
      {progress > 0.8 && (
        <g
          transform={`translate(${to.x}, ${to.y}) rotate(${angle})`}
          opacity={interpolate(progress, [0.8, 1], [0, 1])}
        >
          <polygon
            points="0,0 -20,-10 -20,10"
            fill={color}
          />
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// DATA PACKET COMPONENT - 1.8X SCALED
// =============================================================================

interface DataPacketProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  color?: string;
  size?: number;
}

const DataPacket: React.FC<DataPacketProps> = ({
  from,
  to,
  progress,
  color = ACCENT_PRIMARY,
  size = 24,
}) => {
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;

  // Fade in/out at edges
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  if (progress <= 0 || progress >= 1) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: 4,
        opacity,
        boxShadow: `0 0 18px ${color}`,
      }}
    />
  );
};

// =============================================================================
// X-PATTERN ICONS (for SOURCES node) - 2 on top, 2 on bottom with dotted lines
// =============================================================================

interface XPatternIconsProps {
  centerX: number;
  centerY: number;
  progress: number;
  continuous?: boolean;
}

/** Dotted lines connecting icons to SOURCES node center (rendered behind node) */
const SourceConnectorLines: React.FC<{
  centerX: number;
  centerY: number;
  iconPositions: Array<{ x: number; y: number }>;
  progress: number;
}> = ({ centerX, centerY, iconPositions, progress }) => {
  if (progress <= 0) return null;

  const lineOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.3, 0.6]);

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0, // Behind node
      }}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {iconPositions.map((pos, index) => (
        <line
          key={`connector-${index}`}
          x1={pos.x}
          y1={pos.y}
          x2={centerX}
          y2={centerY}
          stroke={ACCENT_AMBER}
          strokeWidth={2}
          strokeDasharray="8 6"
          opacity={lineOpacity}
        />
      ))}
    </svg>
  );
};

/** Helper to calculate icon positions for both components */
const useIconPositions = (centerX: number, centerY: number, continuous: boolean, progress: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const icons = [
    { icon: '📡', label: 'RSS', baseAngle: -135 }, // top-left
    { icon: '🌐', label: 'Web', baseAngle: -45 },  // top-right
    { icon: '📥', label: 'Submit', baseAngle: 135 }, // bottom-left
    { icon: '👤', label: 'Users', baseAngle: 45 },   // bottom-right
  ];

  const radius = 140;
  // Spin animation once icons are fully visible (full rotation over 4 seconds for smoother motion)
  const spinAngle = continuous && progress >= 1 ? (frame / fps) * (360 / 4) : 0;

  const getPosition = (baseAngle: number) => {
    const angleRad = ((baseAngle + spinAngle) * Math.PI) / 180;
    return {
      x: centerX + Math.cos(angleRad) * radius,
      y: centerY + Math.sin(angleRad) * radius,
    };
  };

  return { icons, getPosition };
};

/** Just the connector lines - rendered BEFORE SOURCES node */
const SourceConnectorLinesWrapper: React.FC<XPatternIconsProps> = ({
  centerX,
  centerY,
  progress,
  continuous = false,
}) => {
  const { icons, getPosition } = useIconPositions(centerX, centerY, continuous, progress);
  const iconPositions = icons.map((item) => getPosition(item.baseAngle));

  return (
    <SourceConnectorLines
      centerX={centerX}
      centerY={centerY}
      iconPositions={iconPositions}
      progress={progress}
    />
  );
};

/** Just the icons - rendered AFTER SOURCES node */
const XPatternIcons: React.FC<XPatternIconsProps> = ({
  centerX,
  centerY,
  progress,
  continuous = false,
}) => {
  const { icons, getPosition } = useIconPositions(centerX, centerY, continuous, progress);

  return (
    <>
      {icons.map((item, index) => {
        const entryProgress = Math.min(1, progress * 2 - index * 0.15);

        if (entryProgress <= 0) return null;

        const pos = getPosition(item.baseAngle);
        const opacity = interpolate(entryProgress, [0, 0.5, 1], [0, 0.5, 1]);
        const scale = interpolate(entryProgress, [0, 1], [0.5, 1]);

        return (
          <div
            key={item.label}
            style={{
              position: 'absolute',
              left: pos.x - 44,
              top: pos.y - 44,
              width: 88,
              height: 88,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              transform: `scale(${scale})`,
            }}
          >
            <span style={{ fontSize: 42 }}>{item.icon}</span>
            <span
              style={{
                ...terminalStyle(16),
                color: FG_TERTIARY,
                marginTop: 4,
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </>
  );
};

// =============================================================================
// CLASSIFICATION OUTPUT PANEL - 1.8X SCALED
// =============================================================================

interface ClassifyOutputProps {
  progress: number;
}

const ClassifyOutput: React.FC<ClassifyOutputProps> = ({ progress }) => {
  if (progress <= 0) return null;

  const opacity = interpolate(progress, [0, 0.3], [0, 1]);
  const scale = interpolate(progress, [0, 0.3], [0.9, 1]);

  // Animated score counting
  const relevanceScore = Math.min(92, Math.floor(progress * 92 * 1.5));
  const credibilityScore = Math.min(75, Math.floor(progress * 75 * 1.5));

  return (
    <div
      style={{
        position: 'absolute',
        left: POSITIONS.classify.x - 160,
        top: POSITIONS.classify.y + NODE_HEIGHT / 2 + 25,
        width: 320,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      <div
        style={{
          backgroundColor: `${BG_TERTIARY}e0`,
          border: `2px solid ${ACCENT_PRIMARY}40`,
          borderRadius: 10,
          padding: '16px 22px',
        }}
      >
        <div style={{ ...terminalStyle(18), color: FG_TERTIARY, marginBottom: 10 }}>
          classification_output:
        </div>
        <div style={{ ...terminalStyle(20), color: FG_SECONDARY, lineHeight: 1.8 }}>
          {/* YAML format - no brackets */}
          <div>topics:</div>
          <div style={{ paddingLeft: 16 }}>- <span style={{ color: ACCENT_PRIMARY }}>comms</span></div>
          <div style={{ paddingLeft: 16 }}>- <span style={{ color: ACCENT_PRIMARY }}>censorship</span></div>
          <div>relevance: <span style={{ color: ACCENT_PRIMARY }}>{relevanceScore}</span></div>
          <div>credibility: <span style={{ color: ACCENT_PRIMARY }}>{credibilityScore}</span></div>
          <div>geo:</div>
          <div style={{ paddingLeft: 16 }}>- <span style={{ color: ACCENT_PRIMARY }}>Uganda</span></div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SUMMARIZE OUTPUT PANEL - RESTORED
// =============================================================================

interface SummarizeOutputProps {
  progress: number;
}

const SummarizeOutput: React.FC<SummarizeOutputProps> = ({ progress }) => {
  if (progress <= 0) return null;

  const opacity = interpolate(progress, [0, 0.3], [0, 1]);
  const scale = interpolate(progress, [0, 0.3], [0.9, 1]);

  // Show typing progress for title
  const titleProgress = interpolate(progress, [0.1, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  const title = 'Uganda Mesh Network Warning';
  const visibleTitle = title.slice(0, Math.floor(titleProgress * title.length));

  return (
    <div
      style={{
        position: 'absolute',
        left: POSITIONS.summarize.x - 160,
        top: POSITIONS.summarize.y + NODE_HEIGHT / 2 + 25,
        width: 320,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      <div
        style={{
          backgroundColor: `${BG_TERTIARY}e0`,
          border: `2px solid ${ACCENT_PRIMARY}40`,
          borderRadius: 10,
          padding: '16px 22px',
        }}
      >
        <div style={{ ...terminalStyle(18), color: FG_TERTIARY, marginBottom: 10 }}>
          insight_generated:
        </div>
        <div style={{ ...terminalStyle(20), color: FG_PRIMARY, marginBottom: 6 }}>
          {visibleTitle}
          {titleProgress < 1 && (
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 16,
                backgroundColor: ACCENT_PRIMARY,
                marginLeft: 2,
              }}
            />
          )}
        </div>
        {titleProgress >= 1 && (
          <div style={{ ...terminalStyle(16), color: ACCENT_PRIMARY, marginTop: 6 }}>
            ✓ published
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// DIGEST OUTPUT PANEL - Shows feed types below DIGEST node
// =============================================================================

interface DigestOutputProps {
  progress: number;
}

const DigestOutput: React.FC<DigestOutputProps> = ({ progress }) => {
  if (progress <= 0) return null;

  const feedTypes = ['RSS Feeds', 'JSON Feeds', 'Markdowns'];

  return (
    <div
      style={{
        position: 'absolute',
        left: POSITIONS.digest.x - 160,
        top: POSITIONS.digest.y + NODE_HEIGHT / 2 + 20,
        width: 320,
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      {feedTypes.map((feed, index) => {
        const itemProgress = interpolate(
          progress,
          [index * 0.2, index * 0.2 + 0.4],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return (
          <div
            key={feed}
            style={{
              ...terminalStyle(14),
              color: ACCENT_AMBER,
              opacity: itemProgress,
              transform: `translateY(${(1 - itemProgress) * 10}px)`,
            }}
          >
            {feed}
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// IDEAS OUTPUT PANEL - 1.8X SCALED (positioned to the left of IDEAS node)
// =============================================================================

interface IdeasOutputProps {
  progress: number;
}

const IdeasOutput: React.FC<IdeasOutputProps> = ({ progress }) => {
  if (progress <= 0) return null;

  const opacity = interpolate(progress, [0, 0.3], [0, 1]);
  const scale = interpolate(progress, [0, 0.3], [0.9, 1]);

  const impactScore = Math.min(85, Math.floor(progress * 85 * 1.5));

  return (
    <div
      style={{
        position: 'absolute',
        left: POSITIONS.ideas.x - NODE_WIDTH / 2 - 340,
        top: POSITIONS.ideas.y - 60,
        width: 320,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center right',
      }}
    >
      <div
        style={{
          backgroundColor: `${BG_TERTIARY}e0`,
          border: `2px solid ${ACCENT_PRIMARY}40`,
          borderRadius: 10,
          padding: '16px 22px',
        }}
      >
        <div style={{ ...terminalStyle(18), color: FG_TERTIARY, marginBottom: 10 }}>
          project_idea:
        </div>
        <div style={{ ...terminalStyle(20), color: FG_SECONDARY, lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🔗</span>
            <span style={{ color: FG_PRIMARY }}>GitHub Issue</span>
          </div>
          <div>impact: <span style={{ color: ACCENT_PRIMARY }}>{impactScore}/100</span></div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// GOLD GLOW EFFECT (for IDEAS lightbulb moment)
// =============================================================================

interface GoldGlowProps {
  x: number;
  y: number;
  progress: number;
}

const ACCENT_GOLD = '#ffd700';

const GoldGlowEffect: React.FC<GoldGlowProps> = ({ x, y, progress }) => {
  if (progress <= 0) return null;

  // Glow grows then fades as node appears
  const glowSize = interpolate(progress, [0, 0.5, 1], [20, 200, 80]);
  const glowOpacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.8, 0.6, 0.3]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - glowSize,
        top: y - glowSize,
        width: glowSize * 2,
        height: glowSize * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${ACCENT_GOLD}60 0%, ${ACCENT_GOLD}20 40%, transparent 70%)`,
        opacity: glowOpacity,
        pointerEvents: 'none',
      }}
    />
  );
};

// =============================================================================
// DIGEST COMPILATION ANIMATION (published sources flowing into digest - continuous)
// =============================================================================

interface DigestCompilationProps {
  active: boolean;
}

const DigestCompilation: React.FC<DigestCompilationProps> = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!active) return null;

  // Multiple small document icons flowing from Publish to Digest in a continuous loop
  const docCount = 5;
  const cycleDuration = 1.5; // seconds for full cycle
  const cycleFrames = cycleDuration * fps;

  const docs = Array.from({ length: docCount }).map((_, i) => {
    // Stagger each document in the cycle
    const phaseOffset = (i / docCount) * cycleFrames;
    const adjustedFrame = (frame + phaseOffset) % cycleFrames;
    const docProgress = adjustedFrame / cycleFrames;

    // Path from Publish to Digest with some horizontal spread
    const spreadOffset = (i - 2) * 25;
    const startX = POSITIONS.publish.x + spreadOffset;
    const startY = POSITIONS.publish.y + NODE_HEIGHT / 2;
    const endX = POSITIONS.digest.x;
    const endY = POSITIONS.digest.y - NODE_HEIGHT / 2;

    const x = startX + (endX - startX) * docProgress;
    const y = startY + (endY - startY) * docProgress;
    const opacity = interpolate(docProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
    const scale = interpolate(docProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

    return (
      <div
        key={`doc-${i}`}
        style={{
          position: 'absolute',
          left: x - 12,
          top: y - 12,
          fontSize: 18,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        📄
      </div>
    );
  });

  return <>{docs}</>;
};

// =============================================================================
// LIBERTAS LOGO (using actual logo image) with staggered text
// =============================================================================

interface LogoProps {
  opacity: number;
  scale: number;
  textProgress: number;
}

const LibertasLogo: React.FC<LogoProps> = ({ opacity, scale, textProgress }) => {
  if (opacity <= 0) return null;

  const letters = 'LIBERTAS'.split('');
  // Calculate delay so last letter finishes exactly at textProgress = 1.0
  // Formula: (letters.length - 1) * letterDelay + animDuration = 1.0
  const animDuration = 0.2; // Time for each letter to animate
  const letterDelay = (1 - animDuration) / (letters.length - 1); // ~0.114

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <Img
        src={staticFile('images/libertas-logo.png')}
        style={{
          width: 360,
          height: 360,
          transform: `scale(${scale})`,
          filter: `drop-shadow(0 0 40px ${ACCENT_PRIMARY}) drop-shadow(0 0 80px ${ACCENT_PRIMARY}60)`,
        }}
      />

      {/* Staggered LIBERTAS text */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 30,
        }}
      >
        {letters.map((letter, index) => {
          const letterProgress = interpolate(
            textProgress,
            [index * letterDelay, index * letterDelay + animDuration],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const letterOpacity = letterProgress;
          const letterScale = interpolate(letterProgress, [0, 1], [0.5, 1]);
          const glowIntensity = interpolate(letterProgress, [0, 0.5, 1], [0, 30, 15]);

          return (
            <span
              key={`letter-${index}`}
              style={{
                fontFamily: fontFamilies.display,
                fontSize: 72,
                fontWeight: 700,
                color: ACCENT_PRIMARY,
                opacity: letterOpacity,
                transform: `scale(${letterScale})`,
                textShadow: `0 0 ${glowIntensity}px ${ACCENT_PRIMARY}, 0 0 ${glowIntensity * 2}px ${ACCENT_PRIMARY}60`,
                display: 'inline-block',
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// CONTINUOUS DATA FLOW (multiple packets)
// =============================================================================

interface ContinuousFlowProps {
  active: boolean;
  ideasActive: boolean; // Only show IDEAS path after IDEAS phase starts
}

const ContinuousFlow: React.FC<ContinuousFlowProps> = ({ active, ideasActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!active) return null;

  const packetCount = 6; // Reduced since IDEAS path is conditional
  const cycleDuration = 2;
  const cycleFrames = cycleDuration * fps;

  // Main horizontal pipeline paths (always active when flow is active)
  const mainPaths = [
    { from: POSITIONS.sources, to: POSITIONS.classify, color: ACCENT_PRIMARY, direction: 'right' as const },
    { from: POSITIONS.classify, to: POSITIONS.summarize, color: ACCENT_PRIMARY, direction: 'right' as const },
    { from: POSITIONS.summarize, to: POSITIONS.publish, color: ACCENT_PRIMARY, direction: 'right' as const },
  ];

  // IDEAS path only active after IDEAS phase
  const ideasPath = { from: POSITIONS.publish, to: POSITIONS.ideas, color: ACCENT_GOLD, direction: 'up' as const };

  const mainPackets = Array.from({ length: packetCount }).map((_, i) => {
    const pathIndex = i % mainPaths.length;
    const path = mainPaths[pathIndex];
    const phaseOffset = (i / packetCount) * cycleFrames;
    const adjustedFrame = (frame + phaseOffset) % cycleFrames;
    const progress = adjustedFrame / cycleFrames;

    const fromX = path.from.x + NODE_WIDTH / 2;
    const fromY = path.from.y;
    const toX = path.to.x - NODE_WIDTH / 2;
    const toY = path.to.y;

    return {
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      color: path.color,
      progress,
      key: `packet-${i}`,
    };
  });

  // IDEAS packets (only when ideasActive)
  const ideasPackets = ideasActive ? Array.from({ length: 2 }).map((_, i) => {
    const phaseOffset = (i / 2) * cycleFrames;
    const adjustedFrame = (frame + phaseOffset) % cycleFrames;
    const progress = adjustedFrame / cycleFrames;

    return {
      from: { x: ideasPath.from.x, y: ideasPath.from.y - NODE_HEIGHT / 2 },
      to: { x: ideasPath.to.x, y: ideasPath.to.y + NODE_HEIGHT / 2 },
      color: ideasPath.color,
      progress,
      key: `ideas-packet-${i}`,
    };
  }) : [];

  const allPackets = [...mainPackets, ...ideasPackets];

  return (
    <>
      {allPackets.map((packet) => (
        <DataPacket
          key={packet.key}
          from={packet.from}
          to={packet.to}
          progress={packet.progress}
          color={packet.color}
        />
      ))}
    </>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const WorkflowScene: React.FC<WorkflowSceneProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // ---------------------------------------------------------------------------
  // ANIMATION PROGRESS CALCULATIONS
  // ---------------------------------------------------------------------------

  // Sources node entry
  const sourcesProgress = spring({
    frame: frame - SOURCES_START,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // X-pattern icons progress
  const iconsProgress = interpolate(
    frame,
    [SOURCES_START + 30, SOURCES_START + 90],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Classify node and arrow (120-200) - faster
  const classifyArrowProgress = interpolate(
    frame,
    [CLASSIFY_START, CLASSIFY_START + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const classifyNodeProgress = spring({
    frame: Math.max(0, frame - CLASSIFY_START - 20),
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const classifyOutputProgress = interpolate(
    frame,
    [CLASSIFY_START + 35, CLASSIFY_START + 70],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Summarize node (200-280) - earlier
  const summarizeArrowProgress = interpolate(
    frame,
    [SUMMARIZE_START, SUMMARIZE_START + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const summarizeNodeProgress = spring({
    frame: Math.max(0, frame - SUMMARIZE_START - 20),
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const summarizeOutputProgress = interpolate(
    frame,
    [SUMMARIZE_START + 35, SUMMARIZE_START + 75],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Publish node (280-360)
  const publishArrowProgress = interpolate(
    frame,
    [PUBLISH_START, PUBLISH_START + 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const publishNodeProgress = spring({
    frame: Math.max(0, frame - PUBLISH_START - 25),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Digest node (360-480) - no arrow, uses continuous doc flow instead
  const digestNodeProgress = spring({
    frame: Math.max(0, frame - DIGEST_START - 35),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Ideas node (480-650)
  const ideasArrowProgress = interpolate(
    frame,
    [IDEAS_START, IDEAS_START + 45],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const ideasNodeProgress = spring({
    frame: Math.max(0, frame - IDEAS_START - 35),
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const ideasOutputProgress = interpolate(
    frame,
    [IDEAS_START + 60, IDEAS_START + 120],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Continuous flow starts once PUBLISH node is revealed (after frame 320 or so)
  const continuousFlowActive = frame >= PUBLISH_START + 40;

  // Digest compilation (continuous docs flowing) - active once DIGEST node appears
  const digestCompilationActive = frame >= DIGEST_START + 50;

  // Digest output labels progress
  const digestOutputProgress = interpolate(
    frame,
    [DIGEST_START + 50, DIGEST_START + 100],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ideas gold glow effect (grows before node appears)
  const ideasGlowProgress = interpolate(
    frame,
    [IDEAS_START - 15, IDEAS_START + 60],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Logo morph (650-725) - 2.5s = 75 frames - appears ON TOP of pipeline
  const logoProgress = interpolate(
    frame,
    [LOGO_MORPH_START, LOGO_MORPH_START + 45],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  // LIBERTAS text stagger (starts slightly after logo, runs for 2s = 60 frames)
  const textProgress = interpolate(
    frame,
    [LOGO_MORPH_START + 15, LOGO_MORPH_START + 75],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Matrix rain opacity (unchanged - background)
  const matrixOpacity = interpolate(
    frame,
    [0, 30, LOGO_MORPH_START, LOGO_MORPH_START + 30],
    [0.15, 0.25, 0.25, 0.35],
    { extrapolateRight: 'clamp' }
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/* Audio layer */}
      <WorkflowAudio />

      {/* Matrix rain background (not scaled) */}
      <MatrixRain
        opacity={matrixOpacity}
        columnCount={25}
        speedRange={[2, 5]}
        seed="workflow-matrix"
        verticalOffset={height / 3}
      />

      {/* Pipeline container - stays visible during logo morph */}
      <AbsoluteFill>
        {/* === ARROWS (rendered first, behind nodes) === */}

        {/* Sources → Classify */}
        <FlowArrow
          from={{ x: POSITIONS.sources.x + NODE_WIDTH / 2, y: POSITIONS.sources.y }}
          to={{ x: POSITIONS.classify.x - NODE_WIDTH / 2, y: POSITIONS.classify.y }}
          progress={classifyArrowProgress}
        />

        {/* Classify → Summarize */}
        <FlowArrow
          from={{ x: POSITIONS.classify.x + NODE_WIDTH / 2, y: POSITIONS.classify.y }}
          to={{ x: POSITIONS.summarize.x - NODE_WIDTH / 2, y: POSITIONS.summarize.y }}
          progress={summarizeArrowProgress}
        />

        {/* Summarize → Publish */}
        <FlowArrow
          from={{ x: POSITIONS.summarize.x + NODE_WIDTH / 2, y: POSITIONS.summarize.y }}
          to={{ x: POSITIONS.publish.x - NODE_WIDTH / 2, y: POSITIONS.publish.y }}
          progress={publishArrowProgress}
        />

        {/* Publish → Digest connection is handled by continuous doc flow animation */}

        {/* Publish → Ideas (vertical up, with gold glow) */}
        <FlowArrow
          from={{ x: POSITIONS.publish.x, y: POSITIONS.publish.y - NODE_HEIGHT / 2 }}
          to={{ x: POSITIONS.ideas.x, y: POSITIONS.ideas.y + NODE_HEIGHT / 2 }}
          progress={ideasArrowProgress}
          color={ACCENT_GOLD}
        />

        {/* === NODES === */}

        {/* Dotted connector lines BEHIND SOURCES node */}
        <SourceConnectorLinesWrapper
          centerX={POSITIONS.sources.x}
          centerY={POSITIONS.sources.y}
          progress={iconsProgress}
          continuous={continuousFlowActive}
        />

        {/* SOURCES node */}
        <FlowNode
          label="SOURCES"
          icon="📡"
          x={POSITIONS.sources.x}
          y={POSITIONS.sources.y}
          opacity={sourcesProgress}
          scale={sourcesProgress}
        />

        {/* X-pattern icons around SOURCES - spin once pipeline flow starts */}
        <XPatternIcons
          centerX={POSITIONS.sources.x}
          centerY={POSITIONS.sources.y}
          progress={iconsProgress}
          continuous={continuousFlowActive}
        />

        {/* CLASSIFY node */}
        <FlowNode
          label="CLASSIFY"
          icon="🔍"
          x={POSITIONS.classify.x}
          y={POSITIONS.classify.y}
          opacity={classifyNodeProgress}
          scale={classifyNodeProgress}
        />

        {/* Classification output panel */}
        <ClassifyOutput progress={classifyOutputProgress} />

        {/* SUMMARIZE node */}
        <FlowNode
          label="SUMMARIZE"
          icon="📝"
          x={POSITIONS.summarize.x}
          y={POSITIONS.summarize.y}
          opacity={summarizeNodeProgress}
          scale={summarizeNodeProgress}
        />

        {/* Summarize output panel - RESTORED */}
        <SummarizeOutput progress={summarizeOutputProgress} />

        {/* PUBLISH node */}
        <FlowNode
          label="PUBLISH"
          icon="🌐"
          x={POSITIONS.publish.x}
          y={POSITIONS.publish.y}
          opacity={publishNodeProgress}
          scale={publishNodeProgress}
        />

        {/* Digest compilation animation (continuous docs flowing from Publish to Digest) */}
        <DigestCompilation active={digestCompilationActive} />

        {/* DIGEST node (amber accent) */}
        <FlowNode
          label="DIGEST"
          icon="📬"
          x={POSITIONS.digest.x}
          y={POSITIONS.digest.y}
          accentColor={ACCENT_AMBER}
          pulsing
          opacity={digestNodeProgress}
          scale={digestNodeProgress}
        />

        {/* Digest output labels (RSS Feeds, JSON Feeds, Markdowns) */}
        <DigestOutput progress={digestOutputProgress} />

        {/* Gold glow effect for IDEAS (lightbulb moment) */}
        <GoldGlowEffect
          x={POSITIONS.ideas.x}
          y={POSITIONS.ideas.y}
          progress={ideasGlowProgress}
        />

        {/* IDEAS node */}
        <FlowNode
          label="IDEAS"
          icon="💡"
          x={POSITIONS.ideas.x}
          y={POSITIONS.ideas.y}
          accentColor={ACCENT_GOLD}
          opacity={ideasNodeProgress}
          scale={ideasNodeProgress}
        />

        {/* Ideas output panel */}
        <IdeasOutput progress={ideasOutputProgress} />

        {/* === DATA PACKETS (single traversal during reveal) === */}

        {/* Packet: Sources → Classify */}
        {frame >= CLASSIFY_START + 10 && frame < CLASSIFY_START + 45 && (
          <DataPacket
            from={{ x: POSITIONS.sources.x + NODE_WIDTH / 2, y: POSITIONS.sources.y }}
            to={{ x: POSITIONS.classify.x - NODE_WIDTH / 2, y: POSITIONS.classify.y }}
            progress={(frame - CLASSIFY_START - 10) / 35}
          />
        )}

        {/* Packet: Classify → Summarize */}
        {frame >= SUMMARIZE_START + 10 && frame < SUMMARIZE_START + 40 && (
          <DataPacket
            from={{ x: POSITIONS.classify.x + NODE_WIDTH / 2, y: POSITIONS.classify.y }}
            to={{ x: POSITIONS.summarize.x - NODE_WIDTH / 2, y: POSITIONS.summarize.y }}
            progress={(frame - SUMMARIZE_START - 10) / 30}
          />
        )}

        {/* Packet: Summarize → Publish */}
        {frame >= PUBLISH_START + 10 && frame < PUBLISH_START + 45 && (
          <DataPacket
            from={{ x: POSITIONS.summarize.x + NODE_WIDTH / 2, y: POSITIONS.summarize.y }}
            to={{ x: POSITIONS.publish.x - NODE_WIDTH / 2, y: POSITIONS.publish.y }}
            progress={(frame - PUBLISH_START - 10) / 35}
          />
        )}

        {/* Publish → Digest uses continuous doc flow animation instead of packet */}

        {/* Packet: Publish → Ideas (gold, upward) */}
        {frame >= IDEAS_START + 10 && frame < IDEAS_START + 55 && (
          <DataPacket
            from={{ x: POSITIONS.publish.x, y: POSITIONS.publish.y - NODE_HEIGHT / 2 }}
            to={{ x: POSITIONS.ideas.x, y: POSITIONS.ideas.y + NODE_HEIGHT / 2 }}
            progress={(frame - IDEAS_START - 10) / 45}
            color={ACCENT_GOLD}
          />
        )}

        {/* Continuous data flow through pipeline */}
        <ContinuousFlow active={continuousFlowActive} ideasActive={frame >= IDEAS_START + 50} />
      </AbsoluteFill>

      {/* Logo morph with staggered LIBERTAS text */}
      <LibertasLogo
        opacity={logoProgress}
        scale={interpolate(logoProgress, [0, 1], [0.8, 1])}
        textProgress={textProgress}
      />

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
            backgroundColor: `${BG_SECONDARY}cc`,
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <div>Frame: {frame}</div>
          <div>Time: {(frame / fps).toFixed(2)}s</div>
          <div>Phase: {
            frame < CLASSIFY_START ? 'Sources' :
            frame < SUMMARIZE_START ? 'Classify' :
            frame < PUBLISH_START ? 'Summarize' :
            frame < DIGEST_START ? 'Publish' :
            frame < IDEAS_START ? 'Digest' :
            frame < LOGO_MORPH_START ? 'Ideas' :
            'Logo Morph'
          }</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default WorkflowScene;

/** Timing constants for use in parent composition */
export const WORKFLOW_TIMING = {
  duration: SCENE_DURATION, // 725 frames (24.17s)
  sourcesStart: SOURCES_START,
  classifyStart: CLASSIFY_START,
  summarizeStart: SUMMARIZE_START,
  publishStart: PUBLISH_START,
  digestStart: DIGEST_START,
  ideasStart: IDEAS_START,
  logoMorphStart: LOGO_MORPH_START, // 650 (2.5s duration with text stagger)
} as const;
