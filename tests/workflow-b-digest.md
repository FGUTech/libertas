# Workflow B: Weekly Digest - Test Documentation

## Overview

**Purpose:** Aggregate published insights from the past week, generate a digest summary using Claude AI, commit to GitHub (markdown + RSS + JSON feeds), insert digest record, and send email via Resend.

**Trigger:** Cron `0 9 * * 0` (Sunday 9am UTC) or manual

**Tables Affected:**
- `insights` (READ published insights from past 7 days)
- `project_ideas` (READ recent ideas for inclusion)
- `digests` (INSERT/UPSERT weekly digest record)

**External Services:**
- Claude API (digest generation)
- GitHub API (atomic commit of 3 files)
- Resend API (email delivery)

---

## Pre-Test Database Queries

Run these queries to capture the state before testing:

```sql
-- 1. Count existing digests
SELECT COUNT(*) AS total_digests FROM digests;

-- 2. Get most recent digests
SELECT id, period_start, period_end, insight_count, tldr, published_at, created_at
FROM digests
ORDER BY created_at DESC
LIMIT 5;

-- 3. Count published insights from last 7 days (these will be included)
SELECT COUNT(*) AS publishable_insights
FROM insights
WHERE status = 'published'
  AND created_at >= NOW() - INTERVAL '7 days';

-- 4. Preview insights that will be included
SELECT id, title, tldr, topics, freedom_relevance_score, credibility_score, created_at
FROM insights
WHERE status = 'published'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY freedom_relevance_score DESC;

-- 5. Count project ideas from last 7 days (may be included)
SELECT COUNT(*) AS recent_ideas
FROM project_ideas
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND status IN ('new', 'triaged', 'build_candidate');

-- 6. Preview project ideas that may be included
SELECT id, detected_pattern, problem_statement, feasibility_score, impact_score, status
FROM project_ideas
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND status IN ('new', 'triaged', 'build_candidate');
```

---

## Test Execution Steps

### Pre-Requisites:

1. **Ensure Sufficient Data:**
   - Workflow requires `min_insights: 3` (from thresholds.yml)
   - If fewer than 3 published insights exist, digest will be skipped
   - Consider running Workflow A first if needed

2. **Check GitHub Credentials:**
   - Workflow needs write access to FGUTech/libertas repo
   - Uses Git Data API for atomic commits

### In n8n:

1. **Navigate to Workflow B** (Weekly Digest workflow)

2. **Check Configuration:**
   - Period calculation: yesterday 23:59 back 7 days
   - Min insights threshold: 3

3. **Toggle Stub Mode (Optional):**
   - `runtime.use_stubs: true` will mock Claude/GitHub/Resend
   - For full integration, use `false`

4. **Execute Workflow Manually:**
   - Click "Execute Workflow" button
   - Monitor execution progress

5. **Expected File Outputs (if successful):**
   - `website/public/content/digests/YYYY/MM/weekly-YYYY-MM-DD.md`
   - `website/public/digests-rss.xml` (updated)
   - `website/public/digests-feed.json` (updated)

---

## Post-Test Database Queries

Run these queries after workflow execution:

