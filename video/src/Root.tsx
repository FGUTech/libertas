import "./index.css";
import { Composition, Still } from "remotion";
import { z } from "zod";
import { LibertasExplainer } from "./compositions/LibertasExplainer";
import { HookScene, ProblemScene, SolutionScene, WorkflowScene, ProofScene, CTAScene, EndCardScene } from "./compositions/LibertasExplainer/scenes";
import { Thumbnail } from "./compositions/Thumbnail";

// Props schema for LibertasExplainer composition
export const libertasExplainerSchema = z.object({
  // Enable debug overlays
  debug: z.boolean().default(false),
  // Enable audio tracks
  audioEnabled: z.boolean().default(true),
  // Master volume (0-1)
  masterVolume: z.number().min(0).max(1).default(1.0),
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

// Props schema for Proof scene (for development preview)
export const proofSceneSchema = z.object({
  debug: z.boolean().default(false),
});

// Props schema for CTA scene (for development preview)
export const ctaSceneSchema = z.object({
  debug: z.boolean().default(false),
});

// Props schema for EndCard scene (for development preview)
export const endCardSceneSchema = z.object({
  debug: z.boolean().default(false),
});

// Props schema for Thumbnail still
export const thumbnailSchema = z.object({
  showPlayButton: z.boolean().default(false),
  playButtonStyle: z.enum(['circle', 'rounded']).default('circle'),
  xOptimized: z.boolean().default(false),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main full video composition */}
      {/* Duration: ~98.1s (2944 frames) - includes 1 frame thumbnail for X */}
      <Composition
        id="LibertasExplainer"
        component={LibertasExplainer}
        durationInFrames={2944}
        fps={30}
        width={1920}
        height={1080}
        schema={libertasExplainerSchema}
        defaultProps={{
          debug: false,
          audioEnabled: true,
          masterVolume: 1.0,
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

      {/* Problem scene preview - Section 2 (17.2 seconds) */}
      <Composition
        id="Problem"
        component={ProblemScene}
        durationInFrames={528}
        fps={30}
        width={1920}
        height={1080}
        schema={problemSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* Solution scene preview - Section 3 (16.67 seconds) */}
      <Composition
        id="Solution"
        component={SolutionScene}
        durationInFrames={500}
        fps={30}
        width={1920}
        height={1080}
        schema={solutionSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* Workflow scene preview - Section 4 (23.17 seconds) */}
      <Composition
        id="Workflow"
        component={WorkflowScene}
        durationInFrames={695}
        fps={30}
        width={1920}
        height={1080}
        schema={workflowSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* Proof scene preview - Section 5 (20 seconds) */}
      <Composition
        id="Proof"
        component={ProofScene}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        schema={proofSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* CTA scene preview - Section 6 (15 seconds) */}
      <Composition
        id="CTA"
        component={CTAScene}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={ctaSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* EndCard scene preview - Section 7 (5 seconds) */}
      <Composition
        id="EndCard"
        component={EndCardScene}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={endCardSceneSchema}
        defaultProps={{
          debug: false,
        }}
      />

      {/* Thumbnail still - no play button (clean version) */}
      <Still
        id="Thumbnail"
        component={Thumbnail}
        width={1920}
        height={1080}
        schema={thumbnailSchema}
        defaultProps={{
          showPlayButton: false,
          playButtonStyle: 'circle',
        }}
      />

      {/* Thumbnail still - with play button overlay */}
      <Still
        id="ThumbnailWithPlay"
        component={Thumbnail}
        width={1920}
        height={1080}
        schema={thumbnailSchema}
        defaultProps={{
          showPlayButton: true,
          playButtonStyle: 'circle',
        }}
      />

      {/* Thumbnail still - with WATCH button overlay */}
      <Still
        id="ThumbnailWithWatch"
        component={Thumbnail}
        width={1920}
        height={1080}
        schema={thumbnailSchema}
        defaultProps={{
          showPlayButton: true,
          playButtonStyle: 'rounded',
          xOptimized: false,
        }}
      />

      {/* Thumbnail still - X/Twitter optimized with WATCH button */}
      <Still
        id="ThumbnailX"
        component={Thumbnail}
        width={1920}
        height={1080}
        schema={thumbnailSchema}
        defaultProps={{
          showPlayButton: true,
          playButtonStyle: 'rounded',
          xOptimized: true,
        }}
      />
    </>
  );
};
