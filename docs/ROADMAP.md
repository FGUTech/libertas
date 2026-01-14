# Roadmap

Feature roadmap for Libertas backend infrastructure and n8n workflows, broken into MVP, Nice-to-have, and Future phases.

> **Note:** Website-specific features are tracked in `website/docs/ROADMAP.md`.

---

## Prompt Initialization

Hey, I am working to implement features for the libertas website from the roadmap. Let's continue with implementing:

# Phase 1: MVP

Core infrastructure and workflow features required for initial launch.

## Runtime Configuration Pattern

All workflows use a config-driven stub toggle via `thresholds.yml`:

```yaml
# Runtime Settings
runtime:
  # Set to true for local dev/testing (uses stubs, no API calls)
  # Set to false for production (uses real Claude, GitHub, Resend APIs)
  use_stubs: true
```

**How it works:**
- Each workflow has IF nodes that check `runtime.use_stubs`
- When `true`: Routes to stub nodes (no API costs, safe for testing)
- When `false`: Routes to real API nodes (Claude, GitHub, Resend)
- Toggle by committing change to `thresholds.yml`

This pattern is implemented across: 1.5, 1.6, 1.9, 1.10, 1.11, 1.13, 1.14, 1.15

### 1.0 n8n Migration to Managed Hosting

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

### 1.1 Firebase Authentication Setup

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

### 1.4 Integrate JSON Schemas for Validation

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

### 1.5 Workflow A: Claude API Integration ✅

**Description**: Replace classification and summarization stubs with real Claude API calls, with config-driven toggle for stub/real mode.

**Requirements**:
- [x] Add `use_stubs` config to `thresholds.yml` under new `runtime` section
- [x] Set up n8n credential for Anthropic API (Header Auth with x-api-key)
- [x] Add IF node to check `runtime.use_stubs` config value
- [x] Wire Classify Stub and real Claude API node to IF branches
- [x] Wire Summarize Stub and real Claude API node to IF branches
- [x] Real Claude nodes load prompts from `agents/classify.md` and `agents/summarize.md`
- [x] Validate output against JSON schemas (per 1.4)
- [x] Test with golden test cases in both stub and real modes

**Implementation Notes**:
- Claude API nodes exist but are disabled; wire to IF node instead of deleting
- Keep stubs functional for local dev/testing without API costs
- Use structured output mode for reliable JSON parsing
- Config toggle allows switching modes via `thresholds.yml` commit

---

### 1.6 Workflow A: Feed Publishing

**Description**: Generate and publish RSS/JSON feeds for consumed content, with config-driven toggle for stub/real mode.

**Requirements**:
- [ ] Add node to generate/update RSS feed (`/rss.xml`)
- [ ] Add node to generate/update JSON feed (`/feed.json`)
- [ ] Add IF node to check `runtime.use_stubs` config value
- [ ] Wire GitHub Commit Stub and real GitHub API node to IF branches
- [ ] Real GitHub node commits published insights to repo as markdown files
- [ ] Set up n8n credential for GitHub API (Bearer token)
- [ ] Validate RSS 2.0 and JSON Feed 1.1 compliance

**Implementation Notes**:
- Feeds should include all published insights with status='published'
- Markdown files go in `/content/insights/{year}/{month}/{slug}.md`
- Use frontmatter format matching website expectations
- Keep stub for local dev/testing without GitHub commits
- Config toggle via `runtime.use_stubs` in `thresholds.yml`

---

### 1.7 Workflow A: Raw Content Storage

**Description**: Archive raw HTML content to GCS for provenance.

**Requirements**:
- [ ] Set up GCS bucket (`libertas-content`)
- [ ] Set up n8n credential for GCP Cloud Storage
- [ ] Add node to store raw HTML at `/raw/{year}/{month}/{day}/{id}.html`
- [ ] Store GCS URL reference in `source_items.metadata`

**Implementation Notes**:
- Use standard storage class (not nearline/coldline) for frequent access
- Consider lifecycle policy to move to coldline after 90 days

---

### 1.8 Workflow A: Source Health & Error Handling

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

### 1.9 Workflow B: Claude API Integration ✅

**Description**: Replace digest composer stub with real Claude API, with config-driven toggle for stub/real mode.

**Requirements**:
- [x] Add IF node to check `runtime.use_stubs` config value
- [x] Wire DigestComposer Stub and real Claude API node to IF branches
- [x] Real Claude node uses `agents/digest.md` prompt
- [x] Set up n8n credential for Anthropic API (if not already from 1.5)
- [x] Include emerging patterns and trend detection in prompt
- [x] Validate digest output structure
- [ ] Test in both stub and real modes

