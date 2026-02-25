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

### 3.2 Social Distribution Pipeline

**Description**: Automated social post generation and publishing across platforms, powered by specialized Claude Code skills that pull from Postgres data (insights, digests, project ideas, patterns). Each post type has a dedicated generation skill; all skills inherit from a shared voice/style reference. Posts are generated, queued for optional review, then published via n8n Workflow F.

**Voice model**: Mixed register per post type — signal alerts and breaking news are institutional/factual; threads and commentary get more editorial personality; project spotlights are enthusiastic but grounded.

**Target platforms**: X/Twitter (primary), Reddit, Nostr, LinkedIn (secondary).

---

### 3.2a FGUTech Voice & Style Reference

**Description**: Master reference document defining @FGUTech's brand voice, tone spectrum, anti-patterns, and platform-specific formatting rules. All social post generation skills inherit from this reference.

**Deliverable**: `agents/social/voice-reference.md` — loaded by all social generation agents as shared context.

**Requirements**:
- [x] Define FGUTech brand identity (not a person — a sharp, credible research entity)
- [x] Define tone spectrum with register levels: `institutional` (signal alerts, breaking), `editorial` (threads, digests), `conversational` (commentary, engagement)
- [x] Document writing rules: max lengths per platform, citation style, link formatting, hashtag policy (none on X, subreddit-appropriate on Reddit)
- [x] Document anti-patterns: no engagement farming, no crypto-bro language, no "gm/wagmi/lfg", no emojis in body, no sensationalism, no speculation beyond source data
- [x] Define topic framing guidelines per Libertas topic (`bitcoin`, `zk`, `censorship-resistance`, `privacy`, `surveillance`, etc.)
- [x] Define citation/attribution rules: always link to Libertas insight URL, credit original source
- [x] Platform-specific formatting rules appendix (X: 280 char / thread conventions, Reddit: markdown / subreddit norms, Nostr: NIP-01 note format, LinkedIn: professional framing)
- [x] Include 3-5 golden examples per register level
- [x] Include explicit "cringe test" checklist (would FGU be embarrassed by this in 6 months?)

**Implementation Notes**:
- Pattern follows `agents/summarize.md` structure: Role → Context → Rules → Examples
- This file is a reference, not an agent prompt — it gets included as context in post-generation agent prompts
- Voice should be distinct from @BrandonJRobertz (personal) — FGU is an organization, not an individual
- Review with team before finalizing; voice is hard to change once established

---

### 3.2b Database: Social Posts Table & Scheduling

**Description**: Database schema and n8n workflow infrastructure for social post lifecycle: generation → review queue → scheduling → publishing → tracking.

**Deliverable**: Migration file + n8n Workflow F (Social Publisher).

