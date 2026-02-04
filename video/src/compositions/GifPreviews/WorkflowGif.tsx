/**
 * WorkflowGif - 480px wide GIF preview of the Workflow scene
 *
 * Captures key parts of the workflow pipeline animation.
 * - 480x270 (16:9 aspect ratio)
 * - 12 second loop showing pipeline build + continuous flow
 * - No audio (GIF format)
 * - Optimized layout for smaller resolution
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { ACCENT_PRIMARY, ACCENT_AMBER, BG_PRIMARY, BG_TERTIARY, FG_PRIMARY, FG_TERTIARY } from '../../utils/colors';
import { terminalStyle } from '../../utils/fonts';
import { MatrixRain } from '../LibertasExplainer/components/MatrixRain';
import { Scanlines } from '../LibertasExplainer/components/Scanlines';

// =============================================================================
// TIMING CONSTANTS (compressed for GIF)
// =============================================================================

const SOURCES_START = 0;
const CLASSIFY_START = 45;
const SUMMARIZE_START = 90;
const PUBLISH_START = 135;
const DIGEST_START = 180;
const IDEAS_START = 220;
const CONTINUOUS_FLOW_START = 270;

// Total GIF duration: 12 seconds at 30fps = 360 frames
const GIF_DURATION = 360;

// =============================================================================
// LAYOUT CONSTANTS (scaled for 480x270)
// =============================================================================

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 270;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2 - 20;

const HORIZONTAL_SPACING = 105;

const POSITIONS = {
  sources: { x: CENTER_X - HORIZONTAL_SPACING * 1.5, y: CENTER_Y },
  classify: { x: CENTER_X - HORIZONTAL_SPACING * 0.5, y: CENTER_Y },
  summarize: { x: CENTER_X + HORIZONTAL_SPACING * 0.5, y: CENTER_Y },
  publish: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y },
  ideas: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y - 55 },
  digest: { x: CENTER_X + HORIZONTAL_SPACING * 1.5, y: CENTER_Y + 55 },
} as const;

const NODE_WIDTH = 72;
const NODE_HEIGHT = 24;

const ACCENT_GOLD = '#ffd700';

// =============================================================================
// TYPES
// =============================================================================

export interface WorkflowGifProps {
  debug?: boolean;
}

// =============================================================================
// MINI FLOW NODE
// =============================================================================

interface NodeProps {
  label: string;
  icon: string;
  x: number;
  y: number;
  accentColor?: string;
  opacity?: number;
  scale?: number;
}

const MiniFlowNode: React.FC<NodeProps> = ({
  label,
  icon,
  x,
  y,
  accentColor = ACCENT_PRIMARY,
  opacity = 1,
  scale = 1,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - NODE_WIDTH / 2,
        top: y - NODE_HEIGHT / 2,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
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
          border: `1px solid ${accentColor}`,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          boxShadow: `0 0 6px ${accentColor}30`,
        }}
      >
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span
          style={{
            ...terminalStyle(9),
            color: FG_PRIMARY,
            letterSpacing: '0.03em',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// SOURCE ICONS (X-pattern around SOURCES node)
// =============================================================================

interface SourceIconsProps {
  centerX: number;
  centerY: number;
  progress: number;
}

const SourceIcons: React.FC<SourceIconsProps> = ({ centerX, centerY, progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const icons = [
    { icon: '📡', baseAngle: -135, phaseOffset: 0 },      // top-left
    { icon: '🌐', baseAngle: -45, phaseOffset: 0.7 },     // top-right
    { icon: '📥', baseAngle: 135, phaseOffset: 1.3 },     // bottom-left
    { icon: '👤', baseAngle: 45, phaseOffset: 2.1 },      // bottom-right
  ];

  const radius = 35; // Scaled down for smaller GIF

  // Per-icon bob animation with staggered phases
  const getBobOffset = (phaseOffset: number) =>
    Math.sin((frame / fps) * Math.PI * 2 / 3 + phaseOffset) * 2;

  return (
    <>
      {/* Dotted connector lines */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {icons.map((item, index) => {
          const angleRad = (item.baseAngle * Math.PI) / 180;
          const iconX = centerX + Math.cos(angleRad) * radius;
          const iconY = centerY + Math.sin(angleRad) * radius;
          const bobOffset = getBobOffset(item.phaseOffset);

          return (
            <line
              key={`connector-${index}`}
              x1={iconX}
              y1={iconY + (progress >= 1 ? bobOffset : 0)}
              x2={centerX}
              y2={centerY}
              stroke={ACCENT_AMBER}
              strokeWidth={1}
              strokeDasharray="3 2"
              opacity={progress * 0.5}
            />
          );
        })}
      </svg>

      {/* Icons */}
      {icons.map((item, index) => {
        const entryProgress = Math.min(1, progress * 2 - index * 0.15);
        if (entryProgress <= 0) return null;

        const angleRad = (item.baseAngle * Math.PI) / 180;
        const iconX = centerX + Math.cos(angleRad) * radius;
        const iconY = centerY + Math.sin(angleRad) * radius;
        const bobOffset = getBobOffset(item.phaseOffset);

        const opacity = interpolate(entryProgress, [0, 0.5, 1], [0, 0.5, 1]);
        const scale = interpolate(entryProgress, [0, 1], [0.5, 1]);

        return (
          <div
            key={item.icon}
            style={{
              position: 'absolute',
              left: iconX - 10,
              top: iconY - 10 + (entryProgress >= 1 ? bobOffset : 0),
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              transform: `scale(${scale})`,
              fontSize: 12,
            }}
          >
            {item.icon}
          </div>
        );
      })}
    </>
  );
};

