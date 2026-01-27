# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remotion video project for the Libertas Freedom Tech research platform. This creates a 90-120 second cinematic explainer video with a terminal/Matrix hacker aesthetic, dark synthwave audio, and authoritative voiceover. Built with React 19, TypeScript, and Tailwind CSS v4.

## Documentation

Before implementing, read these docs if relevant:

| Doc | Purpose |
|-----|---------|
| `docs/SPEC.md` | Source of truth - visual identity, color palette, typography, audio specs, narrative structure, component architecture |
| `docs/STORYBOARD.md` | Frame-by-frame breakdown of all 7 sections with timing, visuals, audio, and animation details |

## Commands

```bash
npm run dev       # Start Remotion Studio (interactive preview at localhost:3000)
npm run build     # Bundle video composition
npm run lint      # ESLint + TypeScript type checking
npm run upgrade   # Upgrade Remotion to latest version

# Render final video
npx remotion render LibertasExplainer out/libertas-explainer-final.mp4 \
  --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k
```

## Target Composition Config

Per `docs/SPEC.md`, the main composition should be:
- ID: "LibertasExplainer"
- Resolution: 1920×1080
- Frame Rate: 30 fps
- Duration: 3600 frames (120 seconds)

## Architecture

**Current structure:**
```
src/
├── index.ts         # Entry point - registers Remotion root
├── Root.tsx         # Root composition container
├── Composition.tsx  # Main composition component
└── index.css        # Tailwind imports
```

**Target structure (per SPEC.md):**
```
src/
├── compositions/LibertasExplainer/
│   ├── index.tsx           # Main composition
│   ├── scenes/             # Hook, Problem, Solution, Workflow, Proof, CTA, EndCard
│   └── components/         # Terminal, MatrixRain, Scanlines, GlitchEffect, etc.
├── hooks/
├── utils/                  # colors.ts, timing.ts, typography.ts
└── assets/                 # fonts/, audio/, images/
```

## Key Remotion Patterns

**Frame-based animations:** Use `useCurrentFrame()` hook for timing. All motion driven by frame number, never CSS transitions.

**Video config access:** Use `useVideoConfig()` to get fps, durationInFrames, width, height.

**Sequencing:** Use `<Sequence>` and `<TransitionSeries>` to arrange scenes at specific frame offsets.

**Springs:** Use `spring()` for natural motion. Common configs in SPEC: `{ damping: 200 }` for data flow.

## Visual Identity (from SPEC.md)

```
Backgrounds: #0a0a0a (primary), #111111 (secondary), #1a1a1a (tertiary)
Accent: #00ff41 (Matrix green), #ffb800 (amber), #ff3c3c (error)
Text: #e0e0e0 (primary), #a0a0a0 (secondary)
Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (terminal)
```

## Configuration

- **remotion.config.ts**: Output format (JPEG), Webpack override for Tailwind
- **tsconfig.json**: ES2018 target, strict mode enabled
- **postcss.config.mjs**: Tailwind v4 via `@tailwindcss/postcss`

## Skill Reference

Detailed Remotion best practices in `.claude/skills/remotion-best-practices/` covering animations, media, text, captions, 3D, and parameters.
