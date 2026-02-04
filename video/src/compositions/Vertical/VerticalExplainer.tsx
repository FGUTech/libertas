/**
 * VerticalExplainer - Vertical format composition for TikTok/Reels
 *
 * 1080x1920 (9:16 aspect ratio) vertical video format.
 * Reframes the key content for mobile-first viewing.
 * Fast-paced edit optimized for social media attention spans.
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  staticFile,
} from 'remotion';
import { colors } from '../../utils/colors';
import { fontFamilies, terminalStyle } from '../../utils/fonts';
import {
  AUDIO_FILES,
  MUSIC_VOLUME_DUCKED,
  SFX_VOLUME_TYPING,
  SFX_VOLUME_AMBIENT,
} from '../../utils/audio';
import { TypewriterText } from '../LibertasExplainer/components/TypewriterText';
import { MatrixRain } from '../LibertasExplainer/components/MatrixRain';
import { Scanlines } from '../LibertasExplainer/components/Scanlines';

// =============================================================================
// TIMING CONSTANTS (fast-paced ~34 seconds total)
// =============================================================================

// Music offset - start at 18.02 seconds into the track (at 30fps = 541 frames)
const MUSIC_START_OFFSET = 541;

// Scene boundaries (frames at 30fps)
const HOOK_START = 0;
const HOOK_END = 150; // 5s - unchanged

const GLITCH_TRANSITION_START = 140; // Starts 10 frames before hook ends
const GLITCH_TRANSITION_DURATION = 20; // ~0.67s glitch

const PROBLEM_START = 150;
const PROBLEM_END = 270; // 4s (was 9s)

const SOLUTION_START = 270;
const SOLUTION_END = 450; // 6s (was 10s)

const WORKFLOW_START = 450;
const WORKFLOW_END = 720; // 9s (was 18s)

const CTA_START = 720;
const CTA_END = 840; // 4s (was 8s)

const END_START = 840;
const END_END = 990; // 5s (was 10s)

const TOTAL_DURATION = 990; // ~33 seconds (was 60s)

// =============================================================================
// TYPES
// =============================================================================

export interface VerticalExplainerProps {
  debug?: boolean;
  audioEnabled?: boolean;
}

// =============================================================================
// AUDIO COMPONENT (updated timings)
// =============================================================================

const VerticalAudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Music volume - slightly ducked throughout since it's shorter format
  const getMusicVolume = () => {
    // Fade in over first 1.5 seconds
    if (frame < fps * 1.5) {
      return interpolate(frame, [0, fps * 1.5], [0, MUSIC_VOLUME_DUCKED]);
    }
    // Fade out in last 2 seconds
    if (frame > TOTAL_DURATION - fps * 2) {
      return interpolate(
        frame,
        [TOTAL_DURATION - fps * 2, TOTAL_DURATION],
        [MUSIC_VOLUME_DUCKED, 0]
      );
    }
    return MUSIC_VOLUME_DUCKED;
  };

  const typeVol = () => SFX_VOLUME_TYPING;
  const dataHumVol = () => SFX_VOLUME_AMBIENT;

  return (
    <>
      {/* Background music - start at 18.02s into the track */}
      <Audio
        src={staticFile(AUDIO_FILES.music)}
        volume={getMusicVolume}
        startFrom={MUSIC_START_OFFSET}
      />

      {/* Typing sounds for Hook section */}
      <Sequence from={30} durationInFrames={15} name="SFX: Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={36} durationInFrames={15} name="SFX: Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={42} durationInFrames={15} name="SFX: Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>

      {/* Glitch sound at transition */}
      <Sequence from={GLITCH_TRANSITION_START} durationInFrames={30} name="SFX: Glitch">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={() => 0.3} />
      </Sequence>

      {/* Data hum ambient - starts after problem */}
      <Sequence from={SOLUTION_START} name="SFX: Data Hum">
        <Audio src={staticFile(AUDIO_FILES.sfx.dataHum)} volume={dataHumVol} loop />
      </Sequence>

      {/* Success sound on Solution reveal */}
      <Sequence from={SOLUTION_START + 15} durationInFrames={45} name="SFX: Success">
        <Audio src={staticFile(AUDIO_FILES.sfx.success)} volume={() => 0.15} />
      </Sequence>

      {/* Typing sounds for Workflow nodes (faster pace) */}
      <Sequence from={WORKFLOW_START + 10} durationInFrames={15} name="SFX: Workflow Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={WORKFLOW_START + 55} durationInFrames={15} name="SFX: Workflow Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={WORKFLOW_START + 100} durationInFrames={15} name="SFX: Workflow Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>
      <Sequence from={WORKFLOW_START + 145} durationInFrames={15} name="SFX: Workflow Type 4">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={WORKFLOW_START + 190} durationInFrames={15} name="SFX: Workflow Type 5">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
    </>
  );
};

