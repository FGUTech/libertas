/**
 * Thumbnail Composition
 *
 * Static thumbnail for social preview at 1920x1080.
 * Based on the CTA scene - shows URL, terminal prompts, and branding.
 * Optionally includes a play button overlay for video preview.
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import {
  ACCENT_PRIMARY,
  BG_PRIMARY,
  FG_PRIMARY,
  FG_TERTIARY,
} from '../../utils/colors';
import { displayStyle, fontFamilies } from '../../utils/fonts';
import { MatrixRain } from '../LibertasExplainer/components/MatrixRain';
import { Scanlines } from '../LibertasExplainer/components/Scanlines';

// =============================================================================
// TYPES
// =============================================================================

export interface ThumbnailProps {
  /** Show play button overlay */
  showPlayButton?: boolean;
  /** Play button style */
  playButtonStyle?: 'circle' | 'rounded';
  /** X/Twitter optimized - larger text, bolder elements */
  xOptimized?: boolean;
}

// =============================================================================
// TERMINAL PROMPTS DATA
// =============================================================================

const TERMINAL_PROMPTS = [
  'explore the signals',
  'subscribe to feeds',
  'submit intel',
];

// =============================================================================
// PLAY BUTTON COMPONENT
// =============================================================================

interface PlayButtonProps {
  style: 'circle' | 'rounded';
  xOptimized?: boolean;
}

const PlayButton: React.FC<PlayButtonProps> = ({ style, xOptimized = false }) => {
  if (style === 'circle') {
    const size = xOptimized ? 150 : 120;
    return (
      <div
        style={{
          position: 'absolute',
          top: xOptimized ? '20%' : '22%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: `${xOptimized ? 4 : 3}px solid ${ACCENT_PRIMARY}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: xOptimized
            ? `0 0 50px ${ACCENT_PRIMARY}, 0 0 100px ${ACCENT_PRIMARY}60`
            : `0 0 30px ${ACCENT_PRIMARY}80, 0 0 60px ${ACCENT_PRIMARY}40`,
        }}
      >
        <svg
          width={xOptimized ? 55 : 45}
          height={xOptimized ? 65 : 55}
          viewBox="0 0 50 60"
          style={{ marginLeft: xOptimized ? 10 : 6 }}
        >
          <polygon
            points="0,0 50,30 0,60"
            fill={ACCENT_PRIMARY}
            style={{
              filter: `drop-shadow(0 0 ${xOptimized ? 20 : 12}px ${ACCENT_PRIMARY})`,
            }}
          />
        </svg>
      </div>
    );
  }

  // Rounded rectangle style with "WATCH" text
  return (
    <div
      style={{
        position: 'absolute',
        top: xOptimized ? '20%' : '22%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: xOptimized ? '20px 44px' : '16px 32px',
        borderRadius: xOptimized ? 16 : 12,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: `${xOptimized ? 3 : 2}px solid ${ACCENT_PRIMARY}`,
        display: 'flex',
        alignItems: 'center',
        gap: xOptimized ? 20 : 16,
        boxShadow: xOptimized
          ? `0 0 50px ${ACCENT_PRIMARY}, 0 0 100px ${ACCENT_PRIMARY}60`
          : `0 0 30px ${ACCENT_PRIMARY}80, 0 0 60px ${ACCENT_PRIMARY}40`,
      }}
    >
      {/* Play icon */}
      <svg
        width={xOptimized ? 38 : 28}
        height={xOptimized ? 46 : 34}
        viewBox="0 0 30 36"
      >
        <polygon
          points="0,0 30,18 0,36"
          fill={ACCENT_PRIMARY}
          style={{
            filter: `drop-shadow(0 0 ${xOptimized ? 15 : 8}px ${ACCENT_PRIMARY})`,
          }}
        />
      </svg>
      {/* WATCH text */}
      <span
        style={{
          fontFamily: fontFamilies.display,
          fontSize: xOptimized ? 38 : 28,
          fontWeight: 700,
          color: ACCENT_PRIMARY,
          letterSpacing: '0.12em',
          textShadow: xOptimized
            ? `0 0 15px ${ACCENT_PRIMARY}, 0 0 30px ${ACCENT_PRIMARY}80`
            : `0 0 8px ${ACCENT_PRIMARY}60`,
        }}
      >
        WATCH
      </span>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Thumbnail: React.FC<ThumbnailProps> = ({
  showPlayButton = false,
  playButtonStyle = 'circle',
  xOptimized = false,
}) => {
  const { height } = useVideoConfig();

  // Static glow intensity - stronger for X optimization
  const glowIntensity = xOptimized ? 45 : 30;

  // Font sizes - larger for X feed readability
  const urlFontSize = xOptimized ? 88 : 72;
  const promptFontSize = xOptimized ? 42 : 36;
  const brandingFontSize = xOptimized ? 40 : 36;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY }}>
      {/* Matrix rain background - slightly more visible for X */}
      <MatrixRain
        opacity={xOptimized ? 0.3 : 0.25}
        columnCount={25}
        speedRange={[2, 4]}
        seed="thumbnail-matrix"
        verticalOffset={height / 3}
      />

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: xOptimized ? 48 : 40,
        }}
      >
        {/* URL with glow */}
        <div
          style={{
            ...displayStyle(urlFontSize),
            color: ACCENT_PRIMARY,
            letterSpacing: '0.02em',
            textShadow: xOptimized
              ? `
                0 0 ${glowIntensity}px ${ACCENT_PRIMARY},
                0 0 ${glowIntensity * 1.5}px ${ACCENT_PRIMARY},
                0 0 ${glowIntensity * 2.5}px ${ACCENT_PRIMARY}80,
                0 0 ${glowIntensity * 4}px ${ACCENT_PRIMARY}40
              `
              : `
                0 0 ${glowIntensity}px ${ACCENT_PRIMARY},
                0 0 ${glowIntensity * 2}px ${ACCENT_PRIMARY}60,
                0 0 ${glowIntensity * 3}px ${ACCENT_PRIMARY}30
              `,
          }}
        >
          libertas.fgu.tech
        </div>

        {/* Terminal prompts */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: xOptimized ? 20 : 16,
          }}
        >
          {TERMINAL_PROMPTS.map((prompt, index) => (
            <div
              key={index}
              style={{
                fontFamily: fontFamilies.mono,
                fontSize: promptFontSize,
                color: ACCENT_PRIMARY,
                textShadow: xOptimized
                  ? `0 0 12px ${ACCENT_PRIMARY}80, 0 0 24px ${ACCENT_PRIMARY}40`
                  : `0 0 8px ${ACCENT_PRIMARY}60`,
              }}
            >
              {'> '}{prompt}
            </div>
          ))}
        </div>

        {/* FGU branding */}
        <div
          style={{
            position: 'absolute',
            bottom: xOptimized ? 60 : 80,
            ...displayStyle(brandingFontSize),
            color: FG_PRIMARY,
            letterSpacing: '0.06em',
          }}
        >
          Built by Cypherpunks{' '}
          <span style={{ color: FG_TERTIARY }}>@</span>{' '}
          <span style={{ color: ACCENT_PRIMARY }}>StarkWare</span>
        </div>
      </AbsoluteFill>

      {/* CRT scanlines overlay */}
      <Scanlines opacity={0.03} flicker={false} />

      {/* Optional play button overlay */}
      {showPlayButton && <PlayButton style={playButtonStyle} xOptimized={xOptimized} />}
    </AbsoluteFill>
  );
};

export default Thumbnail;
