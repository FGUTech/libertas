# SPEC.md — Technical Specification

> Technical architecture, data models, and API contracts for Libertas.

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ORCHESTRATION LAYER                          │
│                                  (n8n)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Workflow A│ │Workflow B│ │Workflow C│ │Workflow D│ │Workflow E│      │
│  │ Ingest   │ │ Digest   │ │ Intake   │ │  Ideas   │ │  Vibe    │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
└───────┼────────────┼────────────┼────────────┼────────────┼────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            PROCESSING LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Fetcher    │  │  Normalizer  │  │   Deduper    │                  │
│  │  (HTTP/RSS)  │  │ (HTML→Text)  │  │ (Hash+Embed) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Classifier  │  │  Summarizer  │  │ Idea Synth   │                  │
│  │    (LLM)     │  │    (LLM)     │  │    (LLM)     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            PERSISTENCE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Postgres   │  │Object Storage│  │ Vector Store │                  │
│  │  (entities)  │  │    (raw)     │  │  (optional)  │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            PUBLISHING LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Git Commit  │  │  RSS/JSON    │  │   GitHub     │                  │
│  │ (Markdown)   │  │   Feeds      │  │   Issues     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Orchestrator | n8n (self-hosted) | Visual workflows, built-in retry, webhook support |
| Database | PostgreSQL 15+ | JSON support, reliability, n8n native integration |
| Object Storage | S3-compatible (MinIO/R2) | Raw document storage, cost-effective |
| Vector Store | pgvector OR Qdrant | Semantic deduplication (optional for MVP) |
| LLM Runtime | Claude API / OpenAI | Structured output support required |
| Publishing | Git + Static Site | Version control, audit trail, resilience |
| Email | Listmonk (self-hosted) | Privacy-preserving, no tracking |

---

## Data Models

### SourceItem

Represents a single piece of fetched content from any source.

```typescript
interface SourceItem {
  id: string;                    // UUIDv4
  url: string;                   // Canonical source URL
  platform: Platform;            // Enum: rss | web | x | nostr | github | email
  fetchedAt: string;             // ISO 8601 UTC
  rawContentRef: string;         // Object storage key
  extractedText: string;         // Cleaned text content
  contentHash: string;           // SHA-256 of extractedText
  author?: string;               // Author name if available
  accountHandle?: string;        // @handle if social platform
  publishedAt?: string;          // Original publish date if known
  language?: string;             // ISO 639-1 code
  metadata: Record<string, any>; // Platform-specific metadata
  createdAt: string;             // Record creation time
  updatedAt: string;             // Last update time
}

type Platform = 'rss' | 'web' | 'x' | 'nostr' | 'github' | 'email';
```

**Database Schema:**

```sql
CREATE TABLE source_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_content_ref TEXT,
  extracted_text TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  author TEXT,
  account_handle TEXT,
  published_at TIMESTAMPTZ,
  language VARCHAR(10),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_content_hash UNIQUE (content_hash)
);

CREATE INDEX idx_source_items_platform ON source_items(platform);
CREATE INDEX idx_source_items_fetched_at ON source_items(fetched_at);
CREATE INDEX idx_source_items_content_hash ON source_items(content_hash);
```

---

### Insight

Generated analysis derived from one or more SourceItems.

```typescript
interface Insight {
  id: string;                      // UUIDv4
  sourceItemIds: string[];         // References to source items
  title: string;                   // Generated title
  tldr: string;                    // 1-2 sentence summary
  summaryBullets: string[];        // 5-10 bullet points
  deepDiveMarkdown?: string;       // Long-form analysis (optional)
  topics: Topic[];                 // Classification tags
  geo?: string[];                  // Geographic relevance
  freedomRelevanceScore: number;   // 0-100
  credibilityScore: number;        // 0-100
  citations: string[];             // Source URLs
  status: InsightStatus;           // Workflow state
  publishedUrl?: string;           // URL if published
  publishedAt?: string;            // Publish timestamp
  createdAt: string;
  updatedAt: string;
}

type Topic =
  | 'bitcoin'
  | 'zk'
  | 'censorship-resistance'
  | 'comms'
  | 'payments'
  | 'identity'
  | 'privacy'
  | 'surveillance'
  | 'activism'
  | 'sovereignty';

type InsightStatus = 'draft' | 'queued' | 'published' | 'rejected';
```

**Database Schema:**

