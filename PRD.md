# Libertas — Automated Research & Distribution Platform

## Product Requirements Document and Engineering Specification

**Project name:** Libertas
**Repository:** https://github.com/FGUTech/libertas
**Organization:** StarkWare — Freedom Go Up (FGU)
**Doc version:** v0.1
**Date:** 2026-01-05

---

## 1. Purpose

This document specifies the **first flagship build** for the Freedom Go Up (FGU) squad: a **fully automated, privacy-preserving research + publishing platform** for **FGU.tech**.

The platform’s job is to:

1. **Continuously research Freedom Tech** (Bitcoin, ZK, sovereignty tooling, censorship resistance, activists using tech under pressure).
2. **Synthesize + publish** that research in formats optimized for humans **and** agents (RSS + machine-readable feeds, optionally email newsletter).
3. **Ingest inbound requests** from the world (activists, builders, orgs) for Freedom Tech needs/ideas.
4. **Generate project ideas** based on observed global patterns (surveillance, shutdowns, repression, monetary tyranny).
5. Optionally **trigger “vibe coding”** workflows to scaffold prototypes when appropriate.

**Core implementation constraint:** the system must be **agentic-first**, with **n8n workflows as the orchestrator**.

---

## 2. Manifesto alignment

This project is not “content marketing.” It is **Freedom Tech infrastructure**: a machine that converts global signal into:

* Understanding
* Coordination
* Action
* Prototypes

Guiding principles (must shape design choices):

* **Permissionless:** the outputs should be accessible without accounts, paywalls, or centralized gatekeepers.
* **Open source:** default to permissive licensing for the platform code and output schemas.
* **Resilient:** automation should keep running under failures; publishing should degrade gracefully.
* **Privacy-first:** no tracking pixels, no surveillance analytics, minimal logs, minimal data retention.
* **Built from first principles:** optimize for long-term composability (clean schemas, stable APIs, reproducibility).

---

## 3. Problem statement

FGU needs a repeatable way to:

* Track fast-moving developments in freedom tech and global civil liberties.
* Translate them into high-signal content that can influence builders and decision-makers.
* Detect patterns and gaps (“what tools are missing?”) and convert them into actionable project directions.
* Scale our output without scaling headcount.

Today, doing this manually is high-friction and inconsistent.

---

## 4. Goals

### 4.1 Product goals

1. **Automated research pipeline**

   * Regular ingestion from curated sources plus open web research.
   * Continuous classification and prioritization using the “Freedom Tech lens.”

2. **Automated publishing**

   * Publish to **FGU.tech** as:

     * RSS
     * JSON Feed (machine-friendly)
     * Markdown posts (for site + Git-based publishing)
   * Optional: email newsletter (privacy-preserving).

3. **Agent-native output**

   * Outputs should be easy for other agents to parse and remix.
   * Provide structured metadata, citations, and stable schemas.

4. **Inbound channel**

   * Collect requests/ideas from the public and route them into an internal backlog.
   * Support multiple intake mechanisms (web form, email alias, optionally Nostr).

5. **Idea generation**

   * Convert observed events into proposed Freedom Tech projects.
   * Generate clear problem statements + threat models + suggested MVPs.

6. **Optional “vibe coding” automation**

   * Under defined safety gates, auto-scaffold prototype repos/PRs/issues.

### 4.2 Technical goals

* n8n is the **control plane** (schedulers, routing, retries, branching, state transitions).
* A persistent store exists for:

  * source documents
  * extracted text
  * generated insights
  * published artifacts
  * inbound submissions
* System is **idempotent**: re-running workflows should not duplicate content.

---

## 5. Non-goals

To keep scope sane for the first build:

* Not building a full social network or “creator platform.”
* Not building an on-chain publishing system.
* Not building a private comms tool (Signal/Bitchat competitor).
* Not fully automating controversial editorial judgment without guardrails.
* Not doing invasive user analytics or ad tracking.

---

## 6. Success metrics

Privacy-first means we avoid per-user surveillance metrics. Measure success using **aggregate** and operational metrics.

**Output cadence**

* ≥ 1 “Daily Signals” post/day (can be short)
* ≥ 1 “Weekly Digest”/week

**Quality**

* ≥ 90% of published items include **at least 1 citation**
* ≤ 5% duplicate stories per week (by similarity threshold)

