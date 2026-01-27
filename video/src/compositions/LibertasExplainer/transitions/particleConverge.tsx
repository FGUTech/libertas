/**
 * Particle Converge Transition
 *
 * Content dissolves into particles that converge to center,
 * then expand to reveal next scene. Used for Proof → CTA.
 */

import React from 'react';
import {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill, interpolate, random, Easing } from 'remotion';
import { ACCENT_PRIMARY, BG_PRIMARY } from '../../../utils/colors';

interface ParticleConvergeProps {
  /** Number of particles */
  particleCount?: number;
  /** Size range of particles */
  particleSizeRange?: [number, number];
  /** Index signature for Remotion compatibility */
  [key: string]: unknown;
}

interface Particle {
  id: number;
  startX: number;
  startY: number;
  size: number;
  delay: number;
}

const ParticleConvergePresentation: React.FC<
  TransitionPresentationComponentProps<ParticleConvergeProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { particleCount = 40, particleSizeRange = [2, 6] } = passedProps;

  const isExiting = presentationDirection === 'exiting';

  // Generate particles deterministically
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      startX: random(`particle-${i}-x`) * 100,
      startY: random(`particle-${i}-y`) * 100,
      size:
        particleSizeRange[0] +
        random(`particle-${i}-size`) * (particleSizeRange[1] - particleSizeRange[0]),
      delay: random(`particle-${i}-delay`) * 0.3,
    }));
  }, [particleCount, particleSizeRange]);

  // Particle visibility based on progress
  const particleOpacity = interpolate(
    presentationProgress,
    [0.2, 0.4, 0.6, 0.8],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (isExiting) {
    // Content fades and particles converge to center
    const contentOpacity = interpolate(
      presentationProgress,
      [0, 0.3, 0.5],
      [1, 0.7, 0],
      { extrapolateRight: 'clamp' }
    );

    const contentScale = interpolate(
      presentationProgress,
      [0, 0.5],
      [1, 0.95],
      { extrapolateRight: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        <AbsoluteFill
          style={{
            opacity: contentOpacity,
            transform: `scale(${contentScale})`,
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Converging particles */}
        {particleOpacity > 0 && (
          <AbsoluteFill style={{ overflow: 'hidden' }}>
            {particles.map((particle) => {
              const adjustedProgress = Math.max(0, presentationProgress - particle.delay);
              const particleProgress = interpolate(
                adjustedProgress,
                [0, 0.7],
                [0, 1],
                { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
              );

              // Move from start position to center
              const x = interpolate(particleProgress, [0, 1], [particle.startX, 50]);
              const y = interpolate(particleProgress, [0, 1], [particle.startY, 50]);

              return (
                <div
                  key={particle.id}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: ACCENT_PRIMARY,
                    borderRadius: '50%',
                    opacity: particleOpacity,
                    boxShadow: `0 0 ${particle.size * 2}px ${ACCENT_PRIMARY}`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              );
            })}
          </AbsoluteFill>
        )}

        {/* Central glow at convergence point */}
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: ACCENT_PRIMARY,
              opacity: interpolate(
                presentationProgress,
                [0.4, 0.6, 0.8, 1],
                [0, 0.8, 0.8, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              ),
              boxShadow: `0 0 60px ${ACCENT_PRIMARY}, 0 0 120px ${ACCENT_PRIMARY}`,
              filter: 'blur(20px)',
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    // Particles expand from center and content fades in
    const contentOpacity = interpolate(
      presentationProgress,
      [0.4, 0.7, 1],
      [0, 0.5, 1],
      { extrapolateLeft: 'clamp' }
    );

    const contentScale = interpolate(
      presentationProgress,
      [0.5, 1],
      [1.02, 1],
      { extrapolateLeft: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
        {/* Expanding particles */}
        {particleOpacity > 0 && (
          <AbsoluteFill style={{ overflow: 'hidden' }}>
            {particles.map((particle) => {
              const adjustedProgress = Math.max(0, presentationProgress - particle.delay);
              const particleProgress = interpolate(
                adjustedProgress,
                [0.2, 0.8],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
              );

              // Move from center to final position
              const x = interpolate(particleProgress, [0, 1], [50, particle.startX]);
              const y = interpolate(particleProgress, [0, 1], [50, particle.startY]);

              return (
                <div
                  key={particle.id}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: ACCENT_PRIMARY,
                    borderRadius: '50%',
                    opacity: particleOpacity * (1 - particleProgress * 0.5),
                    boxShadow: `0 0 ${particle.size * 2}px ${ACCENT_PRIMARY}`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              );
            })}
          </AbsoluteFill>
        )}

        {/* Central glow fading out */}
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: ACCENT_PRIMARY,
              opacity: interpolate(
                presentationProgress,
                [0, 0.2, 0.5],
                [0.8, 0.5, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              ),
              boxShadow: `0 0 60px ${ACCENT_PRIMARY}, 0 0 120px ${ACCENT_PRIMARY}`,
              filter: 'blur(20px)',
            }}
          />
        </AbsoluteFill>

        <AbsoluteFill
          style={{
            opacity: contentOpacity,
            transform: `scale(${contentScale})`,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
};

/**
 * Creates a particle converge transition presentation
 */
export function particleConverge(
  props: ParticleConvergeProps = {}
): TransitionPresentation<ParticleConvergeProps> {
  return {
    component: ParticleConvergePresentation,
    props,
  };
}
