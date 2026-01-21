# Workflow A: Daily Ingestion

This document describes the control flow of the Libertas daily ingestion workflow, which runs every 6 hours to fetch, classify, and publish freedom tech content.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  WORKFLOW A: DAILY INGESTION                                                     │
│                                     (runs every 6 hours)                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIALIZATION (parallel config fetches)                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────┐
                                        │   ⏰ Every 6 Hours   │
                                        │   (Cron Trigger)    │
                                        └──────────┬──────────┘
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
          ┌─────────▼─────────┐         ┌─────────▼─────────┐         ┌─────────▼─────────┐         ┌─────────────────────┐
          │ Fetch Sources     │         │ Fetch Thresholds  │         │ Fetch Classify    │         │ Fetch Summarize     │
          │ Config            │         │ Config            │         │ Prompt            │         │ Prompt              │
          │ /api/config/      │         │ /api/config/      │         │ /api/agents/      │         │ /api/agents/        │
          │ sources           │         │ thresholds        │         │ classify          │         │ summarize           │
          └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬───────────┘
                    │                              │                              │                              │
                    └──────────┬───────────────────┘                              └───────────────┬──────────────┘
                               │                                                                  │
                    ┌──────────▼──────────┐                                            ┌──────────▼──────────┐
                    │   Merge Configs     │                                            │   Merge Prompts     │
                    └──────────┬──────────┘                                            └──────────┬──────────┘
                               │                                                                  │
                               └───────────────────────────┬──────────────────────────────────────┘
                                                           │
                                                ┌──────────▼──────────┐
                                                │     Merge All       │
                                                └──────────┬──────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │ Merge Config & Agents    │
                                             │ (consolidate into        │
                                             │  single context object)  │
                                             └─────────────┬─────────────┘
                                                           │
                                              ┌────────────▼────────────┐
                                              │     Load Sources        │
                                              │ (filter enabled,        │
                                              │  fan out per source)    │
                                              └────────────┬────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: FETCH & DEDUPE (per source item)                                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                           │
                                           ┌───────────────▼───────────────┐
                                           │  Fetch RSS & Extract Items    │
                                           │  (HTTP fetch, parse XML,      │
                                           │   extract per-item metadata)  │
                                           └───────────────┬───────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │      Extract Text         │
                                             │   (strip HTML tags,       │
                                             │    decode entities)       │
                                             └─────────────┬─────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │     Compute Hash          │
                                             │    (SHA256 of text)       │
                                             └─────────────┬─────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │    Check Duplicate        │
                                             │  (query source_items      │
                                             │   by content_hash)        │
                                             └─────────────┬─────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │   Evaluate Duplicate      │
                                             │   (merge DB result with   │
                                             │    original item data)    │
                                             └─────────────┬─────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │       Is New Item?        │
                                             └───────┬───────────┬───────┘
                                                     │           │
                                           YES ──────┘           └────── NO
                                                     │                   │
                                  ┌──────────────────▼──────────┐   ┌────▼────────────┐
                                  │   Insert Source Item        │   │  Log Duplicate  │───────────────────────────────────┐
                                  │   (Postgres INSERT)         │   └─────────────────┘                                   │
                                  └──────────────────┬──────────┘                                                         │

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: CLASSIFICATION (stub/real toggle via thresholds.runtime.use_stubs)                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                           │
                                           ┌───────────────▼───────────────┐
                                           │   Use Stubs for Classify?     │
                                           └───────┬───────────────┬───────┘
                                                   │               │
                              use_stubs=true ──────┘               └────── use_stubs=false
                                                   │                       │
                              ┌─────────────────────▼─────────┐    ┌───────▼───────────────────┐
                              │  Classify Stub (Claude)       │    │  Classify with Claude API │
                              │  (keyword-based scoring,      │    │  POST /v1/messages        │
                              │   topic extraction)           │    │  (claude-sonnet-4)        │
                              └─────────────────────┬─────────┘    └───────┬───────────────────┘
                                                    │                      │
                                                    │              ┌───────▼───────────────────┐
                                                    │              │ Wrap Claude Classify      │
                                                    │              │ Response                  │
                                                    │              └───────┬───────────────────┘
                                                    └───────────┬──────────┘
                                                                │
                                                  ┌─────────────▼─────────────┐
                                                  │   Parse Classification    │
                                                  │  (extract JSON from       │
                                                  │   Claude response)        │
                                                  └─────────────┬─────────────┘
                                                                │
                                                  ┌─────────────▼─────────────┐
                                                  │  Validate Classification  │
                                                  │  (topics, scores, geo,    │
                                                  │   safety_concern)         │
                                                  └─────────────┬─────────────┘
                                                                │
                                                  ┌─────────────▼─────────────┐
                                                  │    Apply Threshold        │
                                                  │  (compare relevance       │
                                                  │   vs config threshold)    │
                                                  └─────────────┬─────────────┘
                                                                │
                                                  ┌─────────────▼─────────────┐
                                                  │    Meets Threshold?       │
                                                  └───────┬───────────┬───────┘
                                                          │           │
                                        YES (≥50) ────────┘           └──────── NO (<50)
                                                          │                     │
                                                          │             ┌───────▼───────┐
                                                          │             │  Log Skipped  │─────────────────────────────────────┐
                                                          │             └───────────────┘                                     │

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: SUMMARIZATION (stub/real toggle)                                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                          │
                                          ┌───────────────▼───────────────┐
                                          │  Use Stubs for Summarize?     │
                                          └───────┬───────────────┬───────┘
                                                  │               │
                             use_stubs=true ──────┘               └────── use_stubs=false
                                                  │                       │
                             ┌─────────────────────▼─────────┐    ┌───────▼───────────────────┐
                             │  Summarize Stub (Claude)      │    │ Summarize with Claude API │
                             │  (extract title, tldr,        │    │ POST /v1/messages         │
                             │   summary bullets)            │    │ (claude-sonnet-4)         │
                             └─────────────────────┬─────────┘    └───────┬───────────────────┘
                                                   │                      │
                                                   │              ┌───────▼───────────────────┐
                                                   │              │ Wrap Claude Summarize     │
                                                   │              │ Response                  │
                                                   │              └───────┬───────────────────┘
                                                   └───────────┬──────────┘
                                                               │
                                                 ┌─────────────▼─────────────┐
                                                 │  Parse Summary & Gates    │
                                                 │  (determine publish       │
                                                 │   status: relevance≥70    │
                                                 │   AND credibility≥60)     │
                                                 └─────────────┬─────────────┘
                                                               │
                                                 ┌─────────────▼─────────────┐
                                                 │    Validate Summary       │
                                                 │  (title, tldr, bullets,   │
                                                 │   topics, scores)         │
                                                 └─────────────┬─────────────┘
                                                               │
                                                 ┌─────────────▼─────────────┐
                                                 │   Build Insight Query     │
                                                 │  (construct INSERT SQL)   │
                                                 └─────────────┬─────────────┘
                                                               │
                                                 ┌─────────────▼─────────────┐
                                                 │     Insert Insight        │
                                                 │    (Postgres INSERT)      │
                                                 └─────────────┬─────────────┘
                                                               │
                                                 ┌─────────────▼─────────────┐
                                                 │      Is Published?        │
                                                 └───────┬───────────┬───────┘
                                                         │           │
                                  status='published' ────┘           └──── status='queued'
                                                         │                       │
                                                         └───────────┬───────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: AGGREGATION & FEED PUBLISHING                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                 │
             ┌───────────────────────────────────────────────────┼───────────────────────────────────────────────────┐
             │                                                   │                                                   │
             │  (from Log Duplicate)                             │            (from Log Skipped)                     │
             │                                                   │                                                   │
             └───────────────────────────────────────────────────┼───────────────────────────────────────────────────┘
                                                                 │
                                                   ┌─────────────▼─────────────┐
                                                   │    Aggregate Results      │
                                                   │  (count: published,       │
                                                   │   queued, skipped, dups)  │
                                                   └─────────────┬─────────────┘
                                                                 │
                                                   ┌─────────────▼─────────────┐
                                                   │    Workflow Complete      │
                                                   │  (log completion,         │
                                                   │   prepare for publishing) │
                                                   └─────────────┬─────────────┘
                                                                 │
                                                ┌────────────────▼────────────────┐
                                                │  Query New Published Insights   │
                                                │  (last 7 hours, status=pub)     │
                                                └────────────────┬────────────────┘
                                                                 │
                                                   ┌─────────────▼─────────────┐
                                                   │    Has New Insights?      │
                                                   └───────┬───────────┬───────┘
                                                           │           │
                                              YES ─────────┘           └───────── NO
                                                           │                     │
                                 ┌─────────────────────────▼─────────┐   ┌───────▼──────────────┐
                                 │  Query All Published Insights    │   │ Log No New Insights  │
                                 │  (up to 100, for feeds)          │   │        (END)         │
                                 └─────────────────────────┬─────────┘   └──────────────────────┘
                                                           │
                                          ┌────────────────▼────────────────┐
                                          │       Generate RSS Feed         │
                                          │  (RSS 2.0, all published)       │
                                          └────────────────┬────────────────┘
                                                           │
                                          ┌────────────────▼────────────────┐
                                          │      Generate JSON Feed         │
                                          │  (JSON Feed 1.1)                │
                                          └────────────────┬────────────────┘
                                                           │
                                         ┌─────────────────▼─────────────────┐
                                         │   Generate Insight Markdown       │
                                         │  (frontmatter .md per insight)    │
                                         └─────────────────┬─────────────────┘
                                                           │
                                         ┌─────────────────▼─────────────────┐
                                         │   Use Stubs for Publishing?       │
                                         └───────┬───────────────────┬───────┘
                                                 │                   │
                            use_stubs=true ──────┘                   └────── use_stubs=false
                                                 │                           │
                        ┌────────────────────────▼──────────┐   ┌────────────▼────────────────┐
                        │  GitHub Commit Stub (Feeds)       │   │  Prepare GitHub Commit      │
                        │  (log only, no actual commit)     │   │  (build files array)        │
                        │             (END)                 │   └────────────┬────────────────┘
                        └───────────────────────────────────┘                │

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 6: GITHUB GIT DATA API (atomic commit - real mode only)                                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │         Get Branch Ref                 │
                                                        │  GET /git/ref/heads/main               │
                                                        └────────────────────┬────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │          Get Base Tree                 │
                                                        │  GET /git/commits/{sha}                │
                                                        └────────────────────┬────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │        Build Tree Entries              │
                                                        │  (RSS, JSON, markdown files)           │
                                                        └────────────────────┬────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │           Create Tree                  │
                                                        │  POST /git/trees                       │
                                                        └────────────────────┬────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │          Create Commit                 │
                                                        │  POST /git/commits                     │
                                                        └────────────────────┬────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │        Update Branch Ref               │
                                                        │  PATCH /git/refs/heads/main            │
                                                        └────────────────────┬────────────────────┘
                                                                             │
                                                        ┌────────────────────▼────────────────────┐
                                                        │       Wrap GitHub Response             │
                                                        │             (END)                      │
                                                        └─────────────────────────────────────────┘
