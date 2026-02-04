# Workflow D: Project Idea Generation - Test Documentation

## Overview

**Purpose:** Analyze high-signal published insights from the past week, synthesize cross-topic patterns, generate project ideas, and create GitHub issues for each passing idea.

**Trigger:** Cron `0 10 * * 0` (Sunday 10am UTC) or manual

**Tables Affected:**
- `insights` (READ high-score published insights from past 7 days)
- `project_ideas` (INSERT new project ideas)

**External Services:**
- Claude API (generate-idea.md agent)
- GitHub API (create issues for each idea)

---

## Pre-Test Database Queries

Run these queries to capture the state before testing:

```sql
-- 1. Count existing project_ideas
SELECT COUNT(*) AS total_ideas FROM project_ideas;

-- 2. Get recent project_ideas
SELECT id, detected_pattern, problem_statement, feasibility_score, impact_score,
       status, github_issue_url, created_at
FROM project_ideas
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count ideas by status
SELECT status, COUNT(*) FROM project_ideas GROUP BY status;

-- 4. Count HIGH-SIGNAL insights eligible for idea generation
-- (relevance >= 80, published, last 7 days, not already used)
SELECT COUNT(*) AS eligible_insights
FROM insights i
WHERE i.freedom_relevance_score >= 80
  AND i.status = 'published'
  AND i.created_at >= NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM project_ideas pi
    WHERE i.id = ANY(pi.derived_from_insight_ids)
  );

-- 5. Preview eligible insights
SELECT id, title, tldr, topics, freedom_relevance_score, credibility_score, created_at
FROM insights i
WHERE i.freedom_relevance_score >= 80
  AND i.status = 'published'
  AND i.created_at >= NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM project_ideas pi
    WHERE i.id = ANY(pi.derived_from_insight_ids)
  )
ORDER BY freedom_relevance_score DESC;

-- 6. Check insights already used in project ideas
SELECT DISTINCT unnest(derived_from_insight_ids) AS used_insight_id
FROM project_ideas
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## Test Execution Steps

### Pre-Requisites:

1. **Ensure Sufficient High-Signal Insights:**
   - Workflow needs insights with `freedom_relevance_score >= 80`
   - Run Workflow A first if needed to generate qualifying insights
   - Insights must be status='published'

2. **Check GitHub Credentials:**
   - Workflow creates issues in FGUTech/libertas repo
   - Needs write access to issues

### In n8n:

1. **Navigate to Workflow D** (Idea Generator workflow)

2. **Check Configuration:**
   - Lookback period: 7 days (from thresholds)
   - Min relevance for ideas: 80
   - Min feasibility: 50
   - Min impact: 50

3. **Toggle Stub Mode (Optional):**
   - `runtime.use_stubs: true` will mock Claude/GitHub
   - For full integration, use `false`

4. **Execute Workflow Manually:**
   - Click "Execute Workflow" button
   - Monitor execution progress

5. **Expected Outputs:**
   - New `project_ideas` records in database
   - GitHub issues created with label `project-idea`

---

## Post-Test Database Queries

Run these queries after workflow execution:

```sql
-- 1. Count project_ideas after (compare to pre-test)
SELECT COUNT(*) AS total_ideas FROM project_ideas;

-- 2. Get NEW project_ideas created during test
SELECT id, detected_pattern, problem_statement, feasibility_score, impact_score,
       status, github_issue_url, derived_from_insight_ids, created_at
FROM project_ideas
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Verify derived_from_insight_ids reference valid insights
SELECT pi.id AS idea_id, pi.detected_pattern,
       array_agg(i.title) AS source_insight_titles
FROM project_ideas pi
CROSS JOIN LATERAL unnest(pi.derived_from_insight_ids) AS insight_id
JOIN insights i ON i.id = insight_id
WHERE pi.created_at > NOW() - INTERVAL '1 hour'
GROUP BY pi.id, pi.detected_pattern;

-- 4. Check all required fields are populated
SELECT id, detected_pattern,
       CASE WHEN problem_statement IS NULL OR problem_statement = '' THEN 'MISSING' ELSE 'OK' END AS problem_statement,
       CASE WHEN threat_model IS NULL OR threat_model = '' THEN 'MISSING' ELSE 'OK' END AS threat_model,
       CASE WHEN proposed_solution IS NULL OR proposed_solution = '' THEN 'MISSING' ELSE 'OK' END AS proposed_solution,
       CASE WHEN mvp_scope IS NULL OR mvp_scope = '' THEN 'MISSING' ELSE 'OK' END AS mvp_scope,
       CASE WHEN misuse_risks IS NULL OR misuse_risks = '' THEN 'MISSING' ELSE 'OK' END AS misuse_risks,
       CASE WHEN array_length(affected_groups, 1) IS NULL THEN 'MISSING' ELSE 'OK' END AS affected_groups,
       feasibility_score,
       impact_score,
       github_issue_url
FROM project_ideas
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 5. Verify scores are within valid range
SELECT id, detected_pattern, feasibility_score, impact_score,
       CASE
         WHEN feasibility_score >= 0 AND feasibility_score <= 100
          AND impact_score >= 0 AND impact_score <= 100
         THEN 'VALID'
         ELSE 'INVALID'
       END AS score_validity
FROM project_ideas
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## n8n Execution History Checks

### What to Look For:

1. **Fetch Config/Prompts Nodes:**
   - Should retrieve thresholds and generate-idea.md prompt

2. **Calculate Lookback Period:**
   - Default: 7 days (from thresholds)
   - Verify date range is correct

