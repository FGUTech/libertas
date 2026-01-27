/**
 * Custom Transitions for Libertas Explainer Video
 *
 * Scene-to-scene transition effects using @remotion/transitions API.
 * Each transition is a custom presentation function.
 */

export { glitchCut } from './glitchCut';
export { crtShutdown } from './crtShutdown';
export { fadeThroughGreen } from './fadeThroughGreen';
export { glitchMorph } from './glitchMorph';
export { particleConverge } from './particleConverge';

// Re-export fade from @remotion/transitions for convenience
export { fade } from '@remotion/transitions/fade';