```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_item_ids UUID[] NOT NULL,
  title TEXT NOT NULL,
  tldr TEXT NOT NULL,
  summary_bullets TEXT[] NOT NULL,
  deep_dive_markdown TEXT,
  topics VARCHAR(50)[] NOT NULL,
  geo VARCHAR(100)[],
  freedom_relevance_score INTEGER NOT NULL CHECK (freedom_relevance_score BETWEEN 0 AND 100),
  credibility_score INTEGER NOT NULL CHECK (credibility_score BETWEEN 0 AND 100),
  citations TEXT[] NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_topics ON insights USING GIN(topics);
CREATE INDEX idx_insights_created_at ON insights(created_at);
CREATE INDEX idx_insights_scores ON insights(freedom_relevance_score, credibility_score);
```

---

### ProjectIdea

Generated project proposal derived from insights.

```typescript
interface ProjectIdea {
  id: string;                      // UUIDv4
  derivedFromInsightIds: string[]; // Source insights
  problemStatement: string;        // Clear problem definition
  threatModel: string;             // Security/adversary context
  affectedGroups: string[];        // Who benefits
  proposedSolution: string;        // Solution overview
  mvpScope: string;                // Minimum viable scope
  misuseRisks: string;             // Potential for harm
  feasibilityScore: number;        // 0-100
  impactScore: number;             // 0-100
  status: IdeaStatus;              // Workflow state
  githubIssueUrl?: string;         // If created as issue
  createdAt: string;
  updatedAt: string;
}

type IdeaStatus = 'new' | 'triaged' | 'build_candidate' | 'prototyped' | 'rejected';
```

**Database Schema:**

```sql
CREATE TABLE project_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derived_from_insight_ids UUID[] NOT NULL,
  problem_statement TEXT NOT NULL,
  threat_model TEXT NOT NULL,
  affected_groups TEXT[] NOT NULL,
  proposed_solution TEXT NOT NULL,
  mvp_scope TEXT NOT NULL,
  misuse_risks TEXT NOT NULL,
  feasibility_score INTEGER NOT NULL CHECK (feasibility_score BETWEEN 0 AND 100),
  impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN 0 AND 100),
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  github_issue_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_ideas_status ON project_ideas(status);
CREATE INDEX idx_project_ideas_scores ON project_ideas(feasibility_score, impact_score);
```

---

### Submission

Public intake from external parties.

```typescript
interface Submission {
  id: string;                    // UUIDv4
  submittedAt: string;           // ISO 8601 UTC
  channel: SubmissionChannel;    // Intake method
  contact?: string;              // Optional contact (encrypted at rest)
  message: string;               // Submission content
  tags: string[];                // Auto-generated tags
  riskLevel: RiskLevel;          // Safety classification
  status: SubmissionStatus;      // Processing state
  githubIssueUrl?: string;       // If converted to issue
  createdAt: string;
  updatedAt: string;
}

type SubmissionChannel = 'web' | 'email' | 'nostr';
type RiskLevel = 'low' | 'medium' | 'high';
type SubmissionStatus = 'new' | 'triaged' | 'responded' | 'archived';
```

**Database Schema:**

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel VARCHAR(20) NOT NULL,
  contact TEXT,  -- Consider encryption at rest
  message TEXT NOT NULL,
  tags VARCHAR(50)[] DEFAULT '{}',
  risk_level VARCHAR(10) NOT NULL DEFAULT 'low',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  github_issue_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Do NOT index contact field to avoid accidental exposure
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_risk_level ON submissions(risk_level);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
```

---

## Workflow Specifications

### Workflow A: Daily Ingestion & Signal Generation

**Trigger:** Cron schedule (every 6 hours)

**Node Graph:**

```
[Cron Trigger]
      │
      ▼
[Load Sources Config]
      │
      ▼
[Split Into Items] ──────────────────────────────────────┐
      │                                                   │
      ▼                                                   │
[Fetch Content] ◄── [HTTP Request / RSS Read]            │
      │                                                   │
      ▼                                                   │
[Extract Text] ◄── [HTML to Markdown / Text]             │
      │                                                   │
      ▼                                                   │
[Compute Hash]                                            │
      │                                                   │
      ▼                                                   │
[Check Duplicate] ──► [Skip if exists] ──────────────────┤
      │                                                   │
      ▼                                                   │
[Store SourceItem]                                        │
      │                                                   │
      ▼                                                   │
[LLM: Classify + Score]                                   │
      │                                                   │
      ▼                                                   │
[IF: relevance >= threshold]                              │
      │         │                                         │
      ▼         ▼                                         │
[Generate    [Skip]                                       │
 Summary]                                                 │
      │                                                   │
      ▼                                                   │
[Create Insight Record]                                   │
      │                                                   │
      ▼                                                   │
[IF: auto-publish criteria met]                           │
      │         │                                         │
      ▼         ▼                                         │
[Publish]   [Queue for Review]                            │
      │                                                   │
      ▼                                                   │
