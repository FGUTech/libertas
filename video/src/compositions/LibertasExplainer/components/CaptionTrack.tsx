/**
 * CaptionTrack - Baked-in captions for X/Twitter autoplay
 *
 * Features:
 * - Word-by-word highlight sync to voiceover
 * - Lower third positioning (720px from top)
 * - Inter Bold 48px, white with black shadow
 * - Minimum 48px text for mobile readability
 *
 * Usage:
 * Add as an overlay layer in the main composition.
 * Captions are automatically synced to global frame timing.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { fontFamilies } from '../../../utils/fonts';
import {
  getActivePhrase,
  getHighlightedWordIndex,
  CAPTION_STYLE,
  type CaptionPhrase,
} from '../../../data/captions';

// =============================================================================
// TYPES
// =============================================================================

export interface CaptionTrackProps {
  /** Enable caption display */
  enabled?: boolean;
  /** Debug mode - show frame info */
  debug?: boolean;
}

interface CaptionWordProps {
  /** Word text */
  text: string;
  /** Whether this word is currently highlighted */
  isHighlighted: boolean;
  /** Whether this word has been spoken (past highlight) */
  isSpoken: boolean;
  /** Index in the phrase (for animation stagger) */
  index: number;
}

interface CaptionPhraseDisplayProps {
  /** The phrase to display */
  phrase: CaptionPhrase;
  /** Current global frame */
  frame: number;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Individual word with highlight styling
 */
const CaptionWord: React.FC<CaptionWordProps> = ({
  text,
  isHighlighted,
  isSpoken,
}) => {
  // Determine color based on state
  // Highlighted = full white, Spoken = full white, Unspoken = dimmed
  const color = isHighlighted || isSpoken
    ? CAPTION_STYLE.highlightColor
    : CAPTION_STYLE.dimColor;

  // Scale effect on currently highlighted word
  const scale = isHighlighted ? 1.05 : 1;

  return (
    <span
      style={{
        color,
        transform: `scale(${scale})`,
        display: 'inline-block',
        marginRight: '0.3em',
      }}
    >
      {text}
    </span>
  );
};

/**
 * Display a full phrase with word-by-word highlighting
 */
const CaptionPhraseDisplay: React.FC<CaptionPhraseDisplayProps> = ({
  phrase,
  frame,
}) => {
  // Get the currently highlighted word index
  const highlightedIndex = getHighlightedWordIndex(phrase, frame);

  // Calculate fade in/out opacity
  const fadeInDuration = 10; // frames
  const fadeOutDuration = 15; // frames

  const opacity = interpolate(
    frame,
    [
      phrase.showFrame,
      phrase.showFrame + fadeInDuration,
      phrase.hideFrame - fadeOutDuration,
      phrase.hideFrame,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Slide up animation on entry
  const slideY = interpolate(
    frame,
    [phrase.showFrame, phrase.showFrame + fadeInDuration],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px)`,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {phrase.words.map((word, index) => (
        <CaptionWord
          key={`${phrase.id}-${index}`}
          text={word.text}
          isHighlighted={index === highlightedIndex}
          isSpoken={index < highlightedIndex}
          index={index}
        />
      ))}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * CaptionTrack - Global caption overlay
 *
 * Renders captions synchronized to voiceover timing.
 * Position at lower third (720px from top on 1080p).
 */
export const CaptionTrack: React.FC<CaptionTrackProps> = ({
  enabled = true,
  debug = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) return null;

  // Get the currently active phrase
  const activePhrase = getActivePhrase(frame);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      {/* Caption container - positioned near bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: CAPTION_STYLE.bottomOffset,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 60px',
        }}
      >
        <div
          style={{
            fontFamily: fontFamilies.body,
            fontWeight: CAPTION_STYLE.fontWeight,
            fontSize: CAPTION_STYLE.fontSize,
            color: CAPTION_STYLE.color,
            textShadow: CAPTION_STYLE.shadow,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {activePhrase && (
            <CaptionPhraseDisplay phrase={activePhrase} frame={frame} />
          )}
        </div>
      </div>

      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            fontFamily: fontFamilies.body,
            fontSize: 14,
            color: '#00ff41',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #00ff41',
          }}
        >
          <div>Frame: {frame}</div>
          <div>Time: {(frame / fps).toFixed(2)}s</div>
          <div>
            Phrase: {activePhrase?.id || 'none'}
          </div>
          {activePhrase && (
            <div>
              Word: {getHighlightedWordIndex(activePhrase, frame) + 1}/
              {activePhrase.words.length}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default CaptionTrack;
