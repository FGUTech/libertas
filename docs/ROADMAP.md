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

**Threshold Integration** (`config/thresholds.yml`):
- `circuit_breaker.failure_threshold` (default: 5) — consecutive failures before marking source as degraded
- `circuit_breaker.cooldown_hours` (default: 24) — hours to wait before retrying degraded source

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

### 2.0e Source URL Deduplication for Insights

**Description**: Prevent duplicate insights from being created when the same source URL is fetched on different days with slightly different content.

**Requirements**:
- [ ] Before creating a new insight, check if an existing insight already cites the same source URL
- [ ] If match found, skip insight generation for that source item
- [ ] Log skipped items for monitoring

**Implementation Notes**:
- Current deduplication uses `content_hash` on `source_items`, but the same article fetched on different days may produce different hashes (minor content changes, ads, timestamps)
- This creates duplicate insights about the same event (e.g., two Gabon internet blackout insights citing the same NetBlocks URL)
- Simple SQL check: `SELECT id FROM insights WHERE $sourceUrl = ANY(citations)`
- Lower effort than semantic dedup (2.1); should be implemented first

---

### 2.1 Semantic Deduplication

**Description**: Use vector embeddings to detect near-duplicate content.

**Requirements**:
- [ ] Enable pgvector extension in Cloud SQL (already in schema)
- [ ] Generate embeddings for content via Claude API
- [ ] Implement similarity threshold checking per `thresholds.yml`
- [ ] Add near-duplicate detection before insight generation
- [ ] Wire up `deduper.ts` interface (currently returns no-op)
- [ ] Add workflow IF node to check `deduplication.semantic_enabled` before running similarity checks

**Threshold Integration** (`config/thresholds.yml`):
- `deduplication.semantic_enabled` (default: false) — toggle semantic dedup on/off
- `deduplication.semantic_threshold` (default: 0.85) — similarity score above which items are considered duplicates (0.0-1.0)
- `deduplication.exact_match` (default: true) — always enabled, uses content hash

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

### 2.3a Structured API Source Type: Infrastructure

