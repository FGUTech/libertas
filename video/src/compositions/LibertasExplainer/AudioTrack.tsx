/**
 * AudioTrack - Audio layering for Libertas Explainer Video
 *
 * Layers background music, voiceover, and sound effects with
 * VO ducking (music volume lowers when voice plays).
 *
 * Audio Mix Levels (per SPEC.md):
 * - Voiceover: 0dB (reference) = 1.0 linear
 * - Music bed: -18dB normal, -24dB ducked = 0.126/0.063 linear
 * - Sound effects: -12dB to -15dB = 0.251 to 0.178 linear
 */

import { Audio } from "@remotion/media";
import {
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

// Import centralized audio utilities
import {
  AUDIO_FILES,
  MUSIC_VOLUME_NORMAL,
  MUSIC_VOLUME_DUCKED,
  SFX_VOLUME_TYPING,
  SFX_VOLUME_LOUD,
  SFX_VOLUME_NORMAL,
  SFX_VOLUME_QUIET,
  SFX_VOLUME_GLITCH,
  SFX_VOLUME_AMBIENT,
  DUCK_TRANSITION_SEC,
  getVOVolume,
} from "../../utils/audio";

// ============================================================================
// TIMING CONSTANTS (frames at 30fps)
// ============================================================================

/** Frame timing for each section */
export const SECTION_TIMING = {
  hook: { start: 0, end: 150 },
  problem: { start: 150, end: 750 },
  solution: { start: 750, end: 1500 },
  engine: { start: 1500, end: 2400 },
  proof: { start: 2400, end: 3000 },
  cta: { start: 3000, end: 3450 },
  endCard: { start: 3450, end: 3600 },
} as const;

/** Voiceover start frames and durations (in frames at 30fps) */
export const VO_TIMING = {
  problem: { start: 150, durationSec: 15.9 },
  solution: { start: 840, durationSec: 17.8 },
  engine: { start: 1500, durationSec: 23.7 },
  proof: { start: 2400, durationSec: 17.8 },
  cta: { start: 3000, durationSec: 9.0 },
} as const;

/** Sound effect trigger frames */
export const SFX_TIMING = {
  typeStart: 30, // Hook typewriter starts
  typeEnd: 90, // Hook typewriter ends
  dataHumStart: 90, // Matrix rain appears
  glitchHookToProblem: 148,
  warningStart: 200, // Problem section threats
  crtOff: 600, // Problem section ending
  crtOn: 750, // Solution boot
  successReveal: 870, // Libertas reveal
  dataFlowStart: 1500, // Engine flow diagram
  glitchProblemToSolution: 748,
  glitchSolutionToEngine: 1498,
  glitchEngineToProof: 2398,
  musicFadeStart: 3500, // Final music fade
} as const;

// ============================================================================
// VOLUME UTILITIES
// ============================================================================

/**
 * Calculate music volume with VO ducking
 * Uses SPEC.md levels: -18dB normal, -24dB ducked
 */
function getMusicVolumeAtFrame(frame: number, fps: number): number {
  const fadeInFrames = fps * 2; // 2 second fade in at start
  const fadeOutFrames = fps * 3; // 3 second fade out at end
  const totalFrames = 3600;
  const duckTransition = fps * DUCK_TRANSITION_SEC;

  // Check if any VO is playing and calculate ducking
  let targetVolume = MUSIC_VOLUME_NORMAL;

  for (const [, timing] of Object.entries(VO_TIMING)) {
    const voStart = timing.start;
    const voEnd = timing.start + timing.durationSec * fps;

    // Duck the music during VO playback with smooth transitions
    if (frame >= voStart - duckTransition && frame <= voEnd + duckTransition) {
      if (frame < voStart) {
        // Transition into duck
        targetVolume = Math.min(
          targetVolume,
          interpolate(frame, [voStart - duckTransition, voStart], [MUSIC_VOLUME_NORMAL, MUSIC_VOLUME_DUCKED], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
      } else if (frame > voEnd) {
        // Transition out of duck
        targetVolume = Math.min(
          targetVolume,
          interpolate(frame, [voEnd, voEnd + duckTransition], [MUSIC_VOLUME_DUCKED, MUSIC_VOLUME_NORMAL], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
      } else {
        // During VO - fully ducked
        targetVolume = MUSIC_VOLUME_DUCKED;
      }
    }
  }

  // Apply fade in at the start
  if (frame < fadeInFrames) {
    targetVolume = interpolate(frame, [0, fadeInFrames], [0, targetVolume], {
      extrapolateRight: "clamp",
    });
  }

  // Apply fade out at the end
  if (frame > totalFrames - fadeOutFrames) {
    targetVolume = interpolate(
      frame,
      [totalFrames - fadeOutFrames, totalFrames],
      [targetVolume, 0],
      { extrapolateLeft: "clamp" }
    );
  }

  return targetVolume;
}

/**
 * Calculate VO volume with fade in/out
 * Uses SPEC.md level: 0dB (1.0 linear)
 */
function getVOVolumeAtFrame(frame: number, durationSec: number, fps: number): number {
  return getVOVolume(frame, durationSec, fps);
}

// ============================================================================
// COMPONENTS
// ============================================================================

export interface AudioTrackProps {
  /** Enable/disable music (default: true) */
  musicEnabled?: boolean;
  /** Enable/disable voiceover (default: true) */
  voiceoverEnabled?: boolean;
  /** Enable/disable sound effects (default: true) */
  sfxEnabled?: boolean;
  /** Master volume multiplier (default: 1.0) */
  masterVolume?: number;
}

/**
 * Background music track with VO ducking
 */
export const MusicTrack: React.FC<{ volume?: number }> = ({ volume = 1.0 }) => {
  const { fps } = useVideoConfig();

  return (
    <Audio
      src={staticFile(AUDIO_FILES.music)}
      volume={(f) => getMusicVolumeAtFrame(f, fps) * volume}
      loop
    />
  );
};

/**
 * Voiceover tracks - each section's narration
 */
export const VoiceoverTrack: React.FC<{ volume?: number }> = ({ volume = 1.0 }) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Problem VO */}
      <Sequence from={VO_TIMING.problem.start} name="VO: Problem">
        <Audio
          src={staticFile(AUDIO_FILES.vo.problem)}
          volume={(f) => getVOVolumeAtFrame(f, VO_TIMING.problem.durationSec, fps) * volume}
        />
      </Sequence>

      {/* Solution VO */}
      <Sequence from={VO_TIMING.solution.start} name="VO: Solution">
        <Audio
          src={staticFile(AUDIO_FILES.vo.solution)}
          volume={(f) => getVOVolumeAtFrame(f, VO_TIMING.solution.durationSec, fps) * volume}
        />
      </Sequence>

      {/* Engine VO */}
      <Sequence from={VO_TIMING.engine.start} name="VO: Engine">
        <Audio
          src={staticFile(AUDIO_FILES.vo.engine)}
          volume={(f) => getVOVolumeAtFrame(f, VO_TIMING.engine.durationSec, fps) * volume}
        />
      </Sequence>

      {/* Proof VO */}
      <Sequence from={VO_TIMING.proof.start} name="VO: Proof">
        <Audio
          src={staticFile(AUDIO_FILES.vo.proof)}
          volume={(f) => getVOVolumeAtFrame(f, VO_TIMING.proof.durationSec, fps) * volume}
        />
      </Sequence>

      {/* CTA VO */}
      <Sequence from={VO_TIMING.cta.start} name="VO: CTA">
        <Audio
          src={staticFile(AUDIO_FILES.vo.cta)}
          volume={(f) => getVOVolumeAtFrame(f, VO_TIMING.cta.durationSec, fps) * volume}
        />
      </Sequence>
    </>
  );
};

/**
 * Sound effects track - synced to visual events
 * Levels adjusted based on feedback:
 * - Typing: -6dB (louder, clearly audible)
 * - Glitch: -22dB (softer, less harsh)
 */
export const SFXTrack: React.FC<{ volume?: number }> = ({ volume = 1.0 }) => {
  // Create volume callbacks
  // Typing sounds: -6dB (louder per feedback)
  const typeVol = () => SFX_VOLUME_TYPING * volume;
  // Ambient hum: -20dB (ambient)
  const dataHumVol = () => SFX_VOLUME_AMBIENT * volume;
  // Glitch transitions: -22dB (softer per feedback)
  const glitchVol = () => SFX_VOLUME_GLITCH * volume;
  // Warning tone: -15dB (quiet, background)
  const warningVol = () => SFX_VOLUME_QUIET * volume;
  // CRT effects: -12dB (loud, transitions)
  const crtOffVol = () => SFX_VOLUME_LOUD * volume;
  const crtOnVol = () => SFX_VOLUME_LOUD * volume;
  // Success chime: -14dB (normal)
  const successVol = () => SFX_VOLUME_NORMAL * volume;
  // Command execute: -14dB (normal)
  const cmdVol = () => SFX_VOLUME_NORMAL * volume;
  // Smaller glitches: -22dB (softer per feedback)
  const glitchSmallVol = () => SFX_VOLUME_GLITCH * volume;

  return (
    <>
      {/* Hook section - typing sounds */}
      <Sequence from={SFX_TIMING.typeStart} durationInFrames={15} name="SFX: Type 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.typeStart + 6} durationInFrames={15} name="SFX: Type 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.typeStart + 12} durationInFrames={15} name="SFX: Type 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.typeStart + 18} durationInFrames={15} name="SFX: Type 1b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type1)} volume={typeVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.typeStart + 24} durationInFrames={15} name="SFX: Type 2b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type2)} volume={typeVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.typeStart + 30} durationInFrames={15} name="SFX: Type 3b">
        <Audio src={staticFile(AUDIO_FILES.sfx.type3)} volume={typeVol} />
      </Sequence>

      {/* Data transmission hum - Matrix rain appears (loops through engine section) */}
      <Sequence from={SFX_TIMING.dataHumStart} durationInFrames={2400} name="SFX: Data Hum">
        <Audio src={staticFile(AUDIO_FILES.sfx.dataHum)} volume={dataHumVol} loop />
      </Sequence>

      {/* Glitch transition - Hook to Problem */}
      <Sequence from={SFX_TIMING.glitchHookToProblem} durationInFrames={45} name="SFX: Glitch 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={glitchVol} />
      </Sequence>

      {/* Warning tone - Problem section */}
      <Sequence from={SFX_TIMING.warningStart} durationInFrames={60} name="SFX: Warning">
        <Audio src={staticFile(AUDIO_FILES.sfx.warning)} volume={warningVol} />
      </Sequence>

      {/* CRT off - Problem section ending */}
      <Sequence from={SFX_TIMING.crtOff} durationInFrames={60} name="SFX: CRT Off">
        <Audio src={staticFile(AUDIO_FILES.sfx.crtOff)} volume={crtOffVol} />
      </Sequence>

      {/* CRT on - Solution boot */}
      <Sequence from={SFX_TIMING.crtOn} durationInFrames={75} name="SFX: CRT On">
        <Audio src={staticFile(AUDIO_FILES.sfx.crtOn)} volume={crtOnVol} />
      </Sequence>

      {/* Success chime - Libertas reveal */}
      <Sequence from={SFX_TIMING.successReveal} durationInFrames={90} name="SFX: Success">
        <Audio src={staticFile(AUDIO_FILES.sfx.success)} volume={successVol} />
      </Sequence>

      {/* Command execute - Engine section data flow */}
      <Sequence from={SFX_TIMING.dataFlowStart + 30} durationInFrames={30} name="SFX: Cmd 1">
        <Audio src={staticFile(AUDIO_FILES.sfx.cmdExecute)} volume={cmdVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.dataFlowStart + 180} durationInFrames={30} name="SFX: Cmd 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.cmdExecute)} volume={cmdVol} />
      </Sequence>
      <Sequence from={SFX_TIMING.dataFlowStart + 330} durationInFrames={30} name="SFX: Cmd 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.cmdExecute)} volume={cmdVol} />
      </Sequence>

      {/* Glitch transition - Solution to Engine */}
      <Sequence from={SFX_TIMING.glitchSolutionToEngine} durationInFrames={45} name="SFX: Glitch 2">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={glitchSmallVol} />
      </Sequence>

      {/* Glitch transition - Engine to Proof */}
      <Sequence from={SFX_TIMING.glitchEngineToProof} durationInFrames={45} name="SFX: Glitch 3">
        <Audio src={staticFile(AUDIO_FILES.sfx.glitch)} volume={glitchSmallVol} />
      </Sequence>
    </>
  );
};

