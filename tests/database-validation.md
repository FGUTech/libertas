# Database Validation - Test Documentation

## Overview

This document covers database table inspection, field validation, and frontend display considerations for all Libertas tables.

---

## Table: `source_items`

**Purpose:** Stores raw fetched content from curated sources before processing.

**Populated by:** Workflow A (Daily Ingestion)

**Read by:** Workflow A (deduplication check)

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `url` | TEXT | Workflow A | Valid URL | NOT NULL |
| `platform` | VARCHAR(20) | Workflow A | rss, web, x, nostr, github, email | CHECK constraint |
| `fetched_at` | TIMESTAMPTZ | Workflow A | Timestamp | NOT NULL DEFAULT NOW() |
| `raw_content_ref` | TEXT | Workflow A | S3/storage reference | Optional |
| `extracted_text` | TEXT | Workflow A | Actual content | Should be non-empty |
| `content_hash` | VARCHAR(64) | Workflow A | SHA-256 hex | UNIQUE, NOT NULL |
| `author` | TEXT | Workflow A | Author name/handle | Optional |
| `account_handle` | TEXT | Workflow A | @handle format | Optional |
| `published_at` | TIMESTAMPTZ | Workflow A | Original publish date | Optional |
| `language` | VARCHAR(10) | Workflow A | ISO 639-1 code (en, es, etc) | Optional |
| `freedom_relevance_score` | INTEGER | Workflow A (classify) | 0-100 | CHECK 0-100 |
| `credibility_score` | INTEGER | Workflow A (classify) | 0-100 | CHECK 0-100 |
| `metadata` | JSONB | Workflow A | Extra data | Optional |
| `created_at` | TIMESTAMPTZ | Auto | Timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Auto | Timestamp | Trigger updated |

### Validation Queries

```sql
-- Check for NULL scores (should be populated by classify agent)
SELECT COUNT(*) AS items_without_scores
FROM source_items
WHERE freedom_relevance_score IS NULL OR credibility_score IS NULL;

-- Check for invalid platform values
SELECT platform, COUNT(*)
FROM source_items
GROUP BY platform
ORDER BY COUNT(*) DESC;

-- Check for duplicate content_hash (should be impossible)
SELECT content_hash, COUNT(*)
FROM source_items
GROUP BY content_hash
HAVING COUNT(*) > 1;

-- Check for empty extracted_text
SELECT COUNT(*) AS items_without_text
FROM source_items
WHERE extracted_text IS NULL OR extracted_text = '';

-- Check score distributions
SELECT
  CASE
    WHEN freedom_relevance_score >= 90 THEN '90-100'
    WHEN freedom_relevance_score >= 70 THEN '70-89'
    WHEN freedom_relevance_score >= 50 THEN '50-69'
    WHEN freedom_relevance_score >= 30 THEN '30-49'
    ELSE '0-29'
  END AS relevance_bucket,
  COUNT(*)
FROM source_items
GROUP BY 1
ORDER BY 1;
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| No | - | Internal table, not user-facing |
| Debug | Admin panel | Could show for debugging/monitoring |

---

## Table: `insights`

**Purpose:** Stores generated analysis/summaries of source content.

**Populated by:** Workflow A (summarize agent)

**Read by:** Workflow B (digest), Workflow D (idea generation), Frontend (public display)

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `source_item_ids` | UUID[] | Workflow A | Array of source_items.id | NOT NULL, non-empty |
| `title` | TEXT | Workflow A (summarize) | Headline | NOT NULL, max 120 chars |
| `tldr` | TEXT | Workflow A (summarize) | 1-2 sentences | NOT NULL, max 280 chars |
| `summary_bullets` | TEXT[] | Workflow A (summarize) | 5-10 bullet points | NOT NULL, non-empty |
| `deep_dive_markdown` | TEXT | Workflow A (summarize) | Extended analysis | Optional (high-score only) |
| `topics` | VARCHAR(50)[] | Workflow A (classify) | Valid topic enums | NOT NULL, non-empty |
| `geo` | VARCHAR(100)[] | Workflow A (classify) | Country/region names | Optional |
| `freedom_relevance_score` | INTEGER | Workflow A | 0-100 | CHECK 0-100 |
| `credibility_score` | INTEGER | Workflow A | 0-100 | CHECK 0-100 |
| `citations` | TEXT[] | Workflow A (summarize) | URLs | Should be non-empty |
| `status` | VARCHAR(20) | Workflow A | draft, queued, published, rejected | CHECK constraint |
| `published_url` | TEXT | System | URL to published insight | Optional |
| `published_at` | TIMESTAMPTZ | System | Publish timestamp | Set when status=published |
| `created_at` | TIMESTAMPTZ | Auto | Timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Auto | Timestamp | Trigger updated |

### Valid Topics Enum

```
bitcoin, zk, censorship-resistance, comms, payments, identity, privacy, surveillance, activism, sovereignty
```

### Validation Queries

```sql
-- Check status distribution
SELECT status, COUNT(*) FROM insights GROUP BY status;

