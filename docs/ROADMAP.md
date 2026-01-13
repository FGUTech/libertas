# ROADMAP.md — Project Milestones

> Phased delivery plan for Libertas. No time estimates—focus on dependencies and deliverables.

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 0: Foundation                                                    │
│  Infrastructure, schemas, basic n8n setup                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: MVP                                                           │
│  Daily signals, RSS/JSON feeds, basic publishing                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: Inbound & Ideas                                               │
│  Public intake, project idea generation                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: Enhancement                                                   │
│  Semantic dedupe, digest, email newsletter                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: Automation                                                    │
│  Vibe coding pipeline, advanced features                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Foundation

**Goal:** Establish infrastructure and core patterns.

### Deliverables

- [x] **P0.1** Repository structure created per CLAUDE.md specification
- [x] **P0.2** Database schema deployed (GCP Cloud SQL Postgres + pgvector)
  - `source_items` table
  - `insights` table
  - `project_ideas` table
  - `submissions` table
  - pgvector extension enabled
- [x] **P0.3** n8n instance deployed on managed n8n hosting
- [ ] **P0.4** GCP Cloud Storage bucket configured (`libertas-content`)
- [x] **P0.5** Environment variables documented and secrets configured
- [x] **P0.6** JSON schemas created in `/schemas/`
- [x] **P0.7** Initial prompt templates in `/prompts/`
- [x] **P0.8** Configuration files created
  - `config/sources.yml` with 10 seed sources
  - `config/thresholds.yml` with default values
- [x] **P0.9** Basic test infrastructure
- [ ] **P0.10** Vercel project created and linked to repo
- [ ] **P0.11** Resend account configured with API key

### Exit Criteria

- n8n can connect to GCP Cloud SQL Postgres
- n8n can connect to GCP Cloud Storage
- n8n can make Claude API calls
- Vercel deploys on push to main
- All config files load without errors

### Dependencies

- Managed n8n hosting account configured
- GCP project with Cloud SQL and Cloud Storage enabled
- Firebase project created for auth
- Vercel account linked to GitHub repo
- Resend account created
- Anthropic API key available
- GitHub repo created

---

## Phase 1: MVP — Daily Signals Pipeline

**Goal:** Automated ingestion and publishing of daily signals.

### Deliverables

- [x] **P1.1** Workflow A: Daily Ingestion (core loop)
  - Cron trigger (every 6 hours)
  - RSS feed fetching
  - Web page fetching
  - Content extraction (HTML → text)
  - Hash-based deduplication
  - Store in `source_items`

- [x] **P1.2** LLM Classification integration
  - Classifier agent calling LLM
  - Schema validation of output
  - Scoring and tagging stored

- [x] **P1.3** LLM Summarization integration
  - Summarizer agent for qualifying content
  - TL;DR and bullet generation
  - Insight record creation

- [x] **P1.4** Publishing pipeline
  - Markdown file generation with frontmatter
  - RSS 2.0 feed generation
  - JSON Feed 1.1 generation
  - Git commit automation

- [x] **P1.5** Quality gates
  - Auto-publish for high-confidence items
  - Queue for review otherwise
  - Citation requirement enforcement

- [x] **P1.6** Error handling
  - Retry logic for failed fetches
  - Graceful degradation for source failures
  - Error notifications

- [x] **P1.7** Testing
  - Unit tests for parsing/hashing
  - Golden tests for classifier output
  - Golden tests for summarizer output
  - Feed validation tests

### Exit Criteria

- Workflow runs automatically every 6 hours
- At least 1 signal published per day (with real sources)
- RSS feed validates against RSS 2.0 spec
- JSON feed validates against JSON Feed 1.1 spec
- No duplicate content after multiple runs
- All tests passing

### Dependencies

- Phase 0 complete
- At least 10 seed sources in config
- LLM API configured and tested

---

## Phase 2: Inbound & Ideas

**Goal:** Public intake and project idea generation.

### Deliverables

- [x] **P2.1** Workflow C: Inbound Intake
  - Webhook endpoint `/api/intake`
  - Input validation and sanitization
  - Rate limiting
  - Submission storage

