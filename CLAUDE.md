# CLAUDE.md — Libertas

> Agentic context file for Claude Code. Read this first.

## Project Identity

**Libertas** is a fully automated, privacy-preserving research and publishing platform for Freedom Tech. It converts global signals about sovereignty, censorship resistance, and civil liberties into actionable insights, published content, and project ideas.

**Repository:** https://github.com/FGUTech/libertas
**Organization:** StarkWare — Freedom Go Up (FGU)
**Core constraint:** n8n workflows as the orchestrator, agentic-first architecture.

## Quick Context Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | You are here. Overall guidance and conventions. |
| `SPEC.md` | Technical architecture, data models, API contracts. |
| `AGENTS.md` | LLM agent behaviors, prompts, structured outputs. |
| `ROADMAP.md` | Milestones, phases, and delivery checkpoints. |
| `PRD.md` | Full product requirements (source of truth for scope). |
| `INFRASTRUCTURE.md` | Deployment guide for Railway, Supabase, GCP, Vercel. |

**Always read `SPEC.md` before implementing data models or workflows.**
**Always read `AGENTS.md` before writing LLM prompts or agent logic.**
**Always read `INFRASTRUCTURE.md` before deploying or configuring services.**

---

## Guiding Principles (Non-Negotiable)

These principles MUST shape every design decision:

1. **Permissionless** — No accounts, paywalls, or gatekeepers for outputs.
2. **Open source** — Permissive licensing. Default to transparency.
3. **Resilient** — Graceful degradation. Workflows must handle failures.
4. **Privacy-first** — No tracking pixels. No fingerprinting. Minimal logs.
5. **Idempotent** — Re-running any workflow produces identical results (no duplicates).
6. **Citation-grounded** — Every insight must cite sources. No hallucinated claims.

---

## Repository Structure

```
libertas/
├── CLAUDE.md            # This file
├── SPEC.md              # Technical specification
├── AGENTS.md            # Agent behaviors and prompts
├── ROADMAP.md           # Project milestones
├── PRD.md               # Product requirements
├── docs/                # Additional documentation
├── schemas/             # JSON schemas for data models
│   ├── source-item.schema.json
│   ├── insight.schema.json
│   ├── project-idea.schema.json
│   └── submission.schema.json
├── prompts/             # Versioned LLM prompt templates
│   ├── classify.md
│   ├── summarize.md
│   ├── generate-idea.md
│   └── digest.md
├── config/              # Runtime configuration
│   ├── sources.yml      # Seed sources (editable without deploy)
│   └── thresholds.yml   # Scoring thresholds
├── n8n/                 # n8n workflow exports
│   └── workflows/
├── site-content/        # Published content output
│   ├── posts/
│   ├── rss.xml
│   └── feed.json
├── scripts/             # Utility scripts
└── tests/               # Test suites
    ├── unit/
    ├── integration/
    └── golden/          # LLM output validation snapshots
```

---

## Coding Conventions

### General

- **Language:** TypeScript for scripts and utilities. YAML for config.
- **Style:** Functional where possible. Explicit over implicit.
- **Naming:** `kebab-case` for files, `camelCase` for variables, `PascalCase` for types.
- **Comments:** Only where logic isn't self-evident. No boilerplate comments.

### n8n Workflows

- One workflow per logical pipeline (A, B, C, D, E as defined in PRD).
- Use descriptive node names: `fetch-rss-sources`, `dedupe-by-hash`, `llm-classify`.
- Always include error handling nodes with retry logic.
- Store workflow exports as JSON in `/n8n/workflows/`.

### Data Handling

- **All fetched content is untrusted.** Sanitize before processing.
- **Hash everything:** SHA-256 for content deduplication.
- **Timestamps:** ISO 8601 format, UTC timezone.
- **IDs:** UUIDv4 for all entities.

### LLM Interactions

- **Always use structured output** (JSON with schema validation).
- **Never trust LLM output blindly** — validate against schemas before persisting.
- **Prompts are versioned** — changes go through PR review.
- See `AGENTS.md` for prompt templates and expected behaviors.

---

## Security Requirements

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Prompt injection via scraped content | Treat all input as untrusted. Sanitize. Use structured output schemas. |
| Malicious links in sources | Mark external links. Consider safe redirect/preview. |
| Credential leakage | Secrets in env vars only. Never log secrets. |
| Intake endpoint abuse | Rate limiting. Spam scoring. Optional captcha. |
| Activist safety | Never publish operational details. Redaction heuristics. |

### Hard Rules

- **NEVER** store passwords, API keys, or secrets in code or config files.
- **NEVER** log full request bodies that might contain sensitive data.
- **NEVER** publish content that could endanger activists (operational details, locations, identities).
- **ALWAYS** validate LLM output against schema before publishing.
- **ALWAYS** include citations — refuse to publish uncited claims.

