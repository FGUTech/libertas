# Libertas Workflow Testing Guide

## Overview

This directory contains comprehensive test documentation for validating Libertas n8n workflows and database operations.

## Test Documents

| Document | Purpose |
|----------|---------|
| [workflow-a-ingestion.md](./workflow-a-ingestion.md) | Daily content ingestion workflow testing |
| [workflow-b-digest.md](./workflow-b-digest.md) | Weekly digest generation workflow testing |
| [workflow-c-intake.md](./workflow-c-intake.md) | User submission intake workflow testing |
| [workflow-d-ideas.md](./workflow-d-ideas.md) | Project idea generation workflow testing |
| [database-validation.md](./database-validation.md) | Database table inspection and validation |

---

## Testing Order

**Recommended sequence** (workflows have dependencies):

```
1. Workflow C (Intake)     - Independent, can run anytime
                             Tests form submissions

2. Workflow A (Ingestion)  - Processes sources + queued user stories
                             Populates source_items, insights

3. Workflow D (Ideas)      - Requires published insights from A
                             Generates project_ideas from high-score insights

4. Workflow B (Digest)     - Requires published insights from A
                             Requires project_ideas from D (optional)
                             Generates weekly digest

5. Database Validation     - Run after all workflows
                             Comprehensive data quality check
```

---

## Quick Start

### 1. Connect to Database

```bash
# Using psql directly
psql $DATABASE_URL

# Or with connection string
psql "postgresql://user:pass@host:5432/libertas"
```

### 2. Pre-Test Snapshot (All Tables)

```sql
-- Save this output before testing
SELECT 'source_items' AS tbl, COUNT(*) AS cnt FROM source_items
UNION ALL SELECT 'insights', COUNT(*) FROM insights
UNION ALL SELECT 'project_ideas', COUNT(*) FROM project_ideas
UNION ALL SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL SELECT 'user_story_items', COUNT(*) FROM user_story_items
UNION ALL SELECT 'digests', COUNT(*) FROM digests;
```

### 3. Run Workflows in n8n

1. Open n8n dashboard
2. Navigate to workflow
3. Click "Execute Workflow" (manual trigger)
4. Monitor execution
5. Check execution history for errors

### 4. Post-Test Snapshot

```sql
-- Compare to pre-test
SELECT 'source_items' AS tbl, COUNT(*) AS cnt FROM source_items
UNION ALL SELECT 'insights', COUNT(*) FROM insights
UNION ALL SELECT 'project_ideas', COUNT(*) FROM project_ideas
UNION ALL SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL SELECT 'user_story_items', COUNT(*) FROM user_story_items
UNION ALL SELECT 'digests', COUNT(*) FROM digests;
```

---

## Workflow Summary

### Workflow A: Daily Ingestion

**Trigger:** Every 6 hours (or manual)

**Flow:**
```
Fetch Sources → Fetch RSS/Web Content → Dedupe by content_hash
     ↓
Classify (Claude) → Score Check (≥50 relevance)
     ↓
Summarize (Claude) → Auto-publish Check (≥70 rel, ≥60 cred)
     ↓
Insert source_items → Insert insights (published or queued)
```

**Tables:** `source_items` (INSERT), `insights` (INSERT), `source_health` (UPDATE)

---

### Workflow B: Weekly Digest

**Trigger:** Sunday 9am UTC (or manual)

**Flow:**
```
Query Published Insights (last 7 days) → Query Project Ideas
     ↓
Check Threshold (≥3 insights required)
     ↓
Generate Digest (Claude) → Generate Markdown + RSS + JSON
     ↓
Atomic GitHub Commit (3 files) → Insert digest record → Send Email
```

**Tables:** `insights` (READ), `project_ideas` (READ), `digests` (INSERT)

---

### Workflow C: Intake

**Trigger:** Webhook POST to /intake (or form submission)

**Flow:**
```
Webhook Receives POST → Rate Limit Check → Parse Submission Type
     ↓
Story: Classify (Claude) → Queue Check (≥80 rel, ≥40 cred, no safety)
       ↓
       Insert submissions → Insert user_story_items (if queued)

Feedback/Project: Insert submissions → Optional GitHub Issue
```

**Tables:** `submissions` (INSERT), `user_story_items` (INSERT if story qualifies)

---

### Workflow D: Idea Generator

**Trigger:** Sunday 10am UTC (or manual)

**Flow:**
```
Query High-Signal Insights (≥80 relevance, not already used)
     ↓
Generate Ideas (Claude) → Validate Required Fields
     ↓
Filter by Thresholds (≥50 feasibility, ≥50 impact)
     ↓
Insert project_ideas → Create GitHub Issues → Update github_issue_url
```

**Tables:** `insights` (READ), `project_ideas` (INSERT)

---

## Key Thresholds Reference

From `config/thresholds.yml`:

| Threshold | Value | Used In |
|-----------|-------|---------|
| `relevance_threshold` | 50 | Workflow A: min to create insight |
| `auto_publish_relevance` | 70 | Workflow A: auto-publish gate |
| `auto_publish_credibility` | 60 | Workflow A: auto-publish gate |
| `min_insights` | 3 | Workflow B: skip if fewer |
| `story_queue_relevance_threshold` | 80 | Workflow C: queue for insight |
| `story_queue_credibility_threshold` | 40 | Workflow C: queue for insight |
| `min_relevance_for_idea` | 80 | Workflow D: insight eligibility |
| `min_feasibility` | 50 | Workflow D: idea filter |
| `min_impact` | 50 | Workflow D: idea filter |

---

## Stub Mode

For testing without real API calls, set in `config/thresholds.yml`:

```yaml
runtime:
  use_stubs: true  # Mocks Claude, GitHub, Resend APIs
```

**Stub behavior:**
- Claude API: Returns mock classification/summary data
- GitHub API: Returns mock commit/issue URLs
- Resend API: Logs email but doesn't send

---

## Troubleshooting

### No New Records Created

1. **Workflow A:** Check if all content was deduplicated (content_hash exists)
2. **Workflow B:** Check if insight_count < min_insights (3)
3. **Workflow D:** Check if no insights with relevance >= 80 exist

### Scores Are NULL

- Classification agent failed - check Claude API response in n8n execution
- Check for API rate limits or authentication errors

### GitHub Issues Not Created

- Check GitHub credentials in n8n
- Verify repo write permissions
- Check for API rate limits

### Digest Not Generated

- Fewer than 3 published insights in period
- Check period calculation (last 7 days from yesterday)

---

## Providing Results for Validation

After running tests, copy the following into each workflow's test document:

1. **Pre-Test Snapshot:** Query results before execution
2. **Post-Test Snapshot:** Query results after execution
3. **n8n Execution Summary:**
   - Execution ID
   - Duration
   - Status (success/error)
   - Nodes executed
   - Any warnings/errors
4. **Key Outputs:** New records, scores, GitHub URLs, etc.

Then share the completed test document for validation review.

---

## Files Changed After Testing

After successful testing, these files may be modified:

| File | Changed By | Content |
|------|------------|---------|
| `website/public/content/digests/YYYY/MM/weekly-*.md` | Workflow B | New digest markdown |
| `website/public/digests-rss.xml` | Workflow B | Updated RSS feed |
| `website/public/digests-feed.json` | Workflow B | Updated JSON feed |

These changes will need to be committed to git after Workflow B runs.