[Aggregate Results] ◄────────────────────────────────────┘
      │
      ▼
[Update Feeds (RSS/JSON)]
      │
      ▼
[Commit to Git Repo]
```

**Key Configuration:**

```yaml
# config/thresholds.yml
ingestion:
  relevance_threshold: 50      # Minimum to generate insight
  auto_publish_relevance: 70   # Auto-publish if >= this
  auto_publish_credibility: 60 # AND >= this
  max_items_per_run: 100       # Rate limit
  retry_attempts: 3
  retry_delay_seconds: 60
```

**Idempotency:** Content hash prevents duplicate ingestion. Same URL can update if content changes.

---

### Workflow B: Weekly Digest Builder

**Trigger:** Cron schedule (weekly, e.g., Sunday 00:00 UTC)

**Node Graph:**

```
[Cron Trigger]
      │
      ▼
[Query Insights: last 7 days, status=published]
      │
      ▼
[Group by Topic]
      │
      ▼
[LLM: Generate Digest]
      │
      ├──► [Markdown Output]
      │          │
      │          ▼
      │    [Commit to /posts/weekly/]
      │
      ├──► [Email HTML Output]
      │          │
      │          ▼
      │    [Send via Listmonk] (if enabled)
      │
      └──► [JSON Summary]
               │
               ▼
         [Update /feed.json]
```

**Output Format:**

```markdown
---
id: "digest-2026-01-05"
type: "weekly-digest"
published_at: "2026-01-05T00:00:00Z"
period_start: "2025-12-29"
period_end: "2026-01-04"
insight_count: 12
---

# Weekly Freedom Tech Digest

## TL;DR
[2-3 sentence executive summary]

## Top Signals

### Censorship Resistance
- [Signal 1 title](link) — brief
- [Signal 2 title](link) — brief

### Bitcoin & Payments
- [Signal 3 title](link) — brief

## Emerging Patterns
[Analysis of trends across the week]

## Project Ideas Generated
[Links to new ProjectIdeas if any]

## Sources This Week
[Aggregate citation list]
```

---

### Workflow C: Inbound Submissions Intake

**Trigger:** Webhook endpoint `POST /api/intake`

**Request Schema:**

```typescript
interface IntakeRequest {
  message: string;           // Required: the submission content
  contact?: string;          // Optional: email or handle
  category?: string;         // Optional: self-categorization
  safetyMode?: boolean;      // If true, extra privacy measures
}
```

**Node Graph:**

```
[Webhook Trigger]
      │
      ▼
[Rate Limit Check] ──► [429 if exceeded]
      │
      ▼
[Validate + Sanitize Input]
      │
      ▼
[IF: safetyMode]
      │         │
      ▼         ▼
[Strip      [Normal
 Metadata]   Processing]
      │         │
      └────┬────┘
           │
           ▼
[Store Submission]
           │
           ▼
[LLM: Classify + Risk Assessment]
           │
           ▼
[Create GitHub Issue]
           │
           ▼
[Notify Internal Channel]
           │
           ▼
[Return Success Response]
```

**GitHub Issue Template:**

```markdown
## Inbound Submission

**ID:** {{ submission.id }}
**Channel:** {{ submission.channel }}
**Risk Level:** {{ submission.riskLevel }}
**Tags:** {{ submission.tags | join(', ') }}

---

### Message

{{ submission.message }}

---

### Auto-Generated Classification

{{ llm_classification_output }}

---

*This issue was auto-generated by Libertas.*
```

---

### Workflow D: Project Idea Generator

**Trigger:** Cron (daily) OR triggered after high-score insights

**Node Graph:**

```
[Trigger]
      │
      ▼
[Query High-Signal Insights]
  - freedom_relevance_score >= 80
  - last 7 days
  - not already processed for ideas
      │
      ▼
[Cluster by Theme/Pattern]
      │
      ▼
[FOR EACH Cluster]
      │
      ▼
[LLM: Generate ProjectIdea]
      │
      ▼
[Validate Schema]
      │
      ▼
[IF: feasibility >= 50 AND impact >= 50]
      │         │
      ▼         ▼
[Store     [Log and Skip]
 ProjectIdea]
      │
      ▼
[Create GitHub Issue]
      │
      ▼
[Link Issue to ProjectIdea]
```

---

### Workflow E: Vibe Coding Pipeline (Gated)

**Trigger:** Manual promotion OR ProjectIdea.status = 'build_candidate' AND category in allowlist

**Gates (ALL must pass):**

```yaml
vibe_coding_gates:
  allowed_categories:
    - internal-tooling
    - documentation
    - data-processing
  blocked_categories:
    - security-critical
    - user-facing-auth
    - financial
  required_scores:
    feasibility: >= 70
    impact: >= 60
  requires_human_approval: true  # Always true for v1