- [x] **P2.2** Intake classification
  - IntakeClassifier agent integration
  - Risk level assessment
  - Category tagging

- [x] **P2.3** GitHub issue creation
  - Issue template formatting
  - Auto-creation from submissions
  - Link back to submission record

- [x] **P2.4** Internal notifications
  - Slack/Matrix/Discord webhook (configurable)
  - Notification for high-risk submissions

- [x] **P2.5** Public intake form
  - Simple HTML form for FGU.tech
  - Safety mode option
  - Clear privacy notice

- [x] **P2.6** Workflow D: Idea Generator
  - Query high-signal insights
  - Pattern detection
  - IdeaSynthesizer agent integration

- [x] **P2.7** Project idea storage and routing
  - ProjectIdea record creation
  - GitHub issue creation for ideas
  - Status tracking

- [x] **P2.8** Testing
  - Webhook endpoint tests
  - Rate limit verification
  - Idea generator golden tests

### Exit Criteria

- Public can submit via web form
- Submissions appear as GitHub issues
- At least 3 project ideas generated per week (with real inputs)
- No PII stored unless explicitly provided
- Rate limiting prevents abuse

### Dependencies

- Phase 1 complete
- GitHub repo/org configured for issues
- Notification channel configured

---

## Phase 3: Enhancement

**Goal:** Improved quality and additional distribution channels.

### Deliverables

- [ ] **P3.1** Semantic deduplication
  - pgvector integration via GCP Cloud SQL
  - Embedding generation for content (Claude API)
  - Similarity threshold checking
  - Near-duplicate detection
  - _Note: Interface exists in `deduper.ts` but returns no-op. Requires pgvector setup._

- [x] **P3.2** Workflow B: Weekly Digest
  - Weekly cron trigger
  - Insight aggregation
  - DigestComposer agent integration
  - Digest publishing

- [x] **P3.3** Email newsletter
  - Resend integration
  - Subscriber management
  - Digest email formatting
  - No tracking pixel verification (Resend default)

- [x] **P3.4** Enhanced classification
  - Multi-source correlation
  - Trend detection
  - Improved scoring calibration

- [ ] **P3.5** Admin dashboard (optional)
  - Review queue interface
  - Manual publish/reject
  - Source health monitoring

- [x] **P3.6** Testing
  - Semantic dedupe accuracy tests
  - Digest generation tests
  - Email deliverability tests

### Exit Criteria

- Weekly digest publishes automatically
- Semantic duplicates detected (< 5% duplicate rate)
- Email newsletter sends without tracking
- Review queue accessible for manual intervention

### Dependencies

- Phase 2 complete
- Vector store provisioned (if using)
- Email infrastructure configured (if using)

---

## Phase 4: Automation

**Goal:** Advanced automation including vibe coding pipeline.

### Deliverables

- [ ] **P4.1** Workflow E: Vibe Coding Pipeline
  - Gate validation logic
  - Category allowlist enforcement
  - Branch creation automation

- [ ] **P4.2** Scaffold generation
  - ScaffoldGenerator agent integration
  - File generation and commit
  - CI workflow inclusion

- [ ] **P4.3** PR automation
  - Draft PR creation
  - Reviewer assignment
  - Status tracking

- [ ] **P4.4** Safety controls
  - Human approval requirement (hard-coded)
  - Audit logging
  - Rollback capability

- [ ] **P4.5** Additional source types
  - Nostr integration (if desired)
  - GitHub repo watching
  - Mailing list ingestion

- [ ] **P4.6** Advanced analytics (privacy-preserving)
  - Aggregate metrics dashboard
  - Workflow success rates
  - Content quality trends

- [ ] **P4.7** Documentation
  - Operator runbook
  - Source onboarding guide
  - Troubleshooting guide