**Engagement (privacy-respecting)**

* RSS subscribers (aggregate count if available)
* Email subscribers (count only, no tracking pixels)
* Number of inbound submissions / month
* Number of project ideas generated / month
* Number of project ideas promoted to “Build Candidate” status

**Operational**

* Workflow success rate ≥ 95% (excluding external source downtime)
* Mean time to recovery for broken connector < 1 day (internal SLO)

---

## 7. Users and personas

1. **Freedom Tech builders**

   * Want high-signal updates, open problems, and ideas worth building.

2. **Bitcoin + ZK engineers**

   * Want technical depth, credible sources, and composable references.

3. **Activists / civil society**

   * Want tools and pathways; may want to submit needs safely.

4. **Researchers / journalists**

   * Want provenance, citations, and clean extraction.

5. **FGU internal**

   * Wants a reliable machine that reduces manual load and generates real pipeline.

---

## 8. Key example and editorial focus

The platform must reliably detect and elevate concrete “freedom tech in action” stories.

**Seed example: Bitchat in Uganda** (offline / non-internet comms implications; repression/surveillance context)

Seed links (treat as “starter sources” in the crawler; store as citations):

```text
https://x.com/callebtc/status/2008120211699044544
https://nilepost.co.ug/news/312962/dont-be-excited-by-bitchat-ucc-boss-warns-ugandans
```

**Editorial requirement:** Coverage must tie back to FGU’s mission: **tech-enabled sovereignty and resistance to surveillance/tyranny**.

---

## 9. Product requirements

### 9.1 Content sourcing requirements

**R1 — Curated seed sources**

* Must support a configurable list of “Tier 1” sources:

  * HRF website content and updates
  * Selected social accounts (X/Twitter)
  * Other freedom tech channels (Nostr, GitHub repos, mailing lists)
* The source list must be editable without redeploying code (config file, DB table, or n8n data store).

**R2 — Open web discovery**

* Agents must also discover relevant content beyond the curated list:

  * web search queries derived from manifesto themes
  * follow citations and outbound links from high-quality sources
* Discovery must be bounded (rate limits, per-run budgets).

**R3 — Topic autonomy**

* The agent must be able to select topics based on manifesto context:

  * sovereignty
  * privacy
  * censorship resistance
  * surveillance and countermeasures
  * money and institutional capture
  * real-world activism and civil liberties

**R4 — Provenance**

* Every insight must store:

  * source URL(s)
  * fetch timestamp
  * extracted text hash
  * author/account where available
  * platform type

---

### 9.2 Processing and analysis requirements

**R5 — Normalization**

* Convert source content into clean text + metadata.
* Store raw HTML/text for reproducibility.

**R6 — Deduplication**

* Deduplicate at two levels:

  1. exact duplicates (hash)
  2. semantic near-duplicates (embedding similarity threshold)

**R7 — Classification**

* Tag content across:

  * Topics: Bitcoin, ZK, censorship, comms, payments, identity, etc.
  * Geography (if detectable)
  * “Freedom relevance score” (0–100)
  * “Credibility score” (0–100)

**R8 — Summarization**

* Produce:

  * 1–2 sentence “Signal”
  * 5–10 bullet “Brief”
  * Optional “Deep Dive” for high-score items

**R9 — Project idea synthesis**

* If a story indicates a gap or repeating pattern, generate:

  * Problem statement
  * Threat model
  * Who is affected
  * Proposed solution(s)
  * MVP scope
  * Risks and misuse considerations
  * Suggested next actions

---

### 9.3 Publishing requirements

**R10 — Output formats**

* Publish at least:

  * RSS 2.0 feed
  * JSON Feed 1.1 (or similar) for agent consumption
  * Markdown files for website posts

**R11 — LLM-friendly content**
Every published item must include:

* stable, machine-readable metadata block (frontmatter or JSON)
* citations
* consistent sectioning
* “TL;DR” field
* tags and canonical IDs

**R12 — Privacy-preserving distribution**

* No tracking pixels.
* No third-party analytics that fingerprint users by default.
* If analytics are required, use aggregate-only, self-hosted, privacy-preserving mode.

**R13 — Automation**

* System can publish automatically with confidence gates:

  * If credibility/relevance below threshold → queue for review
  * If above threshold → publish automatically

---

### 9.4 Inbound requests requirements

**R14 — Public intake**