```

**Node Graph:**

```
[Trigger: build_candidate status]
      │
      ▼
[Check Gates] ──► [Reject if any fail]
      │
      ▼
[Create Branch: idea-{{ idea.id }}]
      │
      ▼
[LLM: Generate Scaffold]
      │
      ├──► README.md
      ├──► src/index.ts (or appropriate)
      ├──► tests/basic.test.ts
      └──► .github/workflows/ci.yml
      │
      ▼
[Commit to Branch]
      │
      ▼
[Run CI Checks]
      │
      ▼
[Open Draft PR]
      │
      ▼
[Notify for Human Review]
      │
      ▼
[WAIT: Human approval required]
```

**Hard Rule:** No PR is ever auto-merged. Human review is mandatory.

---

## API Contracts

### Webhook: Intake Endpoint

```
POST /api/intake
Content-Type: application/json

Request:
{
  "message": "We need a tool for...",
  "contact": "user@example.com",  // optional
  "category": "tool-request",     // optional
  "safetyMode": false             // optional
}

Response (201):
{
  "id": "submission-uuid",
  "status": "received",
  "message": "Thank you for your submission."
}

Response (429):
{
  "error": "rate_limit_exceeded",
  "retryAfter": 60
}

Response (400):
{
  "error": "validation_error",
  "details": ["message is required"]
}
```

### Feed: RSS 2.0

**Endpoint:** `/rss.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Libertas Signals</title>
    <link>https://libertas.fgu.tech</link>
    <description>Freedom Tech signals and insights</description>
    <atom:link href="https://libertas.fgu.tech/rss.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>{{ insight.title }}</title>
      <link>{{ insight.publishedUrl }}</link>
      <guid isPermaLink="true">{{ insight.publishedUrl }}</guid>
      <pubDate>{{ insight.publishedAt | rfc822 }}</pubDate>
      <description>{{ insight.tldr }}</description>
      <category>{{ insight.topics | join(',') }}</category>
    </item>
  </channel>
</rss>
```

### Feed: JSON Feed 1.1

**Endpoint:** `/feed.json`

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Libertas Signals",
  "home_page_url": "https://libertas.fgu.tech",
  "feed_url": "https://libertas.fgu.tech/feed.json",
  "description": "Freedom Tech signals and insights",
  "items": [
    {
      "id": "insight-uuid",
      "url": "https://libertas.fgu.tech/signals/insight-uuid",
      "title": "Insight Title",
      "summary": "TL;DR content",
      "content_text": "Full content...",
      "date_published": "2026-01-05T00:00:00Z",
      "tags": ["bitcoin", "censorship-resistance"],
      "_libertas": {
        "freedom_relevance_score": 85,
        "credibility_score": 72,
        "citations": ["https://source1.com", "https://source2.com"],
        "geo": ["Uganda"]
      }
    }
  ]
}
```

---

## Object Storage Structure

```
/raw/
  /{year}/
    /{month}/
      /{day}/
        /{source-item-id}.html     # Raw HTML
        /{source-item-id}.txt      # Extracted text
        /{source-item-id}.meta.json # Fetch metadata

/published/
  /posts/
    /{insight-id}.md
  /digests/
    /weekly-{date}.md
```

---

## Error Handling

### Retry Strategy

| Error Type | Retry | Max Attempts | Backoff |
|------------|-------|--------------|---------|
| Network timeout | Yes | 3 | Exponential (1m, 5m, 15m) |
| Rate limit (429) | Yes | 5 | Use Retry-After header |
| Server error (5xx) | Yes | 3 | Exponential |
| Client error (4xx) | No | - | Log and skip |
| LLM validation fail | Yes | 2 | Immediate |
| Schema violation | No | - | Log, queue for review |

### Circuit Breaker

If a source fails 5 consecutive times:
1. Mark source as `degraded` in config
2. Skip for 24 hours
3. Alert via notification channel
4. Auto-retry after cooldown

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Ingestion latency (per source) | < 30s |
| LLM classification latency | < 10s |
| End-to-end (fetch → publish) | < 5 min |
| Webhook response time | < 500ms |
| Feed generation | < 2s |

---

## Migrations

When schema changes are needed:

1. Create migration file: `/migrations/{timestamp}_{description}.sql`
2. Test on staging database
3. Apply via n8n workflow or manual execution
4. Update TypeScript interfaces
5. Update JSON schemas in `/schemas/`

**Migration Naming:** `20260105_001_add_embedding_column.sql`

---

*This specification is the technical source of truth. Update when architecture changes.*
