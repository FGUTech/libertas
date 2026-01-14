# Roadmap

Feature roadmap for Libertas backend infrastructure and n8n workflows, broken into MVP, Nice-to-have, and Future phases.

> **Note:** Website-specific features are tracked in `website/docs/ROADMAP.md`.

---

# Phase 1: MVP

Core infrastructure and workflow features required for initial launch.

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

### 1.2 Integrate Config Files into Workflows

**Description**: Wire `config/sources.yml` and `config/thresholds.yml` into n8n workflows.

**Requirements**:
- [ ] Fetch `sources.yml` from GitHub raw URL or website endpoint
- [ ] Replace hardcoded source list in Workflow A with dynamic source loading
- [ ] Fetch `thresholds.yml` values for scoring gates (relevance >= 70, credibility >= 60)
- [ ] Load `thresholds.yml` values for circuit breaker settings (5 failures, 24hr cooldown)
- [ ] Load `thresholds.yml` values for idea generation thresholds (relevance >= 80)
- [ ] Load `thresholds.yml` rate limiting values for intake webhook
- [ ] Parse YAML in n8n (use Code node or HTTP + yaml parser)

**Implementation Notes**:
- Currently Workflow A has 6 hardcoded sources; `sources.yml` defines 10
- Threshold values are hardcoded throughout workflows instead of reading from config
- **Option A**: GitHub raw URL (e.g., `https://raw.githubusercontent.com/{org}/libertas/main/config/sources.yml`)
- **Option B**: Next.js API route that reads and serves the config files as JSON
- **Option C**: Symlink/copy configs to `website/public/` for static serving
- Config changes require git push but not workflow redeployment

---

### 1.3 Integrate Agent Prompts into Workflows

**Description**: Load agent prompts from `agents/*.md` files for Claude API calls.

**Requirements**:
- [ ] Fetch prompt templates from GitHub raw URLs or website endpoint
- [ ] Workflow A: Load `agents/classify.md` for classifier prompt
- [ ] Workflow A: Load `agents/summarize.md` for summarizer prompt
- [ ] Workflow B: Load `agents/digest.md` for digest composer prompt
- [ ] Workflow C: Load `agents/intake-classify.md` for intake classification prompt
- [ ] Workflow D: Load `agents/generate-idea.md` for idea synthesizer prompt
- [ ] Cache prompts in workflow (avoid fetching on every item)

**Implementation Notes**:
- Agent prompts exist but aren't loaded dynamically; currently would need copy/paste into n8n nodes
- **Option A**: GitHub raw URL (e.g., `https://raw.githubusercontent.com/{org}/libertas/main/agents/classify.md`)
- **Option B**: Next.js API route that serves prompt files
- **Option C**: Symlink/copy to `website/public/agents/` for static serving
- Prompt updates via git push; no workflow changes needed
- `agents/AGENTS.md` contains prompt engineering guidelines for reference

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
- **Option A**: GitHub raw URL (e.g., `https://raw.githubusercontent.com/{org}/libertas/main/schemas/insight.schema.json`)
- **Option B**: Next.js API route or static serving from `website/public/schemas/`
- n8n has built-in JSON Schema validation via Code node or IF node with JSON parse
- Validation catches malformed LLM outputs before database insertion
- Cache schemas; they change rarely

---

### 1.5 Workflow A: Claude API Integration

**Description**: Replace classification and summarization stubs with real Claude API calls.

**Requirements**:
- [ ] Set up n8n credential for Anthropic API (Header Auth with x-api-key)
- [ ] Swap Classify Stub → real Claude API HTTP request (load from `agents/classify.md`)
- [ ] Swap Summarize Stub → real Claude API HTTP request (load from `agents/summarize.md`)
- [ ] Validate output against JSON schemas (per 1.4)
- [ ] Test with golden test cases

**Implementation Notes**:
- Claude API nodes exist but are disabled; enable by setting `disabled: false`
- Use structured output mode for reliable JSON parsing
- Current stub uses keyword-based fallback classifier
- Depends on 1.3 (agent prompt loading) and 1.4 (schema validation)

---