-- Check for invalid topics
SELECT DISTINCT unnest(topics) AS topic
FROM insights
ORDER BY topic;

-- Verify auto-publish logic: published items should have high scores
SELECT COUNT(*) AS low_score_published
FROM insights
WHERE status = 'published'
  AND (freedom_relevance_score < 70 OR credibility_score < 60);

-- Check title length
SELECT COUNT(*) AS titles_too_long
FROM insights
WHERE LENGTH(title) > 120;

-- Check tldr length
SELECT COUNT(*) AS tldr_too_long
FROM insights
WHERE LENGTH(tldr) > 280;

-- Check for empty citations on published items (should have citations)
SELECT COUNT(*) AS published_without_citations
FROM insights
WHERE status = 'published'
  AND (citations IS NULL OR array_length(citations, 1) = 0);

-- Verify source_item_ids reference valid records
SELECT i.id AS insight_id, unnest(i.source_item_ids) AS source_id
FROM insights i
WHERE NOT EXISTS (
  SELECT 1 FROM source_items si
  WHERE si.id = ANY(i.source_item_ids)
);
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| Yes | Insights feed | Main public content |
| Yes | Insight detail page | Full insight with deep_dive |
| Yes | Topic filters | Filter by topics[] |
| Yes | Search | Search title, tldr |
| No | draft/rejected | Only show status='published' |

**Display Fields:**
- `title` - Main headline
- `tldr` - Summary/preview
- `summary_bullets` - Bullet list
- `deep_dive_markdown` - Full analysis (if exists)
- `topics` - Tags/categories
- `geo` - Location context
- `citations` - Source links
- `published_at` - Display date

---

## Table: `project_ideas`

**Purpose:** Stores project proposals synthesized from insights.

**Populated by:** Workflow D (Idea Generator)

**Read by:** Workflow B (digest inclusion), Frontend (public display), GitHub (linked issues)

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `derived_from_insight_ids` | UUID[] | Workflow D | Array of insights.id | NOT NULL, non-empty |
| `detected_pattern` | TEXT | Workflow D | Pattern description | NOT NULL |
| `problem_statement` | TEXT | Workflow D | Problem description | NOT NULL |
| `threat_model` | TEXT | Workflow D | Threat analysis | NOT NULL |
| `affected_groups` | TEXT[] | Workflow D | User groups affected | NOT NULL, non-empty |
| `proposed_solution` | TEXT | Workflow D | Solution description | NOT NULL |
| `mvp_scope` | TEXT | Workflow D | MVP definition | NOT NULL |
| `misuse_risks` | TEXT | Workflow D | Potential misuse | NOT NULL |
| `feasibility_score` | INTEGER | Workflow D | 0-100 | CHECK 0-100, >= 50 |
| `impact_score` | INTEGER | Workflow D | 0-100 | CHECK 0-100, >= 50 |
| `status` | VARCHAR(20) | System | new, triaged, build_candidate, prototyped, rejected | CHECK |
| `github_issue_url` | TEXT | Workflow D | GitHub issue URL | Should be set |
| `technical_dependencies` | TEXT[] | Workflow D | Tech dependencies | Optional |
| `suggested_stack` | TEXT[] | Workflow D | Suggested technologies | Optional |
| `prior_art` | TEXT[] | Workflow D | Related projects | Optional |
| `open_questions` | TEXT[] | Workflow D | Unresolved questions | Optional |
| `created_at` | TIMESTAMPTZ | Auto | Timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Auto | Timestamp | Trigger updated |

### Validation Queries

