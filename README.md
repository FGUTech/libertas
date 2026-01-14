```
██╗     ██╗██████╗ ███████╗██████╗ ████████╗ █████╗ ███████╗
██║     ██║██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔══██╗██╔════╝
██║     ██║██████╔╝█████╗  ██████╔╝   ██║   ███████║███████╗
██║     ██║██╔══██╗██╔══╝  ██╔══██╗   ██║   ██╔══██║╚════██║
███████╗██║██████╔╝███████╗██║  ██║   ██║   ██║  ██║███████║
╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

**Automated Research & Distribution Platform for Freedom Tech**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built by FGU](https://img.shields.io/badge/Built%20by-FGU%20Tech-blue)](https://fgu.tech)

---

## Overview

Libertas is a fully automated, privacy-preserving system that continuously researches Freedom Tech topics and synthesizes high-quality insights. Built by the Freedom Go Up (FGU) squad at StarkWare, it converts global signals—surveillance reports, censorship events, monetary repression—into actionable understanding and project ideas.

**This is not content marketing. This is Freedom Tech infrastructure.**

### What It Does

- **Ingests** content from curated sources (HRF, EFF, Bitcoin Magazine, OONI, and more)
- **Classifies** relevance to freedom-focused topics using Claude AI
- **Publishes** insights via RSS, JSON feeds, and email newsletters
- **Processes** inbound submissions from activists, researchers, and builders
- **Generates** project ideas based on observed global patterns
- **Scaffolds** prototypes through automated "vibe coding" pipelines (with safety gates)

### Core Principles

- **Permissionless** — All outputs accessible without accounts or paywalls
- **Privacy-first** — No tracking pixels, no fingerprinting, minimal logging
- **Open source** — Fully auditable, forkable, and extensible
- **Idempotent** — Re-running workflows never creates duplicates
- **High-signal** — Freedom Tech lens applied to all content

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                          │
│                    Managed n8n Hosting                          │
│                                                                 │
│  Workflow A: Daily Ingestion ──────► RSS/JSON Feeds            │
│  Workflow B: Weekly Digest ────────► Email Newsletters          │
│  Workflow C: Inbound Intake ───────► GitHub Issues              │
│  Workflow D: Idea Generator ───────► Project Proposals          │
│  Workflow E: Vibe Coding ──────────► Draft PRs (gated)          │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐
    │ Claude AI │       │  GitHub   │       │  Vercel   │
    │ (LLM)     │       │  (Issues) │       │  (Web)    │
    └───────────┘       └───────────┘       └───────────┘
                              │
    ┌─────────────────────────┴─────────────────────────┐
    │         GCP Cloud SQL (Postgres + pgvector)       │
    │  source_items │ insights │ project_ideas │ ...    │
    └───────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Orchestration** | n8n (managed hosting) |
| **Database** | GCP Cloud SQL (Postgres + pgvector) |
| **Storage** | GCP Cloud Storage |
| **LLM** | Claude API (Anthropic) |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Radix UI |
| **Auth** | Firebase Auth |
| **Email** | Resend |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Access to GCP Cloud SQL instance
- n8n account (managed or self-hosted)
- Claude API key

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/FGUTech/libertas.git
cd libertas

# Copy environment template
cp .env.example .env
```

Configure `.env` with your credentials:

```bash
# Required
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
N8N_WEBHOOK_URL=https://...

# Firebase (for website auth)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Optional
RESEND_API_KEY=...
GCS_BUCKET_NAME=libertas-content
```

### Database Setup