**Requirements**:
- [ ] Create `social_posts` table:
  ```sql
  CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('insight', 'digest', 'project_idea', 'pattern', 'manual')),
    source_id UUID,                    -- FK to insights/digests/project_ideas
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('x', 'reddit', 'nostr', 'linkedin')),
    post_type VARCHAR(30) NOT NULL CHECK (post_type IN ('signal_alert', 'insight_thread', 'digest_recap', 'pattern_alert', 'project_spotlight', 'breaking', 'commentary')),
    content_json JSONB NOT NULL,       -- Platform-specific content (text, thread parts, media refs)
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'approved', 'published', 'rejected', 'failed')),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    platform_post_id TEXT,             -- X tweet ID, Reddit post ID, Nostr event ID, etc.
    platform_url TEXT,                 -- Direct link to published post
    metadata JSONB DEFAULT '{}',       -- Engagement metrics, error details, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- [ ] Add indexes on `(platform, status)`, `(source_type, source_id)`, `(scheduled_at)`
- [ ] Add `updated_at` trigger (reuse existing pattern from `source_items`)
- [ ] Add TypeScript types and Zod schema for `SocialPost`
- [ ] Add JSON Schema in `schemas/social-post.schema.json`
- [ ] Design n8n Workflow F: poll `social_posts` where `status = 'approved'` and `scheduled_at <= now()` → publish to platform API → update status + `platform_post_id`

**Implementation Notes**:
- `content_json` is platform-specific: X posts store `{ text, thread_parts[], media_urls[] }`, Reddit stores `{ title, body_markdown, subreddit, flair }`, etc.
- Scheduling allows batching (don't post 10 tweets in 10 minutes)
- `source_id` enables tracing any social post back to the insight/digest/idea that spawned it
- Migration file: `migrations/004_social_posts.sql`

---

### 3.2c X: Signal Alert Posts

**Description**: Single-tweet posts for individual published insights. The most common post type — one tweet per noteworthy insight with the TL;DR and a link.

**Deliverable**: `agents/social/x-signal-alert.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes an Insight (title, tldr, topics, relevance_score, citations, published_url) and generates a single tweet
- [ ] Tone register: `institutional` — factual, direct, no editorializing
- [ ] Format: Signal text + insight URL, must fit 280 chars (URL counts as ~23 chars via t.co)
- [ ] Topic-appropriate framing (e.g., censorship items lead with the country/event, bitcoin items lead with the technical development)
- [ ] Auto-trigger: Workflow A publishes insight with `relevance_score >= 70` → generate signal alert → insert into `social_posts` as `draft` or `queued` (configurable gate)
- [ ] Generate 3 variations, pick the best (or let reviewer choose)
- [ ] Golden tests: 5+ input/output pairs covering different topics

**Input** (from Postgres):
```sql
SELECT title, tldr, topics, freedom_relevance_score, credibility_score, citations, published_url
FROM insights WHERE status = 'published' AND id = $1
```

**Example Output**:
```
Internet outage detected across Pakistan as authorities jail human rights lawyers — censorship escalation following legal defense of political dissidents.

fgu.tech/signals/pakistan-jails-human-rights-lawyers
```

---

### 3.2d X: Insight Thread Posts

**Description**: Multi-tweet threads for high-signal insights that deserve deeper exposition. Uses summary bullets and deep dive content to build a narrative thread.

**Deliverable**: `agents/social/x-insight-thread.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes a high-signal Insight (including `deep_dive_markdown`, `summary_bullets`, `citations`) and generates a thread (3-8 tweets)
- [ ] Tone register: `editorial` — more personality, connects dots, highlights implications
- [ ] Thread structure: Hook tweet (most compelling angle) → Key facts (from bullets) → Why it matters (from deep dive) → Sources + link to full insight
- [ ] Each tweet in thread must stand alone as readable (no "1/" numbering)
- [ ] Auto-trigger: insight with `relevance_score >= 85` AND `deep_dive_markdown IS NOT NULL`
- [ ] `content_json` stores `{ thread_parts: string[] }` for ordered tweet sequence
- [ ] Golden tests: 3+ input/output pairs

**Implementation Notes**:
- Thread tweets should be connected but each individually retweetable
- Final tweet always links back to the full insight on fgu.tech
- Consider including a relevant image/chart placeholder for tweet 1 (media support in future iteration)

---

### 3.2e X: Weekly Digest Recap

**Description**: Thread summarizing the weekly digest — posted when Workflow B publishes a new digest. Gives followers the week's highlights without needing to read the full digest.

**Deliverable**: `agents/social/x-digest-recap.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes a Digest (tldr, sections, emerging_patterns, insight_count, top_topics) and generates a recap thread (4-10 tweets)
- [ ] Tone register: `editorial` — narrative, connects the week's dots
- [ ] Thread structure: "This week in freedom tech" hook → Top signal per category → Emerging patterns → Looking ahead → Link to full digest
- [ ] Auto-trigger: Workflow B publishes digest → generate recap → queue
- [ ] Golden tests: 2+ input/output pairs

**Input** (from Postgres):
```sql
SELECT title, tldr, sections, emerging_patterns, insight_count, top_topics, published_at
FROM digests WHERE id = $1
```

---

### 3.2f X: Pattern & Trend Posts

**Description**: Single tweets or short threads highlighting emerging patterns detected across multiple insights. These connect dots that individual signal alerts don't.

