# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Libertas website** — the public-facing Next.js frontend for the Freedom Tech research and publishing platform. It serves published insights, RSS/JSON feeds, and the intake submission form.

**Parent project docs:** See `../CLAUDE.md`, `../SPEC.md`, `../PRD.md` for full system architecture.

## Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # ESLint check
```

## Architecture

### Stack
- **Next.js 16** with App Router
- **React 19** with Server Components
- **Tailwind CSS 4** (via PostCSS)
- **TypeScript** (strict mode)

### Directory Structure
```
src/
├── app/           # App Router pages and layouts
│   ├── layout.tsx # Root layout (Geist fonts)
│   ├── page.tsx   # Homepage
│   └── globals.css # Design system variables
├── components/    # React components (empty, to be built)
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API clients
└── types/         # TypeScript type definitions
    └── index.ts   # Core types (Post, Citation, Reaction, Comment, etc.)
```

### Design System

CSS custom properties defined in `globals.css`:
- **Dark theme default** with light theme override via `[data-theme="light"]`
- Accent color: Matrix Green (`--accent-primary: #00ff41`)
- Fonts: Inter (sans), JetBrains Mono (mono), Space Grotesk (display)

Key CSS variables:
- `--bg-*` — background colors
- `--fg-*` — foreground/text colors
- `--accent-*` — accent colors and glow effects
- `--border-*` — border colors
- `--shadow-*` — shadows including glow effect

Utility classes: `.glow-green`, `.glow-text`, `.terminal-cursor`

### Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`)

### Key Types

Located in `src/types/index.ts`:
- `Post` — published content with citations and scores
- `Citation` — source references
- `Reaction` / `ReactionCounts` — likes/dislikes (supports Starknet tx hashes)
- `Comment` — threaded comments
- `IntakeSubmission` — public intake form data

## Integration Points

This website connects to:
- **GCP Cloud SQL** — database for posts, reactions, comments (env: `DATABASE_URL`)
- **Firebase Auth** — user authentication (env: `NEXT_PUBLIC_FIREBASE_*`)
- **n8n webhook** — intake form submissions (env: `N8N_WEBHOOK_URL`)
- **GCS** — feed storage (optional, for static feed serving)

## Privacy Requirements

Per project manifesto:
- No tracking pixels
- No fingerprinting scripts
- No third-party analytics by default
- Minimal metadata storage
