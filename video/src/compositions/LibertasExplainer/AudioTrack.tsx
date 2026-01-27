/**
 * AudioTrack - Audio layering for Libertas Explainer Video
 *
 * Layers background music, voiceover, and sound effects with
 * VO ducking (music volume lowers when voice plays).
 */

import { Audio } from "@remotion/media";
import {
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

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
// AUDIO FILE PATHS
// ============================================================================

const AUDIO_FILES = {
  music: "audio/skynet-sky-cassette-main-version-41446-01-52.mp3",
  vo: {
    problem: "audio/vo/vo-problem.mp3",
    solution: "audio/vo/vo-solution.mp3",
    engine: "audio/vo/vo-engine.mp3",
    proof: "audio/vo/vo-proof.mp3",
    cta: "audio/vo/vo-cta.mp3",
  },
  sfx: {
    type1: "audio/sfx/type-1.wav",
    type2: "audio/sfx/type-2.wav",
    type3: "audio/sfx/type-3.wav",
    cmdExecute: "audio/sfx/cmd-execute.wav",
    glitch: "audio/sfx/glitch.wav",
    warning: "audio/sfx/warning.wav",
    success: "audio/sfx/success.wav",
    dataHum: "audio/sfx/data-hum.wav",
    crtOn: "audio/sfx/crt-on.wav",
    crtOff: "audio/sfx/crt-off.wav",
  },
} as const;

// ============================================================================
// VOLUME UTILITIES
// ============================================================================

/**
 * Calculate music volume with VO ducking
 * Lowers music when voiceover is playing
 */
function getMusicVolumeAtFrame(frame: number, fps: number): number {
  const normalVolume = 0.35;
  const duckedVolume = 0.12;
  const fadeInFrames = fps * 2; // 2 second fade in at start
  const fadeOutFrames = fps * 3; // 3 second fade out at end
  const totalFrames = 3600;
  const duckTransition = fps * 0.3; // 0.3 second transition

  // Check if any VO is playing and calculate ducking
  let targetVolume = normalVolume;

  for (const [, timing] of Object.entries(VO_TIMING)) {
    const voStart = timing.start;
    const voEnd = timing.start + timing.durationSec * fps;

    // Duck the music during VO playback with smooth transitions
    if (frame >= voStart - duckTransition && frame <= voEnd + duckTransition) {
      if (frame < voStart) {
        // Transition into duck
        targetVolume = Math.min(
          targetVolume,
          interpolate(frame, [voStart - duckTransition, voStart], [normalVolume, duckedVolume], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
      } else if (frame > voEnd) {
        // Transition out of duck
        targetVolume = Math.min(
          targetVolume,
          interpolate(frame, [voEnd, voEnd + duckTransition], [duckedVolume, normalVolume], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
      } else {
        // During VO - fully ducked
        targetVolume = duckedVolume;
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
 */
function getVOVolumeAtFrame(frame: number, durationSec: number, fps: number): number {
  const fadeFrames = fps * 0.1; // 0.1 second fade
  const totalFrames = durationSec * fps;

  // Fade in
  if (frame < fadeFrames) {
    return interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" });
  }

  // Fade out
  if (frame > totalFrames - fadeFrames) {
    return interpolate(frame, [totalFrames - fadeFrames, totalFrames], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  return 1;
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
 */
export const SFXTrack: React.FC<{ volume?: number }> = ({ volume = 0.6 }) => {
  // Create volume callbacks that return constant values
  const typeVol = () => volume * 0.7;
  const dataHumVol = () => volume * 0.15;
  const glitchVol = () => volume * 0.5;
  const warningVol = () => volume * 0.3;
  const crtOffVol = () => volume * 0.7;
  const crtOnVol = () => volume * 0.6;
  const successVol = () => volume * 0.4;
  const cmdVol = () => volume * 0.4;
  const glitchSmallVol = () => volume * 0.4;

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
