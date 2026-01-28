/**
 * LibertasExplainer - Main Composition
 *
 * ~94.7 second cinematic explainer video for the Libertas Freedom Tech
 * Research Platform. Combines all 7 scenes with transitions and audio.
 *
 * Scene Timeline (approximate):
 * - Hook:     0:00 - 0:05  (150 frames)
 * - Problem:  0:05 - 0:22  (528 frames)
 * - Solution: 0:22 - 0:34  (360 frames)
 * - Workflow: 0:34 - 0:57  (695 frames)
 * - Proof:    0:57 - 1:17  (600 frames)
 * - CTA:      1:17 - 1:32  (450 frames)
 * - EndCard:  1:32 - 1:37  (150 frames)
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

// Scenes
import {
  HookScene,
  ProblemScene,
  SolutionScene,
  WorkflowScene,
  ProofScene,
  CTAScene,
  EndCardScene,
} from './scenes';

// Thumbnail for X/Twitter first frame
import { Thumbnail } from '../Thumbnail';

// Custom transitions
import {
  glitchCut,
  crtShutdown,
  fadeThroughGreen,
  glitchMorph,
  particleConverge,
} from './transitions';

// Note: Audio is handled by individual scenes, not centrally
// Each scene has its own music + VO + SFX at scene-relative timing

// Colors
import { BG_PRIMARY } from '../../utils/colors';

// Caption overlay
import { CaptionTrack } from './components/CaptionTrack';

// =============================================================================
// TIMING CONFIGURATION
// =============================================================================

/**
 * Scene durations in frames (at 30fps)
 * These values are used by TransitionSeries, which overlaps transitions.
 * The actual timeline positions are calculated accounting for overlap.
 */
const SCENE_DURATIONS = {
  thumbnailIntro: 1,  // 1 frame - just enough for X first frame capture
  hook: 150,      // 5 seconds
  problem: 528,   // 17.6 seconds (cut 2.4s of black from end)
  solution: 370,  // 12.33 seconds (removed action words section)
  workflow: 695,  // 23.17 seconds (cut 1s from end, logo morph removed)
  proof: 600,     // 20 seconds
  cta: 450,       // 15 seconds
  endCard: 150,   // 5 seconds
} as const;

/**
 * Transition durations in frames (at 30fps)
 */
const TRANSITION_DURATIONS = {
  thumbnailToHook: 1,     // 1 frame - instant cut to hook
  hookToProblem: 12,      // 0.4s - Glitch cut
  problemToSolution: 18,   // 0.6s - CRT shutdown
  solutionToWorkflow: 15,  // 0.5s - Fade through green
  workflowToProof: 15,     // 0.5s - Glitch morph
  proofToCta: 18,          // 0.6s - Particle converge
  ctaToEndCard: 15,        // 0.5s - Gentle fade
} as const;

/**
 * Duration Calculation Notes:
 * With TransitionSeries, each transition overlaps adjacent scenes.
 * Total = sum(sceneDurations) - sum(transitionDurations)
 *
 * Base scene total: 150 + 528 + 360 + 695 + 600 + 450 + 150 = 2933
 * Transition overlap: 12 + 18 + 15 + 15 + 18 + 15 = 93
 * Final duration: 2933 - 93 = 2840 frames (~94.7 seconds)
 *
 * Adjusted durations add overlap compensation per scene.
 */
const ADJUSTED_SCENE_DURATIONS = {
  thumbnailIntro: 1 + 1,    // 2 frames - just for X first frame capture
  hook: 150 + 12,           // 162 frames - accounts for exit transition
  problem: 528 + 15,        // 543 frames - cut 2.4s black + transitions
  solution: 370 + 17,       // 387 frames - removed action words section
  workflow: 695 + 15,       // 710 frames - cut 1s, logo morph removed
  proof: 600 + 17,          // 617 frames
  cta: 450 + 17,            // 467 frames
  endCard: 150,             // 150 frames - no exit transition
} as const;

/** Total composition duration in frames (added 1 frame for thumbnail intro) */
const TOTAL_FRAMES = 2944;

// =============================================================================
// TYPES
// =============================================================================

export interface LibertasExplainerProps {
  /** Enable debug overlays on scenes */
  debug?: boolean;
  /** Enable audio tracks */
  audioEnabled?: boolean;
  /** Master volume (0-1) */
  masterVolume?: number;
  /** Enable baked-in captions for autoplay */
  captionsEnabled?: boolean;
}

// =============================================================================
// COMPOSITION
// =============================================================================

/**
 * Main LibertasExplainer Composition
 *
 * Uses TransitionSeries for smooth scene transitions with custom
 * presentation effects (glitch, CRT, particles, etc.)
 */
