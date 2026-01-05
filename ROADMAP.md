# ROADMAP.md — Project Milestones

> Phased delivery plan for FGU Signal Engine. No time estimates—focus on dependencies and deliverables.

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
- [x] **P0.2** Database schema deployed (Postgres)
  - `source_items` table
  - `insights` table
  - `project_ideas` table
  - `submissions` table
- [ ] **P0.3** n8n instance deployed and accessible
- [ ] **P0.4** Object storage configured (S3-compatible)
- [x] **P0.5** Environment variables documented and secrets configured
- [x] **P0.6** JSON schemas created in `/schemas/`
- [x] **P0.7** Initial prompt templates in `/prompts/`
- [x] **P0.8** Configuration files created
  - `config/sources.yml` with 10 seed sources
  - `config/thresholds.yml` with default values
- [x] **P0.9** Basic test infrastructure

### Exit Criteria

- n8n can connect to Postgres
- n8n can connect to object storage
- n8n can make LLM API calls
- All config files load without errors

### Dependencies

- Cloud/hosting environment provisioned
- Database credentials available
- LLM API key available
- GitHub repo created

---

## Phase 1: MVP — Daily Signals Pipeline

**Goal:** Automated ingestion and publishing of daily signals.

### Deliverables

- [ ] **P1.1** Workflow A: Daily Ingestion (core loop)
  - Cron trigger (every 6 hours)
  - RSS feed fetching
  - Web page fetching
  - Content extraction (HTML → text)
  - Hash-based deduplication
  - Store in `source_items`

- [ ] **P1.2** LLM Classification integration
  - Classifier agent calling LLM
  - Schema validation of output
  - Scoring and tagging stored

- [ ] **P1.3** LLM Summarization integration
  - Summarizer agent for qualifying content
  - TL;DR and bullet generation
  - Insight record creation

- [ ] **P1.4** Publishing pipeline
  - Markdown file generation with frontmatter
  - RSS 2.0 feed generation
  - JSON Feed 1.1 generation
  - Git commit automation

- [ ] **P1.5** Quality gates
  - Auto-publish for high-confidence items
  - Queue for review otherwise
  - Citation requirement enforcement

- [ ] **P1.6** Error handling
  - Retry logic for failed fetches
  - Graceful degradation for source failures
  - Error notifications

- [ ] **P1.7** Testing
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

- [ ] **P2.1** Workflow C: Inbound Intake
  - Webhook endpoint `/api/intake`
  - Input validation and sanitization
  - Rate limiting
  - Submission storage

- [ ] **P2.2** Intake classification
  - IntakeClassifier agent integration
  - Risk level assessment
  - Category tagging

- [ ] **P2.3** GitHub issue creation
  - Issue template formatting
  - Auto-creation from submissions
  - Link back to submission record

- [ ] **P2.4** Internal notifications
  - Slack/Matrix/Discord webhook (configurable)
  - Notification for high-risk submissions

- [ ] **P2.5** Public intake form
  - Simple HTML form for FGU.tech
  - Safety mode option
  - Clear privacy notice

- [ ] **P2.6** Workflow D: Idea Generator
  - Query high-signal insights
  - Pattern detection
  - IdeaSynthesizer agent integration

- [ ] **P2.7** Project idea storage and routing
  - ProjectIdea record creation
  - GitHub issue creation for ideas
  - Status tracking

- [ ] **P2.8** Testing
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
  - Vector store integration (pgvector or Qdrant)
  - Embedding generation for content
  - Similarity threshold checking
  - Near-duplicate detection

- [ ] **P3.2** Workflow B: Weekly Digest
  - Weekly cron trigger
  - Insight aggregation
  - DigestComposer agent integration
  - Digest publishing

- [ ] **P3.3** Email newsletter (optional)
  - Listmonk integration
  - Subscriber management
  - Digest email formatting
  - No tracking pixel verification

- [ ] **P3.4** Enhanced classification
  - Multi-source correlation
  - Trend detection
  - Improved scoring calibration

- [ ] **P3.5** Admin dashboard (optional)
  - Review queue interface
  - Manual publish/reject
  - Source health monitoring

- [ ] **P3.6** Testing
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

- [ ] Infrastructure deployed
- [ ] Daily ingestion running
- [ ] Signals publishing to RSS/JSON
- [ ] Deduplication working
- [ ] Tests passing
- [ ] Documentation current

### Full v1 Complete (Phases 0-3)

- [ ] All MVP criteria met
- [ ] Public intake operational
- [ ] Project ideas generating
- [ ] Weekly digest publishing
- [ ] Review queue accessible
- [ ] Email newsletter functional (if enabled)

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

### Before Phase 1

- [ ] Which LLM provider (Anthropic Claude, OpenAI, other)?
- [ ] Self-hosted n8n or cloud?
- [ ] Which hosting provider for infrastructure?

### Before Phase 2

- [ ] GitHub org for issues/repos?
- [ ] Notification channel preference (Slack/Matrix/Discord)?

### Before Phase 3

- [ ] Include email newsletter in scope?
- [ ] Vector store choice (pgvector vs external)?

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