* Provide a way for others to reach out with:

  * Freedom Tech requests
  * ideas
  * “we need a tool for X”
* Minimum: web form on FGU.tech that triggers an n8n webhook.

**R15 — Routing**

* Inbound submissions automatically become:

  * a GitHub issue (preferred)
  * or internal DB record + Slack/Matrix/Signal notification (depending on stack)

**R16 — Safety**

* Provide an optional “safety mode” intake:

  * allows pseudonymous submission
  * clear warning to not include identifying info if risky
  * store minimal metadata (no IP retention if possible)

---

### 9.5 “Vibe coding” automation requirements

**R17 — Controlled auto-prototyping**

* For a subset of ideas (low-risk, internal tooling, non-sensitive), the system may:

  * create a repo branch
  * scaffold code + README
  * run lint/tests
  * open a PR
* Must be gated by:

  * feasibility score
  * safety policy checks
  * “allowed category” list

**R18 — Human approval**

* Even if ideation is automated, **publishing code externally must require human review** (at least for v1).

---

## 10. System architecture

### 10.1 High-level components

| Component | Service | Purpose |
|-----------|---------|---------|
| Orchestrator | **Railway (n8n)** | Workflow automation, scheduling, webhooks |
| Database | **Supabase (Postgres + pgvector)** | Entity storage, semantic deduplication |
| Object Storage | **GCP Cloud Storage** | Raw documents, published feeds |
| Static Site | **Vercel (Next.js)** | FGU.tech website, intake form |
| Email | **Resend** | Privacy-friendly newsletter delivery |
| LLM Runtime | **Claude API (Anthropic)** | Classification, summarization, idea generation |
| Code/Publishing | **GitHub** | Issues, PRs, content repo, deploy triggers |

### 10.2 Data flow overview

```
                              ┌─────────────────┐
                              │   Claude API    │
                              └────────┬────────┘
                                       │
┌─────────────┐  webhook    ┌──────────▼──────────────────────┐   issues    ┌─────────────┐
│   Vercel    │ ──────────► │         Railway (n8n)           │ ──────────► │   GitHub    │
│  (Next.js)  │             │  Workflows A, B, C, D, E        │             │             │
│             │ ◄────────── └──────────┬──────────────────────┘             └─────────────┘
└──────┬──────┘                        │
       │                               │
       │ fetch                         │ read/write
       ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                             │
│                   (Postgres + pgvector)                     │
│  source_items │ insights │ project_ideas │ submissions      │
└─────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     │                     ▼
┌─────────────────┐            │            ┌─────────────────┐
│  GCP Cloud      │            │            │     Resend      │
│  Storage        │◄───────────┘            │  (email)        │
│  /raw/          │                         └─────────────────┘
│  /published/    │───────────► Vercel (serve feeds)
└─────────────────┘
```

---

## 11. Data model

### 11.1 Core entities

**SourceItem**

* `id` (UUID)
* `url`
* `platform` (rss/web/x/nostr/github/etc.)
* `fetched_at`
* `raw_content_ref` (object storage key)
* `extracted_text`
* `content_hash` (sha256)
* `author` / `account_handle` (optional)
* `published_at` (if known)
* `language` (optional)
* `metadata_json`

**Insight**

* `id`
* `source_item_ids[]`
* `title`
* `tldr`
* `summary_bullets[]`
* `deep_dive_markdown` (optional)
* `topics[]`
* `geo` (optional)
* `freedom_relevance_score` (0–100)
* `credibility_score` (0–100)
* `citations[]` (URLs)
* `status` (draft/queued/published)
* `published_url` (if published)

**ProjectIdea**

* `id`
* `derived_from_insight_ids[]`
* `problem_statement`
* `threat_model`
* `affected_groups`
* `proposed_solution`
* `mvp_scope`
* `misuse_risks`
* `feasibility_score`
* `impact_score`
* `status` (new/triaged/build_candidate/prototyped)

**Submission**

* `id`
* `submitted_at`
* `channel` (web/email/nostr)
* `contact` (optional)
* `message`
* `tags[]`
* `risk_level` (low/med/high)
* `status` (new/triaged/responded)

---

## 12. n8n workflows specification

Below are the concrete workflows Brandon should implement. The goal is to keep each workflow small, composable, and testable.

### Workflow A — Daily ingestion and signal generation

