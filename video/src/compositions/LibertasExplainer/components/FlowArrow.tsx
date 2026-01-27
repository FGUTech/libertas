/**
 * FlowArrow Component
 *
 * Animated arrow path for connecting workflow nodes. Features path drawing
 * animation, arrowhead, and optional data packet that travels along the path.
 * Supports straight lines, right-angle paths, and curved bezier paths.
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ACCENT_PRIMARY } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface Point {
  x: number;
  y: number;
}

export type PathType = 'straight' | 'rightAngle' | 'bezier';

export interface FlowArrowProps {
  /** Starting point of the arrow */
  from: Point;
  /** Ending point of the arrow */
  to: Point;
  /** Frame at which drawing animation starts */
  startFrame?: number;
  /** Duration of drawing animation in frames (default: 20) */
  drawDuration?: number;
  /** Arrow stroke color (default: green) */
  color?: string;
  /** Stroke width in pixels (default: 3) */
  strokeWidth?: number;
  /** Path type: straight, rightAngle, or bezier (default: straight) */
  pathType?: PathType;
  /** Control point for bezier curves (optional) */
  controlPoint?: Point;
  /** Show data packet animation (default: false) */
  showPacket?: boolean;
  /** Frame offset for packet start after arrow draws (default: 0) */
  packetDelay?: number;
  /** Packet travel duration in frames (default: 30) */
  packetDuration?: number;
  /** Packet size in pixels (default: 12) */
  packetSize?: number;
  /** Show arrowhead (default: true) */
  showArrowhead?: boolean;
  /** Arrowhead size (default: 12) */
  arrowheadSize?: number;
  /** Dashed line style (default: false) */
  dashed?: boolean;
  /** Additional inline styles for SVG container */
  style?: React.CSSProperties;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_DRAW_DURATION = 20;
const DEFAULT_STROKE_WIDTH = 3;
const DEFAULT_PACKET_SIZE = 12;
const DEFAULT_PACKET_DURATION = 30;
const DEFAULT_ARROWHEAD_SIZE = 12;

/** Spring config for smooth motion */
const DRAW_SPRING_CONFIG = {
  damping: 20,
  stiffness: 80,
  mass: 0.5,
};

// =============================================================================
// PATH GENERATION HELPERS
// =============================================================================

/**
 * Generate SVG path string based on path type
 */