---

## Testing Requirements

| Type | Location | Purpose |
|------|----------|---------|
| Unit | `/tests/unit/` | Parsing, normalization, hashing functions |
| Integration | `/tests/integration/` | n8n workflow end-to-end |
| Golden | `/tests/golden/` | LLM output schema conformance |
| Snapshot | `/tests/` | Feed generation (RSS, JSON) |

**Before merging:**
- All tests must pass.
- New LLM prompts require golden test cases.
- Schema changes require migration plan.

---

## Quality Gates

Content is auto-published only when ALL conditions are met:

```yaml
publish_automatically:
  freedom_relevance_score: >= 70
  credibility_score: >= 60
  has_citations: true
  passed_safety_check: true

queue_for_review:
  freedom_relevance_score: < 70
  OR credibility_score: < 60
  OR has_citations: false
```

---

## Key Workflows Reference

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| A: Daily Ingestion | Cron (6h) | Fetch, normalize, classify, publish signals |
| B: Weekly Digest | Cron (weekly) | Aggregate insights into digest |
| C: Inbound Intake | Webhook | Process public submissions |
| D: Idea Generator | Daily/triggered | Convert patterns into project ideas |
| E: Vibe Coding | Manual gate | Scaffold prototypes (human review required) |

See `SPEC.md` for detailed workflow specifications.

---

## Common Tasks

### Adding a New Source

1. Edit `/config/sources.yml`
2. Add entry with: `name`, `type`, `url`, `tier`, `tags`
3. No code deployment needed — n8n reads config at runtime.

### Adjusting Thresholds

1. Edit `/config/thresholds.yml`
2. Changes take effect on next workflow run.

### Adding a New Prompt

1. Create file in `/prompts/` with `.md` extension.
2. Include structured output schema in prompt.
3. Add golden test case in `/tests/golden/`.
4. Update `AGENTS.md` with behavior documentation.

### Debugging Failed Workflows

1. Check n8n execution logs.
2. Look for validation errors in LLM output.
3. Check for source availability (external dependencies).
4. Review rate limits and retry counts.

---

## Anti-Patterns (Do NOT)

- **Don't bypass deduplication** — even for "important" content.
- **Don't publish without citations** — queue for review instead.
- **Don't store IP addresses** from submissions unless legally required.
- **Don't add tracking pixels** — ever, for any reason.
- **Don't commit secrets** — use environment variables.
- **Don't ignore LLM validation errors** — fix the prompt or schema.
- **Don't auto-merge vibe coding PRs** — human review is mandatory.

---

## Environment Variables

### Railway (n8n)

```bash
# Database (Supabase)
DATABASE_URL=                          # Supabase Postgres connection string
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_HOST=db.xxx.supabase.co
DB_POSTGRESDB_PORT=5432

# n8n Config
N8N_ENCRYPTION_KEY=                    # Generate with: openssl rand -base64 42
N8N_WEBHOOK_URL=                       # Railway app URL

# External Services
ANTHROPIC_API_KEY=                     # Claude API key
GITHUB_TOKEN=                          # For creating issues/PRs
RESEND_API_KEY=                        # Email sending
GOOGLE_APPLICATION_CREDENTIALS=        # GCS service account JSON (base64 or path)
```

### Vercel (Next.js)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=              # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=             # For server-side operations

# n8n Integration
N8N_WEBHOOK_URL=                       # Railway n8n URL for intake form

# GCS (for feed serving, optional)
GCS_BUCKET_NAME=libertas-content
```

---

## Decision Log

When making architectural decisions, document them here:

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-05 | n8n as orchestrator | Low-code, visual debugging, built-in retry logic |
| 2026-01-05 | Postgres for persistence | Reliable, supports JSON, good n8n integration |
| 2026-01-05 | Git-based publishing | Version control, audit trail, works offline |
| 2026-01-06 | Railway for n8n hosting | Simple deployment, managed service, persistent storage, ~$5-20/mo |
| 2026-01-06 | Supabase for database | Managed Postgres + pgvector (no separate vector DB), great API, free tier |
| 2026-01-06 | GCP Cloud Storage | Existing GCP setup, reliable for raw content and feed storage |
| 2026-01-06 | Vercel for static site | Best-in-class Next.js DX, preview deployments, free tier |
| 2026-01-06 | Resend for email | Privacy-friendly, no tracking pixels, modern API |
| 2026-01-06 | Claude API (Anthropic) | Best structured output support, strong coding capability |

---

## Getting Help

- **PRD questions:** See `PRD.md` for full requirements context.
- **Technical details:** See `SPEC.md` for architecture and schemas.
- **Agent behavior:** See `AGENTS.md` for prompts and LLM guidelines.
- **Timeline/scope:** See `ROADMAP.md` for milestones.

---

*This file is the entry point for agentic development. Keep it current.*