**Deliverable**: `agents/social/x-pattern-alert.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes an EmergingPattern (from digest or cross-topic detection) with supporting insight references and generates 1-3 tweets
- [ ] Tone register: `editorial` to `conversational` — analytical, "here's what we're seeing"
- [ ] Must cite at least 2 supporting signals with links
- [ ] Auto-trigger: digest `emerging_patterns` array OR Workflow D pattern detection output
- [ ] Golden tests: 3+ input/output pairs

**Example Output**:
```
Pattern we're tracking: Three countries in East Africa have implemented internet shutdowns during election periods in the past month.

Uganda, Tanzania, and Ethiopia — all following the same playbook.

Sources and analysis: fgu.tech/digest/weekly-2026-02-22
```

---

### 3.2g X: Project Spotlight Posts

**Description**: Posts highlighting new project ideas generated by Workflow D. Designed to attract builders and collaborators.

**Deliverable**: `agents/social/x-project-spotlight.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes a ProjectIdea (problem_statement, proposed_solution, affected_groups, feasibility_score, impact_score) and generates 1-2 tweets
- [ ] Tone register: `conversational` — enthusiastic but grounded, builder-oriented
- [ ] Must frame as "here's a problem that needs solving" not "we have a great idea"
- [ ] Include link to GitHub issue if available
- [ ] Auto-trigger: Workflow D creates idea with `impact_score >= 70`
- [ ] Golden tests: 3+ input/output pairs

**Example Output**:
```
Problem worth solving: Mesh network bootstrapping in shutdown-prone regions is still too slow and technical for non-experts.

What if there was a pre-configured node kit with encrypted messaging + Bitcoin Lightning built in?

Builders welcome → github.com/FGUTech/libertas/issues/42
```

---

### 3.2h X: Breaking Signal Posts

**Description**: Urgent single tweets for exceptionally high-signal items (internet shutdowns, major censorship events, critical vulnerabilities). Faster cadence than regular signal alerts.

**Deliverable**: `agents/social/x-breaking.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes a high-urgency Insight and generates a single punchy tweet
- [ ] Tone register: `institutional` — factual, urgent, no editorializing
- [ ] Must include geographic context if applicable
- [ ] Auto-trigger: insight with `relevance_score >= 90` AND topics include `censorship-resistance` or `surveillance`
- [ ] Skip review queue (auto-approve) for items above threshold — configurable in `thresholds.yml`
- [ ] Rate limit: max 2 breaking alerts per 24h to avoid fatigue
- [ ] Golden tests: 3+ input/output pairs

**Threshold Integration** (`config/thresholds.yml`):
- `social.breaking_alert_threshold` (default: 90) — minimum relevance score for breaking treatment
- `social.breaking_auto_approve` (default: false) — skip review queue for breaking alerts
- `social.breaking_max_per_day` (default: 2) — rate limit

---

### 3.2i X: Commentary Posts

**Description**: Reactive commentary on trending freedom tech news or external tweets. Unlike other post types, these are manually triggered or triggered by high-signal external items, not automated from Libertas data alone.

**Deliverable**: `agents/social/x-commentary.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table)

**Requirements**:
- [ ] Agent prompt that takes external context (URL, quote text, or topic) plus relevant Libertas insights and generates commentary (1-3 tweets)
- [ ] Tone register: `conversational` — opinionated but data-backed, references Libertas research
- [ ] Must always ground commentary in published Libertas data (no pure opinion)
- [ ] Manual trigger only (never auto-generated) — invoked via Claude Code skill
- [ ] Supports quote-tweet style: references external content + adds FGU analysis
- [ ] Golden tests: 3+ input/output pairs

**Implementation Notes**:
- This is the most "personality-forward" post type — voice reference register rules are especially important here
- Query Postgres for relevant insights to back up commentary:
  ```sql
  SELECT title, tldr, published_url FROM insights
  WHERE topics && $topics AND status = 'published'
  ORDER BY freedom_relevance_score DESC LIMIT 5
  ```

---

### 3.2j Workflow F: Social Publisher

**Description**: n8n workflow that manages the social post publishing lifecycle — polling the queue, publishing to platform APIs, tracking results.

