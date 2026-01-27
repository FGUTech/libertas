/**
 * GlitchEffect Component
 *
 * Digital glitch effect with RGB channel separation and horizontal slice
 * displacement. Used for transitions and dramatic moments. Creates the
 * iconic VHS/digital corruption look.
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, random, AbsoluteFill } from 'remotion';
import { ERROR, INFO } from '../../../utils/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface GlitchEffectProps {
  /** Children to apply glitch effect to */
  children: React.ReactNode;
  /** Intensity of the glitch effect (0-1, default: 0.5) */
  intensity?: number;
  /** RGB separation offset in pixels (default: auto based on intensity) */
  rgbOffset?: number;
  /** Number of horizontal slices for displacement (default: 8) */
  sliceCount?: number;
  /** Maximum slice displacement in pixels (default: auto based on intensity) */
  maxSliceOffset?: number;
  /** Whether the glitch is currently active (default: true) */
  active?: boolean;
  /** Seed for deterministic randomness (default: 'glitch') */
  seed?: string;
  /** Enable RGB channel separation (default: true) */
  enableRgbSplit?: boolean;
  /** Enable horizontal slice displacement (default: true) */
  enableSliceDisplacement?: boolean;
  /** Flicker rate - how often glitch pattern changes (default: 2 frames) */
  flickerRate?: number;
}

interface SliceConfig {
  /** Y position of slice start (0-1 normalized) */
  y: number;
  /** Height of slice (0-1 normalized) */
  height: number;
  /** X offset in pixels */
  offset: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  children,
  intensity = 0.5,
  rgbOffset,
  sliceCount = 8,
  maxSliceOffset,
  active = true,
  seed = 'glitch',
  enableRgbSplit = true,
  enableSliceDisplacement = true,
  flickerRate = 2,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // Calculate auto values based on intensity
  const effectiveRgbOffset = rgbOffset ?? Math.round(intensity * 12);
  const effectiveMaxSliceOffset = maxSliceOffset ?? Math.round(intensity * width * 0.05);

  // Generate deterministic flicker frame for reproducible renders
  const flickerFrame = Math.floor(frame / flickerRate);

