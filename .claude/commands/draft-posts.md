Generate social media post drafts for @FGUTech based on recent Libertas content.

## Arguments

Parse the following from `$ARGUMENTS`:
- `--topic=X` — Constrain to insights matching topic X
- `--type=Y` — Force a specific format (thread, alert, pattern, spotlight, breaking, digest)
- `--days=N` — Override the default 24-hour window (e.g., `--days=3`)
- No flags = auto-select best mix from today's content

## Step 1: Load Context

Read these files into context:
- `agents/social/draft-posts.md` — the agent prompt defining all post formats, selection logic, and output format
- `agents/social/voice-reference.md` — the authoritative voice & style rules

## Step 2: Gather Insights from Disk

Read insight markdown files from `website/public/content/insights/`. Apply the time window:
- Default: last 24 hours (based on `published_at` in frontmatter)
- If `--days=N` is set, use N days instead
- Also scan the last 7 days for pattern/trend detection (grouping by topic and geo)

For each insight file, parse:
- Frontmatter: `title`, `slug`, `published_at`, `status`, `topics`, `freedom_relevance_score`, `credibility_score`, `citations`, `geo` (if present)
- Body: TL;DR and Key Points sections

Only include insights with `status: published`.

If `--topic=X` is set, filter to insights where `topics` includes X.

Sort by `published_at` descending (newest first).

## Step 3: Gather Digests from Disk

Read digest markdown files from `website/public/content/digests/`. Check if the most recent digest was published within the time window. If so, parse its frontmatter and body for the Digest Recap format.

## Step 4: Query Project Ideas from Database

Use the `pi-server` skill (or SSH into kageguchi) to query the Postgres database:

```sql
SELECT id, title, problem_statement, proposed_solution,
       feasibility_score, impact_score, status, created_at
FROM project_ideas
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND status != 'rejected'
ORDER BY impact_score DESC
LIMIT 5;
```

Adjust the interval if `--days=N` is set.

If the database is unreachable, skip this step and note it in the output. Project Spotlight posts will not be available.

## Step 5: Check Post History

Read `.posts-history.json` from the project root. If the file does not exist, treat it as empty (first run). The history file tracks previously posted slugs to avoid duplicates.

Expected format:
```json
{
  "posts": [
    {
      "slug": "insight-slug-here",
      "format": "signal-alert",
      "posted_at": "2026-02-20T15:00:00Z",
      "platform": "x"
    }
  ]
}
```

Filter out any insights whose slugs appear in the history.

## Step 6: Generate Drafts

Following the format selection logic in `agents/social/draft-posts.md`, generate 3-5 post drafts. Use the collected insights, digest, and project ideas as input material.

Apply all voice rules from `agents/social/voice-reference.md`. Run each draft through the cringe test checklist before outputting.

Output each draft in the format specified by the agent prompt, including:
- Format label
- Source insight(s) with title and slug
- The actual post text, ready to copy-paste
- Character count per tweet

## Step 7: Summary

After all drafts, output a summary table:

```
| # | Format | Source Slug | Characters | Topics |
|---|--------|-------------|------------|--------|
| 1 | Signal Alert | slug-here | 245/280 | privacy, surveillance |
| 2 | Pattern Thread | multiple | 3 tweets | censorship-resistance |
| ... | ... | ... | ... | ... |
```

Then remind the user:
- To review and edit drafts before posting
- To update `.posts-history.json` after publishing (add the slug, format, timestamp, and platform)