```bash
# Run migrations
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

### Website Development

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### n8n Workflows

Import workflow JSON files from `n8n/workflows/` into your n8n instance:

1. `workflow-a-ingestion.json` — Daily signal ingestion
2. `workflow-b-digest.json` — Weekly digest builder
3. `workflow-c-intake.json` — Public intake handler
4. `workflow-d-ideas.json` — Project idea generator

---

## Project Structure

```
libertas/
├── agents/                 # LLM agent prompts
│   ├── classify.md         # Content classifier
│   ├── digest.md           # Digest composer
│   ├── generate-idea.md    # Idea synthesizer
│   └── intake-classify.md  # Submission risk assessor
│
├── config/                 # Runtime configuration
│   ├── sources.yml         # Content sources (RSS, web, X, etc.)
│   └── thresholds.yml      # Scoring gates and limits
│
├── docs/                   # Project documentation
│   ├── PRD.md              # Product requirements
│   ├── SPEC.md             # Technical specification
│   ├── ROADMAP.md          # Delivery roadmap
│   └── INFRA_DEPLOY.md     # Infrastructure guide
│
├── migrations/             # Database migrations
│   └── 001_initial_schema.sql
│
├── n8n/workflows/          # n8n workflow definitions
│   ├── workflow-a-ingestion.json
│   ├── workflow-b-digest.json
│   ├── workflow-c-intake.json
│   └── workflow-d-ideas.json
│
├── schemas/                # JSON Schema definitions
│   ├── insight.schema.json
│   ├── project-idea.schema.json
│   └── llm-outputs/        # LLM output validation
│
└── website/                # Next.js frontend
    ├── src/app/            # App Router pages
    ├── src/components/     # React components
    └── src/lib/            # Utilities
```

---

## Workflows

### Workflow A: Daily Ingestion

Runs every 6 hours. Fetches content from configured sources, classifies relevance, generates summaries, and publishes to feeds.

**Pipeline:** Fetch → Deduplicate → Classify → Summarize → Publish

### Workflow B: Weekly Digest

Runs weekly. Aggregates published insights, generates a thematic digest, and sends email newsletters.

### Workflow C: Inbound Intake

Webhook-triggered. Processes public submissions, assesses risk level, and creates GitHub issues for triage.

### Workflow D: Idea Generator

Runs daily or after high-signal insights. Clusters themes, synthesizes project proposals, and opens issues for viable ideas.

### Workflow E: Vibe Coding (Gated)

Triggered on approved `build_candidate` ideas. Generates code scaffolds, runs CI, and opens draft PRs for human review.

---

## Configuration

### Sources (`config/sources.yml`)

Add or modify content sources without code changes:

```yaml
sources:
  - name: "Human Rights Foundation"
    type: "rss"
    url: "https://hrf.org/feed/"
    tier: 1
    tags: ["human-rights", "activism"]
    enabled: true
```

**Tier system:**
- **Tier 1** — High-trust sources, process all content
- **Tier 2** — Apply stricter relevance filtering
- **Tier 3** — Only high-signal items

### Thresholds (`config/thresholds.yml`)

Control scoring gates, rate limits, and publishing rules:

```yaml
ingestion:
  relevance_threshold: 50
  max_items_per_run: 100

publishing:
  auto_publish_relevance: 70
  auto_publish_credibility: 60
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](docs/PRD.md) | Full product requirements and context |
| [SPEC.md](docs/SPEC.md) | Technical specification with data models |
| [ROADMAP.md](docs/ROADMAP.md) | Phased delivery plan |
| [INFRA_DEPLOY.md](docs/INFRA_DEPLOY.md) | Infrastructure deployment guide |
| [AGENTS.md](agents/AGENTS.md) | Agent prompt engineering guidelines |

---

## Data Model

| Entity | Description |
|--------|-------------|
| **SourceItem** | Raw fetched content with metadata |
| **Insight** | Generated analysis with scores and citations |
| **ProjectIdea** | Opportunity proposals with feasibility ratings |
| **Submission** | Public intake from web form or email |
| **Digest** | Weekly rollup of published insights |

---

## Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| n8n Webhook | External | Intake form submissions (Workflow C) |
| `/rss.xml` | Static | RSS 2.0 feed (generated at build) |
| `/feed.json` | Static | JSON Feed 1.1 (generated at build) |

---

## Contributing

1. Read [SPEC.md](docs/SPEC.md) for technical details
2. Check [ROADMAP.md](docs/ROADMAP.md) for current priorities
3. Follow agent guidelines in [AGENTS.md](agents/AGENTS.md)
4. Submit PRs against the `main` branch

---

## Privacy Commitment

Libertas is built with privacy as a core requirement:

- No tracking pixels or analytics fingerprinting
- No third-party scripts that leak user data
- Minimal metadata storage
- Optional email delivery with no tracking
- All outputs permissionless and open

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

- **Website:** [fgu.tech](https://fgu.tech)
- **Repository:** [github.com/FGUTech/libertas](https://github.com/FGUTech/libertas)

---

*Built with conviction by the Freedom Go Up squad at StarkWare.*
