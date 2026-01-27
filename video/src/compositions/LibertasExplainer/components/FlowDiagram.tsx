/**
 * FlowDiagram Component
 *
 * Orchestrates FlowNode and FlowArrow components to create animated
 * workflow diagrams. Handles timing, positioning, and data flow visualization.
 * Used in the Workflow scene (Section 4) to demonstrate the Libertas pipeline.
 */

import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { FlowNode, getNodeEdgePositions } from './FlowNode';
import { FlowArrow, type Point, type PathType } from './FlowArrow';
import { ACCENT_AMBER } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface NodeConfig {
  /** Unique identifier for the node */
  id: string;
  /** Display label for the node */
  label: string;
  /** Optional icon character or emoji */
  icon?: string;
  /** X position (center) in pixels */
  x: number;
  /** Y position (center) in pixels */
  y: number;
  /** Node width (default: 180) */
  width?: number;
  /** Node height (default: 60) */
  height?: number;
  /** Accent color override */
  accentColor?: string;
  /** Show pulsing glow */
  pulsing?: boolean;
  /** Frame at which node appears */
  startFrame: number;
}

export interface ConnectionConfig {
  /** ID of source node */
  from: string;
  /** ID of target node */
  to: string;
  /** Frame at which arrow starts drawing */
  startFrame: number;
  /** Path type (straight, rightAngle, bezier) */
  pathType?: PathType;
  /** Control point for bezier paths */
  controlPoint?: Point;
  /** Show data packet animation */
  showPacket?: boolean;
  /** Packet delay after arrow draws */
  packetDelay?: number;
  /** Use dashed line style */
  dashed?: boolean;
  /** Source edge (default: right) */
  fromEdge?: 'top' | 'bottom' | 'left' | 'right';
  /** Target edge (default: left) */
  toEdge?: 'top' | 'bottom' | 'left' | 'right';
  /** Arrow color override */
  color?: string;
}

export interface FlowDiagramProps {
  /** Array of node configurations */
  nodes: NodeConfig[];
  /** Array of connection configurations */
  connections: ConnectionConfig[];
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get edge position for a node
 */
function getEdgePosition(
  node: NodeConfig,
  edge: 'top' | 'bottom' | 'left' | 'right'
): Point {
  const edges = getNodeEdgePositions(
    node.x,
    node.y,
    node.width ?? 180,
    node.height ?? 60
  );
  return edges[edge];
}

// =============================================================================
// COMPONENT
// =============================================================================

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  nodes,
  connections,
  style,
}) => {
  // Create node lookup map for connection resolution
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeConfig>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  // Resolve connection points
  const resolvedConnections = useMemo(() => {
    return connections.map((conn) => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);

      if (!fromNode || !toNode) {
        console.warn(`FlowDiagram: Could not find nodes for connection ${conn.from} -> ${conn.to}`);
        return null;
      }

      const fromPos = getEdgePosition(fromNode, conn.fromEdge ?? 'right');
      const toPos = getEdgePosition(toNode, conn.toEdge ?? 'left');

      return {
        ...conn,
        fromPos,
        toPos,
      };
    }).filter((c): c is NonNullable<typeof c> => c !== null);
  }, [connections, nodeMap]);

  return (
    <AbsoluteFill style={style}>
      {/* Render arrows first (behind nodes) */}
      {resolvedConnections.map((conn, index) => (
        <FlowArrow
          key={`arrow-${conn.from}-${conn.to}-${index}`}
          from={conn.fromPos}
          to={conn.toPos}
          startFrame={conn.startFrame}
          pathType={conn.pathType}
          controlPoint={conn.controlPoint}
          showPacket={conn.showPacket}
          packetDelay={conn.packetDelay}
          dashed={conn.dashed}
          color={conn.color}
        />
      ))}

      {/* Render nodes on top */}
      {nodes.map((node) => (
        <FlowNode
          key={`node-${node.id}`}
          label={node.label}
          icon={node.icon}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          startFrame={node.startFrame}
          accentColor={node.accentColor}
          pulsing={node.pulsing}
        />
      ))}
    </AbsoluteFill>
  );
};

// =============================================================================
// LIBERTAS WORKFLOW PRESET
// =============================================================================

/**
 * Pre-configured Libertas workflow pipeline
 * Matches the storyboard Section 4 (Engine/Workflow) specification
 */
export interface LibertasWorkflowConfig {
  /** Frame offset for entire workflow */
  startFrame: number;
  /** Horizontal center of the diagram */
  centerX?: number;
  /** Vertical center of the diagram */
  centerY?: number;
  /** Whether to show data packets */
  showPackets?: boolean;
}

/**
 * Generate Libertas workflow node and connection configs
 */
