import "./index.css";
import { Composition } from "remotion";
import { z } from "zod";
import { MyComposition } from "./Composition";
import { HookScene, ProblemScene, SolutionScene, WorkflowScene } from "./compositions/LibertasExplainer/scenes";

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

// Props schema for Problem scene (for development preview)
export const problemSceneSchema = z.object({
  debug: z.boolean().default(false),
});

// Props schema for Solution scene (for development preview)
export const solutionSceneSchema = z.object({
  debug: z.boolean().default(false),
});

// Props schema for Workflow scene (for development preview)
export const workflowSceneSchema = z.object({
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

      {/* Problem scene preview - Section 2 (20 seconds) */}
      <Composition
        id="Problem"
        component={ProblemScene}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        schema={problemSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* Solution scene preview - Section 3 (25 seconds) */}
      <Composition
        id="Solution"
        component={SolutionScene}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
        schema={solutionSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* Workflow scene preview - Section 4 (30 seconds) */}
      <Composition
        id="Workflow"
        component={WorkflowScene}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        schema={workflowSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />
    </>
  );
};
