/**
 * LibertasExplainer - Main Composition
 *
 * 90-120 second cinematic explainer video for the Libertas Freedom Tech
 * Research Platform. Combines all 7 scenes with transitions and audio.
 *
 * Scene Timeline:
 * - Hook:     0:00 - 0:05  (frames 0-150)
 * - Problem:  0:05 - 0:25  (frames 150-750)
 * - Solution: 0:25 - 0:50  (frames 750-1500)
 * - Workflow: 0:50 - 1:20  (frames 1500-2400)
 * - Proof:    1:20 - 1:40  (frames 2400-3000)
 * - CTA:      1:40 - 1:55  (frames 3000-3450)
 * - EndCard:  1:55 - 2:00  (frames 3450-3600)
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

// =============================================================================
// TIMING CONFIGURATION
// =============================================================================

/**
 * Scene durations in frames (at 30fps)
 * These values are used by TransitionSeries, which overlaps transitions.
 * The actual timeline positions are calculated accounting for overlap.
 */
const SCENE_DURATIONS = {
  hook: 150,      // 5 seconds
  problem: 528,   // 17.6 seconds (cut 2.4s of black from end)
  solution: 500,  // 16.67 seconds (removed value props section)
  workflow: 695,  // 23.17 seconds (cut 1s from end, logo morph removed)
  proof: 600,     // 20 seconds
  cta: 450,       // 15 seconds
  endCard: 150,   // 5 seconds
} as const;

/**
 * Transition durations in frames (at 30fps)
 */
const TRANSITION_DURATIONS = {
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
 * Base scene total: 150 + 528 + 500 + 695 + 600 + 450 + 150 = 3073
 * Transition overlap: 12 + 18 + 15 + 15 + 18 + 15 = 93
 * Final duration: 3073 - 93 = 2980 frames (~99.3 seconds)
 *
 * Adjusted durations add overlap compensation per scene.
 */
const ADJUSTED_SCENE_DURATIONS = {
  hook: 150 + 12,           // 162 frames - accounts for exit transition
  problem: 528 + 15,        // 543 frames - cut 2.4s black + transitions
  solution: 500 + 17,       // 517 frames - removed value props
  workflow: 695 + 15,       // 710 frames - cut 1s, logo morph removed
  proof: 600 + 17,          // 617 frames
  cta: 450 + 17,            // 467 frames
  endCard: 150,             // 150 frames - no exit transition
} as const;

/** Total composition duration in frames */
const TOTAL_FRAMES = 3073;

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
        {/* Scene 1: Hook (0:00 - 0:05) */}
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
  let currentScene = 'Hook';
  if (frame >= 150) currentScene = 'Problem';
  if (frame >= 663) currentScene = 'Solution';
  if (frame >= 1148) currentScene = 'Workflow';
  if (frame >= 1828) currentScene = 'Proof';
  if (frame >= 2413) currentScene = 'CTA';
  if (frame >= 2848) currentScene = 'EndCard';

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
        <div>Frame: {frame} / 3600</div>
        <div>Time: {seconds}s / 120.00s</div>
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
  total: TOTAL_FRAMES, // ~3085 frames (~102.8 seconds)
} as const;