// =============================================================================
// MINI FLOW ARROW
// =============================================================================

interface ArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  color?: string;
}

const MiniFlowArrow: React.FC<ArrowProps> = ({
  from,
  to,
  progress,
  color = ACCENT_PRIMARY,
}) => {
  const pathLength = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );
  const dashOffset = pathLength * (1 - progress);
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
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
      />
      {progress > 0.8 && (
        <g
          transform={`translate(${to.x}, ${to.y}) rotate(${angle})`}
          opacity={interpolate(progress, [0.8, 1], [0, 1])}
        >
          <polygon points="0,0 -6,-3 -6,3" fill={color} />
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// DATA PACKET
// =============================================================================

interface PacketProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  color?: string;
  size?: number;
}

const MiniDataPacket: React.FC<PacketProps> = ({
  from,
  to,
  progress,
  color = ACCENT_PRIMARY,
  size = 8,
}) => {
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;
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
        borderRadius: 2,
        opacity,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  );
};

// =============================================================================
// DIGEST DOCUMENT FLOW (Publish → Digest)
// =============================================================================

const DigestDocFlow: React.FC<{ active: boolean }> = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!active) return null;

  const docCount = 3;
  const cycleDuration = 1.2;
  const cycleFrames = cycleDuration * fps;

  const docs = Array.from({ length: docCount }).map((_, i) => {
    const phaseOffset = (i / docCount) * cycleFrames;
    const adjustedFrame = (frame + phaseOffset) % cycleFrames;
    const docProgress = adjustedFrame / cycleFrames;

    const spreadOffset = (i - 1) * 8;
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
          left: x - 5,
          top: y - 5,
          fontSize: 10,
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
// CONTINUOUS FLOW (including Ideas path)
// =============================================================================

const ContinuousFlow: React.FC<{ active: boolean; ideasActive: boolean }> = ({ active, ideasActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!active) return null;

  const packetCount = 4;
  const cycleDuration = 1.5;
  const cycleFrames = cycleDuration * fps;

  // Main horizontal paths
  const mainPaths = [
    { from: POSITIONS.sources, to: POSITIONS.classify, color: ACCENT_PRIMARY },
    { from: POSITIONS.classify, to: POSITIONS.summarize, color: ACCENT_PRIMARY },
    { from: POSITIONS.summarize, to: POSITIONS.publish, color: ACCENT_PRIMARY },
  ];

  const mainPackets = Array.from({ length: packetCount }).map((_, i) => {
    const pathIndex = i % mainPaths.length;
    const path = mainPaths[pathIndex];
    const phaseOffset = (i / packetCount) * cycleFrames;
    const adjustedFrame = (frame + phaseOffset) % cycleFrames;
    const progress = adjustedFrame / cycleFrames;

    return {
      from: { x: path.from.x + NODE_WIDTH / 2, y: path.from.y },
      to: { x: path.to.x - NODE_WIDTH / 2, y: path.to.y },
      color: path.color,
      progress,
      key: `main-${i}`,
    };
  });

  // Ideas path packets (gold, going up)
  const ideasPackets = ideasActive ? Array.from({ length: 2 }).map((_, i) => {
    const phaseOffset = (i / 2) * cycleFrames;
    const adjustedFrame = (frame + phaseOffset) % cycleFrames;
    const progress = adjustedFrame / cycleFrames;

    return {
      from: { x: POSITIONS.publish.x, y: POSITIONS.publish.y - NODE_HEIGHT / 2 },
      to: { x: POSITIONS.ideas.x, y: POSITIONS.ideas.y + NODE_HEIGHT / 2 },
      color: ACCENT_GOLD,
      progress,
      key: `ideas-${i}`,
    };
  }) : [];

  const allPackets = [...mainPackets, ...ideasPackets];

  return (
    <>
      {allPackets.map((p) => (
        <MiniDataPacket
          key={p.key}
          from={p.from}
          to={p.to}
          progress={p.progress}
          color={p.color}
        />
      ))}
    </>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const WorkflowGif: React.FC<WorkflowGifProps> = ({ debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Node animation progress
  const sourcesProgress = spring({
    frame: frame - SOURCES_START,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Source icons progress
  const iconsProgress = interpolate(
    frame,
    [SOURCES_START + 15, SOURCES_START + 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const classifyArrowProgress = interpolate(
    frame, [CLASSIFY_START, CLASSIFY_START + 20], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const classifyNodeProgress = spring({
    frame: Math.max(0, frame - CLASSIFY_START - 15),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const summarizeArrowProgress = interpolate(
    frame, [SUMMARIZE_START, SUMMARIZE_START + 20], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const summarizeNodeProgress = spring({
    frame: Math.max(0, frame - SUMMARIZE_START - 15),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const publishArrowProgress = interpolate(
    frame, [PUBLISH_START, PUBLISH_START + 20], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const publishNodeProgress = spring({
    frame: Math.max(0, frame - PUBLISH_START - 15),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Digest arrow (Publish → Digest)
  const digestArrowProgress = interpolate(
    frame, [DIGEST_START, DIGEST_START + 20], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const digestNodeProgress = spring({
    frame: Math.max(0, frame - DIGEST_START - 20),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const ideasArrowProgress = interpolate(
    frame, [IDEAS_START, IDEAS_START + 25], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const ideasNodeProgress = spring({
    frame: Math.max(0, frame - IDEAS_START - 20),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const continuousFlowActive = frame >= CONTINUOUS_FLOW_START;
  const digestDocFlowActive = frame >= DIGEST_START + 30;
  const ideasFlowActive = frame >= IDEAS_START + 30;

  const matrixOpacity = 0.2;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/* Matrix rain background */}
      <MatrixRain
        opacity={matrixOpacity}
        columnCount={12}
        speedRange={[2, 5]}
        seed="workflow-gif"
        verticalOffset={90}
      />

      {/* Pipeline */}
      <AbsoluteFill>
        {/* Source icons around SOURCES node */}
        <SourceIcons
          centerX={POSITIONS.sources.x}
          centerY={POSITIONS.sources.y}
          progress={iconsProgress}
        />

        {/* Horizontal arrows */}
        <MiniFlowArrow
          from={{ x: POSITIONS.sources.x + NODE_WIDTH / 2, y: POSITIONS.sources.y }}
          to={{ x: POSITIONS.classify.x - NODE_WIDTH / 2, y: POSITIONS.classify.y }}
          progress={classifyArrowProgress}
        />
        <MiniFlowArrow
          from={{ x: POSITIONS.classify.x + NODE_WIDTH / 2, y: POSITIONS.classify.y }}
          to={{ x: POSITIONS.summarize.x - NODE_WIDTH / 2, y: POSITIONS.summarize.y }}
          progress={summarizeArrowProgress}
        />
        <MiniFlowArrow
          from={{ x: POSITIONS.summarize.x + NODE_WIDTH / 2, y: POSITIONS.summarize.y }}
          to={{ x: POSITIONS.publish.x - NODE_WIDTH / 2, y: POSITIONS.publish.y }}
          progress={publishArrowProgress}
        />

        {/* Publish → Digest arrow (down) */}
        <MiniFlowArrow
          from={{ x: POSITIONS.publish.x, y: POSITIONS.publish.y + NODE_HEIGHT / 2 }}
          to={{ x: POSITIONS.digest.x, y: POSITIONS.digest.y - NODE_HEIGHT / 2 }}
          progress={digestArrowProgress}
          color={ACCENT_AMBER}
        />

        {/* Publish → Ideas arrow (up) */}
        <MiniFlowArrow
          from={{ x: POSITIONS.publish.x, y: POSITIONS.publish.y - NODE_HEIGHT / 2 }}
          to={{ x: POSITIONS.ideas.x, y: POSITIONS.ideas.y + NODE_HEIGHT / 2 }}
          progress={ideasArrowProgress}
          color={ACCENT_GOLD}
        />

        {/* Nodes */}
        <MiniFlowNode
          label="SOURCES"
          icon="📡"
          x={POSITIONS.sources.x}
          y={POSITIONS.sources.y}
          opacity={sourcesProgress}
          scale={sourcesProgress}
        />
        <MiniFlowNode
          label="CLASSIFY"
          icon="🔍"
          x={POSITIONS.classify.x}
          y={POSITIONS.classify.y}
          opacity={classifyNodeProgress}
          scale={classifyNodeProgress}
        />
        <MiniFlowNode
          label="SUMMARIZE"
          icon="📝"
          x={POSITIONS.summarize.x}
          y={POSITIONS.summarize.y}
          opacity={summarizeNodeProgress}
          scale={summarizeNodeProgress}
        />
        <MiniFlowNode
          label="PUBLISH"
          icon="🌐"
          x={POSITIONS.publish.x}
          y={POSITIONS.publish.y}
          opacity={publishNodeProgress}
          scale={publishNodeProgress}
        />
        <MiniFlowNode
          label="DIGEST"
          icon="📬"
          x={POSITIONS.digest.x}
          y={POSITIONS.digest.y}
          accentColor={ACCENT_AMBER}
          opacity={digestNodeProgress}
          scale={digestNodeProgress}
        />
        <MiniFlowNode
          label="IDEAS"
          icon="💡"
          x={POSITIONS.ideas.x}
          y={POSITIONS.ideas.y}
          accentColor={ACCENT_GOLD}
          opacity={ideasNodeProgress}
          scale={ideasNodeProgress}
        />

        {/* Digest document flow animation */}
        <DigestDocFlow active={digestDocFlowActive} />

        {/* Continuous flow including Ideas path */}
        <ContinuousFlow active={continuousFlowActive} ideasActive={ideasFlowActive} />
      </AbsoluteFill>

      {/* Scanlines */}
      <Scanlines opacity={0.03} flicker={false} />

      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            fontSize: 8,
            color: FG_TERTIARY,
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '2px 4px',
            borderRadius: 2,
          }}
        >
          {frame}/{GIF_DURATION}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default WorkflowGif;

export const WORKFLOW_GIF_TIMING = {
  duration: GIF_DURATION,
} as const;