**Trigger:** Cron (e.g., every 6 hours)

**Steps**

1. Load source list (DB table or config)
2. For each source:

   * Fetch content (RSS/HTTP/API)
   * Store raw response
   * Extract readable text (HTML → text)
3. Compute hash; skip if already ingested
4. Generate embedding (optional) and check semantic duplicates
5. LLM classification + scoring
6. If relevance >= threshold:

   * Generate Signal + Brief
   * Create Insight record (status: queued or published)
7. Publish if confidence gates satisfied

**Key n8n nodes**

* Cron
* HTTP Request / RSS Read
* Code node (parsing + hashing)
* Postgres nodes (upsert, queries)
* LLM node (structured JSON output)
* IF nodes (gating)
* GitHub node or “commit to repo” mechanism
* Error Trigger / retry path

**Acceptance criteria**

* Running the workflow twice does not create duplicates.
* At least one feed is published (RSS/JSON) from generated Insights.

---

### Workflow B — Weekly digest builder

**Trigger:** Cron (weekly)

**Steps**

1. Query Insights published in last 7 days
2. Cluster by topic / geography
3. LLM composes a Weekly Digest in:

   * Markdown
   * Email-friendly HTML/text
   * JSON summary for agents
4. Publish digest post to FGU.tech
5. Send email newsletter (if enabled)

**Acceptance criteria**

* Weekly digest is reproducible from stored Insights.
* Newsletter sending supports unsubscribe and does not embed trackers.

---

### Workflow C — Inbound submissions intake

**Trigger:** Webhook endpoint (`/api/intake`)

**Steps**

1. Validate + sanitize input
2. Store Submission
3. Auto-tag + classify risk level (LLM)
4. Create GitHub issue with structured template
5. Notify internal channel (Slack/Matrix/etc.)

**Acceptance criteria**

* A public submission reliably becomes a GitHub issue in the correct repo.
* No sensitive metadata is stored by default beyond what user explicitly provides.

---

### Workflow D — Project idea generator

**Trigger:** Daily (or after new high-score Insights)

**Steps**

1. Select high-signal Insights or clusters showing repeated patterns
2. Generate ProjectIdea objects with:

   * threat model
   * MVP
   * constraints
   * misuse risks
3. Score feasibility/impact
4. Auto-create GitHub issues for ideas above threshold

**Acceptance criteria**

* At least 3 ideas/week are generated from real Insights.
* Each idea includes a threat model and misuse section.

---

### Workflow E — Vibe coding pipeline (optional, gated)

**Trigger:** New ProjectIdea with `status=build_candidate` AND `category in allowlist`

**Steps**

1. Create a branch or repo scaffold
2. LLM generates:

   * README
   * initial code structure
   * tests (even minimal)
3. Run CI checks (lint/tests)
4. Open a PR
5. Notify Brandon for review

**Acceptance criteria**

* No PR is merged automatically.
* PR contains clear scope and safety notes.

---

## 13. Publishing and “LLM-friendly” schema

### 13.1 Canonical artifact format

For each published Insight, generate a Markdown file with **frontmatter**:

```yaml
---
id: "insight-2026-01-05-0001"
type: "signal"
published_at: "2026-01-05T00:00:00Z"
topics: ["comms", "censorship-resistance", "activism"]
geo: ["Uganda"]
freedom_relevance_score: 92
credibility_score: 75
citations:
  - "SOURCE_URL_1"
  - "SOURCE_URL_2"
tldr: "One or two sentence summary..."
---
```

Then body:

* TL;DR
* What happened
* Why it matters for freedom tech
* What we should build next (if applicable)
* Links / citations

### 13.2 Feeds

* RSS 2.0: human subscribers
* JSON Feed: agent subscribers
* Optional: a simple `/api/insights` endpoint returning paginated JSON

---

## 14. Privacy and security requirements

### 14.1 Privacy

* No third-party trackers by default.
* No fingerprinting scripts.
* Store minimal logs; rotate and purge.
* For inbound submissions: do not store IP unless strictly required for abuse prevention (and if stored, short retention).

### 14.2 Security

**Threats to explicitly mitigate**

* Prompt injection via scraped web content
* Malicious links in sources
* Credential leakage via logs
* Abuse of intake endpoint (spam, harassment)

**Mitigations**

