/**
 * Libertas Design System - Timing & Animation Utilities
 *
 * Common animation helpers and spring configurations for Remotion.
 * All animations frame-based, never CSS transitions.
 */

import { interpolate, spring, type SpringConfig } from 'remotion';

// =============================================================================
// VIDEO CONSTANTS
// =============================================================================

/** Target frame rate */
export const FPS = 30;

/** Total duration in frames (120 seconds) */
export const TOTAL_FRAMES = FPS * 120;

/** Total duration in seconds */
export const TOTAL_DURATION = 120;

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

/**
 * Smooth spring - gentle, professional motion
 * Use for: fade-ins, subtle movements, UI elements
 */
export const springSmooth: Partial<SpringConfig> = {
  damping: 20,
  mass: 1,
  stiffness: 100,
};

/**
 * Snappy spring - quick, responsive
 * Use for: buttons, toggles, quick state changes
 */
export const springSnappy: Partial<SpringConfig> = {
  damping: 30,
  mass: 0.5,
  stiffness: 200,
};

/**
 * Bouncy spring - playful with overshoot
 * Use for: emphasis, attention-grabbing elements
 */
export const springBouncy: Partial<SpringConfig> = {
  damping: 10,
  mass: 1,
  stiffness: 150,
};

/**
 * Data flow spring - as specified in SPEC.md
 * Use for: workflow diagrams, data transmission animations
 */
export const springDataFlow: Partial<SpringConfig> = {
  damping: 200,
  mass: 1,
  stiffness: 100,
};

/**
 * Heavy spring - slow, weighty motion
 * Use for: dramatic reveals, hero elements
 */
export const springHeavy: Partial<SpringConfig> = {
  damping: 40,
  mass: 2,
  stiffness: 80,
};

/** All spring configurations */
export const springs = {
  smooth: springSmooth,
  snappy: springSnappy,
  bouncy: springBouncy,
  dataFlow: springDataFlow,
  heavy: springHeavy,
} as const;

// =============================================================================
// TIMING HELPERS
// =============================================================================

/**
 * Convert seconds to frames
 */
export function secondsToFrames(seconds: number, fps: number = FPS): number {
  return Math.round(seconds * fps);
}

/**
 * Convert frames to seconds
 */
export function framesToSeconds(frames: number, fps: number = FPS): number {
  return frames / fps;
}

// =============================================================================
// ANIMATION HELPERS
// =============================================================================

/**
 * Standard fade in animation
 * @param frame - Current frame
 * @param startFrame - Frame to start fade
 * @param durationFrames - Duration in frames (default 0.5s)
 */
export function fadeIn(
  frame: number,
  startFrame: number = 0,
  durationFrames: number = FPS * 0.5
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

/**
 * Standard fade out animation
 */
export function fadeOut(
  frame: number,
  startFrame: number,
  durationFrames: number = FPS * 0.5
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

/**
 * Slide up animation (combine with opacity for fade+slide)
 * @param frame - Current frame
 * @param startFrame - Frame to start animation
 * @param durationFrames - Duration in frames
 * @param distance - Distance to slide in pixels
 */
export function slideUp(
  frame: number,
  startFrame: number = 0,
  durationFrames: number = FPS * 0.5,
  distance: number = 50
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [distance, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

/**
 * Typewriter effect - returns number of characters to show
 * @param frame - Current frame
 * @param text - Full text string
 * @param startFrame - Frame to start typing
 * @param charsPerSecond - Typing speed (default 20 chars/sec)
 */
export function typewriter(
  frame: number,
  text: string,
  startFrame: number = 0,
  charsPerSecond: number = 20
): number {
  const elapsed = Math.max(0, frame - startFrame);
  const charsPerFrame = charsPerSecond / FPS;
  return Math.min(Math.floor(elapsed * charsPerFrame), text.length);
}

/**
 * Get visible text for typewriter effect
 */
export function typewriterText(
  frame: number,
  text: string,
  startFrame: number = 0,
  charsPerSecond: number = 20
): string {
  const charCount = typewriter(frame, text, startFrame, charsPerSecond);
  return text.slice(0, charCount);
}

/**
 * Blinking cursor effect (1s interval, step animation)
 * @param frame - Current frame
 * @param blinkInterval - Interval in frames (default 1s)
 */
export function blinkingCursor(
  frame: number,
  blinkInterval: number = FPS
): boolean {
  return Math.floor(frame / (blinkInterval / 2)) % 2 === 0;
}

/**
 * Create spring animation value
 * @param frame - Current frame
 * @param fps - Frames per second
 * @param config - Spring configuration
 * @param delay - Delay in frames before spring starts
 */
export function springValue(
  frame: number,
  fps: number,
  config: Partial<SpringConfig> = springSmooth,
  delay: number = 0
): number {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config,
  });
}

// =============================================================================
// SECTION TIMING (per STORYBOARD.md structure)
// =============================================================================

/** Scene timing boundaries in frames */
export const sceneTiming = {
  hook: { start: 0, end: secondsToFrames(5) },
  problem: { start: secondsToFrames(5), end: secondsToFrames(25) },
  solution: { start: secondsToFrames(25), end: secondsToFrames(50) },
  workflow: { start: secondsToFrames(50), end: secondsToFrames(80) },
  proof: { start: secondsToFrames(80), end: secondsToFrames(100) },
  cta: { start: secondsToFrames(100), end: secondsToFrames(115) },
  endCard: { start: secondsToFrames(115), end: secondsToFrames(120) },
} as const;

/** Scene durations in frames */
export const sceneDurations = {
  hook: sceneTiming.hook.end - sceneTiming.hook.start,
  problem: sceneTiming.problem.end - sceneTiming.problem.start,
  solution: sceneTiming.solution.end - sceneTiming.solution.start,
  workflow: sceneTiming.workflow.end - sceneTiming.workflow.start,
  proof: sceneTiming.proof.end - sceneTiming.proof.start,
  cta: sceneTiming.cta.end - sceneTiming.cta.start,
  endCard: sceneTiming.endCard.end - sceneTiming.endCard.start,
} as const;

// =============================================================================
// GLITCH EFFECT TIMING
// =============================================================================

/** Max glitch duration in frames (0.5s per SPEC.md) */
export const GLITCH_MAX_FRAMES = FPS * 0.5;

/**
 * Random glitch intensity based on frame
 * @param frame - Current frame
 * @param seed - Seed for pseudo-random variation
 */
export function glitchIntensity(frame: number, seed: number = 0): number {
  // Pseudo-random based on frame for consistent playback
  const noise = Math.sin(frame * 12.9898 + seed * 78.233) * 43758.5453;
  return noise - Math.floor(noise);
}

// =============================================================================
// EXPORT
// =============================================================================

export const timing = {
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  totalDuration: TOTAL_DURATION,
  springs,
  scenes: sceneTiming,
  durations: sceneDurations,
  glitchMaxFrames: GLITCH_MAX_FRAMES,
} as const;

export default timing;
