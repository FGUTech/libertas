import "./index.css";
import { Composition } from "remotion";
import { z } from "zod";
import { MyComposition } from "./Composition";
import { HookScene } from "./compositions/LibertasExplainer/scenes";

// Props schema for LibertasExplainer composition
export const libertasExplainerSchema = z.object({
  // Title displayed in the video
  title: z.string().default("Libertas"),
  // Subtitle/tagline
  subtitle: z.string().default("Freedom Tech Research Platform"),
});

export type LibertasExplainerProps = z.infer<typeof libertasExplainerSchema>;

// Props schema for Hook scene (for development preview)
export const hookSceneSchema = z.object({
  text: z.string().default("initializing libertas..."),
  debug: z.boolean().default(false),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main full video composition */}
      <Composition
        id="LibertasExplainer"
        component={MyComposition}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
        schema={libertasExplainerSchema}
        defaultProps={{
          title: "Libertas",
          subtitle: "Freedom Tech Research Platform",
        }}
      />

      {/* Hook scene preview - Section 1 (5 seconds) */}
      <Composition
        id="Hook"
        component={HookScene}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={hookSceneSchema}
        defaultProps={{
          text: "initializing libertas...",
          debug: false,
        }}
      />
    </>
  );
};