**Implementation Notes**:
- DigestComposer node exists but is disabled; wire to IF node instead of deleting
- Keep stub for local dev/testing without API costs
- Config toggle via `runtime.use_stubs` in `thresholds.yml`
- Consider fallback if Claude API fails (publish digest without LLM enhancement)

**Lessons from 1.5 Implementation**:
- Claude returns JSON wrapped in markdown code blocks (` ```json...``` `). Parsing code must strip these before `JSON.parse()`:
  ```javascript
  text = text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  ```
- n8n blocks `$env` variable access - hardcode URLs (e.g., `https://libertas.fgu.tech/api/...`) instead of `$env.WEBSITE_URL`
- When fetching multiple configs/prompts in parallel, use chained Merge nodes (mode: "append") to wait for all results before processing
- Thread `runtime.use_stubs` through the entire workflow chain - ensure it's included in data passed between nodes
- Anthropic credential setup: Header Auth type, Name = `x-api-key`, Value = API key
- Node positions need ~200px horizontal spacing to avoid label overlap in n8n UI

---

### 1.10 Workflow B: GitHub Publishing

**Description**: Commit weekly digests to GitHub repository, with config-driven toggle for stub/real mode.

**Requirements**:
- [ ] Add IF node to check `runtime.use_stubs` config value
- [ ] Wire GitHub Commit Stub and real GitHub API node to IF branches
- [ ] Set up n8n credential for GitHub API (Bearer token)
- [ ] Handle file update case (fetch existing file SHA for updates)
- [ ] Commit digest markdown to `/content/digests/weekly-{date}.md`
- [ ] Update feed files alongside digest commit
- [ ] Test in both stub and real modes

**Implementation Notes**:
- GitHub API requires SHA of existing file for updates
- Keep stub for local dev/testing without GitHub commits
- Config toggle via `runtime.use_stubs` in `thresholds.yml`
- Consider atomic commit of digest + updated feeds

---

### 1.11 Workflow B: Email Newsletter (Resend)

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

### 1.12 Workflow B: Project Ideas in Digest

**Description**: Include generated project ideas in weekly digest.

**Requirements**:
- [ ] Re-add Query Recent Project Ideas node
- [ ] Wire project ideas into DigestComposer input
- [ ] Include "Project Ideas Generated This Week" section in digest output

**Implementation Notes**:
- Query `project_ideas` table for items with `created_at` in digest period
- Only include ideas with status='pending' or 'approved'

---

### 1.13 Workflow C: API Integration Verification

**Description**: Complete intake workflow API integrations, with config-driven toggle for stub/real mode.

**Requirements**:
- [x] Webhook endpoint functional (implemented)
- [x] Database insertion working (implemented)
- [ ] Set up n8n credential for Anthropic API (Header Auth with x-api-key)
- [ ] Set up n8n credential for GitHub API (Bearer token)
- [ ] Add IF node to check `runtime.use_stubs` config value
- [ ] Wire Classify Stub and real Claude API node to IF branches (use `agents/intake-classify.md`)
- [ ] Wire GitHub Issue Stub and real GitHub API node to IF branches
- [ ] Populate `priority`, `is_spam`, `requires_response` fields via LLM classification
- [ ] Add rate limiting node after webhook (prevent abuse)
- [ ] Add error handling nodes with retry logic
- [ ] Test in both stub and real modes

**Implementation Notes**:
- This workflow is marked active (`"active": true`)
- Keep stubs for local dev/testing without API costs
- Config toggle via `runtime.use_stubs` in `thresholds.yml`
- Credentials may be shared with Workflow A (1.5) and Workflow D (1.14) if already configured

**Lessons from 1.5 Implementation**:
- Claude returns JSON wrapped in markdown code blocks (` ```json...``` `). Parsing code must strip these before `JSON.parse()`:
  ```javascript
  text = text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  ```
- n8n blocks `$env` variable access - hardcode URLs (e.g., `https://libertas.fgu.tech/api/...`) instead of `$env.WEBSITE_URL`
- When fetching multiple configs/prompts in parallel, use chained Merge nodes (mode: "append") to wait for all results before processing
- Thread `runtime.use_stubs` through the entire workflow chain - ensure it's included in data passed between nodes
- Anthropic credential setup: Header Auth type, Name = `x-api-key`, Value = API key
- Node positions need ~200px horizontal spacing to avoid label overlap in n8n UI

---

### 1.13a Workflow C: Story Intake Processing

**Description**: Process "story" type submissions through the content pipeline to generate insights.