```sql
-- Check status distribution
SELECT status, COUNT(*) FROM project_ideas GROUP BY status;

-- Check for ideas below threshold (shouldn't exist)
SELECT COUNT(*) AS below_threshold
FROM project_ideas
WHERE feasibility_score < 50 OR impact_score < 50;

-- Check for missing GitHub issues
SELECT COUNT(*) AS missing_github_url
FROM project_ideas
WHERE github_issue_url IS NULL OR github_issue_url = '';

-- Verify derived_from_insight_ids reference valid records
SELECT pi.id AS idea_id, unnest(pi.derived_from_insight_ids) AS insight_id
FROM project_ideas pi
WHERE NOT EXISTS (
  SELECT 1 FROM insights i
  WHERE i.id = ANY(pi.derived_from_insight_ids)
);

-- Check for empty required arrays
SELECT COUNT(*) AS missing_affected_groups
FROM project_ideas
WHERE affected_groups IS NULL OR array_length(affected_groups, 1) = 0;

-- Score distribution
SELECT
  AVG(feasibility_score) AS avg_feasibility,
  AVG(impact_score) AS avg_impact,
  MIN(feasibility_score) AS min_feasibility,
  MIN(impact_score) AS min_impact,
  MAX(feasibility_score) AS max_feasibility,
  MAX(impact_score) AS max_impact
FROM project_ideas;
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| Yes | Ideas page/section | Public project proposals |
| Yes | Idea detail page | Full proposal |
| Yes | Linked from digest | Weekly digest includes ideas |
| Yes | GitHub link | Link to issue for discussion |

**Display Fields:**
- `detected_pattern` - Title/headline
- `problem_statement` - Problem being addressed
- `proposed_solution` - Solution approach
- `mvp_scope` - What MVP would include
- `feasibility_score`, `impact_score` - Badges/indicators
- `affected_groups` - Who benefits
- `suggested_stack` - Tech recommendations
- `github_issue_url` - "Discuss on GitHub" link

---

## Table: `submissions`

**Purpose:** Stores user-submitted content (stories, feedback, project ideas).

**Populated by:** Workflow C (Intake webhook)

**Read by:** Admin panel, Workflow C (rate limiting)

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `submitted_at` | TIMESTAMPTZ | Workflow C | Timestamp | DEFAULT NOW() |
| `channel` | VARCHAR(20) | Workflow C | web, email, nostr | CHECK |
| `contact` | TEXT | User input | Email/handle | Optional, NOT INDEXED |
| `message` | TEXT | User input | Submission content | NOT NULL |
| `tags` | VARCHAR(50)[] | System | Content tags | Optional |
| `submission_type` | VARCHAR(20) | User/System | story, project, feedback | CHECK |
| `title` | TEXT | User input | Story/project title | Optional |
| `source_url` | TEXT | User input | Reference URL | Optional |
| `region` | VARCHAR(100) | User input | Geographic context | Optional |
| `urgency` | VARCHAR(20) | User input | urgent, normal, low | DEFAULT 'normal' |
| `freedom_relevance_score` | INTEGER | Workflow C (classify) | 0-100 | For stories |
| `credibility_score` | INTEGER | Workflow C (classify) | 0-100 | For stories |
| `safety_concern` | BOOLEAN | Workflow C (classify) | true/false | For stories |
| `queued_for_insight` | BOOLEAN | Workflow C | true/false | If story will be processed |
| `risk_level` | VARCHAR(10) | Workflow C | low, medium, high | Assessment |
| `status` | VARCHAR(20) | System | new, triaged, responded, archived | CHECK |
| `github_issue_url` | TEXT | Workflow C | GitHub issue URL | Optional |
| `category` | VARCHAR(30) | System | Various categories | Optional |
| `priority` | VARCHAR(10) | System | urgent, normal, low | Optional |
| `is_spam` | BOOLEAN | System | true/false | DEFAULT false |
| `created_at` | TIMESTAMPTZ | Auto | Timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Auto | Timestamp | Trigger updated |

### Validation Queries

```sql
-- Check submission type distribution
SELECT submission_type, COUNT(*) FROM submissions GROUP BY submission_type;

-- Check status distribution
SELECT status, COUNT(*) FROM submissions GROUP BY status;

-- Check spam rate
SELECT is_spam, COUNT(*) FROM submissions GROUP BY is_spam;

-- Check stories with classification
SELECT COUNT(*) AS classified_stories
FROM submissions
WHERE submission_type = 'story'
  AND freedom_relevance_score IS NOT NULL;

-- Check queued stories
SELECT COUNT(*) AS queued_for_insight
FROM submissions
WHERE queued_for_insight = true;

-- Check channel distribution
SELECT channel, COUNT(*) FROM submissions GROUP BY channel;

-- Recent submissions
SELECT id, submission_type, channel, status, is_spam, created_at
FROM submissions
ORDER BY created_at DESC
LIMIT 20;
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| Yes | Submit form | Public submission interface |
| No | Submission list | Admin only |
| No | Raw submissions | Privacy concern |

