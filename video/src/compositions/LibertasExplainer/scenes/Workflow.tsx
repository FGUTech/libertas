/**
 * Workflow Scene - Section 4 (0:50 - 1:20)
 *
 * Animated workflow pipeline demonstration showing how Libertas processes data.
 * Shows the full agentic pipeline from sources to publish/digest/ideas.
 * Duration: 900 frames (30s).
 *
 * Frame breakdown (scene-relative):
 * - 0-120: SOURCES node with X-pattern input icons (RSS, Web, Submit, Users)
 * - 120-200: CLASSIFY node with classification output panel
 * - 200-280: SUMMARIZE node with insight card preview
 * - 280-360: PUBLISH node
 * - 360-480: DIGEST node (amber accent)
 * - 480-650: IDEAS node with GitHub icon
 * - 650-810: Full pipeline with continuous data flow animation
 * - 810-900: Logo morph transition (uses actual logo image)
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

/** Full pipeline continuous animation */
const FULL_PIPELINE_START = 650;

/** Logo morph transition */
const LOGO_MORPH_START = 810;

/** Total scene duration */
const SCENE_DURATION = 900;

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

/** Node positions - 4 main nodes in horizontal line, 2 secondary below */
const POSITIONS = {
  // Main row: Sources → Classify → Summarize → Publish
  sources: { x: CENTER_X - HORIZONTAL_SPACING * 1.5, y: CENTER_Y - 80 },
  classify: { x: CENTER_X - HORIZONTAL_SPACING * 0.5, y: CENTER_Y - 80 },
  summarize: { x: CENTER_X + HORIZONTAL_SPACING * 0.5, y: CENTER_Y - 80 },
  publish: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y - 80 },
  // Secondary row: Digest and Ideas
  digest: { x: CENTER_X - HORIZONTAL_SPACING * 0.5, y: CENTER_Y + 200 },
  ideas: { x: CENTER_X + HORIZONTAL_SPACING * 0.5, y: CENTER_Y + 200 },
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
// BRANCHING ARROW (for vertical connections)
// =============================================================================

interface BranchArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  color?: string;
  direction?: 'down' | 'up';
}