```

## Phase Summary

| Phase | Description | Key Decision Points |
|-------|-------------|---------------------|
| **1. Init** | Parallel fetch of 4 configs (sources, thresholds, classify prompt, summarize prompt) | - |
| **2. Fetch & Dedupe** | Load sources → Fetch RSS → Extract text → Hash → Check DB | `Is New Item?` (true/false) |
| **3. Classify** | Call Claude (stub or real) to score relevance/credibility | `use_stubs` → `Meets Threshold?` (≥50) |
| **4. Summarize** | Generate insight content, apply publish gates | `use_stubs` → status = `published` or `queued` |
| **5. Aggregate** | Collect results, query new insights | `Has New Insights?` |
| **6. Publish** | Generate feeds (RSS/JSON/MD), commit to GitHub | `use_stubs` for GitHub |

## Key Thresholds

Configured in `config/thresholds.yml`:

| Threshold | Value | Purpose |
|-----------|-------|---------|
| `ingestion.relevance_threshold` | **50** | Minimum relevance score to generate an insight |
| `publishing.auto_publish_relevance` | **70** | Minimum relevance for auto-publish |
| `publishing.auto_publish_credibility` | **60** | Minimum credibility for auto-publish |
| `ideas.min_relevance_for_idea` | **80** | Minimum relevance to trigger idea generation |

## Runtime Mode Toggle

The workflow supports stub/real mode via `thresholds.runtime.use_stubs`:

- **`use_stubs: true`** (default): Uses keyword-based classification and summarization stubs, logs GitHub commits without executing
- **`use_stubs: false`**: Calls real Claude API for classification/summarization, commits to GitHub via Git Data API

## Node Reference

### Initialization Nodes
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `cron-trigger` | Every 6 Hours | scheduleTrigger | Triggers workflow every 6 hours |
| `fetch-sources-config` | Fetch Sources Config | httpRequest | GET /api/config/sources |
| `fetch-thresholds-config` | Fetch Thresholds Config | httpRequest | GET /api/config/thresholds |
| `fetch-classify-prompt` | Fetch Classify Prompt | httpRequest | GET /api/agents/classify |
| `fetch-summarize-prompt` | Fetch Summarize Prompt | httpRequest | GET /api/agents/summarize |
| `merge-configs` | Merge Configs | merge | Combines sources + thresholds |
| `merge-prompts` | Merge Prompts | merge | Combines classify + summarize prompts |
| `merge-all` | Merge All | merge | Combines configs + prompts |
| `merge-config` | Merge Config & Agents | code | Consolidates into single context object |
| `load-sources` | Load Sources | code | Filters enabled sources, fans out |

### Fetch & Dedupe Nodes
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `fetch-and-extract` | Fetch RSS & Extract Items | code | HTTP fetch RSS, parse XML |
| `extract-text` | Extract Text | code | Strip HTML, decode entities |
| `compute-hash` | Compute Hash | crypto | SHA256 of extracted text |
| `check-duplicate` | Check Duplicate | postgres | Query source_items by hash |
| `evaluate-duplicate` | Evaluate Duplicate | code | Merge DB result with item |
| `is-new-item` | Is New Item? | if | Branch on duplicate status |
| `insert-source-item` | Insert Source Item | postgres | INSERT into source_items |
| `log-duplicate` | Log Duplicate | code | Log skipped duplicates |

### Classification Nodes
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `use-stubs-classify` | Use Stubs for Classify? | if | Branch on use_stubs flag |
| `classify-stub` | Classify Stub (Claude) | code | Keyword-based classification |
| `classify-real` | Classify with Claude API | httpRequest | POST to Claude API |
| `wrap-classify-response` | Wrap Claude Classify Response | code | Normalize API response |
| `parse-classification` | Parse Classification | code | Extract JSON from response |
| `validate-classification` | Validate Classification | code | Schema validation |
| `apply-threshold` | Apply Threshold | code | Compare score vs config |
| `check-threshold` | Meets Threshold? | if | Branch on relevance score |
| `log-skipped` | Log Skipped | code | Log below-threshold items |

### Summarization Nodes
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `use-stubs-summarize` | Use Stubs for Summarize? | if | Branch on use_stubs flag |
| `summarize-stub` | Summarize Stub (Claude) | code | Basic text extraction |
| `summarize-real` | Summarize with Claude API | httpRequest | POST to Claude API |
| `wrap-summarize-response` | Wrap Claude Summarize Response | code | Normalize API response |
| `parse-summary` | Parse Summary & Gates | code | Extract JSON, apply publish gates |
| `validate-summary` | Validate Summary | code | Schema validation |
| `prepare-insight` | Build Insight Query | code | Construct INSERT SQL |
| `insert-insight` | Insert Insight | postgres | INSERT into insights |
| `is-published` | Is Published? | if | Branch on status |

### Aggregation & Publishing Nodes
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `aggregate-results` | Aggregate Results | code | Count results by type |
| `workflow-complete` | Workflow Complete | code | Log completion, prepare publishing |
| `query-new-published` | Query New Published Insights | postgres | Get insights from last 7 hours |
| `has-new-insights` | Has New Insights? | if | Branch on result count |
| `log-no-new-insights` | Log No New Insights | code | Log when nothing to publish |
| `query-all-published` | Query All Published Insights | postgres | Get up to 100 for feeds |
| `generate-rss-feed` | Generate RSS Feed | code | Build RSS 2.0 XML |
| `generate-json-feed` | Generate JSON Feed | code | Build JSON Feed 1.1 |
| `generate-insight-markdown` | Generate Insight Markdown | code | Build frontmatter .md files |

### GitHub Publishing Nodes
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `use-stubs-publish` | Use Stubs for Publishing? | if | Branch on use_stubs flag |
| `github-commit-stub-publish` | GitHub Commit Stub (Feeds) | code | Log-only stub |
| `prepare-github-commit` | Prepare GitHub Commit | code | Build files array |
| `get-branch-ref` | Get Branch Ref | httpRequest | GET /git/ref/heads/main |
| `get-base-tree` | Get Base Tree | httpRequest | GET /git/commits/{sha} |
| `build-tree-entries` | Build Tree Entries | code | Prepare tree structure |
| `create-tree` | Create Tree | httpRequest | POST /git/trees |
| `create-commit` | Create Commit | httpRequest | POST /git/commits |
| `update-branch-ref` | Update Branch Ref | httpRequest | PATCH /git/refs/heads/main |
| `wrap-github-response` | Wrap GitHub Response | code | Summarize commit result |

## Data Flow

```
Source Config → [source1, source2, ...] → RSS Items → Dedupe → New Items Only
                                                                    ↓
                                              Classify (topics, scores) → Filter by threshold
                                                                                   ↓
                                                    Summarize (title, tldr, bullets) → Publish gates
                                                                                              ↓
                                                                        Insert Insight → Generate Feeds → GitHub Commit