### 1.6 Workflow A: Feed Publishing

**Description**: Generate and publish RSS/JSON feeds for consumed content.

**Requirements**:
- [ ] Add node to generate/update RSS feed (`/rss.xml`)
- [ ] Add node to generate/update JSON feed (`/feed.json`)
- [ ] Add node to commit published insights to GitHub repo as markdown files
- [ ] Set up n8n credential for GitHub API (Bearer token)
- [ ] Validate RSS 2.0 and JSON Feed 1.1 compliance

**Implementation Notes**:
- Feeds should include all published insights with status='published'
- Markdown files go in `/content/insights/{year}/{month}/{slug}.md`
- Use frontmatter format matching website expectations

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

### 1.9 Workflow B: Claude API Integration

**Description**: Replace digest composer stub with real Claude API.

**Requirements**:
- [ ] Swap DigestComposer Stub → real Claude API HTTP request (use `agents/digest.md` prompt)
- [ ] Set up n8n credential for Anthropic API (if not already from 1.5)
- [ ] Include emerging patterns and trend detection in prompt
- [ ] Validate digest output structure

**Implementation Notes**:
- DigestComposer node exists but is disabled; stub is active
- Consider fallback if Claude API fails (publish digest without LLM enhancement)

---

### 1.10 Workflow B: GitHub Publishing

**Description**: Commit weekly digests to GitHub repository.

**Requirements**:
- [ ] Swap GitHub Commit Stub → real GitHub API HTTP request
- [ ] Set up n8n credential for GitHub API (Bearer token)
- [ ] Handle file update case (fetch existing file SHA for updates)
- [ ] Commit digest markdown to `/content/digests/weekly-{date}.md`
- [ ] Update feed files alongside digest commit

**Implementation Notes**:
- GitHub API requires SHA of existing file for updates
- Consider atomic commit of digest + updated feeds

---

### 1.11 Workflow B: Email Newsletter (Resend)

**Description**: Send weekly digest via email using Resend.

**Requirements**:
- [ ] Set up Resend account with API key
- [ ] Set up n8n credential for Resend API (Bearer token)
- [ ] Swap Resend Email Stub → real Resend API HTTP request
- [ ] Configure subscriber list/audience management
- [ ] Add unsubscribe link handling
- [ ] Verify no tracking pixels in emails (Resend default)

**Implementation Notes**:
- Email template stub exists and generates proper HTML
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

**Description**: Complete intake workflow API integrations.

**Requirements**:
- [x] Webhook endpoint functional (implemented)
- [x] Database insertion working (implemented)
- [ ] Set up n8n credential for Anthropic API (Header Auth with x-api-key)
- [ ] Set up n8n credential for GitHub API (Bearer token)
- [ ] Swap Classify Stub → real Claude API HTTP request (use `agents/intake-classify.md`)
- [ ] Swap GitHub Issue Stub → real GitHub API HTTP request
- [ ] Populate `priority`, `is_spam`, `requires_response` fields via LLM classification
- [ ] Add rate limiting node after webhook (prevent abuse)
- [ ] Add error handling nodes with retry logic

**Implementation Notes**:
- This workflow is marked active (`"active": true`)
- Credentials may be shared with Workflow A (1.5) and Workflow D (1.15) if already configured

---

### 1.13a Workflow C: Story Intake Processing

**Description**: Process "story" type submissions through the content pipeline to generate insights.

**Requirements**:
- [ ] Add conditional branch in Workflow C to detect `type: 'story'` submissions
- [ ] Route story submissions to classification step (reuse `agents/classify.md` or create `agents/intake-story-classify.md`)
- [ ] Extract and validate `sourceUrl` if provided; fetch source content for classification
- [ ] Score story for `freedom_relevance_score` and `credibility_score`
- [ ] If scores meet threshold (per `thresholds.yml`), queue for insight generation via Workflow A pipeline
- [ ] Store `region` field in `source_items.metadata.geo` if provided
- [ ] Create GitHub issue for manual review if source URL is missing or credibility is uncertain
- [ ] Update submission status to `triaged` after processing

