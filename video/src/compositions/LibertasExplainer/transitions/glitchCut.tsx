/**
 * Glitch Cut Transition
 *
 * Digital corruption effect with RGB separation and horizontal slice
 * displacement. Used for Hook → Problem transition.
 */

import React from 'react';
import {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill, random, interpolate } from 'remotion';
import { ERROR, INFO } from '../../../utils/colors';

interface GlitchCutProps {
  /** Intensity of glitch effect (0-1) */
  intensity?: number;
  /** Number of horizontal slices */
  sliceCount?: number;
  /** Index signature for Remotion compatibility */
  [key: string]: unknown;
}

const GlitchCutPresentation: React.FC<
  TransitionPresentationComponentProps<GlitchCutProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { intensity = 0.7, sliceCount = 10 } = passedProps;

  // Calculate effect intensity based on progress (peaks in the middle)
  const effectProgress = Math.sin(presentationProgress * Math.PI);
  const currentIntensity = intensity * effectProgress;

  // RGB offset calculation
  const rgbOffset = currentIntensity * 15;
  const flickerSeed = Math.floor(presentationProgress * 10);

  // Generate slice offsets
  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const sliceSeed = `glitch-${flickerSeed}-${i}`;
    const shouldOffset = random(sliceSeed + '-should') > 0.3;
    const offset = shouldOffset
      ? (random(sliceSeed + '-offset') - 0.5) * 100 * currentIntensity
      : 0;
    return {
      y: i / sliceCount,
      height: 1 / sliceCount,
      offset,
    };
  });

  const isExiting = presentationDirection === 'exiting';
  const opacity = isExiting
    ? interpolate(presentationProgress, [0, 0.5, 1], [1, 1, 0])
    : interpolate(presentationProgress, [0, 0.5, 1], [0, 1, 1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Base layer */}
      <AbsoluteFill>{children}</AbsoluteFill>

      {/* RGB separation - only during active effect */}
      {currentIntensity > 0.1 && (
        <>
          {/* Red channel */}
          <AbsoluteFill
            style={{
              transform: `translateX(${rgbOffset}px)`,
              mixBlendMode: 'multiply',
              opacity: 0.8,
            }}
          >
            <AbsoluteFill
              style={{
                backgroundColor: ERROR,
                mixBlendMode: 'screen',
                opacity: currentIntensity * 0.4,
              }}
            />
          </AbsoluteFill>

          {/* Cyan channel */}
          <AbsoluteFill
            style={{
              transform: `translateX(${-rgbOffset}px)`,
              mixBlendMode: 'multiply',
              opacity: 0.8,
            }}
          >
            <AbsoluteFill
              style={{
                backgroundColor: INFO,
                mixBlendMode: 'screen',
                opacity: currentIntensity * 0.4,
              }}
            />
          </AbsoluteFill>
        </>
      )}

      {/* Horizontal slice displacement */}
      {currentIntensity > 0.1 && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          {slices
            .filter((s) => Math.abs(s.offset) > 1)
            .map((slice, index) => (
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

/**
 * Creates a glitch cut transition presentation
 */
export function glitchCut(props: GlitchCutProps = {}): TransitionPresentation<GlitchCutProps> {
  return {
    component: GlitchCutPresentation,
    props,
  };
}