const BranchArrow: React.FC<BranchArrowProps> = ({
  from,
  to,
  progress,
  color = ACCENT_PRIMARY,
  direction = 'down',
}) => {
  const pathLength = Math.abs(to.y - from.y) + Math.abs(to.x - from.x);
  const dashOffset = pathLength * (1 - progress);

  // Create an L-shaped path
  const midY = from.y + (to.y - from.y) * 0.5;
  const path = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;

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
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
      />

      {/* Arrowhead pointing down */}
      {progress > 0.8 && (
        <g
          transform={`translate(${to.x}, ${to.y}) rotate(${direction === 'down' ? 90 : -90})`}
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
// X-PATTERN ICONS (for SOURCES node) - 2 on top, 2 on bottom
// =============================================================================

interface XPatternIconsProps {
  centerX: number;
  centerY: number;
  progress: number;
  continuous?: boolean;
}

const XPatternIcons: React.FC<XPatternIconsProps> = ({
  centerX,
  centerY,
  progress,
  continuous = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4 icons in X/square pattern: 2 on top, 2 on bottom
  const icons = [
    { icon: '📡', label: 'RSS', position: 'top-left' },
    { icon: '🌐', label: 'Web', position: 'top-right' },
    { icon: '📥', label: 'Submit', position: 'bottom-left' },
    { icon: '👤', label: 'Users', position: 'bottom-right' },
  ];

  const offsetX = 100; // Horizontal offset from center
  const offsetY = 75;  // Vertical offset from center

  // Subtle floating animation when continuous
  const floatOffset = continuous ? Math.sin((frame / fps) * Math.PI * 0.8) * 4 : 0;

  const getPosition = (position: string) => {
    switch (position) {
      case 'top-left':
        return { x: centerX - offsetX, y: centerY - offsetY - NODE_HEIGHT / 2 - 30 + floatOffset };
      case 'top-right':
        return { x: centerX + offsetX, y: centerY - offsetY - NODE_HEIGHT / 2 - 30 - floatOffset };
      case 'bottom-left':
        return { x: centerX - offsetX, y: centerY + offsetY + NODE_HEIGHT / 2 + 30 - floatOffset };
      case 'bottom-right':
        return { x: centerX + offsetX, y: centerY + offsetY + NODE_HEIGHT / 2 + 30 + floatOffset };
      default:
        return { x: centerX, y: centerY };
    }
  };

  return (
    <>
      {icons.map((item, index) => {
        const entryProgress = Math.min(1, progress * 2 - index * 0.15);

        if (entryProgress <= 0) return null;

        const pos = getPosition(item.position);
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
        <div style={{ ...terminalStyle(20), color: FG_SECONDARY, lineHeight: 1.7 }}>
          <div>topics: [<span style={{ color: ACCENT_PRIMARY }}>comms</span>, <span style={{ color: ACCENT_PRIMARY }}>censorship</span>]</div>
          <div>relevance: <span style={{ color: ACCENT_PRIMARY }}>{relevanceScore}</span></div>
          <div>credibility: <span style={{ color: ACCENT_PRIMARY }}>{credibilityScore}</span></div>
          <div>geo: [<span style={{ color: ACCENT_PRIMARY }}>Uganda</span>]</div>
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
// IDEAS OUTPUT PANEL - 1.8X SCALED
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
        left: POSITIONS.ideas.x - 160,
        top: POSITIONS.ideas.y + NODE_HEIGHT / 2 + 25,
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
// LIBERTAS LOGO (using actual logo image)
// =============================================================================

interface LogoProps {
  opacity: number;
  scale: number;
}

const LibertasLogo: React.FC<LogoProps> = ({ opacity, scale }) => {
  if (opacity <= 0) return null;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
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
    </AbsoluteFill>
  );
};

// =============================================================================
// CONTINUOUS DATA FLOW (multiple packets)
// =============================================================================

interface ContinuousFlowProps {
  active: boolean;
}

const ContinuousFlow: React.FC<ContinuousFlowProps> = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const packetCount = 8;
  const cycleDuration = 2;
  const cycleFrames = cycleDuration * fps;

  const packets = useMemo(() => {
    const paths = [
      // Main horizontal pipeline
      { from: POSITIONS.sources, to: POSITIONS.classify, color: ACCENT_PRIMARY },
      { from: POSITIONS.classify, to: POSITIONS.summarize, color: ACCENT_PRIMARY },
      { from: POSITIONS.summarize, to: POSITIONS.publish, color: ACCENT_PRIMARY },
      // Vertical to secondary row
      { from: POSITIONS.classify, to: POSITIONS.digest, color: ACCENT_AMBER, vertical: true },
      { from: POSITIONS.summarize, to: POSITIONS.ideas, color: ACCENT_PRIMARY, vertical: true },
    ];

    return Array.from({ length: packetCount }).map((_, i) => {
      const pathIndex = i % paths.length;
      const path = paths[pathIndex];
      const phaseOffset = (i / packetCount) * cycleFrames;
      const adjustedFrame = (frame + phaseOffset) % cycleFrames;
      const progress = adjustedFrame / cycleFrames;

      const fromX = path.from.x + (path.vertical ? 0 : NODE_WIDTH / 2);
      const fromY = path.from.y + (path.vertical ? NODE_HEIGHT / 2 : 0);
      const toX = path.to.x - (path.vertical ? 0 : NODE_WIDTH / 2);
      const toY = path.to.y - (path.vertical ? NODE_HEIGHT / 2 : 0);

      return {
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
        color: path.color,
        progress,
        key: `packet-${i}`,
      };
    });
  }, [frame, cycleFrames]);

  if (!active) return null;

  return (
    <>
      {packets.map((packet) => (
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

  // Digest node (360-480)
  const digestArrowProgress = interpolate(
    frame,
    [DIGEST_START, DIGEST_START + 45],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
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

  // Full pipeline mode (650-810)
  const isFullPipeline = frame >= FULL_PIPELINE_START && frame < LOGO_MORPH_START;

  // Logo morph (810-900)
  const logoProgress = interpolate(
    frame,
    [LOGO_MORPH_START, LOGO_MORPH_START + 60],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  // Pipeline fade out during logo morph
  const pipelineOpacity = interpolate(
    frame,
    [LOGO_MORPH_START, LOGO_MORPH_START + 40],
    [1, 0],
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

      {/* Pipeline container */}
      <AbsoluteFill style={{ opacity: pipelineOpacity }}>
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

        {/* Classify → Digest (vertical down, amber) */}
        <BranchArrow
          from={{ x: POSITIONS.classify.x, y: POSITIONS.classify.y + NODE_HEIGHT / 2 }}
          to={{ x: POSITIONS.digest.x, y: POSITIONS.digest.y - NODE_HEIGHT / 2 }}
          progress={digestArrowProgress}
          color={ACCENT_AMBER}
          direction="down"
        />

        {/* Summarize → Ideas (vertical down, dashed) */}
        <FlowArrow
          from={{ x: POSITIONS.summarize.x, y: POSITIONS.summarize.y + NODE_HEIGHT / 2 }}
          to={{ x: POSITIONS.ideas.x, y: POSITIONS.ideas.y - NODE_HEIGHT / 2 }}
          progress={ideasArrowProgress}
          dashed
        />

        {/* === NODES === */}

        {/* SOURCES node */}
        <FlowNode
          label="SOURCES"
          icon="📡"
          x={POSITIONS.sources.x}
          y={POSITIONS.sources.y}
          opacity={sourcesProgress}
          scale={sourcesProgress}
        />

        {/* X-pattern icons around SOURCES */}
        <XPatternIcons
          centerX={POSITIONS.sources.x}
          centerY={POSITIONS.sources.y}
          progress={iconsProgress}
          continuous={isFullPipeline}
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

        {/* IDEAS node */}
        <FlowNode
          label="IDEAS"
          icon="💡"
          x={POSITIONS.ideas.x}
          y={POSITIONS.ideas.y}
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

        {/* Packet: Classify → Digest */}
        {frame >= DIGEST_START + 10 && frame < DIGEST_START + 55 && (
          <DataPacket
            from={{ x: POSITIONS.classify.x, y: POSITIONS.classify.y + NODE_HEIGHT / 2 }}
            to={{ x: POSITIONS.digest.x, y: POSITIONS.digest.y - NODE_HEIGHT / 2 }}
            progress={(frame - DIGEST_START - 10) / 45}
            color={ACCENT_AMBER}
          />
        )}

        {/* Packet: Summarize → Ideas */}
        {frame >= IDEAS_START + 10 && frame < IDEAS_START + 55 && (
          <DataPacket
            from={{ x: POSITIONS.summarize.x, y: POSITIONS.summarize.y + NODE_HEIGHT / 2 }}
            to={{ x: POSITIONS.ideas.x, y: POSITIONS.ideas.y - NODE_HEIGHT / 2 }}
            progress={(frame - IDEAS_START - 10) / 45}
          />
        )}

        {/* Continuous data flow during full pipeline view */}
        <ContinuousFlow active={isFullPipeline} />
      </AbsoluteFill>

      {/* Logo morph */}
      <LibertasLogo
        opacity={logoProgress}
        scale={interpolate(logoProgress, [0, 1], [0.8, 1])}
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
            frame < FULL_PIPELINE_START ? 'Ideas' :
            frame < LOGO_MORPH_START ? 'Full Pipeline' :
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
  duration: SCENE_DURATION,
  sourcesStart: SOURCES_START,
  classifyStart: CLASSIFY_START,
  summarizeStart: SUMMARIZE_START,
  publishStart: PUBLISH_START,
  digestStart: DIGEST_START,
  ideasStart: IDEAS_START,
  fullPipelineStart: FULL_PIPELINE_START,
  logoMorphStart: LOGO_MORPH_START,
} as const;
