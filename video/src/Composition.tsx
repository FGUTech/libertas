import type { LibertasExplainerProps } from "./Root";
import { AbsoluteFill } from "remotion";
import { colors } from "./utils/colors";
import {
  fontFamilies,
  displayStyle,
  bodyStyle,
  dataStyle,
} from "./utils/fonts";
import {
  TypewriterText,
  getTypingEndFrame,
  GlitchTransition,
  Scanlines,
  MatrixRain,
  AudioTrack,
} from "./compositions/LibertasExplainer/components";

export const MyComposition: React.FC<LibertasExplainerProps> = ({
  title,
  subtitle,
}) => {
  // Timing for typewriter demos
  const line1Start = 0;
  const line1End = getTypingEndFrame("initializing libertas...", line1Start, 50);
  const line2Start = line1End + 15; // Small pause after first line
  const line2End = getTypingEndFrame("loading freedom tech signals", line2Start, 40);
  const line3Start = line2End + 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
      }}
    >
      {/* Audio layer - music, voiceover, and SFX */}
      <AudioTrack />

      {/* Matrix rain background */}
      <MatrixRain opacity={0.3} columnCount={30} />

      {/* Main content with glitch effect at frame 60-66 and 120-126 */}
      <GlitchTransition startFrame={60} durationFrames={6} intensity={0.7}>
        <GlitchTransition startFrame={120} durationFrames={6} intensity={0.5}>
          <AbsoluteFill
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 40,
              padding: 100,
            }}
          >
      {/* Display font - Space Grotesk Bold */}
      <div style={{ ...displayStyle(96), color: colors.fg.primary }}>
        {title}
      </div>

      {/* Body font - Inter Regular */}
      <div style={{ ...bodyStyle(48), color: colors.fg.secondary }}>
        {subtitle}
      </div>

      {/* TypewriterText Demo - Terminal style with prompt */}
      <div
        style={{
          backgroundColor: colors.bg.secondary,
          padding: "24px 40px",
          borderRadius: 8,
          minWidth: 700,
        }}
      >
        {/* Line 1 - Standard terminal prompt */}
        <TypewriterText
          text="initializing libertas..."
          startFrame={line1Start}
          msPerChar={50}
          prompt="> "
          showCursor={false}
          fontSize={36}
        />

        {/* Line 2 - Faster typing */}
        <TypewriterText
          text="loading freedom tech signals"
          startFrame={line2Start}
          msPerChar={40}
          prompt="> "
          showCursor={false}
          fontSize={36}
        />

        {/* Line 3 - Amber warning color */}
        <TypewriterText
          text="system ready."
          startFrame={line3Start}
          msPerChar={60}
          prompt="> "
          color={colors.accent.amber}
          fontSize={36}
        />
      </div>

      {/* Data font - JetBrains Mono Medium */}
      <div
        style={{
          display: "flex",
          gap: 24,
        }}
      >
        <div
          style={{
            ...dataStyle(28),
            color: colors.accent.amber,
            backgroundColor: colors.bg.tertiary,
            padding: "12px 24px",
            borderRadius: 6,
          }}
        >
          RELEVANCE: 92
        </div>
        <div
          style={{
            ...dataStyle(28),
            color: colors.accent.primary,
            backgroundColor: colors.bg.tertiary,
            padding: "12px 24px",
            borderRadius: 6,
          }}
        >
          CREDIBILITY: 75
        </div>
      </div>

          {/* Font family labels */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
            }}
          >
            <div style={{ ...bodyStyle(20), color: colors.fg.tertiary }}>
              Display: {fontFamilies.display.split(",")[0]}
            </div>
            <div style={{ ...bodyStyle(20), color: colors.fg.tertiary }}>
              Body: {fontFamilies.body.split(",")[0]}
            </div>
            <div style={{ ...bodyStyle(20), color: colors.fg.tertiary }}>
              Mono: {fontFamilies.mono.split(",")[0]}
            </div>
          </div>
          </AbsoluteFill>
        </GlitchTransition>
      </GlitchTransition>

      {/* CRT scanlines overlay */}
      <Scanlines opacity={0.04} flicker movingBar />
    </AbsoluteFill>
  );
};
