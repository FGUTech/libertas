# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Libertas is an automated, privacy-preserving research and publishing platform for Freedom Tech topics. Built by the Freedom Go Up (FGU) squad at StarkWare, it ingests content from curated sources, classifies relevance using Claude AI, generates insights and project ideas, and publishes via RSS/JSON feeds and email newsletters.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            ORCHESTRATION: Managed n8n Hosting               │
│  Workflow A: Daily Ingestion  │  Workflow B: Weekly Digest  │
│  Workflow C: Inbound Intake   │  Workflow D: Idea Generator │
│  Workflow E: Vibe Coding (gated, requires human approval)   │
└─────────────────────────────────────────────────────────────┘
        │                   │                     │
        ▼                   ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Claude API   │    │    GitHub     │    │    Vercel     │
│  (Anthropic)  │    │ (Issues/PRs)  │    │  (Next.js)    │
└───────────────┘    └───────────────┘    └───────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │  GCP Cloud SQL (Postgres + pgvector)  │
        │  source_items | insights | project_   │
        │  ideas | submissions | digests        │
        └───────────────────────────────────────┘
```

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `agents/` | LLM prompt templates (classify, summarize, digest, generate-idea, intake-classify) |
| `config/` | Runtime config: `sources.yml` (content sources), `thresholds.yml` (scoring gates) |
| `docs/` | PRD, SPEC, ROADMAP, infrastructure guides |
| `migrations/` | Postgres migration files |
| `n8n/workflows/` | n8n workflow JSON definitions |
| `schemas/` | JSON Schema definitions for data validation |
| `website/` | Next.js 16 frontend (see `website/CLAUDE.md`) |

## Commands

### Website Development
```bash
cd website
npm install
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

### Database
```bash
# Apply migrations
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

### Agent Testing
```bash
# Test LLM agents against golden tests
npm run test:agents
npm run test:agents -- --agent=classifier
npm run test:agents -- --agent=classifier --update-golden
```

## Core Data Models

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **SourceItem** | Raw fetched content | `url`, `platform`, `content_hash`, `extracted_text` |
| **Insight** | Generated analysis | `title`, `tldr`, `topics[]`, `freedom_relevance_score`, `credibility_score`, `status` |
| **ProjectIdea** | Project proposals | `problem_statement`, `proposed_solution`, `feasibility_score`, `impact_score`, `status` |
| **Submission** | Public intake | `message`, `channel`, `risk_level`, `status` |
| **Digest** | Weekly rollups | `period_start`, `period_end`, `tldr`, `content_markdown` |

## Key Configuration

### Source Tiers (`config/sources.yml`)
- **Tier 1**: High-trust (HRF, EFF, Bitcoin Magazine, Access Now, OONI) - process all content
- **Tier 2**: Secondary - apply stricter relevance filtering
- **Tier 3**: Discovery - only high-signal items

### Publishing Thresholds (`config/thresholds.yml`)
- Relevance threshold: 50 (minimum to generate insight)
- Auto-publish: relevance >= 70 AND credibility >= 60
- Idea generation: relevance >= 80

## Workflow Pipeline

1. **Workflow A (Daily Ingestion)**: Fetch → Dedupe (content hash) → Classify → Score → Summarize → Publish
2. **Workflow B (Weekly Digest)**: Query week's insights → Group by topic → Generate digest → Email via Resend
3. **Workflow C (Inbound Intake)**: Webhook → Risk assess → Create GitHub issue
4. **Workflow D (Idea Generator)**: Cluster high-signal insights → Generate project proposals → Create issues
5. **Workflow E (Vibe Coding)**: Scaffold code from approved ideas → Open draft PR (human review mandatory)

## Agent Prompts

Located in `agents/`, follow this structure:
```markdown
# Role → # Context → # Task → # Input → # Output Requirements → # Hard Rules → # Examples
```

Key agents:
- `classify.md` - Content classification and scoring
- `summarize.md` - Insight generation
- `digest.md` - Weekly digest composition
- `generate-idea.md` - Project proposal synthesis
- `intake-classify.md` - Submission risk assessment

## Privacy Requirements

Per project manifesto:
- No tracking pixels or fingerprinting
- No third-party analytics by default
- Minimal metadata storage
- Optional email with no tracking
- All outputs permissionless and open

## Type System

TypeScript types in `website/src/types/index.ts` with Zod schemas for runtime validation. Types match JSON schemas in `schemas/`.

Topics enum: `bitcoin`, `zk`, `censorship-resistance`, `comms`, `payments`, `identity`, `privacy`, `surveillance`, `activism`, `sovereignty`
