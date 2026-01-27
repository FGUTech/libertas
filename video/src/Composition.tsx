import type { LibertasExplainerProps } from "./Root";
import { AbsoluteFill } from "remotion";
import { colors } from "./utils/colors";
import {
  fontFamilies,
  displayStyle,
  bodyStyle,
  terminalStyle,
  dataStyle,
} from "./utils/fonts";

export const MyComposition: React.FC<LibertasExplainerProps> = ({
  title,
  subtitle,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
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

      {/* Terminal font - JetBrains Mono */}
      <div
        style={{
          ...terminalStyle(36),
          color: colors.accent.primary,
          backgroundColor: colors.bg.secondary,
          padding: "20px 40px",
          borderRadius: 8,
        }}
      >
        {">"} initializing libertas...
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
  );
};
