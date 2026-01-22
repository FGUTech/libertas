# Roadmap

Feature roadmap for Libertas backend infrastructure and n8n workflows, broken into MVP, Nice-to-have, and Future phases.

> **Note:** Website-specific features are tracked in `website/docs/ROADMAP.md`.

---

## Prompt Initialization

Hey, I am working to implement features for the libertas website from the roadmap. Let's continue with implementing:
After completing your implementation of this feature. Please provide a concise but informative step-by-step plan I can follow to test this new feature entirely.

# Phase 2: Nice-to-have

Features that enhance the system but aren't critical for launch.

### 2.0 n8n Migration to Managed Hosting

**Description**: Migrate from Railway-hosted n8n instance to n8n's managed hosting service and connect to GCP Cloud SQL.

**Requirements**:
- [ ] Set up n8n managed hosting account/instance
- [ ] Configure Cloud SQL connection from managed n8n (replace Railway DB)
- [ ] Export workflow JSONs from Railway n8n instance
- [ ] Import Workflow A (Daily Ingestion) to managed n8n
- [ ] Import Workflow B (Weekly Digest) to managed n8n
- [ ] Import Workflow C (Inbound Intake) to managed n8n
- [ ] Import Workflow D (Idea Generator) to managed n8n
- [ ] Set up credentials in new instance (Anthropic API, GitHub API, Resend API)
- [ ] Test each workflow end-to-end in new environment
- [ ] Verify database connectivity and data persistence
- [ ] Update webhook URLs in Vercel/website config
- [ ] Decommission Railway n8n instance after successful migration

**Implementation Notes**:
- Workflows A-D were developed on Railway-hosted n8n; need migration to managed hosting
- Cloud SQL connection string format differs from Railway Postgres
- Credentials will need to be re-entered (encryption keys differ between instances)
- Test with non-production data before switching over
- Keep Railway instance running until migration verified

---

### 2.0a Firebase Authentication Setup

**Description**: Configure Firebase Auth for the platform.

**Requirements**:
- [ ] Create Firebase project and enable Auth
- [ ] Configure email/password authentication provider
- [ ] Set up Firebase environment variables
- [ ] Document auth integration for website team