**Deliverable**: `n8n/workflows/workflow-f-social-publisher.json`

**Depends on**: 3.2b (social_posts table)

**Requirements**:
- [ ] Poll `social_posts` for `status = 'approved'` AND `scheduled_at <= now()` (every 15 min)
- [ ] Platform routing: Switch node branches for `x`, `reddit`, `nostr`, `linkedin`
- [ ] X publishing: use X API v2 (`POST /2/tweets`) with OAuth 2.0 PKCE — handle threads via reply chains
- [ ] On success: update `status = 'published'`, store `platform_post_id` and `platform_url`
- [ ] On failure: update `status = 'failed'`, store error in `metadata.error`
- [ ] Rate limiting: respect per-platform rate limits (X: 50 tweets/24h per app)
- [ ] Stub mode: `runtime.use_stubs` toggle (log post instead of publishing)
- [ ] Set up n8n credentials for X API (OAuth 2.0 app credentials)

**Implementation Notes**:
- Same stub/real pattern as Workflows A-D
- Thread publishing on X: post first tweet, get tweet ID, reply to it with next tweet, etc.
- Consider a "dry run" mode that generates but doesn't publish (useful for voice tuning)

---

### 3.2k Reddit: Long-form Signal Posts

**Description**: Reddit posts for high-signal insights, formatted as long-form markdown posts to relevant subreddits. Reddit's audience expects depth and sources.