```sql
-- 1. Count digests after (compare to pre-test)
SELECT COUNT(*) AS total_digests FROM digests;

-- 2. Get NEW digest created during test
SELECT id, period_start, period_end, insight_count, tldr, top_topics, published_url, published_at, created_at
FROM digests
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Verify insight_count matches expected
SELECT
  (SELECT insight_count FROM digests WHERE created_at > NOW() - INTERVAL '1 hour' LIMIT 1) AS reported_count,
  (SELECT COUNT(*) FROM insights
   WHERE status = 'published'
   AND created_at >= NOW() - INTERVAL '8 days'
   AND created_at <= NOW() - INTERVAL '1 day') AS actual_count;

-- 4. Check content_markdown field is populated
SELECT id,
       LENGTH(content_markdown) AS content_length,
       LEFT(content_markdown, 500) AS content_preview
FROM digests
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## n8n Execution History Checks

### What to Look For:

1. **Fetch Config/Prompts Nodes:**
   - Should successfully retrieve thresholds and digest.md prompt

2. **Calculate Period Node:**
   - Verify period_start and period_end are correct
   - period_end = yesterday 23:59:59
   - period_start = period_end - 7 days

3. **Query Insights Node:**
   - Should return published insights from period
   - Check the SQL query includes correct date range

4. **Insight Count Check:**
   - If `insight_count < min_insights (3)`: workflow should exit early
   - Check for "skipping digest" message if this happens

5. **Format Insights Node:**
   - Insights should be grouped by primary topic
   - Max 10 per section (from config)

6. **Claude API Call (Digest Generation):**
   - Input: formatted insights, project ideas, period dates
   - Output should contain:
     - `tldr` (2-3 sentences, max 500 chars)
     - `sections[]` (grouped by topic)
     - `emerging_patterns[]`
     - `project_ideas[]` (highlights)
     - `looking_ahead[]`

7. **Generate Markdown Node:**
   - Should create proper YAML frontmatter
   - File path: `website/public/content/digests/YYYY/MM/weekly-YYYY-MM-DD.md`

8. **Generate RSS Feed Node:**
   - Updates `website/public/digests-rss.xml`
   - Should include all recent digests

9. **Generate JSON Feed Node:**
   - Updates `website/public/digests-feed.json`
   - JSON Feed spec compliant

10. **GitHub Atomic Commit:**
    - Creates tree with 3 files
    - Creates commit
    - Updates ref (main branch)
    - Check commit message format

11. **Database Insert/Upsert:**
    - Should insert new digest record
    - Upsert handles duplicate period dates

12. **Email Send (Resend):**
    - In stub mode: logged but not sent
    - In prod: email sent to configured recipients

---

## Expected Behaviors

### Success Indicators:
- [ ] New `digests` record created
- [ ] `insight_count` matches actual published insights in period
- [ ] `content_markdown` is populated with valid markdown
- [ ] `tldr` is present and <= 500 characters
- [ ] `top_topics` reflects actual topics in included insights
- [ ] GitHub commit successful (check commit history)
- [ ] RSS/JSON feeds updated

### Skip Conditions (Not Failures):
- [ ] Fewer than 3 published insights in period → digest skipped
- [ ] All insights already included in previous digest → may skip

### Potential Issues:
- **No digest created:** Check insight count threshold
- **GitHub commit failed:** Check API credentials and permissions
- **Content generation errors:** Check Claude API response
- **Malformed markdown:** Check generate markdown node output

---

## GitHub Verification

After successful execution, verify in GitHub:

```bash
# Check latest commit
git log --oneline -5

# Verify digest file exists
ls -la website/public/content/digests/

# Check RSS feed
cat website/public/digests-rss.xml | head -50

# Check JSON feed
cat website/public/digests-feed.json | head -50
```

Or via GitHub API:
```bash
# Get latest commit
gh api repos/FGUTech/libertas/commits/main --jq '.sha, .commit.message'

# List digest files
gh api repos/FGUTech/libertas/contents/website/public/content/digests
```

---

## Data Validation Checklist

For the new `digest` record:
- [ ] `period_start` is a valid date (7 days before period_end)
- [ ] `period_end` is yesterday's date
- [ ] `insight_count` is >= min_insights (3)
- [ ] `tldr` is non-empty, <= 500 characters
- [ ] `content_markdown` starts with valid YAML frontmatter (`---`)
- [ ] `top_topics` contains valid topic enum values
- [ ] `published_url` points to valid digest URL (if set)
- [ ] `published_at` is set (if actually published)

For generated files:
- [ ] Markdown file has correct date in filename
- [ ] RSS feed is valid XML
- [ ] JSON feed is valid JSON with correct structure

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

### Digest Generated
```
Period: YYYY-MM-DD to YYYY-MM-DD
Insight count: X
Topics covered: [...]
TL;DR preview: ...
GitHub commit: (SHA)
```