/**
 * Main audio track component - combines all audio layers
 */
export const AudioTrack: React.FC<AudioTrackProps> = ({
  musicEnabled = true,
  voiceoverEnabled = true,
  sfxEnabled = true,
  masterVolume = 1.0,
}) => {
  return (
    <>
      {musicEnabled && <MusicTrack volume={masterVolume} />}
      {voiceoverEnabled && <VoiceoverTrack volume={masterVolume} />}
      {sfxEnabled && <SFXTrack volume={masterVolume} />}
    </>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to check if voiceover is currently playing
 * Useful for syncing visual effects to VO
 */
export function useIsVOPlaying(): {
  isPlaying: boolean;
  currentVO: keyof typeof VO_TIMING | null;
} {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  for (const [key, timing] of Object.entries(VO_TIMING)) {
    const voStart = timing.start;
    const voEnd = timing.start + timing.durationSec * fps;

    if (frame >= voStart && frame < voEnd) {
      return { isPlaying: true, currentVO: key as keyof typeof VO_TIMING };
    }
  }

  return { isPlaying: false, currentVO: null };
}

/**
 * Hook to get current section based on frame
 */
export function useCurrentSection(): keyof typeof SECTION_TIMING {
  const frame = useCurrentFrame();

  for (const [section, timing] of Object.entries(SECTION_TIMING)) {
    if (frame >= timing.start && frame < timing.end) {
      return section as keyof typeof SECTION_TIMING;
    }
  }

  return "endCard";
}

export default AudioTrack;