// =============================================================================
// GLITCH TRANSITION OVERLAY
// =============================================================================

const GlitchTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - GLITCH_TRANSITION_START;

  if (localFrame < 0 || localFrame > GLITCH_TRANSITION_DURATION) return null;

  const intensity = interpolate(
    localFrame,
    [0, GLITCH_TRANSITION_DURATION / 2, GLITCH_TRANSITION_DURATION],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Generate pseudo-random glitch slices based on frame
  const sliceCount = 8;
  const slices = Array.from({ length: sliceCount }).map((_, i) => {
    // Use frame-based pseudo-random for deterministic rendering
    const seed = (localFrame * 17 + i * 31) % 100;
    const offset = ((seed / 100) - 0.5) * intensity * 60;
    const height = 100 / sliceCount;
    const top = i * height;

    return {
      top: `${top}%`,
      height: `${height}%`,
      transform: `translateX(${offset}px)`,
      opacity: intensity > 0.3 ? 1 : intensity / 0.3,
    };
  });

  return (
    <AbsoluteFill style={{ zIndex: 100, overflow: 'hidden' }}>
      {/* Red/cyan chromatic aberration bars */}
      {slices.map((slice, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: slice.top,
            height: slice.height,
            backgroundColor: i % 2 === 0 ? 'rgba(255, 0, 0, 0.15)' : 'rgba(0, 255, 255, 0.15)',
            transform: slice.transform,
            opacity: slice.opacity,
            mixBlendMode: 'screen',
          }}
        />
      ))}

      {/* Static noise overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, ${intensity * 0.05}) 2px,
            rgba(255, 255, 255, ${intensity * 0.05}) 4px
          )`,
          opacity: intensity,
        }}
      />

      {/* Flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'white',
          opacity: intensity > 0.7 ? (intensity - 0.7) * 0.5 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL HOOK SECTION
// =============================================================================

const VerticalHook: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - HOOK_START;

  const cursorFadeOpacity = Math.min(1, localFrame / 9);
  const cursorVisible = Math.floor((localFrame - 15) / 15) % 2 === 0;
  const showStandaloneCursor = localFrame < 30;

  const matrixOpacity = localFrame >= 75
    ? Math.min(0.4, (localFrame - 75) / 30 * 0.4)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      {localFrame >= 75 && (
        <MatrixRain
          opacity={matrixOpacity}
          columnCount={20}
          speedRange={[3, 8]}
          seed="vertical-hook"
          verticalOffset={960}
        />
      )}

      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '85%', paddingLeft: 40 }}>
          {showStandaloneCursor && cursorVisible && (
            <div
              style={{
                display: 'inline-block',
                width: 12,
                height: 40,
                backgroundColor: colors.accent.primary,
                opacity: cursorFadeOpacity,
                boxShadow: `0 0 8px ${colors.accent.primary}`,
              }}
            />
          )}

          {localFrame >= 30 && (
            <TypewriterText
              text="initializing libertas..."
              startFrame={30}
              msPerChar={50}
              prompt="> "
              color={colors.accent.primary}
              fontSize={42}
              showCursor={true}
              style={{ textShadow: `0 0 8px ${colors.accent.primary}40` }}
            />
          )}
        </div>
      </AbsoluteFill>

      <Scanlines opacity={0.03} flicker={false} />
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL PROBLEM SECTION (faster - 4s)
// =============================================================================

const VerticalProblem: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - PROBLEM_START;

  // Headlines appear faster (every ~1.3s instead of ~2.7s)
  const headlines = [
    'SIGNAL COLLAPSE',
    'INFORMATION OVERLOAD',
    'CRITICAL STORIES BURIED',
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      <MatrixRain
        opacity={0.2}
        columnCount={20}
        speedRange={[2, 5]}
        seed="vertical-problem"
        verticalOffset={640}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
          gap: 50,
        }}
      >
        {headlines.map((headline, index) => {
          // Faster: 35 frames (~1.17s) between each instead of 80 (~2.67s)
          const headlineStart = index * 35;
          const progress = spring({
            frame: Math.max(0, localFrame - headlineStart),
            fps,
            config: { damping: 15, stiffness: 120 }, // Snappier spring
          });

          if (localFrame < headlineStart) return null;

          return (
            <div
              key={headline}
              style={{
                fontFamily: fontFamilies.display,
                fontSize: 52,
                fontWeight: 700,
                color: colors.semantic.error,
                textAlign: 'center',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 30}px)`,
                textShadow: `0 0 20px ${colors.semantic.error}60`,
              }}
            >
              {headline}
            </div>
          );
        })}
      </AbsoluteFill>

      <Scanlines opacity={0.03} flicker={false} />
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL SOLUTION SECTION (faster - 6s)
// =============================================================================

const VerticalSolution: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SOLUTION_START;

  const logoProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const titleProgress = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const subtitleProgress = spring({
    frame: Math.max(0, localFrame - 16),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const features = [
    { icon: '🤖', label: 'AI-Powered Analysis' },
    { icon: '🔒', label: 'Privacy-First Design' },
    { icon: '📊', label: 'Real-Time Insights' },
    { icon: '🌐', label: 'Open Source' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      <MatrixRain
        opacity={0.15}
        columnCount={20}
        speedRange={[2, 5]}
        seed="vertical-solution"
        verticalOffset={640}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
        }}
      >
        {/* Logo image */}
        <Img
          src={staticFile('images/libertas-logo.png')}
          style={{
            width: 180,
            height: 180,
            opacity: logoProgress,
            transform: `scale(${0.8 + logoProgress * 0.2})`,
            filter: `drop-shadow(0 0 20px ${colors.accent.primary}) drop-shadow(0 0 40px ${colors.accent.primary}40)`,
            marginBottom: 20,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontFamily: fontFamilies.display,
            fontSize: 72,
            fontWeight: 700,
            color: colors.accent.primary,
            textAlign: 'center',
            opacity: titleProgress,
            transform: `scale(${0.8 + titleProgress * 0.2})`,
            textShadow: `0 0 30px ${colors.accent.primary}60`,
            marginBottom: 20,
          }}
        >
          LIBERTAS
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: fontFamilies.body,
            fontSize: 28,
            color: colors.fg.secondary,
            textAlign: 'center',
            opacity: subtitleProgress,
            marginBottom: 60,
          }}
        >
          Freedom Tech Research Platform
        </div>

        {/* Feature list - faster animation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          {features.map((feature, index) => {
            // Faster: 18 frames between each instead of 30
            const featureProgress = spring({
              frame: Math.max(0, localFrame - 30 - index * 18),
              fps,
              config: { damping: 15, stiffness: 150 },
            });

            return (
              <div
                key={feature.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  opacity: featureProgress,
                  transform: `translateX(${(1 - featureProgress) * 50}px)`,
                }}
              >
                <span style={{ fontSize: 48 }}>{feature.icon}</span>
                <span
                  style={{
                    ...terminalStyle(32),
                    color: colors.fg.primary,
                  }}
                >
                  {feature.label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <Scanlines opacity={0.03} flicker={false} />
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL WORKFLOW DATA FLOW
// =============================================================================

interface DataFlowProps {
  active: boolean;
  localFrame: number;
  fps: number;
}

const VerticalDataFlow: React.FC<DataFlowProps> = ({ active, localFrame, fps }) => {
  if (!active) return null;

  const packetCount = 6;
  const cycleDuration = 1.2; // seconds per cycle
  const cycleFrames = cycleDuration * fps;

  // Define vertical paths (y positions for each segment)
  // Aligned with connector lines between nodes
  // Each segment spans from just below one node to just above the arrow of the next
  const segments = [
    { startY: 435, endY: 528, color: colors.accent.primary },   // SOURCES → CLASSIFY
    { startY: 695, endY: 788, color: colors.accent.primary },   // CLASSIFY → SUMMARIZE (+50)
    { startY: 925, endY: 1018, color: colors.accent.primary },  // SUMMARIZE → PUBLISH (+70)
    { startY: 1165, endY: 1258, color: '#ffd700' },             // PUBLISH → IDEAS (+100)
  ];

  const centerX = 540; // Center of 1080 width

  return (
    <>
      {segments.map((segment, segIndex) => {
        return Array.from({ length: Math.ceil(packetCount / segments.length) }).map((_, i) => {
          const packetIndex = segIndex + i * segments.length;
          const phaseOffset = (packetIndex / packetCount) * cycleFrames;
          const adjustedFrame = (localFrame + phaseOffset) % cycleFrames;
          const progress = adjustedFrame / cycleFrames;

          const y = segment.startY + (segment.endY - segment.startY) * progress;
          const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

          if (progress <= 0 || progress >= 1) return null;

          return (
            <div
              key={`packet-${segIndex}-${i}`}
              style={{
                position: 'absolute',
                left: centerX - 8,
                top: y - 8,
                width: 16,
                height: 16,
                backgroundColor: segment.color,
                borderRadius: 4,
                opacity,
                boxShadow: `0 0 12px ${segment.color}`,
                zIndex: 10,
              }}
            />
          );
        });
      })}
    </>
  );
};

// =============================================================================
// VERTICAL WORKFLOW SECTION (faster - 9s)
// =============================================================================

const VerticalWorkflow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - WORKFLOW_START;

  const nodes = [
    { label: 'SOURCES', icon: '📡', color: colors.accent.primary },
    { label: 'CLASSIFY', icon: '🔍', color: colors.accent.primary },
    { label: 'SUMMARIZE', icon: '📝', color: colors.accent.primary },
    { label: 'PUBLISH', icon: '🌐', color: colors.accent.primary },
    { label: 'IDEAS', icon: '💡', color: '#ffd700' },
  ];

  // Scaled up ~75% for better mobile visibility
  const nodeSpacing = 210;

  // Data flow starts after all nodes are visible
  const allNodesVisible = localFrame > (nodes.length - 1) * 45 + 30;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      <MatrixRain
        opacity={0.15}
        columnCount={20}
        speedRange={[2, 5]}
        seed="vertical-workflow"
        verticalOffset={640}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 100,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: fontFamilies.display,
            fontSize: 84,
            fontWeight: 700,
            color: colors.accent.primary,
            marginBottom: 50,
            textShadow: `0 0 30px ${colors.accent.primary}40`,
          }}
        >
          THE PIPELINE
        </div>

        {/* Vertical pipeline */}
        {nodes.map((node, index) => {
          // Faster: 45 frames between nodes instead of 80 (~1.5s vs ~2.7s)
          const nodeStart = index * 45;
          const progress = spring({
            frame: Math.max(0, localFrame - nodeStart),
            fps,
            config: { damping: 15, stiffness: 120 }, // Snappier
          });

          if (localFrame < nodeStart) return null;

          const connectorHeight = nodeSpacing - 130;
          const arrowSize = 14;

          return (
            <React.Fragment key={node.label}>
              {/* Connector with arrow (except for first node) */}
              {index > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 8,
                    marginBottom: 8,
                    opacity: progress * 0.8,
                  }}
                >
                  {/* Vertical line */}
                  <div
                    style={{
                      width: 4,
                      height: connectorHeight - arrowSize,
                      backgroundColor: node.color,
                    }}
                  />
                  {/* Arrow pointing down */}
                  <svg
                    width={arrowSize * 2}
                    height={arrowSize}
                    viewBox={`0 0 ${arrowSize * 2} ${arrowSize}`}
                  >
                    <polygon
                      points={`${arrowSize},${arrowSize} 0,0 ${arrowSize * 2},0`}
                      fill={node.color}
                    />
                  </svg>
                </div>
              )}

              {/* Node */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  padding: '28px 56px',
                  backgroundColor: colors.bg.tertiary,
                  border: `3px solid ${node.color}`,
                  borderRadius: 20,
                  opacity: progress,
                  transform: `scale(${0.8 + progress * 0.2})`,
                  boxShadow: `0 0 25px ${node.color}40`,
                }}
              >
                <span style={{ fontSize: 63 }}>{node.icon}</span>
                <span
                  style={{
                    ...terminalStyle(49),
                    color: colors.fg.primary,
                  }}
                >
                  {node.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>

      {/* Data flow animation */}
      <VerticalDataFlow active={allNodesVisible} localFrame={localFrame} fps={fps} />

      {/* AI Agent badge at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: interpolate(localFrame, [0, 30], [0, 0.7], { extrapolateRight: 'clamp' }),
        }}
      >
        <span style={{ fontSize: 80 }}>🤖</span>
        <span
          style={{
            ...terminalStyle(24),
            color: colors.accent.primary,
            marginTop: 10,
            textShadow: `0 0 10px ${colors.accent.primary}40`,
          }}
        >
          AI Agents
        </span>
        <span
          style={{
            ...terminalStyle(18),
            color: colors.fg.tertiary,
            marginTop: 6,
          }}
        >
          Watch Signals 24/7
        </span>
      </div>

      <Scanlines opacity={0.03} flicker={false} />
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL CTA SECTION (faster - 4s)
// =============================================================================

const VerticalCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - CTA_START;

  const titleProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Faster URL reveal: 30 frames instead of 60
  const urlProgress = spring({
    frame: Math.max(0, localFrame - 30),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      <MatrixRain
        opacity={0.2}
        columnCount={20}
        speedRange={[2, 5]}
        seed="vertical-cta"
        verticalOffset={640}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
          gap: 50,
        }}
      >
        <div
          style={{
            fontFamily: fontFamilies.display,
            fontSize: 56,
            fontWeight: 700,
            color: colors.fg.primary,
            textAlign: 'center',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 30}px)`,
          }}
        >
          STAY INFORMED
        </div>

        <div
          style={{
            fontFamily: fontFamilies.body,
            fontSize: 32,
            color: colors.fg.secondary,
            textAlign: 'center',
            opacity: titleProgress,
          }}
        >
          Freedom tech insights delivered weekly
        </div>

        <div
          style={{
            fontFamily: fontFamilies.mono,
            fontSize: 36,
            color: colors.accent.primary,
            opacity: urlProgress,
            transform: `scale(${0.9 + urlProgress * 0.1})`,
            textShadow: `0 0 20px ${colors.accent.primary}60`,
            padding: '20px 40px',
            border: `2px solid ${colors.accent.primary}`,
            borderRadius: 12,
          }}
        >
          libertas.fgu.tech
        </div>
      </AbsoluteFill>

      <Scanlines opacity={0.03} flicker={false} />
    </AbsoluteFill>
  );
};

// =============================================================================
// VERTICAL END CARD (faster - 5s)
// =============================================================================

const VerticalEndCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - END_START;

  const logoProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const textProgress = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Pulsing glow
  const glowIntensity = 20 + Math.sin((localFrame / fps) * Math.PI * 2) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      <MatrixRain
        opacity={0.25}
        columnCount={20}
        speedRange={[2, 5]}
        seed="vertical-end"
        verticalOffset={640}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Logo image */}
        <Img
          src={staticFile('images/libertas-logo.png')}
          style={{
            width: 240,
            height: 240,
            opacity: logoProgress,
            transform: `scale(${0.8 + logoProgress * 0.2})`,
            filter: `drop-shadow(0 0 ${glowIntensity}px ${colors.accent.primary}) drop-shadow(0 0 ${glowIntensity * 2}px ${colors.accent.primary}40)`,
            marginBottom: 30,
          }}
        />

        {/* LIBERTAS text */}
        <div
          style={{
            fontFamily: fontFamilies.display,
            fontSize: 96,
            fontWeight: 700,
            color: colors.accent.primary,
            opacity: textProgress,
            transform: `scale(${0.8 + textProgress * 0.2})`,
            textShadow: `0 0 ${glowIntensity}px ${colors.accent.primary}, 0 0 ${glowIntensity * 2}px ${colors.accent.primary}40`,
          }}
        >
          LIBERTAS
        </div>

        <div
          style={{
            fontFamily: fontFamilies.body,
            fontSize: 28,
            color: colors.fg.tertiary,
            marginTop: 30,
            opacity: textProgress,
          }}
        >
          Freedom Go Up
        </div>

        <div
          style={{
            fontFamily: fontFamilies.body,
            fontSize: 24,
            color: colors.fg.tertiary,
            marginTop: 15,
            opacity: textProgress * 0.7,
          }}
        >
          @ StarkWare
        </div>
      </AbsoluteFill>

      <Scanlines opacity={0.03} flicker={false} />
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const VerticalExplainer: React.FC<VerticalExplainerProps> = ({
  debug = false,
  audioEnabled = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine current section
  let currentSection = 'Hook';
  let content: React.ReactNode;

  if (frame < HOOK_END) {
    currentSection = 'Hook';
    content = <VerticalHook frame={frame} />;
  } else if (frame < PROBLEM_END) {
    currentSection = 'Problem';
    content = <VerticalProblem frame={frame} fps={fps} />;
  } else if (frame < SOLUTION_END) {
    currentSection = 'Solution';
    content = <VerticalSolution frame={frame} fps={fps} />;
  } else if (frame < WORKFLOW_END) {
    currentSection = 'Workflow';
    content = <VerticalWorkflow frame={frame} fps={fps} />;
  } else if (frame < CTA_END) {
    currentSection = 'CTA';
    content = <VerticalCTA frame={frame} fps={fps} />;
  } else {
    currentSection = 'EndCard';
    content = <VerticalEndCard frame={frame} fps={fps} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.primary }}>
      {/* Audio layer */}
      {audioEnabled && <VerticalAudio />}

      {content}

      {/* Glitch transition between Hook and Problem */}
      <GlitchTransition frame={frame} />

      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            fontFamily: fontFamilies.mono,
            fontSize: 16,
            color: colors.fg.tertiary,
            backgroundColor: `${colors.bg.secondary}cc`,
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <div>Frame: {frame} / {TOTAL_DURATION}</div>
          <div>Time: {(frame / fps).toFixed(2)}s</div>
          <div>Section: {currentSection}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default VerticalExplainer;

export const VERTICAL_TIMING = {
  duration: TOTAL_DURATION,
  sections: {
    hook: { start: HOOK_START, end: HOOK_END },
    problem: { start: PROBLEM_START, end: PROBLEM_END },
    solution: { start: SOLUTION_START, end: SOLUTION_END },
    workflow: { start: WORKFLOW_START, end: WORKFLOW_END },
    cta: { start: CTA_START, end: CTA_END },
    end: { start: END_START, end: END_END },
  },
} as const;