  // Generate slice configurations for this frame
  const slices = useMemo((): SliceConfig[] => {
    if (!active || !enableSliceDisplacement) return [];

    const sliceConfigs: SliceConfig[] = [];
    const sliceHeight = 1 / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      const sliceSeed = `${seed}-slice-${i}-${flickerFrame}`;

      // Only offset some slices (creates more chaotic look)
      const shouldOffset = random(sliceSeed + '-should') > 0.4;

      if (shouldOffset) {
        // Randomize offset direction and magnitude
        const offsetMagnitude = random(sliceSeed + '-mag') * effectiveMaxSliceOffset;
        const offsetDirection = random(sliceSeed + '-dir') > 0.5 ? 1 : -1;

        sliceConfigs.push({
          y: i * sliceHeight,
          height: sliceHeight,
          offset: offsetMagnitude * offsetDirection * intensity,
        });
      }
    }

    return sliceConfigs;
  }, [
    active,
    enableSliceDisplacement,
    sliceCount,
    seed,
    flickerFrame,
    effectiveMaxSliceOffset,
    intensity,
  ]);

  // If not active, just render children
  if (!active) {
    return <>{children}</>;
  }

  // Calculate RGB offsets with slight variation per frame
  const rgbVariation = random(`${seed}-rgb-${flickerFrame}`) * 0.4 + 0.8; // 0.8-1.2 multiplier
  const redOffset = effectiveRgbOffset * rgbVariation;
  const cyanOffset = -effectiveRgbOffset * rgbVariation;

  return (
    <AbsoluteFill>
      {/* Base layer - the original content */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>

      {/* RGB separation layers */}
      {enableRgbSplit && (
        <>
          {/* Red channel - offset left */}
          <AbsoluteFill
            style={{
              transform: `translateX(${redOffset}px)`,
              mixBlendMode: 'multiply',
              opacity: 0.8,
            }}
          >
            <AbsoluteFill
              style={{
                backgroundColor: ERROR,
                mixBlendMode: 'screen',
                opacity: intensity * 0.3,
              }}
            />
          </AbsoluteFill>

          {/* Cyan channel - offset right */}
          <AbsoluteFill
            style={{
              transform: `translateX(${cyanOffset}px)`,
              mixBlendMode: 'multiply',
              opacity: 0.8,
            }}
          >
            <AbsoluteFill
              style={{
                backgroundColor: INFO,
                mixBlendMode: 'screen',
                opacity: intensity * 0.3,
              }}
            />
          </AbsoluteFill>
        </>
      )}

      {/* Horizontal slice displacement */}
      {enableSliceDisplacement && slices.length > 0 && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          {slices.map((slice, index) => (
            <AbsoluteFill
              key={index}
              style={{
                clipPath: `inset(${slice.y * 100}% 0 ${(1 - slice.y - slice.height) * 100}% 0)`,
                transform: `translateX(${slice.offset}px)`,
              }}
            >
              {children}
            </AbsoluteFill>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Preset configurations for common glitch effects
 */
export const glitchPresets = {
  /** Subtle glitch - barely noticeable, good for background tension */
  subtle: {
    intensity: 0.2,
    sliceCount: 4,
    flickerRate: 4,
    enableSliceDisplacement: false,
  },

  /** Standard transition glitch */
  transition: {
    intensity: 0.5,
    sliceCount: 8,
    flickerRate: 2,
  },

  /** Heavy corruption effect for dramatic moments */
  heavy: {
    intensity: 0.8,
    sliceCount: 12,
    flickerRate: 1,
  },

  /** VHS-style tracking error */
  vhs: {
    intensity: 0.6,
    sliceCount: 6,
    flickerRate: 3,
    enableRgbSplit: true,
    enableSliceDisplacement: true,
  },

  /** Pure RGB split without slices */
  rgbOnly: {
    intensity: 0.5,
    enableRgbSplit: true,
    enableSliceDisplacement: false,
  },

  /** Pure slice displacement without RGB */
  slicesOnly: {
    intensity: 0.5,
    sliceCount: 10,
    enableRgbSplit: false,
    enableSliceDisplacement: true,
  },
} as const;

/**
 * Get preset glitch props by name
 */
export function getGlitchPreset(
  preset: keyof typeof glitchPresets
): Partial<GlitchEffectProps> {
  return glitchPresets[preset];
}

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * GlitchTransition - Glitch effect designed for scene transitions
 * Automatically activates based on frame range
 */
export interface GlitchTransitionProps extends Omit<GlitchEffectProps, 'active'> {
  /** Frame to start glitch effect */
  startFrame: number;
  /** Duration of glitch in frames (default: 4) */
  durationFrames?: number;
}

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  children,
  startFrame,
  durationFrames = 4,
  intensity = 0.6,
  ...props
}) => {
  const frame = useCurrentFrame();
  const isActive = frame >= startFrame && frame < startFrame + durationFrames;

  // Intensity ramps up then down during transition
  const progress = isActive
    ? (frame - startFrame) / durationFrames
    : 0;
  const easedIntensity = isActive
    ? intensity * Math.sin(progress * Math.PI) // Sine curve: 0 -> peak -> 0
    : 0;

  return (
    <GlitchEffect
      {...props}
      active={isActive}
      intensity={easedIntensity}
    >
      {children}
    </GlitchEffect>
  );
};

// =============================================================================
// HOOK FOR PROGRAMMATIC CONTROL
// =============================================================================

/**
 * Hook to determine if a glitch should be active at current frame
 * Useful for coordinating glitch timing with other effects
 */
export function useGlitchTiming(
  triggers: { frame: number; duration: number }[],
): { isActive: boolean; intensity: number } {
  const frame = useCurrentFrame();

  // Use useMemo to ensure deterministic computation for Remotion
  return useMemo(() => {
    for (const trigger of triggers) {
      if (frame >= trigger.frame && frame < trigger.frame + trigger.duration) {
        const progress = (frame - trigger.frame) / trigger.duration;
        const intensity = Math.sin(progress * Math.PI);
        return { isActive: true, intensity };
      }
    }
    return { isActive: false, intensity: 0 };
  }, [frame, triggers]);
}

export default GlitchEffect;
