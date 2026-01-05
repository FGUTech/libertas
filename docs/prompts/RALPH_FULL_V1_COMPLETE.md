# Ralph Prompt: Full v1 Complete (Phases 0-3)

> Run with: `/ralph-loop` using the prompt below

## Usage

```bash
/ralph-loop "<paste prompt below>" --max-iterations 100 --completion-promise "V1_COMPLETE"
```

---

## Prompt

```
You are building the FGU Signal Engine — a fully automated, privacy-preserving research and publishing platform for Freedom Tech.

## Context Files (READ FIRST)

Before ANY work, read these files in order:
1. CLAUDE.md — Project identity, conventions, anti-patterns
2. SPEC.md — Technical architecture, data models, APIs
3. AGENTS.md — LLM agent prompts and schemas
4. ROADMAP.md — Phase definitions and exit criteria
5. PRD.md — Full product requirements

## Your Mission

Complete **Full v1 (Phases 0-3)** as defined in ROADMAP.md:

### Phase 0: Foundation
- Repository structure per CLAUDE.md
- Database schemas deployed (Postgres)
- n8n instance configuration
- JSON schemas in /schemas/
- Prompt templates in /prompts/
- Config files (sources.yml, thresholds.yml)
- Basic test infrastructure

### Phase 1: MVP — Daily Signals Pipeline
- Workflow A: Daily Ingestion (cron, fetch, extract, dedupe, classify, summarize, publish)
- RSS 2.0 feed generation
- JSON Feed 1.1 generation
- Markdown post generation with frontmatter
- Quality gates (auto-publish vs queue for review)
- Error handling with retries
- Unit tests, golden tests, feed validation tests

### Phase 2: Inbound & Ideas
- Workflow C: Inbound Intake (webhook, validate, store, classify, GitHub issue)
- Workflow D: Project Idea Generator (query insights, synthesize ideas, create issues)
- Public intake form HTML
- Rate limiting
- Internal notifications

### Phase 3: Enhancement
- Semantic deduplication (vector embeddings)
- Workflow B: Weekly Digest (aggregate, compose, publish, email optional)
- Enhanced classification

## Work Process

Each iteration:
1. Check git status and recent commits to see current progress
2. Read ROADMAP.md to identify next incomplete deliverable
3. Implement that deliverable following SPEC.md and AGENTS.md
4. Write or update tests
5. Run tests and fix any failures
6. Commit working code with descriptive message
7. Update ROADMAP.md checkboxes for completed items
8. If blocked, document in docs/BLOCKERS.md and proceed to next item

## File Organization

Create files following this structure:
```
fgu-signal-engine/
├── schemas/                 # JSON schemas for data models
│   ├── source-item.schema.json
│   ├── insight.schema.json
│   ├── project-idea.schema.json
│   └── submission.schema.json
├── prompts/                 # LLM prompt templates
│   ├── classify.md
│   ├── summarize.md
│   ├── generate-idea.md
│   └── digest.md
├── config/
│   ├── sources.yml          # Seed sources (10-30 sources)
│   └── thresholds.yml       # Scoring thresholds
├── n8n/
│   └── workflows/           # Exported n8n workflow JSON files
├── site-content/
│   ├── posts/               # Published markdown posts
│   ├── rss.xml
│   └── feed.json
├── scripts/                 # Utility scripts
│   ├── setup-db.sql         # Database initialization
│   ├── generate-feeds.ts    # Feed generation
│   └── validate-schemas.ts  # Schema validation
├── src/                     # Source code
│   ├── lib/                 # Shared utilities
│   ├── agents/              # Agent implementations
│   └── workflows/           # Workflow helpers
├── tests/
│   ├── unit/
│   ├── integration/
│   └── golden/              # LLM output snapshots
└── public/
    └── intake-form.html     # Public submission form
```

## Technical Requirements

- TypeScript for all scripts and utilities
- n8n workflows as JSON exports (manually importable)
- PostgreSQL schemas with proper indexes
- All LLM outputs validated against JSON schemas
- Idempotent operations (no duplicates on re-run)
- Privacy-first (no tracking, minimal logs)

## Commit Strategy

Make atomic commits after each logical unit:
- One commit per schema file
- One commit per workflow
- One commit per test suite
- Always run tests before committing

## Exit Criteria Checklist

Before outputting completion, verify ALL of these:

### Phase 0
[ ] /schemas/ contains all 4 JSON schema files
[ ] /prompts/ contains all 4 prompt template files
[ ] /config/sources.yml has 10+ seed sources
[ ] /config/thresholds.yml has all threshold values
[ ] /scripts/setup-db.sql creates all tables with indexes
[ ] package.json exists with dependencies

### Phase 1
[ ] n8n/workflows/ contains Workflow A export
[ ] Classifier agent prompt matches AGENTS.md spec
[ ] Summarizer agent prompt matches AGENTS.md spec
[ ] Feed generation produces valid RSS 2.0
[ ] Feed generation produces valid JSON Feed 1.1
[ ] Markdown posts include frontmatter per SPEC.md
[ ] Deduplication by hash implemented
[ ] tests/golden/ has classifier and summarizer test cases
[ ] All tests pass

### Phase 2
[ ] n8n/workflows/ contains Workflow C export
[ ] n8n/workflows/ contains Workflow D export
[ ] public/intake-form.html exists and posts to webhook
[ ] IntakeClassifier prompt matches AGENTS.md spec
[ ] IdeaSynthesizer prompt matches AGENTS.md spec
[ ] GitHub issue templates defined
[ ] Rate limiting logic documented

### Phase 3
[ ] n8n/workflows/ contains Workflow B export
[ ] DigestComposer prompt matches AGENTS.md spec
[ ] Vector embedding integration documented
[ ] Semantic similarity threshold configured
[ ] Weekly digest template in /prompts/

## Completion Signal

When ALL exit criteria are met:
1. Run all tests one final time
2. Update ROADMAP.md with all checkboxes checked for Phases 0-3
3. Create a final commit: "Complete Full v1 (Phases 0-3)"
4. Output exactly: <promise>V1_COMPLETE</promise>

## If Stuck

If you cannot proceed on a deliverable:
1. Document the blocker in docs/BLOCKERS.md with:
   - What you tried
   - Why it failed
   - What external input is needed
2. Skip to the next deliverable
3. After 80 iterations without completion, output:
   - Summary of completed items
   - List of remaining items
   - Blockers encountered
   - Then: <promise>V1_COMPLETE</promise>

## Hard Rules

- NEVER skip reading context files at start of each iteration
- NEVER commit code that doesn't pass tests
- NEVER publish without citations
- NEVER store secrets in code
- NEVER add tracking or analytics
- ALWAYS validate LLM output against schemas
- ALWAYS commit after completing each deliverable
```

---

## Notes for Operator

### Before Running

1. Ensure n8n is accessible (or mock it for local dev)
2. Ensure Postgres is available (or use SQLite for prototyping)
3. Ensure LLM API key is configured
4. Ensure GitHub token is available for issue creation

### Monitoring

Watch for:
- Repeated failures on same deliverable (may need intervention)
- Blockers accumulating in docs/BLOCKERS.md
- Test failures that persist across iterations

### Intervention Points

Stop and intervene if:
- Same error appears 5+ consecutive iterations
- BLOCKERS.md has 3+ unresolved items
- No commits for 10+ iterations

### Expected Iteration Count

- Phase 0: ~10-15 iterations
- Phase 1: ~30-40 iterations
- Phase 2: ~20-25 iterations
- Phase 3: ~15-20 iterations
- Total: ~75-100 iterations

Set `--max-iterations 100` as safety limit.