export function generateLibertasWorkflow(
  config: LibertasWorkflowConfig
): { nodes: NodeConfig[]; connections: ConnectionConfig[] } {
  const {
    startFrame,
    centerX = 960,
    centerY = 540,
    showPackets = true,
  } = config;

  // Layout constants
  const nodeSpacingX = 240;
  const nodeSpacingY = 120;

  // Node positions (centered layout)
  const sourcesX = centerX - nodeSpacingX * 1.5;
  const classifyX = centerX - nodeSpacingX * 0.5;
  const summarizeX = centerX + nodeSpacingX * 0.5;
  const publishX = centerX + nodeSpacingX * 1.5;

  const mainY = centerY;
  const digestY = centerY + nodeSpacingY;
  const ideasY = centerY + nodeSpacingY;

  // Timing constants
  const nodeDelay = 30; // Frames between node appearances
  const arrowDelay = 15; // Frames after node for arrow

  // Node configurations
  const nodes: NodeConfig[] = [
    {
      id: 'sources',
      label: 'SOURCES',
      icon: '📡',
      x: sourcesX,
      y: mainY,
      width: 160,
      startFrame: startFrame,
    },
    {
      id: 'classify',
      label: 'CLASSIFY',
      icon: '🔍',
      x: classifyX,
      y: mainY,
      width: 160,
      startFrame: startFrame + nodeDelay,
    },
    {
      id: 'summarize',
      label: 'SUMMARIZE',
      icon: '📝',
      x: summarizeX,
      y: mainY,
      width: 180,
      startFrame: startFrame + nodeDelay * 2,
    },
    {
      id: 'publish',
      label: 'PUBLISH',
      icon: '🌐',
      x: publishX,
      y: mainY,
      width: 160,
      startFrame: startFrame + nodeDelay * 3,
    },
    {
      id: 'digest',
      label: 'DIGEST',
      icon: '📬',
      x: publishX - nodeSpacingX * 0.3,
      y: digestY,
      width: 150,
      accentColor: ACCENT_AMBER,
      pulsing: true,
      startFrame: startFrame + nodeDelay * 4,
    },
    {
      id: 'ideas',
      label: 'IDEAS',
      icon: '💡',
      x: summarizeX + nodeSpacingX * 0.5,
      y: ideasY,
      width: 140,
      startFrame: startFrame + nodeDelay * 5,
    },
  ];

  // Connection configurations
  const connections: ConnectionConfig[] = [
    // Main pipeline
    {
      from: 'sources',
      to: 'classify',
      startFrame: startFrame + nodeDelay + arrowDelay,
      showPacket: showPackets,
      packetDelay: 5,
    },
    {
      from: 'classify',
      to: 'summarize',
      startFrame: startFrame + nodeDelay * 2 + arrowDelay,
      showPacket: showPackets,
      packetDelay: 5,
    },
    {
      from: 'summarize',
      to: 'publish',
      startFrame: startFrame + nodeDelay * 3 + arrowDelay,
      showPacket: showPackets,
      packetDelay: 5,
    },
    // Branch to Digest
    {
      from: 'summarize',
      to: 'digest',
      startFrame: startFrame + nodeDelay * 4 + arrowDelay,
      fromEdge: 'bottom',
      toEdge: 'top',
      pathType: 'rightAngle',
      showPacket: showPackets,
      packetDelay: 10,
      color: ACCENT_AMBER,
    },
    // Branch to Ideas (from high-relevance items)
    {
      from: 'classify',
      to: 'ideas',
      startFrame: startFrame + nodeDelay * 5 + arrowDelay,
      fromEdge: 'bottom',
      toEdge: 'top',
      pathType: 'bezier',
      controlPoint: { x: classifyX + 100, y: mainY + nodeSpacingY * 0.5 },
      dashed: true,
      showPacket: showPackets,
      packetDelay: 15,
    },
  ];

  return { nodes, connections };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate the total animation duration for a flow diagram
 */
export function getFlowDiagramDuration(
  nodes: NodeConfig[],
  connections: ConnectionConfig[]
): number {
  let maxFrame = 0;

  // Find latest node start frame + node animation duration (~25 frames)
  for (const node of nodes) {
    maxFrame = Math.max(maxFrame, node.startFrame + 25);
  }

  // Find latest connection animation end
  for (const conn of connections) {
    const drawDuration = 20;
    const packetDuration = conn.showPacket ? 30 : 0;
    const packetDelay = conn.packetDelay ?? 0;
    const endFrame = conn.startFrame + drawDuration + packetDelay + packetDuration;
    maxFrame = Math.max(maxFrame, endFrame);
  }

  return maxFrame;
}

/**
 * Create a simple linear flow diagram
 */
export function createLinearFlow(
  labels: string[],
  config: {
    startFrame: number;
    startX: number;
    y: number;
    nodeSpacing: number;
    nodeDelay: number;
    showPackets?: boolean;
  }
): { nodes: NodeConfig[]; connections: ConnectionConfig[] } {
  const nodes: NodeConfig[] = labels.map((label, index) => ({
    id: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    x: config.startX + index * config.nodeSpacing,
    y: config.y,
    startFrame: config.startFrame + index * config.nodeDelay,
  }));

  const connections: ConnectionConfig[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({
      from: nodes[i].id,
      to: nodes[i + 1].id,
      startFrame: nodes[i + 1].startFrame + 10,
      showPacket: config.showPackets ?? false,
    });
  }

  return { nodes, connections };
}

export default FlowDiagram;