* Treat all fetched content as untrusted input.
* Strong output schemas (JSON) from LLM; validate before publish.
* Secrets managed via environment variables / vault.
* Rate limit webhook intake.
* Link hygiene: mark external links clearly; optionally use a safe redirect/preview page.

---

## 15. Quality control and editorial policy

Even when automated, we need consistent standards:

* Prefer primary sources; cite everything.
* If claim is uncertain, label as such (e.g., “unverified”).
* Avoid doxxing or operational details that could endanger activists.
* Avoid publishing instructions that meaningfully enable wrongdoing.
* Maintain a “Corrections” mechanism (even simple: new post linking correction).

---

## 16. MVP scope

### MVP deliverables

1. **Ingestion of 10–30 seed sources** (RSS + web pages minimum)
2. **Daily Signals pipeline** publishing to:

   * Markdown
   * RSS
   * JSON Feed
3. **Basic dedupe**
4. **Basic scoring + gating**
5. **Inbound web form → GitHub issue**
6. **Weekly Digest**

### Not required for MVP

* Nostr ingestion
* Vector DB (can be added later if dedupe needs it)
* Auto vibe-coding PRs

---

## 17. Implementation notes for Brandon

### Suggested repository layout

```text
libertas/
  /docs
  /schemas
  /prompts
  /n8n
    workflows-export.json
  /site-content
    /posts
    rss.xml
    feed.json
  /scripts
```

### Config strategy

* `sources.yml` or DB table:

  * name, url, type, tier, tags
* `thresholds.yml`:

  * relevance publish threshold
  * credibility threshold
  * review threshold
* Prompt templates versioned under `/prompts`

### Testing strategy

* Unit test parsing + normalization
* Snapshot tests for feed generation
* Golden test cases for LLM output validation (schema conformance)

---

## 18. Risks and mitigations

1. **Platform constraints (X/Twitter API limitations)**

   * Mitigation: treat X as optional; prioritize RSS + web sources; add X later if access is stable.

2. **LLM hallucination**

   * Mitigation: enforce citation requirement; keep summaries grounded in extracted text; use “unknown” labels.

3. **Safety of activist content**

   * Mitigation: do not publish sensitive operational details; add a safety rubric and automatic redaction heuristics.

4. **Newsletter deliverability**

   * Mitigation: start with RSS-first; add email once infrastructure is stable.

5. **Automation spam**

   * Mitigation: rate limit + spam scoring on intake; captcha only if necessary (privacy tradeoff).

---

## 19. Open questions for internal resolution

(These are for you to decide internally; the build can proceed with sensible defaults.)

* What is the current stack behind **FGU.tech** (static site vs CMS)?
* Preferred mailing solution: self-hosted list manager vs SMTP vs third-party?
* Do we want an onion mirror / Tor-friendly hosting as a future goal?
* Preferred GitHub org/repo for auto-created issues and prototype PRs?

---

## Appendix A — Seed sources starter list template

```yaml
- name: "Human Rights Foundation"
  type: "web_or_rss"
  url: "HRF_URL_HERE"
  tier: 1
  tags: ["human-rights", "activism"]

- name: "Calle on X"
  type: "x_account"
  url: "https://x.com/callebtc"
  tier: 1
  tags: ["bitcoin", "freedom-tech"]

- name: "Bitchat Uganda thread"
  type: "web"
  url: "https://x.com/callebtc/status/2008120211699044544"
  tier: 1
  tags: ["comms", "uganda", "surveillance"]
```

---

## Appendix B — Structured LLM output schema for Insight

```json
{
  "title": "string",
  "tldr": "string",
  "summary_bullets": ["string"],
  "topics": ["string"],
  "geo": ["string"],
  "freedom_relevance_score": 0,
  "credibility_score": 0,
  "citations": ["string"],
  "recommended_actions": ["string"],
  "project_idea_trigger": {
    "should_generate": true,
    "reason": "string"
  }
}
```

---

## Appendix C — Definition of done

Brandon can consider v1 complete when:

* n8n workflows A, B, C, D exist, are exportable, and run reliably.
* FGU.tech receives new posts automatically (at least via a repo commit pipeline).
* RSS + JSON feeds are generated and valid.
* Inbound form creates GitHub issues with structured templates.
* The system stores provenance and prevents duplicates.
* There is a documented way to add/disable sources and adjust thresholds without code changes.