**Deliverable**: `agents/social/reddit-signal.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table), 3.2j (Workflow F)

**Requirements**:
- [ ] Agent prompt that takes an Insight (full content including deep_dive, bullets, citations) and generates a Reddit post with `title` + `body_markdown`
- [ ] Subreddit targeting: map Libertas topics to subreddits (e.g., `privacy` → r/privacy, `bitcoin` → r/Bitcoin, `surveillance` → r/netsec + r/privacy, `censorship-resistance` → r/technology)
- [ ] Format: descriptive title, structured body with headers/bullets/sources, TL;DR at top
- [ ] Auto-trigger: insight with `relevance_score >= 80` AND topic maps to a subreddit
- [ ] `content_json` stores `{ title, body_markdown, subreddit, flair }`
- [ ] Respect subreddit rules (no self-promotion spam — max 1 post per sub per day)
- [ ] Workflow F: Reddit publishing via Reddit API (OAuth2)
- [ ] Golden tests: 3+ input/output pairs

**Implementation Notes**:
- Reddit values depth and original sources over hot takes — lean fully into the institutional register
- Each subreddit has different norms; the agent should have subreddit-specific formatting notes in the reference
- Consider a "soft launch" period: post manually first to build karma before automating

---

### 3.2l Nostr: Relay Publishing

**Description**: Cross-post published insights to Nostr relays as NIP-01 text notes. Aligns with Libertas' censorship-resistant ethos — content lives on decentralized relays, not just fgu.tech.

**Deliverable**: `agents/social/nostr-note.md` agent prompt + n8n Nostr publishing node.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table), 3.2j (Workflow F)

**Requirements**:
- [ ] Agent prompt that takes an Insight and generates a Nostr-formatted note (plain text, no markdown)
- [ ] NIP-01 event structure: `kind: 1` text note with content + tags
- [ ] Include `t` tags for topics, `r` tag for source URL
- [ ] Nostr key management: generate and securely store nsec for @FGUTech identity
- [ ] NIP-05 verification: `_fgu@fgu.tech` identifier (add `.well-known/nostr.json` to website)
- [ ] Relay selection: post to 3-5 well-connected relays (e.g., `relay.damus.io`, `nos.lol`, `relay.nostr.band`)
- [ ] Auto-trigger: all published insights (Nostr is permissionless, no review gate needed)
- [ ] Workflow F: Nostr publishing via HTTP to relay WebSocket (or use `nostr-tools` in Code node)
- [ ] Golden tests: 3+ input/output pairs

**Implementation Notes**:
- Merges with existing 3.4 (Nostr Deep Integration) roadmap item — this is the publishing half
- Nostr notes are plain text, no markdown rendering — agent must format accordingly
- Consider NIP-23 (long-form content) for deep dive insights as a future enhancement
- `nsec` must be stored securely in n8n credentials, never in config files or git

---

### 3.2m LinkedIn: Professional Signal Posts

**Description**: Professional-framed posts for LinkedIn, targeting policy makers, institutional researchers, and freedom tech-adjacent professionals.

**Deliverable**: `agents/social/linkedin-professional.md` agent prompt + Claude Code skill.

**Depends on**: 3.2a (voice reference), 3.2b (social_posts table), 3.2j (Workflow F)

**Requirements**:
- [ ] Agent prompt that takes a high-signal Insight or Digest and generates a LinkedIn post (1300 char limit for visible portion)
- [ ] Tone register: fully `institutional` — professional, no slang, frames in terms of policy/rights/infrastructure implications
- [ ] Format: opening hook → context → key findings → implications → link to full analysis
- [ ] Target audience framing: human rights orgs, policy researchers, institutional technologists
- [ ] Auto-trigger: insights with `relevance_score >= 80` AND topics include `surveillance`, `censorship-resistance`, or `activism`
- [ ] Workflow F: LinkedIn publishing via LinkedIn API (OAuth 2.0, requires company page)
- [ ] Golden tests: 3+ input/output pairs
- [ ] Manual review required for all LinkedIn posts (no auto-approve)

**Implementation Notes**:
- LinkedIn audience is very different from X — avoid any crypto/builder jargon
- Frame everything in terms of real-world impact (people affected, countries, organizations)
- LinkedIn company page required; set up FGUTech company page
- LinkedIn API has strict rate limits and requires app review for posting permissions

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

**Description**: Full Nostr protocol support beyond basic publishing (which is covered in 3.2l).

**Requirements**:
- Read comments/reactions from Nostr relays (NIP-25)
- NIP-23 long-form content for deep dive insights
- Nostr-based intake submissions (relay → Workflow C)
- Zap support (NIP-57) for Lightning-based engagement signals

**Notes**: 3.2l covers basic NIP-01 note publishing + NIP-05 identity. This item covers the deeper bidirectional integration.

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
| FGUTech Voice & Style Reference (3.2a) | High | Low | P1 |
| Social Posts DB & Scheduling (3.2b) | High | Medium | P1 |
| X: Signal Alert Posts (3.2c) | High | Low | P1 |
| X: Insight Thread Posts (3.2d) | Medium | Medium | P1 |
| X: Weekly Digest Recap (3.2e) | Medium | Low | P1 |
| X: Pattern & Trend Posts (3.2f) | Medium | Low | P2 |
| X: Project Spotlight Posts (3.2g) | Medium | Low | P2 |
| X: Breaking Signal Posts (3.2h) | High | Low | P1 |
| X: Commentary Posts (3.2i) | Low | Medium | P2 |
| Workflow F: Social Publisher (3.2j) | High | High | P1 |
| Reddit: Long-form Signal Posts (3.2k) | Medium | Medium | P2 |
| Nostr: Relay Publishing (3.2l) | Medium | Medium | P2 |
| LinkedIn: Professional Posts (3.2m) | Low | Medium | P3 |
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
| Social Distribution Pipeline | 5% | Voice reference complete (3.2a); DB schema, agent prompts, Workflow F pending (3.2b-3.2m) |

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

### Before Social Distribution (3.2)

- [ ] Create @FGUTech X account and obtain API keys (X API v2, OAuth 2.0 PKCE)
- [ ] FGUTech voice/tone review with team (3.2a deliverable)
- [ ] Review queue policy: which post types auto-approve vs require human review?
- [ ] Posting cadence targets: max posts per day per platform?
- [ ] Reddit account + karma building strategy (manual posting before automation)
- [ ] Nostr key generation and NIP-05 setup on fgu.tech
- [ ] LinkedIn company page creation
- [ ] Social `thresholds.yml` section review (breaking thresholds, auto-approve gates)

---

*Last updated based on codebase analysis. Update as phases complete.*