function generatePath(
  from: Point,
  to: Point,
  pathType: PathType,
  controlPoint?: Point
): string {
  switch (pathType) {
    case 'straight':
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

    case 'rightAngle': {
      // Create a right-angle path (horizontal first, then vertical)
      const midX = to.x;
      const midY = from.y;
      return `M ${from.x} ${from.y} L ${midX} ${midY} L ${to.x} ${to.y}`;
    }

    case 'bezier': {
      // Create a quadratic bezier curve
      const ctrl = controlPoint ?? {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2 - 50, // Default curve upward
      };
      return `M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`;
    }

    default:
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
}

/**
 * Calculate approximate path length for stroke-dasharray animation
 */
function calculatePathLength(
  from: Point,
  to: Point,
  pathType: PathType
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  switch (pathType) {
    case 'straight':
      return Math.sqrt(dx * dx + dy * dy);

    case 'rightAngle':
      return Math.abs(dx) + Math.abs(dy);

    case 'bezier': {
      // Approximate bezier length (rough estimate)
      const straightLength = Math.sqrt(dx * dx + dy * dy);
      return straightLength * 1.2;
    }

    default:
      return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Get point along path at progress t (0-1)
 */
function getPointOnPath(
  from: Point,
  to: Point,
  pathType: PathType,
  t: number,
  controlPoint?: Point
): Point {
  switch (pathType) {
    case 'straight': {
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
    }

    case 'rightAngle': {
      const raMidX = to.x;
      const raMidY = from.y;
      const horizontalDist = Math.abs(raMidX - from.x);
      const verticalDist = Math.abs(to.y - raMidY);
      const totalDist = horizontalDist + verticalDist;

      const horizontalRatio = horizontalDist / totalDist;

      if (t <= horizontalRatio) {
        // On horizontal segment
        const segmentT = t / horizontalRatio;
        return {
          x: from.x + (raMidX - from.x) * segmentT,
          y: from.y,
        };
      } else {
        // On vertical segment
        const segmentT = (t - horizontalRatio) / (1 - horizontalRatio);
        return {
          x: raMidX,
          y: raMidY + (to.y - raMidY) * segmentT,
        };
      }
    }

    case 'bezier': {
      const ctrl = controlPoint ?? {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2 - 50,
      };
      // Quadratic bezier formula: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
      const mt = 1 - t;
      return {
        x: mt * mt * from.x + 2 * mt * t * ctrl.x + t * t * to.x,
        y: mt * mt * from.y + 2 * mt * t * ctrl.y + t * t * to.y,
      };
    }

    default:
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
  }
}

/**
 * Calculate arrowhead rotation angle at end of path
 */
function getArrowheadAngle(
  from: Point,
  to: Point,
  pathType: PathType,
  controlPoint?: Point
): number {
  let endDir: Point;

  switch (pathType) {
    case 'rightAngle': {
      // Arrow points in direction of final segment (vertical)
      const midX = to.x;
      const midY = from.y;
      endDir = { x: to.x - midX, y: to.y - midY };
      break;
    }

    case 'bezier': {
      // Tangent at end of quadratic bezier
      const ctrl = controlPoint ?? {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2 - 50,
      };
      endDir = {
        x: 2 * (to.x - ctrl.x),
        y: 2 * (to.y - ctrl.y),
      };
      break;
    }

    default:
      endDir = { x: to.x - from.x, y: to.y - from.y };
  }

  return Math.atan2(endDir.y, endDir.x) * (180 / Math.PI);
}

// =============================================================================
// COMPONENT
// =============================================================================

export const FlowArrow: React.FC<FlowArrowProps> = ({
  from,
  to,
  startFrame = 0,
  drawDuration = DEFAULT_DRAW_DURATION,
  color = ACCENT_PRIMARY,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  pathType = 'straight',
  controlPoint,
  showPacket = false,
  packetDelay = 0,
  packetDuration = DEFAULT_PACKET_DURATION,
  packetSize = DEFAULT_PACKET_SIZE,
  showArrowhead = true,
  arrowheadSize = DEFAULT_ARROWHEAD_SIZE,
  dashed = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate path
  const pathD = useMemo(
    () => generatePath(from, to, pathType, controlPoint),
    [from, to, pathType, controlPoint]
  );

  // Calculate path length for dash animation
  const pathLength = useMemo(
    () => calculatePathLength(from, to, pathType),
    [from, to, pathType]
  );

  // Calculate draw progress (0 to 1)
  const isDrawing = frame >= startFrame;
  const drawProgress = isDrawing
    ? spring({
        frame: frame - startFrame,
        fps,
        config: DRAW_SPRING_CONFIG,
        durationInFrames: drawDuration,
      })
    : 0;

  // Calculate stroke-dasharray for drawing animation
  const dashArray = `${pathLength}`;
  const dashOffset = interpolate(
    drawProgress,
    [0, 1],
    [pathLength, 0],
    { extrapolateRight: 'clamp' }
  );

  // Calculate packet position
  const packetStartFrame = startFrame + drawDuration + packetDelay;
  const isPacketVisible = showPacket && frame >= packetStartFrame;
  const packetProgress = isPacketVisible
    ? interpolate(
        frame - packetStartFrame,
        [0, packetDuration],
        [0, 1],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  const packetPosition = useMemo(
    () => getPointOnPath(from, to, pathType, packetProgress, controlPoint),
    [from, to, pathType, packetProgress, controlPoint]
  );

  // Calculate arrowhead rotation
  const arrowAngle = useMemo(
    () => getArrowheadAngle(from, to, pathType, controlPoint),
    [from, to, pathType, controlPoint]
  );

  // Arrowhead visibility tied to draw progress
  const arrowheadOpacity = interpolate(
    drawProgress,
    [0.8, 1],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Packet opacity (fade in at start, fade out at end)
  const packetOpacity = isPacketVisible
    ? interpolate(
        packetProgress,
        [0, 0.1, 0.9, 1],
        [0, 1, 1, 0],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
      }}
      viewBox={`0 0 1920 1080`}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Main path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? '8 8' : dashArray}
        strokeDashoffset={dashed ? 0 : dashOffset}
        opacity={dashed ? drawProgress * 0.6 : 1}
      />

      {/* Arrowhead */}
      {showArrowhead && (
        <g
          transform={`translate(${to.x}, ${to.y}) rotate(${arrowAngle})`}
          opacity={arrowheadOpacity}
        >
          <polygon
            points={`0,0 ${-arrowheadSize},-${arrowheadSize / 2} ${-arrowheadSize},${arrowheadSize / 2}`}
            fill={color}
          />
        </g>
      )}

      {/* Data packet */}
      {showPacket && packetProgress < 1 && (
        <rect
          x={packetPosition.x - packetSize / 2}
          y={packetPosition.y - packetSize / 2}
          width={packetSize}
          height={packetSize}
          fill={color}
          opacity={packetOpacity}
          rx={2}
          ry={2}
        />
      )}
    </svg>
  );
};

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Preset configurations for common arrow types
 */
export const arrowPresets = {
  /** Standard flow arrow */
  standard: {
    strokeWidth: 3,
    pathType: 'straight' as const,
    drawDuration: 20,
  },

  /** Arrow with data packet */
  withPacket: {
    strokeWidth: 3,
    pathType: 'straight' as const,
    drawDuration: 20,
    showPacket: true,
    packetDuration: 30,
  },

  /** Right-angle connector */
  rightAngle: {
    strokeWidth: 3,
    pathType: 'rightAngle' as const,
    drawDuration: 25,
  },

  /** Curved bezier arrow */
  curved: {
    strokeWidth: 3,
    pathType: 'bezier' as const,
    drawDuration: 25,
  },

  /** Dashed optional flow */
  optional: {
    strokeWidth: 2,
    pathType: 'straight' as const,
    dashed: true,
    drawDuration: 20,
  },

  /** Fast arrow for quick transitions */
  fast: {
    strokeWidth: 3,
    pathType: 'straight' as const,
    drawDuration: 10,
  },
} as const;

/**
 * Get preset arrow props by name
 */
export function getArrowPreset(
  preset: keyof typeof arrowPresets
): Partial<FlowArrowProps> {
  return arrowPresets[preset];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate total animation duration for an arrow (draw + optional packet)
 */
export function getArrowAnimationDuration(
  drawDuration: number = DEFAULT_DRAW_DURATION,
  showPacket: boolean = false,
  packetDelay: number = 0,
  packetDuration: number = DEFAULT_PACKET_DURATION
): number {
  if (showPacket) {
    return drawDuration + packetDelay + packetDuration;
  }
  return drawDuration;
}

/**
 * Calculate frame when arrow drawing completes
 */
export function getArrowDrawEndFrame(
  startFrame: number,
  drawDuration: number = DEFAULT_DRAW_DURATION
): number {
  return startFrame + drawDuration;
}

export default FlowArrow;