**Implementation Notes**:
- Stories from the public are treated similar to external sources but with extra verification
- `sourceUrl` provides provenance; stories without URLs need manual verification
- Consider lower auto-publish threshold for community-submitted stories (require editorial review)
- Link resulting insight back to original submission via `source_item_ids`

---

### 1.13b Workflow C: Project Idea Intake Processing

**Description**: Process "project" type submissions as community-sourced project ideas.

**Requirements**:
- [ ] Add conditional branch in Workflow C to detect `type: 'project'` submissions
- [ ] Map submission fields to `project_ideas` schema:
  - `title` → used in GitHub issue title
  - `problemStatement` → `problem_statement`
  - `description` → `proposed_solution`
- [ ] Use Claude API to evaluate and enrich submission:
  - Generate `threat_model` from problem statement
  - Identify `affected_groups`
  - Assess `feasibility_score` and `impact_score`
  - Flag `misuse_risks`
  - Suggest `technical_dependencies` and `suggested_stack`
- [ ] Create or extend `agents/intake-project-evaluate.md` prompt for project idea assessment
- [ ] Insert into `project_ideas` table with `status: 'new'`
- [ ] Create GitHub issue with `project-idea` and `community-submitted` labels
- [ ] Update `project_ideas.github_issue_url` with created issue URL
- [ ] Update submission status to `triaged` after processing

**Implementation Notes**:
- Community project ideas follow same schema as auto-generated ideas from Workflow D
- Add `community-submitted` label to distinguish from auto-generated ideas
- Consider expedited review path for high-impact submissions (`urgency: 'urgent'`)
- Link `project_ideas.derived_from_insight_ids` to any related insights if submission references existing content

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
- [ ] Use Claude API to:
  - Detect spam/abuse and set `is_spam` flag
  - Assess priority based on content severity
  - Extract actionable items from message
  - Suggest appropriate assignees or project areas
- [ ] Create GitHub issue in appropriate repository:
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

---

### 1.14 Workflow D: Claude API Integration

**Description**: Replace idea synthesizer stub with real Claude API.

**Requirements**:
- [ ] Set up n8n credential for Anthropic API (Header Auth with x-api-key)
- [ ] Swap IdeaSynthesizer Stub → real Claude API HTTP request (use `agents/generate-idea.md` prompt)
- [ ] Validate generated idea against project_idea schema
- [ ] Handle empty clusters edge case gracefully
- [ ] Add logging/alerting for failed LLM calls
- [ ] Add error handling nodes with retry logic

**Implementation Notes**:
- Stub currently generates complete proposals with threat_model, MVP scope
- Real API should maintain same output structure
- Credentials may be shared with Workflow A (1.5) and Workflow C (1.13) if already configured

---

### 1.15 Workflow D: GitHub Issue Creation

**Description**: Create GitHub issues for generated project ideas.

**Requirements**:
- [ ] Swap GitHub Issue Stub → real GitHub API HTTP request
- [ ] Set up n8n credential for GitHub API (if not already)
- [ ] Configure labels (currently hardcoded: `project-idea`, `auto-generated`)
- [ ] Link derived insights in issue body to actual published URLs
- [ ] Update `project_ideas.github_issue_url` with created issue URL

**Implementation Notes**:
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
| Agent Prompts (integration) | 0% | Not loaded by workflows; prompts need copy/paste |
| Config Files (files) | 100% | sources.yml and thresholds.yml configured |
| Config Files (integration) | 0% | Workflows use hardcoded values, not config files |
| JSON Schemas (files) | 100% | All schemas exist in `schemas/` |
| JSON Schemas (validation) | 0% | Not wired for runtime validation |
| Workflow A Structure | 85% | Complete pipeline, Claude nodes disabled |
| Workflow B Structure | 80% | Complete pipeline, stubs active |
| Workflow C Structure | 90% | Active workflow, needs verification |
| Workflow D Structure | 80% | Complete pipeline, stubs active |
| Firebase Auth | 0% | Documented but not implemented |
| GCS Integration | 0% | Not implemented |
| Resend Email | 20% | Template exists, API not wired |
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
