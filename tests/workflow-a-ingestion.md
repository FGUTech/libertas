# Workflow A: Daily Ingestion - Test Documentation

## Overview

**Purpose:** Fetch content from curated sources, classify relevance using Claude AI, generate insights, and auto-publish or queue for review.

**Trigger:** Schedule (every 6 hours) or manual

**Tables Affected:**
- `source_items` (INSERT new items with classification scores)
- `insights` (INSERT generated insights)
- `source_health` (UPDATE source status on failures)
- `user_story_items` (READ queued user stories as additional input)

---

## Pre-Test Database Queries

Run these queries to capture the state before testing:

```sql
-- 1. Count existing source_items
SELECT COUNT(*) AS total_source_items FROM source_items;

-- 2. Get most recent source_items (for comparison)
SELECT id, url, platform, content_hash, freedom_relevance_score, credibility_score, created_at
FROM source_items
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count existing insights by status
SELECT status, COUNT(*) FROM insights GROUP BY status;

-- 4. Get most recent insights
SELECT id, title, status, freedom_relevance_score, credibility_score, created_at
FROM insights
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check source_health status
SELECT source_url, status, consecutive_failures, last_success_at, last_failure_at
FROM source_health
ORDER BY last_failure_at DESC NULLS LAST
LIMIT 10;

-- 6. Check pending user_story_items (should be processed)
SELECT id, title, submission_id, insight_generated, freedom_relevance_score
FROM user_story_items
WHERE insight_generated = false;
```

---

## Test Execution Steps

### In n8n:

1. **Navigate to Workflow A** (Daily Ingestion workflow)

2. **Check Workflow Settings:**
   - Verify schedule trigger is configured (every 6 hours)
   - Note: Manual execution bypasses schedule

3. **Toggle Stub Mode (Optional):**
   - If testing without real Claude API calls, ensure `runtime.use_stubs: true` in thresholds config
   - For full integration test, ensure `runtime.use_stubs: false`

4. **Execute Workflow Manually:**
   - Click "Execute Workflow" button
   - Watch execution progress in real-time

5. **Monitor Execution:**
   - Observe each node's execution status (green = success, red = failure)
   - Note any nodes that are skipped (e.g., no new content to process)

---

## Post-Test Database Queries

Run these queries after workflow execution:

```sql
-- 1. Count source_items after (compare to pre-test)
SELECT COUNT(*) AS total_source_items FROM source_items;

-- 2. Get NEW source_items created during test
SELECT id, url, platform, content_hash, freedom_relevance_score, credibility_score, created_at
FROM source_items
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Count insights by status after (compare to pre-test)
SELECT status, COUNT(*) FROM insights GROUP BY status;

-- 4. Get NEW insights created during test
SELECT id, title, tldr, status, freedom_relevance_score, credibility_score, topics, created_at
FROM insights
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 5. Check if user_story_items were processed
SELECT id, title, insight_generated, insight_id
FROM user_story_items
WHERE updated_at > NOW() - INTERVAL '1 hour';

-- 6. Verify source_health updates
SELECT source_url, status, consecutive_failures, last_success_at, last_failure_at, last_error_message
FROM source_health
WHERE last_success_at > NOW() - INTERVAL '1 hour'
   OR last_failure_at > NOW() - INTERVAL '1 hour';
```

---

## n8n Execution History Checks

### What to Look For:

1. **Fetch Sources Node:**
   - Should return list of enabled sources from `config/sources.yml`
   - Expected: 26+ sources across Tier 1-3

2. **Fetch Content Nodes (per source):**
   - Check RSS/web fetch succeeded
   - Note any failures (will be logged in source_health)

3. **Dedupe Node:**
   - Should filter out items where `content_hash` already exists
   - If all items are dupes, subsequent nodes may be skipped

4. **Classify Node (Claude API):**
   - Input: sourceUrl, extractedText, platform, author, publishedAt
   - Output should contain:
     - `topics[]` (valid values: bitcoin, zk, censorship-resistance, comms, payments, identity, privacy, surveillance, activism, sovereignty)
     - `freedom_relevance_score` (0-100)
     - `credibility_score` (0-100)
     - `geo[]`
     - `key_entities[]`
     - `reasoning`

5. **Score Check Node:**
   - Items with `freedom_relevance_score >= 50` continue to summarize
   - Lower scores should be filtered out

6. **Summarize Node (Claude API):**
   - Input: classified item data
   - Output should contain:
     - `title` (max 120 chars)
     - `tldr` (1-2 sentences, max 280 chars)
     - `summary_bullets[]` (5-10 items)
     - `deep_dive_markdown` (if relevance >= threshold)
     - `citations[]`
     - `recommended_actions[]`

7. **Auto-Publish Check:**
   - Conditions for auto-publish (ALL must be true):
     - `freedom_relevance_score >= 70`
     - `credibility_score >= 60`
     - Has citations
     - Safety check passed
   - If not met, status should be `queued`

8. **Database Insert Nodes:**
   - `source_items` insert should include classification scores
   - `insights` insert should include full summary data

---

## Expected Behaviors

### Success Indicators:
- [ ] New `source_items` records created (unless all content was duplicates)
- [ ] Classification scores populated in `source_items` (not NULL)
- [ ] New `insights` created for items with relevance >= 50
- [ ] Auto-published insights have status='published' and scores >= thresholds
- [ ] Queued insights have status='queued'
- [ ] `source_health` shows successful fetches

### Potential Issues:
- **No new source_items:** All content was deduplicated (check `content_hash`)
- **No insights generated:** All scores below relevance threshold (50)
- **Classification errors:** Check Claude API response in execution log
- **Source failures:** Check `source_health` for consecutive_failures

---

## Data Validation Checklist

For each new `source_item`:
- [ ] `url` is valid URL
- [ ] `platform` matches source type (rss, web, x, nostr, github, email)
- [ ] `content_hash` is unique (64-char hex)
- [ ] `extracted_text` contains actual content (not empty)
- [ ] `freedom_relevance_score` is 0-100 integer
- [ ] `credibility_score` is 0-100 integer

For each new `insight`:
- [ ] `source_item_ids` references valid source_items
- [ ] `title` is <= 120 characters
- [ ] `tldr` is <= 280 characters
- [ ] `topics` contains valid enum values only
- [ ] `status` is one of: draft, queued, published, rejected
- [ ] If status='published': scores meet auto-publish thresholds

---

## Paste Test Results Here

### Pre-Test Snapshot
```
(Paste pre-test query results here)
```

### Post-Test Snapshot
```
(Paste post-test query results here)
```

### n8n Execution Summary
```
Execution ID:
Duration:
Status:
Nodes executed:
Errors/Warnings:
```

### Items Processed
```
New source_items: X
New insights (published): X
New insights (queued): X
Sources failed: X
Duplicates filtered: X
```
