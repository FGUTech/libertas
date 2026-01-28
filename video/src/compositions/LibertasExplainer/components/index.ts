/**
 * LibertasExplainer Components
 *
 * Reusable visual components for the explainer video.
 */

export { TypewriterText, getTypingEndFrame, getTypingDuration } from './TypewriterText';
export type { TypewriterTextProps } from './TypewriterText';

export { MatrixRain, getOptimizedMatrixRainProps } from './MatrixRain';
export type { MatrixRainProps } from './MatrixRain';

export { Scanlines, scanlinePresets, getScanlinePreset } from './Scanlines';
export type { ScanlinesProps } from './Scanlines';

export {
  GlitchEffect,
  GlitchTransition,
  glitchPresets,
  getGlitchPreset,
  useGlitchTiming,
} from './GlitchEffect';
export type { GlitchEffectProps, GlitchTransitionProps } from './GlitchEffect';

export {
  AudioTrack,
  MusicTrack,
  VoiceoverTrack,
  SFXTrack,
  useIsVOPlaying,
  useCurrentSection,
  SECTION_TIMING,
  VO_TIMING,
  SFX_TIMING,
} from '../AudioTrack';
export type { AudioTrackProps } from '../AudioTrack';

export { CaptionTrack } from './CaptionTrack';
export type { CaptionTrackProps } from './CaptionTrack';