**Requirements**:
- [ ] Add conditional branch in Workflow C to detect `type: 'story'` submissions
- [ ] Route story submissions to classification step (reuse `agents/classify.md` or create `agents/intake-story-classify.md`)
- [ ] Classification uses `runtime.use_stubs` toggle (shares IF node pattern from 1.13)
- [ ] Extract and validate `sourceUrl` if provided; fetch source content for classification
- [ ] Score story for `freedom_relevance_score` and `credibility_score`
- [ ] If scores meet threshold (per `thresholds.yml`), queue for insight generation via Workflow A pipeline
- [ ] Store `region` field in `source_items.metadata.geo` if provided
- [ ] GitHub issue creation uses `runtime.use_stubs` toggle (shares IF node pattern from 1.13)
- [ ] Update submission status to `triaged` after processing

**Implementation Notes**:
- Stories from the public are treated similar to external sources but with extra verification
- `sourceUrl` provides provenance; stories without URLs need manual verification
- Consider lower auto-publish threshold for community-submitted stories (require editorial review)
- Link resulting insight back to original submission via `source_item_ids`
- Inherits stub/real toggle from parent 1.13 workflow

---

### 1.13b Workflow C: Project Idea Intake Processing

**Description**: Process "project" type submissions as community-sourced project ideas.

**Requirements**:
- [ ] Add conditional branch in Workflow C to detect `type: 'project'` submissions
- [ ] Map submission fields to `project_ideas` schema:
  - `title` → used in GitHub issue title
  - `problemStatement` → `problem_statement`
  - `description` → `proposed_solution`
- [ ] Claude API evaluation uses `runtime.use_stubs` toggle (shares IF node pattern from 1.13):
  - Generate `threat_model` from problem statement
  - Identify `affected_groups`
  - Assess `feasibility_score` and `impact_score`
  - Flag `misuse_risks`
  - Suggest `technical_dependencies` and `suggested_stack`
- [ ] Create or extend `agents/intake-project-evaluate.md` prompt for project idea assessment
- [ ] Insert into `project_ideas` table with `status: 'new'`
- [ ] GitHub issue creation uses `runtime.use_stubs` toggle (shares IF node pattern from 1.13)
- [ ] Update `project_ideas.github_issue_url` with created issue URL
- [ ] Update submission status to `triaged` after processing

**Implementation Notes**:
- Community project ideas follow same schema as auto-generated ideas from Workflow D
- Add `community-submitted` label to distinguish from auto-generated ideas
- Consider expedited review path for high-impact submissions (`urgency: 'urgent'`)
- Link `project_ideas.derived_from_insight_ids` to any related insights if submission references existing content
- Inherits stub/real toggle from parent 1.13 workflow

---

### 1.13c Workflow C: Feedback Intake Processing

**Description**: Process "feedback" type submissions to create GitHub issues for platform improvements.

**Requirements**:
- [ ] Add conditional branch in Workflow C to detect `type: 'feedback'` submissions
- [ ] Map `category` field to GitHub issue labels:
  - `bug` → labels: `bug`, `feedback`
  - `feature` → labels: `enhancement`, `feedback`
  - `content` → labels: `content`, `feedback`
  - `other` → labels: `feedback`, `triage-needed`
- [ ] Claude API assessment uses `runtime.use_stubs` toggle (shares IF node pattern from 1.13):
  - Detect spam/abuse and set `is_spam` flag
  - Assess priority based on content severity
  - Extract actionable items from message
  - Suggest appropriate assignees or project areas
- [ ] GitHub issue creation uses `runtime.use_stubs` toggle (shares IF node pattern from 1.13):
  - `bug`/`feature` → main Libertas repo
  - `content` → potentially separate content issues or same repo with label
- [ ] Format issue body with:
  - Original feedback message
  - Submission ID for reference
  - Contact email (if provided and user consented to follow-up)
  - Category and priority assessment
- [ ] Update submission status to `triaged` after issue creation
- [ ] If `requires_response: true`, add to response queue

**Implementation Notes**:
- Feedback submissions do NOT generate insights or project ideas
- Use simpler processing path than story/project types
- Spam detection is critical for this intake type (public feedback forms attract abuse)
- Consider auto-closing duplicate issues if similar feedback already exists
- Inherits stub/real toggle from parent 1.13 workflow

---

### 1.14 Workflow D: Claude API Integration

**Description**: Replace idea synthesizer stub with real Claude API, with config-driven toggle for stub/real mode.