export const LibertasExplainer: React.FC<LibertasExplainerProps> = ({
  debug = false,
  // Audio props reserved for future centralized audio control
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  audioEnabled: _audioEnabled = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  masterVolume: _masterVolume = 1.0,
  captionsEnabled = true,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/*
        Audio is handled by individual scenes, not centrally.
        Each scene includes its own music, VO, and SFX at scene-relative timing.
        This allows scenes to work both standalone and in the full composition.

        Note: audioEnabled and masterVolume props are available for future use
        if we switch to centralized audio control.
      */}

      {/* Visual Scenes with Transitions */}
      <TransitionSeries>
        {/* Scene 0: Thumbnail Intro (for X/Twitter first frame capture) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.thumbnailIntro}>
          <Thumbnail showPlayButton={true} playButtonStyle="rounded" xOptimized={true} />
        </TransitionSeries.Sequence>

        {/* Transition: Thumbnail → Hook (Fade) */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.thumbnailToHook })}
        />

        {/* Scene 1: Hook (0:01.5 - 0:06.5) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.hook}>
          <HookScene debug={debug} />
        </TransitionSeries.Sequence>

        {/* Transition: Hook → Problem (Glitch Cut) */}
        <TransitionSeries.Transition
          presentation={glitchCut({ intensity: 0.8, sliceCount: 12 })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.hookToProblem })}
        />

        {/* Scene 2: Problem (0:05 - 0:25) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.problem}>
          <ProblemScene debug={debug} />
        </TransitionSeries.Sequence>

        {/* Transition: Problem → Solution (CRT Shutdown) */}
        <TransitionSeries.Transition
          presentation={crtShutdown({ showGlow: true })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.problemToSolution })}
        />

        {/* Scene 3: Solution (0:25 - 0:50) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.solution}>
          <SolutionScene debug={debug} />
        </TransitionSeries.Sequence>

        {/* Transition: Solution → Workflow (Fade Through Green) */}
        <TransitionSeries.Transition
          presentation={fadeThroughGreen({ colorIntensity: 0.5 })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.solutionToWorkflow })}
        />

        {/* Scene 4: Workflow/Engine (0:50 - 1:20) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.workflow}>
          <WorkflowScene debug={debug} />
        </TransitionSeries.Sequence>

        {/* Transition: Workflow → Proof (Glitch Morph) */}
        <TransitionSeries.Transition
          presentation={glitchMorph({ intensity: 0.5, blockCount: 10 })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.workflowToProof })}
        />

        {/* Scene 5: Proof (1:20 - 1:40) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.proof}>
          <ProofScene debug={debug} />
        </TransitionSeries.Sequence>

        {/* Transition: Proof → CTA (Particle Converge) */}
        <TransitionSeries.Transition
          presentation={particleConverge({ particleCount: 50 })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.proofToCta })}
        />

        {/* Scene 6: CTA (1:40 - 1:55) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.cta}>
          <CTAScene debug={debug} />
        </TransitionSeries.Sequence>

        {/* Transition: CTA → EndCard (Gentle Fade) */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATIONS.ctaToEndCard })}
        />

        {/* Scene 7: EndCard (1:55 - 2:00) */}
        <TransitionSeries.Sequence durationInFrames={ADJUSTED_SCENE_DURATIONS.endCard}>
          <EndCardScene debug={debug} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Caption Track - overlays all scenes */}
      <CaptionTrack enabled={captionsEnabled} debug={debug} />

      {/* Global Debug Overlay */}
      {debug && <DebugOverlay />}
    </AbsoluteFill>
  );
};

// =============================================================================
// DEBUG OVERLAY
// =============================================================================

const DebugOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = (frame / 30).toFixed(2);

  // Determine current scene based on frame (approximate with transitions)
  // Thumbnail intro is just 1 frame at the start
  let currentScene = 'Thumbnail';
  if (frame >= 1) currentScene = 'Hook';
  if (frame >= 151) currentScene = 'Problem';
  if (frame >= 664) currentScene = 'Solution';
  if (frame >= 1009) currentScene = 'Workflow';
  if (frame >= 1689) currentScene = 'Proof';
  if (frame >= 2274) currentScene = 'CTA';
  if (frame >= 2709) currentScene = 'EndCard';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff41',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          padding: '8px 12px',
          borderRadius: 4,
          border: '1px solid #00ff41',
        }}
      >
        <div>Frame: {frame} / {TOTAL_FRAMES}</div>
        <div>Time: {seconds}s / {(TOTAL_FRAMES / 30).toFixed(1)}s</div>
        <div>Scene: {currentScene}</div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default LibertasExplainer;

// Export timing for reference
export const TIMING = {
  scenes: SCENE_DURATIONS,
  transitions: TRANSITION_DURATIONS,
  total: TOTAL_FRAMES, // ~2933 frames (~94.7 seconds)
} as const;