**Frontend Forms:**
- Story submission: title, message, source_url, region, urgency, contact
- Feedback submission: message, contact
- Project submission: title, message, contact

---

## Table: `user_story_items`

**Purpose:** Queued user stories awaiting insight generation (processed as tier-2 sources).

**Populated by:** Workflow C (when story qualifies)

**Read by:** Workflow A (processes pending stories)

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `submission_id` | UUID | Workflow C | submissions.id reference | NOT NULL |
| `url` | TEXT | Workflow C | intake://submission/{id} or URL | NOT NULL |
| `platform` | VARCHAR(20) | Workflow C | Always 'web' | CHECK |
| `extracted_text` | TEXT | Workflow C | Story message | NOT NULL |
| `content_hash` | VARCHAR(64) | Workflow C | SHA-256 hex | UNIQUE |
| `author` | TEXT | Workflow C | 'community' or contact | DEFAULT 'community' |
| `published_at` | TIMESTAMPTZ | Workflow C | Submission time | |
| `title` | TEXT | Workflow C | Story title | Optional |
| `region` | VARCHAR(100) | Workflow C | Geographic context | Optional |
| `urgency` | VARCHAR(20) | Workflow C | urgent, normal, low | |
| `source_content` | TEXT | Workflow C | If sourceUrl was fetched | Optional |
| `tier` | INTEGER | Workflow C | Always 2 | |
| `topics` | VARCHAR(50)[] | Workflow C | From classification | |
| `freedom_relevance_score` | INTEGER | Workflow C | 0-100 | |
| `credibility_score` | INTEGER | Workflow C | 0-100 | |
| `geo` | VARCHAR(100)[] | Workflow C | From classification | Optional |
| `safety_concern` | BOOLEAN | Workflow C | Should be false | |
| `reasoning` | TEXT | Workflow C | Classification reasoning | Optional |
| `risk_level` | VARCHAR(10) | Workflow C | low, medium, high | |
| `priority` | VARCHAR(10) | Workflow C | urgent, normal, low | |
| `summary_text` | VARCHAR(200) | Workflow C | Short summary | Optional |
| `key_entities` | TEXT[] | Workflow C | Named entities | Optional |
| `insight_generated` | BOOLEAN | Workflow A | true/false | DEFAULT false |
| `insight_id` | UUID | Workflow A | insights.id reference | Set when processed |

### Validation Queries

```sql
-- Check pending vs processed
SELECT insight_generated, COUNT(*)
FROM user_story_items
GROUP BY insight_generated;

-- Check safety_concern (should all be false - only safe stories queued)
SELECT safety_concern, COUNT(*)
FROM user_story_items
GROUP BY safety_concern;

-- Verify submission_id references
SELECT usi.id
FROM user_story_items usi
LEFT JOIN submissions s ON s.id = usi.submission_id
WHERE s.id IS NULL;

-- Verify insight_id references (when set)
SELECT usi.id
FROM user_story_items usi
LEFT JOIN insights i ON i.id = usi.insight_id
WHERE usi.insight_id IS NOT NULL AND i.id IS NULL;

-- Score distributions
SELECT
  AVG(freedom_relevance_score) AS avg_relevance,
  AVG(credibility_score) AS avg_credibility
FROM user_story_items;
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| No | - | Internal processing table |
| Indirect | Via insights | When processed, shows as insight |

---

## Table: `digests`

**Purpose:** Stores weekly digest summaries.

**Populated by:** Workflow B (Weekly Digest)

**Read by:** Frontend (public display), RSS/JSON feeds

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `period_start` | DATE | Workflow B | Start of week | NOT NULL |
| `period_end` | DATE | Workflow B | End of week | NOT NULL |
| `insight_count` | INTEGER | Workflow B | Number of insights included | >= 3 |
| `tldr` | TEXT | Workflow B | 2-3 sentence summary | NOT NULL, max 500 chars |
| `content_markdown` | TEXT | Workflow B | Full markdown with frontmatter | NOT NULL |
| `top_topics` | VARCHAR(50)[] | Workflow B | Most common topics | |
| `published_url` | TEXT | System | URL to published digest | Optional |
| `published_at` | TIMESTAMPTZ | Workflow B | Publish timestamp | |
| `created_at` | TIMESTAMPTZ | Auto | Timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Auto | Timestamp | Trigger updated |

### Validation Queries

```sql
-- List all digests
SELECT id, period_start, period_end, insight_count, published_at, created_at
FROM digests
ORDER BY period_end DESC;

