/**
 * Caption Data for Libertas Explainer Video
 *
 * Contains word-level timing for all voiceover sections.
 * Timing is in GLOBAL frames (relative to full composition, 30fps).
 *
 * Styling spec (from STORYBOARD.md):
 * - Font: Inter Bold, 48px minimum
 * - Color: White (#ffffff) with black shadow
 * - Position: Lower third (720px from top on 1080p)
 * - Animation: Word-by-word highlight synced to VO
 */

import { FPS } from '../utils/timing';

// =============================================================================
// TYPES
// =============================================================================

export interface CaptionWord {
  /** The word text */
  text: string;
  /** Global frame when this word starts being highlighted */
  startFrame: number;
  /** Global frame when this word stops being highlighted */
  endFrame: number;
}

export interface CaptionPhrase {
  /** Unique identifier */
  id: string;
  /** All words in the phrase */
  words: CaptionWord[];
  /** Global frame when phrase first appears */
  showFrame: number;
  /** Global frame when phrase disappears (includes 0.5s buffer) */
  hideFrame: number;
}

export interface CaptionSection {
  /** Section name */
  name: string;
  /** All phrases in this section */
  phrases: CaptionPhrase[];
}

// =============================================================================
// SCENE TIMING (Global frames, from main composition DebugOverlay)
// =============================================================================

const SCENE_STARTS = {
  hook: 0,
  problem: 150,
  solution: 663,
  workflow: 1008,
  proof: 1688,
  cta: 2273,
  endCard: 2708,
} as const;

// VO start offsets within each scene (scene-relative frames)
// Note: These account for TransitionSeries overlap timing
const VO_OFFSETS = {
  problem: 15,    // VO starts 0.5s into Problem scene
  solution: 90,   // VO starts 3s into Solution scene (after terminal boot)
  engine: 30,     // VO starts 1s into Workflow scene
  proof: 30,      // VO starts 1s into Proof scene
  cta: 75,        // VO starts after URL typing + transition settles
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert seconds to frames
 */
function sec(seconds: number): number {
  return Math.round(seconds * FPS);
}

// Pause durations after punctuation (in seconds)
const PAUSE_AFTER_COMMA = 0.6;    // Commas have moderate pauses
const PAUSE_AFTER_PERIOD = 0.8;   // Periods/sentences have longer pauses

/**
 * Get pause duration for a word based on its ending punctuation
 */
function getPauseForWord(word: string): number {
  if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
    return PAUSE_AFTER_PERIOD;
  }
  if (word.endsWith(',')) {
    return PAUSE_AFTER_COMMA;
  }
  return 0;
}

/**
 * Create caption words from text with even distribution over duration
 * @param text - Full phrase text
 * @param startFrame - Global frame when phrase starts
 * @param speakingDurationSec - Duration in seconds for the SPEAKING portion (pauses are added on top)
 */
function createWords(
  text: string,
  startFrame: number,
  speakingDurationSec: number
): CaptionWord[] {
  const words = text.split(' ');

  // Speaking time is distributed evenly among words
  // Pauses are ADDED after punctuation (not subtracted from total)
  const speakingFrames = sec(speakingDurationSec);
  const framesPerWord = speakingFrames / words.length;

  const result: CaptionWord[] = [];
  let currentFrame = startFrame;

  for (const word of words) {
    const wordDuration = framesPerWord;
    const extraPause = sec(getPauseForWord(word));

    result.push({
      text: word,
      startFrame: Math.round(currentFrame),
      endFrame: Math.round(currentFrame + wordDuration),
    });

    // Move to next word: word duration + any pause after punctuation
    currentFrame += wordDuration + extraPause;
  }

  return result;
}

/**
 * Create a phrase with proper show/hide timing
 */
function createPhrase(
  id: string,
  text: string,
  globalStartFrame: number,
  durationSec: number
): CaptionPhrase {
  const words = createWords(text, globalStartFrame, durationSec);
  const lastWord = words[words.length - 1];

  return {
    id,
    words,
    showFrame: globalStartFrame,
    hideFrame: lastWord.endFrame + sec(0.5), // 0.5s buffer after last word
  };
}

// =============================================================================
// CAPTION DATA - Problem Section (15.9s VO)
// =============================================================================

const PROBLEM_START = SCENE_STARTS.problem + VO_OFFSETS.problem; // Frame 165

const problemCaptions: CaptionSection = {
  name: 'problem',
  phrases: [
    createPhrase(
      'problem-1',
      'Every day, information is censored.',
      PROBLEM_START,
      2.8
    ),
    createPhrase(
      'problem-2',
      'Communications are severed.',
      PROBLEM_START + sec(3.0),
      2.2
    ),
    createPhrase(
      'problem-3',
      'In 2025, over 200 internet shutdowns hit 28 countries.',
      PROBLEM_START + sec(5.4),
      4.5
    ),
    createPhrase(
      'problem-4',
      'When regimes cut the signal, the world goes dark.',
      PROBLEM_START + sec(10.2),
      4.5
    ),
  ],
};

// =============================================================================
// CAPTION DATA - Solution Section (17.8s VO)
// =============================================================================

const SOLUTION_START = SCENE_STARTS.solution + VO_OFFSETS.solution; // Frame 753