**Requirements**:
- [x] Set up n8n credential for Anthropic API (Header Auth with x-api-key)
- [x] Add IF node to check `runtime.use_stubs` config value
- [x] Wire IdeaSynthesizer Stub and real Claude API node to IF branches (use `agents/generate-idea.md` prompt)
- [x] Validate generated idea against project_idea schema
- [x] Handle empty clusters edge case gracefully
- [x] Add logging/alerting for failed LLM calls
- [x] Add error handling nodes with retry logic
- [ ] Test in both stub and real modes

**Implementation Notes**:
- Stub currently generates complete proposals with threat_model, MVP scope
- Keep stub for local dev/testing without API costs
- Config toggle via `runtime.use_stubs` in `thresholds.yml`
- Real API should maintain same output structure
- Credentials may be shared with Workflow A (1.5) and Workflow C (1.13) if already configured

**Lessons from 1.5 Implementation**:
- Claude returns JSON wrapped in markdown code blocks (` ```json...``` `). Parsing code must strip these before `JSON.parse()`:
  ```javascript
  text = text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  ```
- n8n blocks `$env` variable access - hardcode URLs (e.g., `https://libertas.fgu.tech/api/...`) instead of `$env.WEBSITE_URL`
- When fetching multiple configs/prompts in parallel, use chained Merge nodes (mode: "append") to wait for all results before processing
- Thread `runtime.use_stubs` through the entire workflow chain - ensure it's included in data passed between nodes
- Anthropic credential setup: Header Auth type, Name = `x-api-key`, Value = API key
- Node positions need ~200px horizontal spacing to avoid label overlap in n8n UI

---

### 1.15 Workflow D: GitHub Issue Creation

**Description**: Create GitHub issues for generated project ideas, with config-driven toggle for stub/real mode.

**Requirements**:
- [ ] Add IF node to check `runtime.use_stubs` config value
- [ ] Wire GitHub Issue Stub and real GitHub API node to IF branches
- [ ] Set up n8n credential for GitHub API (if not already)
- [ ] Configure labels (currently hardcoded: `project-idea`, `auto-generated`)
- [ ] Link derived insights in issue body to actual published URLs
- [ ] Update `project_ideas.github_issue_url` with created issue URL
- [ ] Test in both stub and real modes

**Implementation Notes**:
- Keep stub for local dev/testing without GitHub API calls
- Config toggle via `runtime.use_stubs` in `thresholds.yml`
- Consider adding assignees or project board integration
- Issue template should include problem statement, threat model, MVP scope

---

### 1.16 Vercel Deployment

**Description**: Configure Vercel project for automatic deployments.

**Requirements**:
- [ ] Create Vercel project linked to GitHub repo
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up automatic deploys on push to main
- [ ] Configure preview deployments for PRs

**Implementation Notes**:
- Website is in `/website` subdirectory; configure root directory in Vercel
- Required env vars documented in `.env.example`

---

# Phase 2: Nice-to-have

Features that enhance the system but aren't critical for launch.

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
| n8n Migration to Managed Hosting | Critical | Medium | P0 |
| Firebase Auth Setup | High | Low | P0 |
| Config Files Integration | High | Medium | P0 |
| Agent Prompts Integration | High | Medium | P0 |
| JSON Schema Validation | High | Medium | P0 |
| Workflow A Claude Integration | High | Medium | P0 |
| Workflow A Feed Publishing | High | Medium | P0 |
| Workflow B Email Newsletter | High | Low | P0 |
| Workflow C Story Intake (1.13a) | Medium | Medium | P0 |
| Workflow C Project Intake (1.13b) | Medium | Medium | P0 |
| Workflow C Feedback Intake (1.13c) | Medium | Low | P0 |
| Workflow D GitHub Issues | Medium | Low | P0 |
| Vercel Deployment | High | Low | P0 |
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
| Runtime Stub Toggle | 50% | `runtime.use_stubs` in thresholds.yml; Workflow A & B wired with IF nodes |
| JSON Schemas (files) | 100% | All schemas exist in `schemas/` |
| JSON Schemas (validation) | 25% | Workflow A has inline validation; other workflows pending |
| Workflow A Structure | 95% | Complete pipeline with stub/real toggle, validation nodes, pending golden tests |
| Workflow B Structure | 95% | Complete pipeline with stub/real toggle for DigestComposer, pending testing |
| Workflow C Structure | 90% | Active workflow, needs IF toggle for APIs |
| Workflow D Structure | 80% | Complete pipeline, stubs active, need IF toggle |
| Firebase Auth | 0% | Documented but not implemented |
| GCS Integration | 0% | Not implemented |
| Resend Email | 20% | Template exists, API not wired, need IF toggle |
| Feed Generation | 10% | Doc page exists, endpoints missing |

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
