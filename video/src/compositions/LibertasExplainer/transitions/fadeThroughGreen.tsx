/**
 * Fade Through Green Transition
 *
 * Cross-fade with a Matrix green tint at the midpoint.
 * Used for Solution → Engine/Workflow transition.
 */

import React from 'react';
import {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill, interpolate } from 'remotion';
import { ACCENT_PRIMARY, BG_PRIMARY } from '../../../utils/colors';

interface FadeThroughGreenProps {
  /** Color to fade through (default: Matrix green) */
  color?: string;
  /** Intensity of the color overlay (0-1) */
  colorIntensity?: number;
  /** Index signature for Remotion compatibility */
  [key: string]: unknown;
}

const FadeThroughGreenPresentation: React.FC<
  TransitionPresentationComponentProps<FadeThroughGreenProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { color = ACCENT_PRIMARY, colorIntensity = 0.6 } = passedProps;

  const isExiting = presentationDirection === 'exiting';

  // Green overlay peaks at midpoint
  const greenOverlayOpacity = interpolate(
    presentationProgress,
    [0, 0.4, 0.6, 1],
    [0, colorIntensity, colorIntensity, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (isExiting) {
    // Fade out with green tint
    const opacity = interpolate(presentationProgress, [0, 0.5, 1], [1, 0.8, 0]);

    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity: greenOverlayOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      </AbsoluteFill>
    );
  } else {
    // Fade in from green
    const opacity = interpolate(presentationProgress, [0, 0.5, 1], [0, 0.2, 1]);

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity: greenOverlayOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      </AbsoluteFill>
    );
  }
};

/**
 * Creates a fade through green transition presentation
 */
export function fadeThroughGreen(
  props: FadeThroughGreenProps = {}
): TransitionPresentation<FadeThroughGreenProps> {
  return {
    component: FadeThroughGreenPresentation,
    props,
  };
}