const solutionCaptions: CaptionSection = {
  name: 'solution',
  phrases: [
    createPhrase(
      'solution-1',
      'Libertas is an automated research engine for freedom technology.',
      SOLUTION_START,
      4.8
    ),
    createPhrase(
      'solution-2',
      'It tracks global signals autonomously.',
      SOLUTION_START + sec(5.2),
      3.2
    ),
  ],
};

// =============================================================================
// CAPTION DATA - Engine/Workflow Section (23.7s VO)
// =============================================================================

const ENGINE_START = SCENE_STARTS.workflow + VO_OFFSETS.engine; // Frame 1038

const engineCaptions: CaptionSection = {
  name: 'engine',
  phrases: [
    createPhrase(
      'engine-1',
      'Sources flow in from across the world.',
      ENGINE_START,
      3.0
    ),
    createPhrase(
      'engine-2',
      'AI agents classify them, assess credibility, extract insights.',
      ENGINE_START + sec(3.3),
      4.5
    ),
    createPhrase(
      'engine-3',
      'High-signal content is published automatically.',
      ENGINE_START + sec(9.5),
      3.5
    ),
    createPhrase(
      'engine-4',
      'Weekly digests compile the most important signals.',
      ENGINE_START + sec(13.5),
      3.8
    ),
    createPhrase(
      'engine-5a',
      'Agents analyze patterns to create project ideas',
      ENGINE_START + sec(18.0),
      3.0
    ),
    createPhrase(
      'engine-5b',
      'for freedom builders to act on.',
      ENGINE_START + sec(21.2),
      2.3
    ),
  ],
};

// =============================================================================
// CAPTION DATA - Proof Section (17.8s VO)
// =============================================================================

const PROOF_START = SCENE_STARTS.proof + VO_OFFSETS.proof; // Frame 1718

const proofCaptions: CaptionSection = {
  name: 'proof',
  phrases: [
    createPhrase(
      'proof-1',
      'New Signals.',
      PROOF_START,
      1.5
    ),
    createPhrase(
      'proof-2',
      "Iran's digital darkness.",
      PROOF_START + sec(1.8),
      2.0
    ),
    createPhrase(
      'proof-3',
      'Over two thousand killed without being able to reach the outside world.',
      PROOF_START + sec(4.0),
      4.5
    ),
    createPhrase(
      'proof-4',
      "Uganda's government warning against mesh networks.",
      PROOF_START + sec(9.0),
      3.2
    ),
    createPhrase(
      'proof-5',
      'Proof the tools work.',
      PROOF_START + sec(12.5),
      2.0
    ),
    createPhrase(
      'proof-6',
      'Freedom tech signals. Compiled. Published. Open to all.',
      PROOF_START + sec(14.8),
      3.8
    ),
  ],
};

// =============================================================================
// CAPTION DATA - CTA Section (9.0s VO)
// =============================================================================

const CTA_START = SCENE_STARTS.cta + VO_OFFSETS.cta; // Frame 2303

const ctaCaptions: CaptionSection = {
  name: 'cta',
  phrases: [
    createPhrase(
      'cta-1',
      'The agents are live now.',
      CTA_START,
      2.2
    ),
    createPhrase(
      'cta-2',
      'Find them by their signals.',
      CTA_START + sec(2.5),
      2.0
    ),
    createPhrase(
      'cta-3',
      'Libertas dot F-G-U dot tech.',
      CTA_START + sec(5.0),
      2.5
    ),
    createPhrase(
      'cta-4',
      'Built by Cypherpunks.',
      CTA_START + sec(7.8),
      1.8
    ),
  ],
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * All caption sections in order
 */
export const CAPTION_SECTIONS: CaptionSection[] = [
  problemCaptions,
  solutionCaptions,
  engineCaptions,
  proofCaptions,
  ctaCaptions,
];

/**
 * All phrases flattened for easy lookup
 */
export const ALL_PHRASES: CaptionPhrase[] = CAPTION_SECTIONS.flatMap(
  section => section.phrases
);

/**
 * Get the active phrase for a given global frame
 */
export function getActivePhrase(frame: number): CaptionPhrase | null {
  return ALL_PHRASES.find(
    phrase => frame >= phrase.showFrame && frame < phrase.hideFrame
  ) || null;
}

/**
 * Get the currently highlighted word index within a phrase
 */
export function getHighlightedWordIndex(phrase: CaptionPhrase, frame: number): number {
  for (let i = phrase.words.length - 1; i >= 0; i--) {
    if (frame >= phrase.words[i].startFrame) {
      return i;
    }
  }
  return -1;
}

/**
 * Caption styling constants (from STORYBOARD.md)
 */
export const CAPTION_STYLE = {
  fontSize: 48,
  fontWeight: 700,
  color: '#ffffff',
  highlightColor: '#ffffff',
  dimColor: 'rgba(255, 255, 255, 0.5)',
  shadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)',
  bottomOffset: 80, // Distance from bottom of screen
} as const;

export default {
  sections: CAPTION_SECTIONS,
  allPhrases: ALL_PHRASES,
  getActivePhrase,
  getHighlightedWordIndex,
  style: CAPTION_STYLE,
};