**Description**: Add `api` as a first-class source type so Workflow A can ingest structured data from JSON APIs (not just RSS feeds). This is the foundation for Cloudflare Radar, GDELT, and ACLED integrations. Inspired by [worldmonitor](https://github.com/koala73/worldmonitor)'s approach to aggregating these upstream APIs.

**Requirements**:
- [ ] Database migration: add `'api'` to `source_items.platform` CHECK constraint
- [ ] Add `api` to source type definitions comment in `sources.yml`
- [ ] Define API source config schema: `type: api`, `url`, `poll_interval`, `auth`, `query` (optional), `response_mapping` (optional)
- [ ] Add `api_sources` JSON Schema in `schemas/api-source.schema.json` for validation
- [ ] Workflow A: add a parallel branch that handles `type: api` sources separately from RSS
- [ ] Implement API adapter node pattern: HTTP Request → Response Normalizer → existing Classify pipeline
- [ ] Response normalizer must map heterogeneous API responses into the standard `source_items` shape (`url`, `extracted_text`, `content_hash`, `platform: 'api'`, `published_at`, `metadata`)
- [ ] Support `auth: none | bearer | api_key` credential modes with n8n credential references
- [ ] Add `poll_interval` support (some APIs should poll every 6h, others every 24h) — use n8n IF node to check if enough time has elapsed since last fetch per source
- [ ] Deduplication: API items use URL-based dedup (not content hash) since structured data is deterministic

**Implementation Notes**:
- Workflow A currently assumes all sources are RSS and uses the RSS Feed Read node. API sources need an HTTP Request node path instead.
- n8n supports branching via Switch/IF nodes — route `api` type sources to a separate processing lane before they merge back into the shared Classify → Score → Summarize pipeline.
- The normalizer is the key abstraction: each API has a different response shape, so use a Code node with per-source mapping logic (keyed on source name or URL pattern).
- Keep `enabled: false` on API sources in `sources.yml` until the adapter nodes are deployed.
- Migration file: `migrations/003_add_api_platform.sql`

**Database Migration**:
```sql
-- migrations/003_add_api_platform.sql
ALTER TABLE source_items DROP CONSTRAINT source_items_platform_check;
ALTER TABLE source_items ADD CONSTRAINT source_items_platform_check
  CHECK (platform IN ('rss', 'web', 'x', 'nostr', 'github', 'email', 'api'));
```

---

### 2.3b Cloudflare Radar Outage Integration

**Description**: Ingest internet outage annotations from Cloudflare Radar as a high-signal freedom tech source. Internet shutdowns are a direct censorship signal and currently detected only when OONI or NetBlocks publish reports (often hours/days later). Cloudflare Radar provides near-real-time structured data.

**Depends on**: 2.3a (API source type infrastructure)

**Requirements**:
- [ ] Set up Cloudflare API token with Radar read permissions
- [ ] Add n8n credential for Cloudflare API (Bearer token)
- [ ] Implement response normalizer for Cloudflare Radar outage annotations → `source_items`
- [ ] Map fields: `country` → `metadata.geo`, `asn` → `metadata.asn`, `startDate/endDate` → `published_at`, `scope` → `metadata.scope`
- [ ] Construct `extracted_text` from annotation fields: `"Internet outage detected in {country} ({scope} scope) affecting ASN {asn} from {startDate} to {endDate}"`
- [ ] Construct `url` as `https://radar.cloudflare.com/outage-center?country={countryCode}` for citation linkback
- [ ] Set `content_hash` as hash of `country + asn + startDate` (deterministic dedup)
- [ ] Enable the source in `sources.yml` once adapter is deployed
- [ ] Test with historical data to verify dedup and classification work correctly

**API Details**:
- Endpoint: `GET https://api.cloudflare.com/client/v4/radar/annotations/outages?dateRange=7d&format=json`
- Auth: Bearer token (Cloudflare API token with `Radar:Read` permission)
- Response contains `annotations[]` with `startDate`, `endDate`, `linkedUrl`, `scope`, `asns[]`, `locations[]`
- Poll interval: every 6 hours (outages are rare but high-signal)

**Implementation Notes**:
- This is the highest-value API integration. Internet shutdowns map directly to Libertas topics: `censorship-resistance`, `surveillance`.
- Cloudflare Radar also has `/radar/annotations/outages/locations` for country-level filtering if volume is too high.
- Cross-reference with existing OONI and NetBlocks RSS items for richer insights.

---

### 2.3c GDELT Global Event Integration

**Description**: Poll GDELT's free document search API for freedom-tech-relevant global events. GDELT monitors news from 100+ languages worldwide and provides tone analysis, geo-location, and source metadata — discovering articles from sources not in our RSS list.

**Depends on**: 2.3a (API source type infrastructure)

**Requirements**:
- [ ] Implement GDELT response normalizer → `source_items`
- [ ] Configure search query in `sources.yml` `query` field: `censorship OR "internet shutdown" OR surveillance OR "digital rights" OR "press freedom"`
- [ ] Map fields: `title` → `extracted_text` (prepend title), `url` → `url`, `seendate` → `published_at`, `domain` → `metadata.source_domain`, `tone` → `metadata.gdelt_tone`
- [ ] Set `content_hash` as hash of article URL (GDELT deduplicates internally)
- [ ] Filter out articles from domains already in our RSS source list (avoid double-ingestion)
- [ ] Limit to `maxrecords=50` per poll to avoid noise — rely on classifier to filter further
- [ ] Test query tuning: run sample queries to verify signal-to-noise ratio before enabling

**API Details**:
- Endpoint: `GET https://api.gdeltproject.org/api/v2/doc/doc?query={query}&mode=artlist&format=json&timespan=24h&maxrecords=50`
- Auth: None required
- Response contains `articles[]` with `title`, `url`, `seendate`, `domain`, `language`, `tone`
- Poll interval: every 12 hours
- Free, no rate limit documented (but be respectful — max 1 request per poll)

**Implementation Notes**:
- GDELT is a discovery source (Tier 2/3). Its value is finding articles from outlets we don't directly follow.
- The `tone` field (positive/negative sentiment) could be stored in `metadata` and used by the classifier as a signal.
- Consider adding a `gdelt_tone` field to the classifier context so it can factor in GDELT's sentiment analysis.
- Query can be tuned over time based on classifier feedback — start conservative, expand if signal is good.

---

### 2.3d ACLED Protest & Conflict Data Integration

**Description**: Ingest structured protest and conflict event data from ACLED (Armed Conflict Location & Event Data). Protests and political violence are leading indicators for internet shutdowns, crackdowns, and censorship escalation — core Libertas territory.

**Depends on**: 2.3a (API source type infrastructure)

**Requirements**:
- [ ] Register for free ACLED researcher API access (requires email + API key)
- [ ] Add n8n credentials for ACLED API (API key + email in query params)
- [ ] Implement ACLED response normalizer → `source_items`
- [ ] Map fields: `event_type` + `sub_event_type` → `extracted_text`, `country` + `admin1` → `metadata.geo`, `latitude/longitude` → `metadata.coordinates`, `source` → `metadata.acled_source`, `fatalities` → `metadata.fatalities`
- [ ] Construct `extracted_text` as: `"{event_type}: {notes}" ` (ACLED `notes` field contains a human-readable event description)
- [ ] Construct `url` as `https://acleddata.com/dashboard/#/dashboard/{event_id}` for citation linkback
- [ ] Set `content_hash` as hash of `data_id` (ACLED's unique event identifier)
- [ ] Filter to event types most relevant to freedom tech: `Protests`, `Riots`, `Strategic developments` (skip `Battles` unless in monitored countries)
- [ ] Limit to monitored regions/countries or filter by ACLED `tags` if volume is too high
- [ ] Enable source in `sources.yml` once adapter is deployed and tested

**API Details**:
- Endpoint: `GET https://api.acleddata.com/acled/read?key={key}&email={email}&event_date={last_24h}&event_date_where=BETWEEN&limit=100`
- Auth: API key + email as query parameters
- Response contains `data[]` with `data_id`, `event_date`, `event_type`, `sub_event_type`, `country`, `admin1`, `latitude`, `longitude`, `source`, `notes`, `fatalities`
- Poll interval: every 24 hours (ACLED updates daily)
- Free for researchers; requires registration at acleddata.com

**Implementation Notes**:
- ACLED data is Tier 2. Protests alone aren't freedom tech stories, but they become high-signal when combined with internet shutdown data (Cloudflare Radar, OONI, NetBlocks).
- Cross-referencing ACLED protest spikes with Cloudflare Radar outages in the same country/timeframe could produce very strong insights. Consider this as a future enhancement to the classifier or pattern detection (2.5).
- ACLED has a `tags` field that sometimes includes labels like "internet" or "media" — filter on these for higher precision.

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

### 2.9a Review Queue & Publishing Gates

**Description**: Config-driven review queue triggers and publishing gate enforcement.

**Requirements**:
- [ ] Wire `review.*` thresholds into Workflow A to queue content for human review
- [ ] Make `require_citations` config-driven (currently hardcoded `hasCitations` check)
- [ ] Add safety check integration with `require_safety_check` threshold
- [ ] Add review queue UI integration (depends on 2.9 Admin Dashboard)

**Threshold Integration** (`config/thresholds.yml`):
- `review.relevance_below` (default: 70) — queue for review if relevance score below this
- `review.credibility_below` (default: 60) — queue for review if credibility score below this
- `review.safety_concern_always_review` (default: true) — always queue if safety flagged
- `publishing.require_citations` (default: true) — require at least one citation for auto-publish
- `publishing.require_safety_check` (default: true) — require safety check pass for auto-publish

**Implementation Notes**:
- `hasCitations` check exists in Parse Summary & Gates but doesn't read from config
- Review thresholds are inverse of auto-publish thresholds
- Safety check integration may require new classifier output field

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
- [ ] Gate validation logic (human approval required)
- [ ] Category allowlist/blocklist enforcement per `thresholds.yml`
- [ ] Minimum score gates for feasibility and impact
- [ ] Branch creation automation
- [ ] ScaffoldGenerator agent integration
- [ ] File generation and commit
- [ ] Draft PR creation with reviewer assignment
- [ ] Audit logging and rollback capability

**Threshold Integration** (`config/thresholds.yml`):
- `vibe_coding.requires_human_approval` (default: true) — hard gate, cannot be disabled in v1
- `vibe_coding.allowed_categories` — categories eligible for auto-scaffolding (internal-tooling, documentation, data-processing)
- `vibe_coding.blocked_categories` — categories never auto-scaffolded (security-critical, user-facing-auth, financial)
- `vibe_coding.min_feasibility` (default: 70) — minimum feasibility score to proceed
- `vibe_coding.min_impact` (default: 60) — minimum impact score to proceed

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
- [ ] Workflow failure alerts
- [ ] Database performance monitoring
- [ ] API rate limit warnings
- [ ] Source degradation notifications

**Notes**: Consider Grafana or similar for dashboards.

---

### 3.9 Performance SLO Tracking

**Description**: Track workflow performance against defined SLO targets.

**Requirements**:
- [ ] Instrument workflows to measure latency at each stage
- [ ] Compare measured latency against `performance.*` targets
- [ ] Alert when targets are exceeded
- [ ] Dashboard visualization of performance trends

**Threshold Integration** (`config/thresholds.yml`):
- `performance.ingestion_latency_target` (default: 30s) — max seconds for single source ingestion
- `performance.classification_latency_target` (default: 10s) — max seconds for LLM classification
- `performance.end_to_end_target` (default: 300s) — max seconds from fetch to publish
- `performance.webhook_response_target` (default: 0.5s) — max seconds for webhook response

**Implementation Notes**:
- These are monitoring targets, not hard enforcement gates
- Use for SLO dashboards and alerting thresholds
- Pairs with 3.8 Monitoring and Alerting infrastructure

---

# Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| n8n Migration to Managed Hosting | High | Medium | P1 |
| Firebase Auth Setup | Medium | Low | P1 |
| JSON Schema Validation | Medium | Medium | P1 |
| Workflow A Source Health & Error Handling | Medium | Medium | P1 |
| Workflow B Email Newsletter | Medium | Low | P1 |
| Source URL Deduplication | Medium | Low | P1 |
| Semantic Deduplication | Medium | High | P1 |
| Config Management UI | Low | Medium | P1 |
| Additional Source Types (RSS) | Medium | High | P1 |
| API Source Type Infrastructure (2.3a) | High | Medium | P1 |
| Cloudflare Radar Outages (2.3b) | High | Low | P1 |
| GDELT Event Integration (2.3c) | Medium | Low | P1 |
| ACLED Protest/Conflict Data (2.3d) | Medium | Low | P2 |
| Admin Dashboard | Medium | High | P1 |
| Review Queue & Publishing Gates | Medium | Low | P1 |
| Vibe Coding Pipeline | Low | High | P2 |
| Social Media Bots | Low | High | P2 |
| Self-hosted LLM | Low | High | P2 |
| Performance SLO Tracking | Low | Medium | P2 |

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