-- Check for overlapping periods (shouldn't exist)
SELECT d1.id, d2.id, d1.period_start, d1.period_end, d2.period_start, d2.period_end
FROM digests d1
JOIN digests d2 ON d1.id != d2.id
WHERE d1.period_start <= d2.period_end AND d1.period_end >= d2.period_start;

-- Verify insight_count >= 3
SELECT COUNT(*) AS below_minimum
FROM digests
WHERE insight_count < 3;

-- Check tldr length
SELECT COUNT(*) AS tldr_too_long
FROM digests
WHERE LENGTH(tldr) > 500;

-- Verify content_markdown has frontmatter
SELECT COUNT(*) AS missing_frontmatter
FROM digests
WHERE content_markdown NOT LIKE '---%';
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| Yes | Digest archive page | List of past digests |
| Yes | Latest digest | Homepage feature |
| Yes | RSS feed | digests-rss.xml |
| Yes | JSON feed | digests-feed.json |

**Display Fields:**
- `period_start`, `period_end` - Date range
- `tldr` - Summary preview
- `content_markdown` - Full rendered content
- `top_topics` - Topic tags
- `insight_count` - "X insights this week"

---

## Table: `source_health`

**Purpose:** Circuit breaker tracking for source reliability.

**Populated by:** Workflow A (on fetch success/failure)

**Read by:** Workflow A (skip failed sources)

### Fields

| Field | Type | Populated By | Expected Values | Validation |
|-------|------|--------------|-----------------|------------|
| `id` | UUID | Auto | Valid UUID | NOT NULL |
| `source_url` | TEXT | Workflow A | Source base URL | UNIQUE |
| `consecutive_failures` | INTEGER | Workflow A | Failure count | DEFAULT 0 |
| `last_success_at` | TIMESTAMPTZ | Workflow A | Last successful fetch | |
| `last_failure_at` | TIMESTAMPTZ | Workflow A | Last failed fetch | |
| `last_error_message` | TEXT | Workflow A | Error details | |
| `status` | VARCHAR(20) | Workflow A | healthy, degraded, failed | |
| `cooldown_until` | TIMESTAMPTZ | Workflow A | When to retry | |

### Validation Queries

```sql
-- Check source health status
SELECT status, COUNT(*) FROM source_health GROUP BY status;

-- List problematic sources
SELECT source_url, status, consecutive_failures, last_error_message, cooldown_until
FROM source_health
WHERE status != 'healthy'
ORDER BY consecutive_failures DESC;

-- Check for sources in cooldown
SELECT source_url, cooldown_until
FROM source_health
WHERE cooldown_until > NOW();
```

### Frontend Display

| Display? | Component | Notes |
|----------|-----------|-------|
| No | - | Internal monitoring |
| Maybe | Status page | Could show source availability |

---

## Complete Database Health Check

Run this comprehensive check after testing all workflows:

```sql
-- Overall table counts
SELECT 'source_items' AS table_name, COUNT(*) AS row_count FROM source_items
UNION ALL
SELECT 'insights', COUNT(*) FROM insights
UNION ALL
SELECT 'project_ideas', COUNT(*) FROM project_ideas
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'user_story_items', COUNT(*) FROM user_story_items
UNION ALL
SELECT 'digests', COUNT(*) FROM digests
UNION ALL
SELECT 'source_health', COUNT(*) FROM source_health;

-- Data quality summary
SELECT
  (SELECT COUNT(*) FROM source_items WHERE freedom_relevance_score IS NULL) AS source_items_missing_scores,
  (SELECT COUNT(*) FROM insights WHERE status = 'published' AND (freedom_relevance_score < 70 OR credibility_score < 60)) AS insights_published_below_threshold,
  (SELECT COUNT(*) FROM project_ideas WHERE github_issue_url IS NULL) AS ideas_missing_github,
  (SELECT COUNT(*) FROM submissions WHERE submission_type = 'story' AND freedom_relevance_score IS NULL) AS stories_missing_classification,
  (SELECT COUNT(*) FROM user_story_items WHERE insight_generated = false) AS stories_pending_insight,
  (SELECT COUNT(*) FROM source_health WHERE status = 'failed') AS failed_sources;
```

---

## Paste Validation Results Here

### Table Counts
```
(Paste table count results)
```

### Data Quality Summary
```
(Paste quality check results)
```

### Issues Found
```
(List any data quality issues discovered)
```
