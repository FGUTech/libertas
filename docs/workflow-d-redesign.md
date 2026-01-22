# Workflow D Redesign: Idea Generator

## Overview

Simplified single-call architecture that enables cross-topic pattern detection.

## Flow Diagram

```
┌─────────────────┐
│  Daily 10am UTC │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Fetch Config & Prompt (parallel)   │
│  - GET /api/config/thresholds       │
│  - GET /api/agents/generate-idea    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Query Week's Insights              │
│  - status = 'published'             │
│  - score >= min_relevance           │
│  - created_at within lookback_days  │
│  - not already used for ideas       │
└────────┬────────────────────────────┘
         │
         ▼
    ┌────┴────┐
    │ Has any │
    │insights?│
    └────┬────┘
     No  │  Yes
     ▼   │
  [Skip] │
         ▼
┌─────────────────────────────────────┐
│  Format Insights for Claude         │
│  - id, title, tldr, bullets         │
│  - topics, geo, score               │
│  (NO clustering - all in one call)  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Claude API: Generate Ideas         │
│  - Single call with all insights    │
│  - Returns { ideas[], patterns[] }  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Parse & Validate Response          │
│  - JSON parse with markdown strip   │
│  - Validate required fields         │
│  - Validate score ranges            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Filter Ideas by Threshold          │
│  - feasibility >= min_feasibility   │
│  - impact >= min_impact             │
│  - Split into: passing / filtered   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Loop: For Each Passing Idea        │
│  ┌─────────────────────────────┐    │
│  │ 1. Insert into project_ideas│    │
│  │ 2. Create GitHub Issue      │    │
│  │ 3. Update with issue URL    │    │
│  └─────────────────────────────┘    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Summary                            │
│  - ideas_created: N                 │
│  - ideas_filtered: M                │
│  - patterns_observed: P             │
└─────────────────────────────────────┘
```

## Key Changes from Current Workflow

| Aspect | Current | New |
|--------|---------|-----|
| Clustering | By primary topic before Claude | None - all insights in one call |
| Claude calls | N calls (one per cluster) | 1 call |
| Output per call | 1 idea | Array of 0-N ideas |
| Cross-topic patterns | Missed (siloed) | Enabled |
| Input fields | title, tldr, topics, score, geo | + bullets (summary_bullets) |
| Metadata passed | topic, count, avg score, related | None (derivable) |

## SQL: Query Insights

```sql
SELECT
  id,
  title,
  tldr,
  summary_bullets,
  topics,
  geo,
  freedom_relevance_score
FROM insights
WHERE status = 'published'
  AND freedom_relevance_score >= $1
  AND created_at >= $2::timestamptz
  AND created_at <= $3::timestamptz
  AND NOT EXISTS (
    SELECT 1 FROM project_ideas p
    WHERE id = ANY(p.derived_from_insight_ids)
  )
ORDER BY freedom_relevance_score DESC, created_at DESC
```

## Node: Format Insights for Claude

```javascript
const insights = $input.all().map(item => item.json);
const prompt = $('Fetch Prompt').first().json.content;

// Format insights array (lean fields only)
const formattedInsights = insights
  .filter(i => i.id) // skip empty rows
  .map(i => ({
    id: i.id,
    title: i.title,
    tldr: i.tldr,
    bullets: i.summary_bullets || [],
    topics: i.topics || [],
    geo: i.geo || [],
    score: i.freedom_relevance_score
  }));

return [{
  json: {
    prompt,
    insightCount: formattedInsights.length,
    insights: formattedInsights
  }
}];
```

## Node: Claude API Call

```javascript
// HTTP Request body
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8192,
  "messages": [{
    "role": "user",
    "content": prompt + "\n\n# Input\n\n" + JSON.stringify({ insights: formattedInsights }, null, 2)
  }]
}
```

## Node: Parse & Validate Response

```javascript
const response = $input.first().json;
const thresholds = $('Fetch Config').first().json;

let parsed;
try {
  let text = response.content[0].text.trim();
  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  parsed = JSON.parse(text);
} catch (e) {
  return [{ json: { error: 'JSON parse failed', message: e.message } }];
}

// Validate structure
if (!Array.isArray(parsed.ideas)) {
  parsed.ideas = [];
}
if (!Array.isArray(parsed.patterns_observed)) {
  parsed.patterns_observed = [];
}

// Validate each idea
const validIdeas = [];
const invalidIdeas = [];

for (const idea of parsed.ideas) {
  const errors = [];

  // Required fields
  const required = ['derived_from_insight_ids', 'problem_statement', 'threat_model',
    'affected_groups', 'proposed_solution', 'mvp_scope', 'misuse_risks',
    'feasibility_score', 'impact_score'];

  for (const field of required) {
    if (!idea[field]) errors.push(`Missing: ${field}`);
  }

  // Score validation
  if (typeof idea.feasibility_score !== 'number' || idea.feasibility_score < 0 || idea.feasibility_score > 100) {
    errors.push('Invalid feasibility_score');
  }
  if (typeof idea.impact_score !== 'number' || idea.impact_score < 0 || idea.impact_score > 100) {
    errors.push('Invalid impact_score');
  }

  if (errors.length === 0) {
    validIdeas.push(idea);
  } else {
    invalidIdeas.push({ idea, errors });
  }
}

return [{
  json: {
    ideas: validIdeas,
    invalidIdeas,
    patterns_observed: parsed.patterns_observed,
    _thresholds: thresholds
  }
}];
```

## Node: Filter by Threshold

```javascript
const data = $input.first().json;
const minFeasibility = data._thresholds.ideas?.min_feasibility || 50;
const minImpact = data._thresholds.ideas?.min_impact || 50;

const passing = [];
const filtered = [];

for (const idea of data.ideas) {
  if (idea.feasibility_score >= minFeasibility && idea.impact_score >= minImpact) {
    passing.push(idea);
  } else {
    filtered.push({
      idea,
      reason: `Scores below threshold (f:${idea.feasibility_score} < ${minFeasibility} or i:${idea.impact_score} < ${minImpact})`
    });
  }
}

return [{
  json: {
    passingIdeas: passing,
    filteredIdeas: filtered,
    patterns_observed: data.patterns_observed
  }
}];
```

## Node: Loop - Insert Idea

For each passing idea, insert into `project_ideas`:

```sql
INSERT INTO project_ideas (
  derived_from_insight_ids,
  detected_pattern,
  problem_statement,
  threat_model,
  affected_groups,
  proposed_solution,
  mvp_scope,
  misuse_risks,
  feasibility_score,
  impact_score,
  technical_dependencies,
  suggested_stack,
  prior_art,
  open_questions,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'new'
) RETURNING id
```

**Note:** This requires adding `detected_pattern TEXT` column to `project_ideas` table.

## Migration Required

```sql
-- Add detected_pattern column to store the pattern that inspired the idea
ALTER TABLE project_ideas ADD COLUMN detected_pattern TEXT;

COMMENT ON COLUMN project_ideas.detected_pattern IS 'Brief description of the pattern/gap that inspired this project idea';
```

## Benefits

1. **Cross-topic pattern detection** - Claude sees all insights, can find "shutdown + mesh + payments" patterns
2. **Simpler workflow** - Fewer nodes, no clustering logic, single API call
3. **Variable output** - 0-5 ideas based on actual patterns, not forced 1-per-cluster
4. **Observable patterns** - `patterns_observed` captures signals for future analysis
5. **Leaner context** - No redundant metadata, just the fields Claude needs