3. **Query High-Signal Insights:**
   - SQL should filter:
     - `freedom_relevance_score >= 80`
     - `status = 'published'`
     - `created_at >= NOW() - 7 days`
     - NOT already used in `derived_from_insight_ids`

4. **Insight Count Check:**
   - If no eligible insights: workflow should exit early
   - Check for "no insights to process" message

5. **Format Insights Node:**
   - Prepares insights for Claude (single call, no clustering)
   - Fields: id, title, tldr, bullets, topics, geo, score

6. **Claude API Call (Idea Generation):**
   - Input: formatted insights array
   - Output should contain:
     - `ideas[]` - Array of project ideas
     - `patterns_observed[]` - Cross-topic patterns detected

7. **Validate Ideas Node:**
   - Each idea must have:
     - `derived_from_insight_ids[]` (non-empty)
     - `detected_pattern`
     - `problem_statement`
     - `threat_model`
     - `affected_groups[]` (non-empty)
     - `proposed_solution`
     - `mvp_scope`
     - `misuse_risks`
     - `feasibility_score` (0-100)
     - `impact_score` (0-100)

8. **Score Threshold Filter:**
   - Only ideas passing BOTH thresholds continue:
     - `feasibility_score >= 50`
     - `impact_score >= 50`

9. **Database Insert (project_ideas):**
   - Status = 'new'
   - All required fields populated
   - `derived_from_insight_ids` correctly references source insights

10. **GitHub Issue Creation:**
    - Title format: `[Idea] {detected_pattern}` (max 80 chars)
    - Labels: `project-idea`, `auto-generated`
    - Body contains full idea details with insight links

11. **Update github_issue_url:**
    - After issue creation, project_idea record updated with issue URL

---

## Expected Behaviors

### Success Indicators:
- [ ] New `project_ideas` records created (if eligible insights exist)
- [ ] All required fields populated (no NULLs for required fields)
- [ ] `derived_from_insight_ids` contains valid insight UUIDs
- [ ] `feasibility_score` and `impact_score` are 0-100 integers
- [ ] `status` = 'new' for all new ideas
- [ ] GitHub issues created with correct labels
- [ ] `github_issue_url` populated for each idea

### Skip Conditions (Not Failures):
- [ ] No high-signal insights → no ideas generated
- [ ] All eligible insights already used → no new ideas
- [ ] Ideas below score thresholds → filtered out

### Potential Issues:
- **No ideas generated:** Check if eligible insights exist
- **Ideas missing fields:** Check Claude response parsing
- **GitHub issues not created:** Check API credentials/permissions
- **Invalid scores:** Check Claude output validation

---

## Threshold Reference

From `config/thresholds.yml`:

```yaml
idea_generation:
  min_relevance_for_idea: 80   # Minimum insight score to consider
  min_feasibility: 50          # Filter ideas below this
  min_impact: 50               # Filter ideas below this
  lookback_days: 7             # How far back to query insights
```

---

## GitHub Issue Verification

After successful execution, verify issues were created:

```bash
# List recent issues with project-idea label
gh issue list --repo FGUTech/libertas --label "project-idea" --limit 10

# View specific issue
gh issue view <issue-number> --repo FGUTech/libertas

# Check issue labels
gh api repos/FGUTech/libertas/issues/<issue-number>/labels
```

### Expected Issue Format:

```markdown
Title: [Idea] Cross-border encrypted communication tool (truncated to 80 chars)

Labels: project-idea, auto-generated

Body:
## Detected Pattern
{detected_pattern}

## Problem Statement
{problem_statement}

## Threat Model
{threat_model}

## Affected Groups
- {group1}
- {group2}

## Proposed Solution
{proposed_solution}

## MVP Scope
{mvp_scope}

## Misuse Risks
{misuse_risks}

## Scores
- Feasibility: X/100
- Impact: X/100

## Technical Dependencies
- {dependency1}
- {dependency2}

## Suggested Stack
- {tech1}
- {tech2}

## Prior Art
- {prior_art1}

## Open Questions
- {question1}

---
*Auto-generated from insights: [Insight Title](link), [Insight Title](link)*
```

---

## Data Validation Checklist

For each `project_ideas` record:
- [ ] `id` is valid UUID
- [ ] `derived_from_insight_ids` is non-empty array of valid insight UUIDs
- [ ] `detected_pattern` is non-empty string
- [ ] `problem_statement` is non-empty string
- [ ] `threat_model` is non-empty string
- [ ] `affected_groups` is non-empty array
- [ ] `proposed_solution` is non-empty string
- [ ] `mvp_scope` is non-empty string
- [ ] `misuse_risks` is non-empty string
- [ ] `feasibility_score` is integer 0-100, >= 50
- [ ] `impact_score` is integer 0-100, >= 50
- [ ] `status` = 'new'
- [ ] `github_issue_url` matches pattern `https://github.com/FGUTech/libertas/issues/\d+`
- [ ] `created_at` is set

Optional fields (may be empty):
- [ ] `technical_dependencies[]`
- [ ] `suggested_stack[]`
- [ ] `prior_art[]`
- [ ] `open_questions[]`

---

## Paste Test Results Here

### Pre-Test Snapshot
```
(Paste pre-test query results here)
```

### Eligible Insights
```
Count: X
Titles:
1. ...
2. ...
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

### Ideas Generated
```
Total ideas: X
Ideas passing threshold: X

Idea 1:
  - Pattern: ...
  - Feasibility: X/100
  - Impact: X/100
  - GitHub Issue: #XXX

Idea 2:
  - Pattern: ...
  - Feasibility: X/100
  - Impact: X/100
  - GitHub Issue: #XXX
```

### Patterns Observed
```
(From Claude response - cross-topic patterns identified)
1. ...
2. ...
```
