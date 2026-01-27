/**
 * CRT Shutdown Transition
 *
 * Classic CRT monitor shutdown effect - image collapses to a horizontal
 * line then fades to black. Used for Problem → Solution transition.
 */

import React from 'react';
import {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import { BG_PRIMARY, ACCENT_PRIMARY } from '../../../utils/colors';

interface CRTShutdownProps {
  /** Color of the final line glow */
  lineColor?: string;
  /** Whether to show the phosphor glow effect */
  showGlow?: boolean;
  /** Index signature for Remotion compatibility */
  [key: string]: unknown;
}

const CRTShutdownPresentation: React.FC<
  TransitionPresentationComponentProps<CRTShutdownProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { lineColor = ACCENT_PRIMARY, showGlow = true } = passedProps;

  const isExiting = presentationDirection === 'exiting';

  if (isExiting) {
    // Exiting scene: collapse vertically to a line, then fade
    const scaleY = interpolate(
      presentationProgress,
      [0, 0.6, 0.8, 1],
      [1, 0.02, 0.02, 0],
      { easing: Easing.out(Easing.cubic) }
    );

    const lineOpacity = interpolate(
      presentationProgress,
      [0.5, 0.7, 0.9, 1],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const brightness = interpolate(
      presentationProgress,
      [0, 0.4, 0.8, 1],
      [1, 1.5, 2, 0],
      { extrapolateRight: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        {/* Collapsing content */}
        <AbsoluteFill
          style={{
            transform: `scaleY(${scaleY})`,
            transformOrigin: 'center center',
            filter: `brightness(${brightness})`,
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Horizontal line remnant */}
        {lineOpacity > 0 && (
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: 3,
                backgroundColor: lineColor,
                opacity: lineOpacity,
                boxShadow: showGlow
                  ? `0 0 20px ${lineColor}, 0 0 40px ${lineColor}, 0 0 60px ${lineColor}`
                  : 'none',
              }}
            />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  } else {
    // Entering scene: expand from a line
    const scaleY = interpolate(
      presentationProgress,
      [0, 0.2, 0.4, 1],
      [0, 0.02, 0.02, 1],
      { easing: Easing.out(Easing.cubic) }
    );

    const lineOpacity = interpolate(
      presentationProgress,
      [0, 0.1, 0.3, 0.5],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const contentOpacity = interpolate(
      presentationProgress,
      [0, 0.3, 0.5],
      [0, 0, 1],
      { extrapolateRight: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        {/* Horizontal line */}
        {lineOpacity > 0 && (
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: 3,
                backgroundColor: lineColor,
                opacity: lineOpacity,
                boxShadow: showGlow
                  ? `0 0 20px ${lineColor}, 0 0 40px ${lineColor}, 0 0 60px ${lineColor}`
                  : 'none',
              }}
            />
          </AbsoluteFill>
        )}

        {/* Expanding content */}
        <AbsoluteFill
          style={{
            transform: `scaleY(${scaleY})`,
            transformOrigin: 'center center',
            opacity: contentOpacity,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
};

/**
 * Creates a CRT shutdown transition presentation
 */
export function crtShutdown(
  props: CRTShutdownProps = {}
): TransitionPresentation<CRTShutdownProps> {
  return {
    component: CRTShutdownPresentation,
    props,
  };
}
