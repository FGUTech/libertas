/**
 * Glitch Morph Transition
 *
 * Data corruption effect with digital artifacts, suggesting
 * transformation/morphing between scenes. Used for Workflow → Proof.
 */

import React from 'react';
import {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill, interpolate, random } from 'remotion';
import { ACCENT_PRIMARY, BG_PRIMARY } from '../../../utils/colors';

interface GlitchMorphProps {
  /** Intensity of the morph effect (0-1) */
  intensity?: number;
  /** Number of data blocks */
  blockCount?: number;
  /** Index signature for Remotion compatibility */
  [key: string]: unknown;
}

const GlitchMorphPresentation: React.FC<
  TransitionPresentationComponentProps<GlitchMorphProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { intensity = 0.6, blockCount = 8 } = passedProps;

  const isExiting = presentationDirection === 'exiting';

  // Effect peaks in the middle
  const effectProgress = Math.sin(presentationProgress * Math.PI);
  const currentIntensity = intensity * effectProgress;

  // Generate data block positions for corruption effect
  const flickerSeed = Math.floor(presentationProgress * 15);
  const blocks = Array.from({ length: blockCount }, (_, i) => {
    const seed = `morph-${flickerSeed}-${i}`;
    return {
      x: random(seed + '-x') * 100,
      y: random(seed + '-y') * 100,
      width: 5 + random(seed + '-w') * 20,
      height: 2 + random(seed + '-h') * 8,
      opacity: random(seed + '-o') * currentIntensity,
    };
  });

  // Scanline effect
  const scanlineOffset = (presentationProgress * 1000) % 100;

  if (isExiting) {
    const opacity = interpolate(presentationProgress, [0, 0.4, 0.7, 1], [1, 1, 0.5, 0]);
    const scale = interpolate(presentationProgress, [0, 0.5, 1], [1, 1.02, 1.05]);

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        <AbsoluteFill
          style={{
            opacity,
            transform: `scale(${scale})`,
            filter: currentIntensity > 0.1 ? `brightness(${1 + currentIntensity * 0.3})` : 'none',
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Data corruption blocks */}
        {currentIntensity > 0.1 &&
          blocks.map((block, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.width}%`,
                height: `${block.height}%`,
                backgroundColor: ACCENT_PRIMARY,
                opacity: block.opacity * 0.4,
                mixBlendMode: 'screen',
              }}
            />
          ))}

        {/* Scanline sweep */}
        {currentIntensity > 0.2 && (
          <AbsoluteFill
            style={{
              background: `linear-gradient(
                180deg,
                transparent ${scanlineOffset - 5}%,
                ${ACCENT_PRIMARY}40 ${scanlineOffset}%,
                transparent ${scanlineOffset + 5}%
              )`,
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AbsoluteFill>
    );
  } else {
    const opacity = interpolate(presentationProgress, [0, 0.3, 0.6, 1], [0, 0.5, 1, 1]);
    const scale = interpolate(presentationProgress, [0, 0.5, 1], [0.95, 0.98, 1]);

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        <AbsoluteFill
          style={{
            opacity,
            transform: `scale(${scale})`,
            filter: currentIntensity > 0.1 ? `brightness(${1 + currentIntensity * 0.2})` : 'none',
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Data corruption blocks */}
        {currentIntensity > 0.1 &&
          blocks.map((block, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.width}%`,
                height: `${block.height}%`,
                backgroundColor: ACCENT_PRIMARY,
                opacity: block.opacity * 0.3,
                mixBlendMode: 'screen',
              }}
            />
          ))}

        {/* Scanline sweep */}
        {currentIntensity > 0.2 && (
          <AbsoluteFill
            style={{
              background: `linear-gradient(
                180deg,
                transparent ${100 - scanlineOffset - 5}%,
                ${ACCENT_PRIMARY}40 ${100 - scanlineOffset}%,
                transparent ${100 - scanlineOffset + 5}%
              )`,
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AbsoluteFill>
    );
  }
};

/**
 * Creates a glitch morph transition presentation
 */
export function glitchMorph(
  props: GlitchMorphProps = {}
): TransitionPresentation<GlitchMorphProps> {
  return {
    component: GlitchMorphPresentation,
    props,
  };
}