- [ ] **P4.8** Wire JSON schemas for runtime validation
  - Implement `loadSchema()` in `src/utils/validation.ts` (currently stubbed)
  - Replace hand-written validators with AJV-compiled schemas from `/schemas/`
  - Single source of truth: JSON schemas drive both documentation and runtime validation
  - Add tests to ensure schemas and TypeScript types stay in sync
  - _Technical debt: P0.6 created schemas but didn't wire them up_

### Exit Criteria

- Vibe coding creates PRs (never auto-merged)
- All safety gates enforced
- Comprehensive documentation complete
- System runs reliably for 30 consecutive days

### Dependencies

- Phase 3 complete
- Human reviewer process defined
- Full test coverage

---

## Milestone Checklist

### MVP Complete (Phases 0-1)

- [x] Infrastructure deployed
- [x] Daily ingestion running
- [x] Signals publishing to RSS/JSON
- [x] Deduplication working
- [x] Tests passing
- [x] Documentation current

### Full v1 Complete (Phases 0-3)

- [x] All MVP criteria met
- [x] Public intake operational
- [x] Project ideas generating
- [x] Weekly digest publishing
- [ ] Review queue accessible
- [x] Email newsletter functional (if enabled)

### Production Ready (Phases 0-4)

- [ ] All v1 criteria met
- [ ] Vibe coding pipeline gated and working
- [ ] 30-day reliability demonstrated
- [ ] Runbook complete
- [ ] Monitoring and alerting configured

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| X/Twitter API restrictions | High | Medium | Prioritize RSS; treat X as optional |
| LLM rate limits | Medium | High | Caching, fallback models, queue management |
| Source availability | Medium | Medium | Circuit breaker pattern, multiple sources |
| Prompt injection | Medium | High | Input sanitization, output validation |
| Low-quality content published | Medium | Medium | Conservative thresholds, review queue |
| Activist safety incident | Low | Critical | Safety checks, human review, redaction |

---

## Decision Points

Decisions that should be made before proceeding:

### Before Phase 1 ✅ RESOLVED

- [x] Which LLM provider? → **Claude API (Anthropic)** — best structured output support
- [x] Self-hosted n8n or cloud? → **Managed n8n hosting** — dedicated hosting, reduced operational overhead
- [x] Which hosting provider for infrastructure?
  - **Managed n8n hosting** for workflow orchestration
  - **GCP Cloud SQL** for Postgres + pgvector
  - **GCP Cloud Storage** for raw content and feeds
  - **Firebase Auth** for user authentication
  - **Vercel** for Next.js static site
  - **Resend** for email delivery

### Before Phase 2

- [ ] GitHub org for issues/repos? → Likely `FGUTech/libertas`
- [ ] Notification channel preference (Slack/Matrix/Discord)?

### Before Phase 3 ✅ RESOLVED

- [x] Include email newsletter in scope? → **Yes, via Resend**
- [x] Vector store choice? → **pgvector via GCP Cloud SQL** (no separate service needed)

### Before Phase 4

- [ ] Categories allowed for vibe coding?
- [ ] Human reviewer assignment process?

---

## Success Metrics by Phase

### Phase 1 Success

- Workflow success rate ≥ 95%
- ≥ 1 signal/day published
- 0 duplicate content
- RSS/JSON feeds valid

### Phase 2 Success

- Intake → GitHub issue latency < 5 minutes
- ≥ 3 project ideas/week
- 0 PII leaks
- Rate limiting effective

### Phase 3 Success

- < 5% semantic duplicate rate
- Weekly digest published on schedule
- Email unsubscribe works (if applicable)

### Phase 4 Success

- 100% human review on vibe coding PRs
- 30-day uptime ≥ 99%
- Documentation completeness verified

---

## Definition of Done (v1)

The project is v1 complete when:

1. **Workflows A, B, C, D** exist, are exportable, and run reliably
2. **FGU.tech** receives new posts automatically
3. **RSS + JSON feeds** are generated and valid
4. **Inbound form** creates GitHub issues
5. **Provenance** is stored for all content
6. **Deduplication** prevents duplicates
7. **Configuration** is editable without code changes
8. **Documentation** is complete and current

---

*Update this roadmap as phases complete and requirements evolve.*
