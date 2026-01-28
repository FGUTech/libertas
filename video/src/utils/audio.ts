/**
 * Libertas Design System - Audio Utilities
 *
 * Centralized audio constants and utilities for consistent mixing
 * across all scenes and compositions.
 *
 * Reference: docs/SPEC.md Audio Design section
 */

import { interpolate } from 'remotion';

// =============================================================================
// dB TO LINEAR CONVERSION
// =============================================================================

/**
 * Convert decibels to linear volume (0-1 scale)
 * Formula: linear = 10^(dB/20)
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear volume to decibels
 * Formula: dB = 20 * log10(linear)
 */
export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

// =============================================================================
// REFERENCE LEVELS (per SPEC.md)
// =============================================================================

/**
 * Master audio levels based on SPEC.md requirements:
 * - Voiceover: 0dB (reference)
 * - Music bed: -18dB to -24dB (ducking under VO)
 * - Sound effects: -12dB to -15dB
 */
export const AUDIO_LEVELS = {
  // Voiceover at reference level (0dB)
  vo: {
    db: 0,
    linear: 1.0,
  },

  // Music bed levels
  music: {
    // Normal level: -18dB (when VO not playing)
    normal: {
      db: -18,
      linear: dbToLinear(-18), // ~0.126
    },
    // Ducked level: -24dB (when VO is playing)
    ducked: {
      db: -24,
      linear: dbToLinear(-24), // ~0.063
    },
  },

  // Sound effects levels (adjusted based on feedback)
  sfx: {
    // Typing SFX: 0dB (very prominent, matches VO level)
    typing: {
      db: 0,
      linear: dbToLinear(0), // 1.0
    },
    // Prominent SFX: -12dB (CRT, success chimes)
    loud: {
      db: -12,
      linear: dbToLinear(-12), // ~0.251
    },
    // Standard SFX: -14dB (commands)
    normal: {
      db: -14,
      linear: dbToLinear(-14), // ~0.200
    },
    // Subtle SFX: -15dB (background)
    quiet: {
      db: -15,
      linear: dbToLinear(-15), // ~0.178
    },
    // Glitch SFX: -30dB (very subtle, background texture)
    glitch: {
      db: -30,
      linear: dbToLinear(-30), // ~0.032
    },
    // Ambient/loop SFX: -20dB (data hum, atmosphere)
    ambient: {
      db: -20,
      linear: dbToLinear(-20), // ~0.100
    },
  },
} as const;

// =============================================================================
// VOLUME CONSTANTS (for direct use in components)
// =============================================================================

// Voiceover
export const VO_VOLUME = AUDIO_LEVELS.vo.linear;

// Music
export const MUSIC_VOLUME_NORMAL = AUDIO_LEVELS.music.normal.linear;
export const MUSIC_VOLUME_DUCKED = AUDIO_LEVELS.music.ducked.linear;

// SFX by category
export const SFX_VOLUME_TYPING = AUDIO_LEVELS.sfx.typing.linear;
export const SFX_VOLUME_LOUD = AUDIO_LEVELS.sfx.loud.linear;
export const SFX_VOLUME_NORMAL = AUDIO_LEVELS.sfx.normal.linear;
export const SFX_VOLUME_QUIET = AUDIO_LEVELS.sfx.quiet.linear;
export const SFX_VOLUME_GLITCH = AUDIO_LEVELS.sfx.glitch.linear;
export const SFX_VOLUME_AMBIENT = AUDIO_LEVELS.sfx.ambient.linear;

// =============================================================================
// DUCKING UTILITIES
// =============================================================================

/**
 * Transition time for volume ducking (in seconds)
 */
export const DUCK_TRANSITION_SEC = 0.3;

/**
 * Calculate music volume with VO ducking
 * Smoothly transitions between normal and ducked levels
 *
 * @param frame - Current frame
 * @param fps - Frames per second
 * @param voSegments - Array of {start, durationSec} for each VO segment
 * @param fadeIn - Optional fade-in config {startFrame, durationFrames}
 * @param fadeOut - Optional fade-out config {startFrame, durationFrames}
 */