```

## External Dependencies

| Service | Purpose | Credentials |
|---------|---------|-------------|
| **Postgres (Cloud SQL)** | Store source_items, insights | `postgres` credential |
| **Claude API (Anthropic)** | Classification & summarization | `httpHeaderAuth` with API key |
| **GitHub API** | Commit feeds and markdown | `httpHeaderAuth` with token |
| **Libertas Website API** | Fetch configs and prompts | None (public endpoints) |




# New Workflow A (Implemented)

The workflow has been restructured to use **Loop Over Sources (Split In Batches)** for per-source processing. Each source is now processed in its own loop iteration, with classification and summarization happening within each iteration before aggregating results.

## Updated Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIALIZATION (same as before)                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────┐
                                        │   ⏰ Every 6 Hours   │
                                        │   (Cron Trigger)    │
                                        └──────────┬──────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
          ┌─────────▼─────────┐         ┌─────────▼─────────┐         ┌─────────▼─────────┐
          │ Fetch Sources     │         │ Fetch Thresholds  │         │ Fetch Classify &  │
          │ Config            │         │ Config            │         │ Summarize Prompts │
          └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
                    │                              │                              │
                    └──────────────────────────────┼──────────────────────────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │  Merge Config &     │
                                        │  Agents             │
                                        └──────────┬──────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │    Load Sources     │
                                        │  (returns N items)  │
                                        └──────────┬──────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2-4: LOOP OVER SOURCES (Split In Batches, batchSize=1)                                                     │
│  Each source processed independently in its own iteration                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │  Loop Over Sources  │◄────────────────────────────────────────────────┐
                                        │ (Split In Batches)  │                                                 │
                                        └────┬───────────┬────┘                                                 │
                                             │           │                                                      │
                              ┌───────────────┘           └──────────────────────────────┐                       │
                              │ (done - output 0)                   (loop - output 1) │                       │
                              ▼                                                          ▼                       │
               ┌──────────────────────────────┐                           ┌──────────────────────┐              │
               │    Workflow Complete         │                           │ Fetch RSS & Extract  │              │
               │    (triggers Phase 5)        │                           │ Items (1 source)     │              │
               └──────────────────────────────┘                           └──────────┬───────────┘              │
                              │                                                                                  │
               ┌──────────────▼───────────────┐                                                                  │
               │  Extract Text → Hash →       │                                                                  │
               │  Check Duplicate             │                                                                  │
               └──────────────┬───────────────┘                                                                  │
                              │                                                                                  │
               ┌──────────────▼───────────────┐                                                                  │
               │      Is New Item?            │                                                                  │
               └───────┬───────────────┬──────┘                                                                  │
                       │               │                                                                         │
            YES ───────┘               └────── NO                                                                │
                       │                       │                                                                 │
               ┌───────▼───────┐       ┌───────▼───────┐                                                         │
               │ Insert Source │       │ Log Duplicate │──────────────────────────────────────┐                  │
               │ Item          │       │ (or _skip)    │                                      │                  │
               └───────┬───────┘       └───────────────┘                                      │                  │
                       │                                                                      │                  │
               ┌───────▼───────────────┐                                                      │                  │
               │  Classify (stub/real) │                                                      │                  │
               └───────┬───────────────┘                                                      │                  │
                       │                                                                      │                  │
               ┌───────▼───────────────┐                                                      │                  │
               │  Meets Threshold?     │                                                      │                  │
               └───────┬───────────────┬──────┘                                               │                  │
                       │               │                                                      │                  │
            YES ───────┘               └────── NO                                             │                  │
                       │                       │                                              │                  │
               ┌───────▼───────────────┐ ┌─────▼───────┐                                      │                  │
               │ Summarize (stub/real) │ │ Log Skipped │──────────────────────────────────────┤                  │
               └───────┬───────────────┘ └─────────────┘                                      │                  │
                       │                                                                      │                  │
               ┌───────▼───────────────┐                                                      │                  │
               │    Insert Insight     │                                                      │                  │
               └───────┬───────────────┘                                                      │                  │
                       │                                                                      │                  │
               ┌───────▼───────────────┐                                                      │                  │
               │    Is Published?      │                                                      │                  │
               └───────┬───────────────┬──────┘                                               │                  │
                       │               │                                                      │                  │
                       └───────────────┼──────────────────────────────────────────────────────┘                  │
                                       │                                                                         │
                            ┌──────────▼──────────┐                                                              │
                            │  Aggregate Results  │──────────────────────────────────────────────────────────────┘
                            │  (count & loop back)│              (loop back to process next source)
                            └─────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5-6: AGGREGATION & PUBLISHING (triggered when loop completes via "done" output)                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────┐
                                        │  Workflow Complete  │ (from Loop Over Sources "done" output)
                                        └──────────┬──────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │ Query New Published │
                                        │ Insights (last 7h)  │
                                        └──────────┬──────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │  Has New Insights?  │
                                        └────┬───────────┬────┘
                                             │           │
                              YES ───────────┘           └──────── NO
                                             │                     │
                              ┌──────────────▼──────────┐   ┌──────▼──────────┐
                              │ Query All Published     │   │ Log No New      │
                              │ Insights (for feeds)    │   │ Insights (END)  │
                              └──────────────┬──────────┘   └─────────────────┘
                                             │
                              ┌──────────────▼──────────┐
                              │ Generate RSS/JSON Feeds │
                              │ + Insight Markdown      │
                              └──────────────┬──────────┘
                                             │
                              ┌──────────────▼──────────┐
                              │ Use Stubs for Publish?  │
                              └────┬───────────────┬────┘
                                   │               │
                    use_stubs=true │               │ use_stubs=false
                                   │               │
                    ┌──────────────▼──┐   ┌────────▼───────────────┐
                    │ GitHub Stub     │   │ GitHub Git Data API    │
                    │ (log only, END) │   │ (atomic commit, END)   │
                    └─────────────────┘   └────────────────────────┘
```

