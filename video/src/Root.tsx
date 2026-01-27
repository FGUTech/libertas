import "./index.css";
import { Composition } from "remotion";
import { z } from "zod";
import { MyComposition } from "./Composition";

// Props schema for LibertasExplainer composition
export const libertasExplainerSchema = z.object({
  // Title displayed in the video
  title: z.string().default("Libertas"),
  // Subtitle/tagline
  subtitle: z.string().default("Freedom Tech Research Platform"),
});

export type LibertasExplainerProps = z.infer<typeof libertasExplainerSchema>;

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