export function getMusicVolumeWithDucking(
  frame: number,
  fps: number,
  voSegments: Array<{ start: number; durationSec: number }>,
  fadeIn?: { startFrame: number; durationFrames: number },
  fadeOut?: { startFrame: number; durationFrames: number }
): number {
  const duckTransitionFrames = Math.round(DUCK_TRANSITION_SEC * fps);
  let volume = MUSIC_VOLUME_NORMAL;

  // Check each VO segment and apply ducking
  for (const vo of voSegments) {
    const voStart = vo.start;
    const voEnd = voStart + vo.durationSec * fps;

    if (frame >= voStart - duckTransitionFrames && frame <= voEnd + duckTransitionFrames) {
      if (frame < voStart) {
        // Transitioning into duck
        const duckAmount = interpolate(
          frame,
          [voStart - duckTransitionFrames, voStart],
          [MUSIC_VOLUME_NORMAL, MUSIC_VOLUME_DUCKED],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        volume = Math.min(volume, duckAmount);
      } else if (frame > voEnd) {
        // Transitioning out of duck
        const duckAmount = interpolate(
          frame,
          [voEnd, voEnd + duckTransitionFrames],
          [MUSIC_VOLUME_DUCKED, MUSIC_VOLUME_NORMAL],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        volume = Math.min(volume, duckAmount);
      } else {
        // During VO - fully ducked
        volume = MUSIC_VOLUME_DUCKED;
      }
    }
  }

  // Apply fade-in
  if (fadeIn && frame < fadeIn.startFrame + fadeIn.durationFrames) {
    const fadeMultiplier = interpolate(
      frame,
      [fadeIn.startFrame, fadeIn.startFrame + fadeIn.durationFrames],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    volume *= fadeMultiplier;
  }

  // Apply fade-out
  if (fadeOut && frame >= fadeOut.startFrame) {
    const fadeMultiplier = interpolate(
      frame,
      [fadeOut.startFrame, fadeOut.startFrame + fadeOut.durationFrames],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    volume *= fadeMultiplier;
  }

  return volume;
}

/**
 * Calculate VO volume with subtle fade in/out
 * @param frame - Current frame (relative to VO start)
 * @param durationSec - VO duration in seconds
 * @param fps - Frames per second
 */
export function getVOVolume(
  frame: number,
  durationSec: number,
  fps: number
): number {
  const fadeFrames = Math.round(0.1 * fps); // 0.1s fade
  const totalFrames = durationSec * fps;

  // Fade in
  if (frame < fadeFrames) {
    return interpolate(frame, [0, fadeFrames], [0, VO_VOLUME], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  // Fade out
  if (frame > totalFrames - fadeFrames) {
    return interpolate(frame, [totalFrames - fadeFrames, totalFrames], [VO_VOLUME, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  return VO_VOLUME;
}

// =============================================================================
// AUDIO FILE PATHS
// =============================================================================

/**
 * Centralized audio file paths for consistency
 */
export const AUDIO_FILES = {
  music: 'audio/skynet-sky-cassette-main-version-41446-01-52.mp3',
  vo: {
    problem: 'audio/vo/vo-problem.mp3',
    solution: 'audio/vo/vo-solution.mp3',
    engine: 'audio/vo/vo-engine.mp3',
    proof: 'audio/vo/vo-proof.mp3',
    cta: 'audio/vo/vo-cta.mp3',
  },
  sfx: {
    type1: 'audio/sfx/type-1.wav',
    type2: 'audio/sfx/type-2.wav',
    type3: 'audio/sfx/type-3.wav',
    cmdExecute: 'audio/sfx/cmd-execute.wav',
    glitch: 'audio/sfx/glitch.wav',
    warning: 'audio/sfx/warning.wav',
    success: 'audio/sfx/success.wav',
    dataHum: 'audio/sfx/data-hum.wav',
    crtOn: 'audio/sfx/crt-on.wav',
    crtOff: 'audio/sfx/crt-off.wav',
  },
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export const audio = {
  levels: AUDIO_LEVELS,
  files: AUDIO_FILES,
  dbToLinear,
  linearToDb,
  getMusicVolumeWithDucking,
  getVOVolume,
} as const;

export default audio;