## Phase Summary

| Phase | Description | Key Decision Points |
|-------|-------------|---------------------|
| **1. Init** | Parallel fetch of 4 configs (sources, thresholds, classify prompt, summarize prompt) | - |
| **2-4. Loop** | Load Sources → **Loop Over Sources** (batchSize=1) → For each source: Fetch RSS → Extract → Hash → Dedupe → Classify → Summarize → Aggregate → Loop back | `Is New Item?`, `Meets Threshold?`, `use_stubs` |
| **5. Aggregate** | When loop completes (all sources processed), query new insights | `Has New Insights?` |
| **6. Publish** | Generate feeds (RSS/JSON/MD), commit to GitHub | `use_stubs` for GitHub |

## Key Changes from Previous Version

1. **Loop Over Sources Node**: Added `n8n-nodes-base.splitInBatches` with `batchSize: 1` after Load Sources
2. **Per-Source Processing**: Each source now processes independently in its own loop iteration
3. **Loop-Back Flow**: Aggregate Results connects back to Loop Over Sources for next iteration
4. **Done Output**: Loop Over Sources "done" output (index 1) triggers Workflow Complete when all sources processed
5. **Skip Handling**: `_skip` items (source errors, no items) routed through Log Duplicate path to Aggregate Results

## Node Reference Updates

### New Node
| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `loop-over-sources` | Loop Over Sources | splitInBatches | Process one source per iteration (batchSize=1) |

### Updated Nodes
| Node ID | Changes |
|---------|---------|
| `fetch-and-extract` | Now handles single source per iteration instead of all sources |
| `extract-text` | Added `_skip` item pass-through logic |
| `evaluate-duplicate` | Routes `_skip` items to duplicate path (isNew=false) |
| `log-duplicate` | Handles both duplicates and `_skip` items with proper reason logging |

### Updated Connections
| From | To (Old) | To (New) |
|------|----------|----------|
| Load Sources | Fetch RSS & Extract Items | Loop Over Sources |
| Loop Over Sources (done - output 0) | - | Workflow Complete |
| Loop Over Sources (loop - output 1) | - | Fetch RSS & Extract Items |
| Aggregate Results | Workflow Complete | Loop Over Sources (loop back) |

**Note**: n8n's Split In Batches node has output 0 = "Done" (all batches complete) and output 1 = "Loop" (items to process).