**Implementation Notes**:
- Firebase project should be in same GCP organization
- Environment vars: `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, etc.

---

### 2.0b Integrate JSON Schemas for Validation

**Description**: Wire `schemas/*.json` for runtime validation of LLM outputs and data.

**Requirements**:
- [ ] Fetch schemas from GitHub raw URLs or website endpoint
- [ ] Validate classifier output against `schemas/source-item.schema.json`
- [ ] Validate insight output against `schemas/insight.schema.json`
- [ ] Validate project idea output against `schemas/project-idea.schema.json`
- [ ] Validate intake submission against `schemas/submission.schema.json`
- [ ] Add validation nodes in workflows after LLM responses
- [ ] Handle validation failures gracefully (log, retry, or queue for review)

**Implementation Notes**:
- Schemas exist but validation currently uses hand-written checks or none
- Use same pattern as ./configs & ./agents use to load from API on site ( done in commits 8a2eaf265b27e093d065e382e48e91958bc1d6d8 & 19384adc6e44d34d60ab036b6714250be27c53ce )
- n8n has built-in JSON Schema validation via Code node or IF node with JSON parse
- Validation catches malformed LLM outputs before database insertion
- Cache schemas; they change rarely

---

### 2.0c Workflow A: Source Health & Error Handling

**Description**: Robust error handling with circuit breaker pattern.

**Requirements**:
- [ ] Enable Update Source Health node (currently disabled)
- [ ] Add error handling nodes with retry logic per source
- [ ] Add node to skip degraded sources (check `source_health` table)
- [ ] Configure circuit breaker: 5 failures → 24hr cooldown (per `thresholds.yml`)

**Implementation Notes**:
- `source_health` table and triggers already exist in schema
- Circuit breaker logic exists but node is disabled

---

### 2.0d Workflow B: Email Newsletter (Resend)

**Description**: Send weekly digest via email using Resend, with config-driven toggle for stub/real mode.

**Requirements**:
- [ ] Set up Resend account with API key
- [ ] Set up n8n credential for Resend API (Bearer token)
- [ ] Add IF node to check `runtime.use_stubs` config value
- [ ] Wire Resend Email Stub and real Resend API node to IF branches
- [ ] Configure subscriber list/audience management
- [ ] Add unsubscribe link handling
- [ ] Verify no tracking pixels in emails (Resend default)
- [ ] Test in both stub and real modes

**Implementation Notes**:
- Email template stub exists and generates proper HTML
- Keep stub for local dev/testing without sending real emails
- Config toggle via `runtime.use_stubs` in `thresholds.yml`
- Resend API endpoint: `https://api.resend.com/emails`
- Consider double opt-in for subscribers

---

### 2.1 Semantic Deduplication

**Description**: Use vector embeddings to detect near-duplicate content.

**Requirements**:
- [ ] Enable pgvector extension in Cloud SQL (already in schema)
- [ ] Generate embeddings for content via Claude API
- [ ] Implement similarity threshold checking (0.85 per `thresholds.yml`)
- [ ] Add near-duplicate detection before insight generation
- [ ] Wire up `deduper.ts` interface (currently returns no-op)

**Implementation Notes**:
- Interface exists in codebase but returns no-op
- pgvector enabled in migration but not utilized
- Consider embedding only title+tldr for efficiency

---

### 2.2 Config Management UI

**Description**: Web UI for editing config files without direct repo access.

**Requirements**:
- [ ] Admin page to view/edit `sources.yml` content
- [ ] Admin page to view/edit `thresholds.yml` content
- [ ] Commit changes back to GitHub via API
- [ ] Preview changes before committing
- [ ] Audit trail via git history

**Implementation Notes**:
- Basic config loading implemented in 1.2 (MVP) via GitHub raw URLs
- This adds a UI layer for non-developers to manage configs
- Uses GitHub API to commit changes (no separate backend needed)
- Alternative: direct file editing via GitHub web UI

---

### 2.3 Additional Source Types

**Description**: Support non-RSS content sources.

**Requirements**:
- [ ] Web scraping for pages without RSS
- [ ] X/Twitter API integration (with rate limit awareness)
- [ ] Nostr relay subscription
- [ ] Email list ingestion (OP_DAILY, Bitcoin mailing list)
- [ ] GitHub repo watching for relevant projects

**Implementation Notes**:
- Source types defined in `sources.yml`: rss, web, x_account, nostr, github, email
- X/Twitter has high API restriction risk; deprioritize
- Email sources require parsing mailing list archives

---

### 2.4 Enhanced Classification Fields

**Description**: Extract additional metadata in classifier.

**Requirements**:
- [ ] Add geo extraction (countries/regions mentioned)
- [ ] Add key_entities extraction (people, orgs, technologies)
- [ ] Store extracted fields in `source_items.metadata`

**Implementation Notes**:
- Classifier prompt can be extended for these fields
- Currently returns empty arrays for geo

---

### 2.5 Cross-topic Pattern Detection

**Description**: Detect patterns spanning multiple topics for idea generation.

**Requirements**:
- [ ] Improve clustering algorithm (currently groups by primary topic only)
- [ ] Identify insights that span multiple themes
- [ ] Feed cross-topic patterns to IdeaSynthesizer

**Implementation Notes**:
- Current clustering in Workflow D is single-topic
- Consider topic co-occurrence analysis

---

### 2.6 Project Idea Deduplication

**Description**: Prevent near-duplicate project proposals.

**Requirements**:
- [ ] Add deduplication check before idea creation
- [ ] Use semantic similarity on problem statements
- [ ] Skip or merge similar proposals

**Implementation Notes**:
- Requires 2.1 (Semantic Deduplication) as foundation

---

### 2.7 Extended Idea Metadata Storage

**Description**: Store additional fields from idea generation.

**Requirements**:
- [ ] Store `technical_dependencies` array
- [ ] Store `suggested_stack` recommendations
- [ ] Store `prior_art` references
- [ ] Store `open_questions` list

**Implementation Notes**:
- These fields are generated by stub but not inserted into DB
- May require schema migration to add columns

---

### 2.8 Idea Creation Notifications

**Description**: Notify team when new project ideas are generated.

**Requirements**:
- [ ] Add notification on idea creation
- [ ] Support Slack, Discord, or email channels
- [ ] Include idea summary and GitHub issue link

**Implementation Notes**:
- Configurable notification channel per `sources.yml` pattern

---

### 2.9 Admin Dashboard

**Description**: Web interface for content review and system monitoring.

**Requirements**:
- [ ] Review queue interface for pending insights
- [ ] Manual publish/reject actions
- [ ] Source health monitoring display
- [ ] Workflow execution status

**Implementation Notes**:
- Could be separate admin section in website
- Or standalone tool (n8n has limited UI capabilities)

---

### 2.10 JSON Schema Runtime Validation

**Description**: Wire JSON schemas for runtime validation throughout system.

**Requirements**:
- [ ] Implement `loadSchema()` in validation utilities
- [ ] Replace hand-written validators with AJV-compiled schemas from `/schemas/`
- [ ] Single source of truth: schemas drive docs and runtime validation
- [ ] Add tests to ensure schemas and TypeScript types stay in sync

**Implementation Notes**:
- Schemas exist in `/schemas/` but aren't wired up
- Technical debt from Phase 0

---

### 2.11 Raw Content Storage (GCS)

**Description**: Archive raw HTML content to GCS for provenance.

**Requirements**:
- [ ] Set up GCS bucket (`libertas-content`)
- [ ] Set up n8n credential for GCP Cloud Storage
- [ ] Add node to store raw HTML at `/raw/{year}/{month}/{day}/{id}.html`
- [ ] Store GCS URL reference in `source_items.raw_content_ref`

**Implementation Notes**:
- Moved from MVP (was 1.7) - not blocking for launch since `extracted_text` is already stored in DB
- More valuable when web scraping (2.3) is implemented for non-RSS sources
- Schema already has `raw_content_ref` column ready
- Use standard storage class (not nearline/coldline) for frequent access
- Consider lifecycle policy to move to coldline after 90 days

---

# Phase 3: Future Improvements

Features for future consideration after core functionality is stable.

### 3.1 Workflow E: Vibe Coding Pipeline

**Description**: Automated code scaffolding from approved project ideas.

**Requirements**:
- Gate validation logic (human approval required)
- Category allowlist enforcement
- Branch creation automation
- ScaffoldGenerator agent integration
- File generation and commit
- Draft PR creation with reviewer assignment
- Audit logging and rollback capability

**Notes**: Human approval is a hard requirement; never auto-merge.

**Implementation Consideration**: The [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) is a strong candidate for the ScaffoldGenerator component. Unlike Workflows A-D (which are content pipelines suited for n8n), Workflow E is a coding task — exactly what the Agent SDK is designed for. It provides autonomous file reading/writing, bash execution (git operations), and PR creation out of the box. Recommended approach: keep n8n as the orchestrator with human approval gates, and call an Agent SDK-based service for the actual code generation step.

---

### 3.2 Social Media Bots

**Description**: Automated posting to social platforms.

**Requirements**:
- Twitter/X bot for insight highlights
- Nostr relay publishing
- LinkedIn professional updates
- TikTok content adaptation (if applicable)

**Notes**: Each platform has different content formatting needs.

---

### 3.3 Self-hosted LLM

**Description**: Run local LLM for cost reduction and privacy.

**Requirements**:
- Evaluate MiniMax or similar models
- Self-hosting infrastructure
- Fallback to Claude for complex tasks
- Performance benchmarking vs Claude

**Notes**: Only pursue if API costs become prohibitive.

---

### 3.4 Nostr Deep Integration

**Description**: Full Nostr protocol support for decentralized publishing.

**Requirements**:
- Cross-post insights to Nostr relays
- Read comments from Nostr
- NIP-05 verification for Libertas identity
- Nostr key management

**Notes**: Aligns with censorship-resistant ethos.

---

### 3.5 Advanced Analytics Dashboard

**Description**: Privacy-preserving system analytics.

**Requirements**:
- Aggregate metrics (no individual tracking)
- Workflow success rates
- Content quality trends over time
- Source reliability metrics

**Notes**: Must maintain no-tracking privacy commitment.

---

### 3.6 Multi-language Content Support

**Description**: Process and publish content in multiple languages.

**Requirements**:
- Language detection in classifier
- Translation pipeline (or language-specific prompts)
- Multi-language feed generation
- RTL support for Arabic/Hebrew sources

**Notes**: Start with Spanish given freedom tech community.

---

### 3.7 Comprehensive Documentation

**Description**: Complete operational documentation.

**Requirements**:
- Operator runbook
- Source onboarding guide
- Troubleshooting guide
- Disaster recovery procedures
- Backup and restore documentation

**Notes**: Critical for team onboarding and incident response.

---

### 3.8 Monitoring and Alerting

**Description**: Production monitoring infrastructure.

**Requirements**:
- Workflow failure alerts
- Database performance monitoring
- API rate limit warnings
- Source degradation notifications

**Notes**: Consider Grafana or similar for dashboards.

---

# Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| n8n Migration to Managed Hosting | High | Medium | P1 |
| Firebase Auth Setup | Medium | Low | P1 |
| JSON Schema Validation | Medium | Medium | P1 |
| Workflow A Source Health & Error Handling | Medium | Medium | P1 |
| Workflow B Email Newsletter | Medium | Low | P1 |
| Semantic Deduplication | Medium | High | P1 |
| Config Management UI | Low | Medium | P1 |
| Additional Source Types | Medium | High | P1 |
| Admin Dashboard | Medium | High | P1 |
| Vibe Coding Pipeline | Low | High | P2 |
| Social Media Bots | Low | High | P2 |
| Self-hosted LLM | Low | High | P2 |

---

# Current State Summary

| Component | Status | Notes |
|-----------|--------|-------|
| n8n Migration | 0% | Workflows on Railway; need migration to managed n8n hosting |
| Database Schema | 100% | Fully implemented with all tables and indexes |
| Agent Prompts (files) | 100% | All 6 agent prompts written in `agents/` |
| Agent Prompts (integration) | 100% | Workflows load prompts from GitHub raw URLs (1.3 complete) |
| Config Files (files) | 100% | sources.yml and thresholds.yml configured |
| Config Files (integration) | 100% | Workflows load config from GitHub raw URLs (1.2 complete) |
| Runtime Stub Toggle | 80% | `runtime.use_stubs` in thresholds.yml; Workflow A (classify, summarize, publish), B (digest composer, GitHub), D (idea synthesizer, GitHub) wired with IF nodes |
| JSON Schemas (files) | 100% | All schemas exist in `schemas/` |
| JSON Schemas (validation) | 25% | Workflow A has inline validation; other workflows pending |
| Workflow A Structure | 100% | Complete pipeline with stub/real toggle for classify, summarize, and feed publishing |
| Workflow B Structure | 100% | Complete pipeline with stub/real toggle for DigestComposer and GitHub publishing via Git Data API |
| Workflow C Structure | 95% | Story (1.13a) and Project (1.13b) intake complete with stub/real toggle; Feedback (1.13c) pending |
| Workflow D Structure | 95% | Complete pipeline with stub/real toggle for IdeaSynthesizer and GitHub issue creation; error handling included |
| Firebase Auth | 0% | Documented but not implemented |
| Resend Email | 20% | Template exists, API not wired, need IF toggle |
| Feed Generation | 100% | RSS 2.0 and JSON Feed 1.1 generation implemented in Workflow A (1.6 complete) |

---

# Decision Points

### Before MVP Launch

- [ ] GitHub org for issues/repos (likely `FGUTech/libertas`)
- [ ] Notification channel preference (Slack/Matrix/Discord)
- [ ] Subscriber list management strategy

### Before Phase 2

- [ ] Vector embedding model selection (Claude vs dedicated embedding model)
- [ ] Source expansion priority order

### Before Phase 3

- [ ] Categories allowed for vibe coding
- [ ] Human reviewer assignment process
- [ ] Social platform account ownership

---

*Last updated based on codebase analysis. Update as phases complete.*
