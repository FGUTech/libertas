# Workflow C: Intake Processing

This document describes the control flow of the Libertas intake processing workflow, which handles submissions from the public intake form (stories, projects, and feedback).

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  WORKFLOW C: INTAKE PROCESSING                                                   │
│                                     (webhook trigger on submit)                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────┐
                                        │   📨 POST /intake    │
                                        │   (Webhook Trigger)  │
                                        └──────────┬──────────┘
                                                   │
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIALIZATION (rate limit + config fetch)                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │   Rate Limit Check   │
                                        └──────────┬──────────┘
                        ┌──────────────────────────┼──────────────────────────┐
                        │                          │                          │
              ┌─────────▼─────────┐     ┌─────────▼─────────┐
              │ Fetch Thresholds  │     │ Fetch Intake      │
              │ Config            │     │ Classify Prompt   │
              └─────────┬─────────┘     └─────────┬─────────┘
                        │                          │
                        └──────────┬───────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │ Merge Config & Agents│
                        └──────────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   Validate Input     │
                        └──────────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │ Insert Submission    │
                        │ (Postgres)           │
                        └──────────┬──────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: CLASSIFICATION (stub/real toggle)                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                   │
                                  ┌────────────────▼────────────────┐
                                  │   Use Stubs for Classify?       │
                                  └───────┬────────────────┬────────┘
                         use_stubs=true ──┘                └── use_stubs=false
                                          │                        │
                    ┌─────────────────────▼───────┐    ┌───────────▼──────────────┐
                    │     Classify Stub           │    │  Classify with Claude    │
                    └─────────────────────┬───────┘    └───────────┬──────────────┘
                                          │                        │
                                          └───────────┬────────────┘
                                                      │
                                        ┌─────────────▼─────────────┐
                                        │   Parse LLM Response      │
                                        └─────────────┬─────────────┘
                                                      │
                                        ┌─────────────▼─────────────┐
                                        │   Update Submission       │
                                        └─────────────┬─────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: TYPE-SPECIFIC PROCESSING                                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                      │
                                        ┌─────────────▼─────────────┐
                                        │        Is Story?          │
                                        └───────┬───────────┬───────┘
                               type='story' ────┘           └──── type!='story'
                                               │                   │
                        ┌──────────────────────▼──────┐   ┌────────▼────────┐
                        │   STORY PROCESSING BRANCH   │   │   Is Project?   │
                        │   (See Story Flow below)    │   └───────┬────┬────┘
                        └─────────────────────────────┘           │    │
                                                    type='project'┘    └── type='feedback'
                                                                  │              │
                                          ┌───────────────────────▼───┐   ┌──────▼──────┐
                                          │  PROJECT PROCESSING BRANCH │   │  FEEDBACK   │
                                          │  (See Project Flow below)  │   │   BRANCH    │
                                          └────────────────────────────┘   └──────┬──────┘
                                                                                  │
                                                                   ┌──────────────▼────────────────┐
                                                                   │   GitHub Issue Creation       │
                                                                   │   (standard intake issue)     │
                                                                   └──────────────┬────────────────┘
                                                                                  │
                                                                   ┌──────────────▼────────────────┐
                                                                   │   Respond to Webhook          │
                                                                   │   (201 Created)               │
                                                                   └───────────────────────────────┘
```

## Story Processing Flow (1.13a)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  STORY BRANCH: Source fetch, classify, queue for insight                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────┐
                                        │   Has Source URL?    │
                                        └───────┬───────┬─────┘
                                          YES ──┘       └── NO
                                               │              │
                        ┌──────────────────────▼──────┐   ┌───▼───────────┐
                        │   Fetch Source Content      │   │ No Source URL │
                        └──────────────────────┬──────┘   └───────┬───────┘
                                               │                  │
                        ┌──────────────────────▼──────┐           │
                        │   Extract Text from HTML    │           │
                        └──────────────────────┬──────┘           │
                                               │                  │
                                               └───────────┬──────┘
                                                           │
                                        ┌──────────────────▼──────────────────┐
                                        │   Fetch Story Classify Prompt       │
                                        └──────────────────┬──────────────────┘
                                                           │
                                        ┌──────────────────▼──────────────────┐
                                        │   Use Stubs for Story Classify?     │
                                        └───────┬──────────────────────┬──────┘
                                                │                      │
                        ┌───────────────────────▼────────┐    ┌────────▼────────────────────┐
                        │   Story Classify Stub          │    │  Story Classify with Claude │
                        └───────────────────────┬────────┘    └────────┬────────────────────┘
                                                │                      │
                                                └───────────┬──────────┘
                                                            │
                                        ┌───────────────────▼───────────────────┐
                                        │   Parse Story LLM Response            │
                                        │   (topics, relevance, credibility,    │
                                        │    geo, safety_concern)               │
                                        └───────────────────┬───────────────────┘
                                                            │
                                        ┌───────────────────▼───────────────────┐
                                        │   Update Story Submission             │
                                        │   (scores, queued_for_insight)        │
                                        └───────────────────┬───────────────────┘
                                                            │
                                        ┌───────────────────▼───────────────────┐
                                        │       Queue for Insight?              │
                                        └───────┬───────────────────────┬───────┘
                     relevance>=80 & cred>=40 ──┘                       └── below threshold
                                                │                               │
                        ┌───────────────────────▼────────┐                      │
                        │   Prepare Source Item Data     │                      │
                        │   Insert into source_items     │                      │
                        └───────────────────────┬────────┘                      │
                                                │                               │
                                                └───────────────┬───────────────┘
                                                                │
                                        ┌───────────────────────▼───────────────────────┐
                                        │   Prepare Story for GitHub                    │
                                        │   (enriched with classification data)         │
                                        └───────────────────────┬───────────────────────┘
                                                                │
                                                   (continues to GitHub Issue Creation)
```

## Project Processing Flow (1.13b) - NEW

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PROJECT BRANCH: Evaluate community project ideas, insert to project_ideas table                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────────────┐
                                        │   Fetch Project Evaluate    │
                                        │   Prompt                    │
                                        │   /api/agents/intake-       │
                                        │   project-evaluate          │
                                        └─────────────┬───────────────┘
                                                      │
                                        ┌─────────────▼───────────────┐
                                        │   Use Stubs for Project     │
                                        │   Evaluate?                 │
                                        └───────┬─────────────┬───────┘
                                                │             │
                        ┌───────────────────────▼───────┐  ┌──▼──────────────────────┐
                        │   Project Evaluate Stub       │  │  Project Evaluate with  │
                        │   (keyword-based scoring,     │  │  Claude API             │
                        │    threat model, affected     │  │  (full AI assessment)   │
                        │    groups, dependencies)      │  │                         │
                        └───────────────────────┬───────┘  └──┬───────────────────────┘
                                                │             │
                                                └──────┬──────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Parse Project LLM         │
                                        │   Response                  │
                                        │   (threat_model, affected_  │
                                        │    groups, feasibility_     │
                                        │    score, impact_score,     │
                                        │    misuse_risks, tech_deps, │
                                        │    suggested_stack)         │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Build Project Idea Query  │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Insert Project Idea       │
                                        │   (Postgres project_ideas   │
                                        │    table, status='new')     │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Prepare Project for       │
                                        │   GitHub                    │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Use Stubs for Project     │
                                        │   GitHub?                   │
                                        └───────┬─────────────┬───────┘
                                                │             │
                        ┌───────────────────────▼───────┐  ┌──▼──────────────────────┐
                        │   Project GitHub Stub         │  │  Create Project GitHub  │
                        │   (mock issue URL)            │  │  Issue                  │
                        └───────────────────────┬───────┘  │  Labels: project-idea,  │
                                                │          │  community-submitted,   │
                                                │          │  intake                 │
                                                │          └──┬───────────────────────┘
                                                │             │
                                                └──────┬──────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Build Project Update      │
                                        │   Query                     │
                                        │   (update project_ideas.    │
                                        │    github_issue_url AND     │
                                        │    submissions.status)      │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Update Project Idea URL   │
                                        │   (Postgres)                │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Project Success Summary   │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Respond to Webhook        │
                                        │   (201 Created)             │
                                        └─────────────────────────────┘
```

## Feedback Processing Flow (1.13c) - NEW

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FEEDBACK BRANCH: Assess platform feedback, create GitHub issues with category-based labels                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                        ┌─────────────────────────────┐
                                        │   Is Feedback?              │
                                        │   type='feedback'           │
                                        └─────────────┬───────────────┘
                                                      │
                                        ┌─────────────▼───────────────┐
                                        │   Fetch Feedback Assess     │
                                        │   Prompt                    │
                                        │   /api/agents/intake-       │
                                        │   feedback-assess           │
                                        └─────────────┬───────────────┘
                                                      │
                                        ┌─────────────▼───────────────┐
                                        │   Use Stubs for Feedback    │
                                        │   Assess?                   │
                                        └───────┬─────────────┬───────┘
                                                │             │
                        ┌───────────────────────▼───────┐  ┌──▼──────────────────────┐
                        │   Feedback Assess Stub        │  │  Feedback Assess with   │
                        │   (keyword-based spam,        │  │  Claude API             │
                        │    priority, actionable       │  │  (full AI assessment)   │
                        │    items detection)           │  │                         │
                        └───────────────────────┬───────┘  └──┬───────────────────────┘
                                                │             │
                                                └──────┬──────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Parse Feedback LLM        │
                                        │   Response                  │
                                        │   (is_spam, priority,       │
                                        │    actionable_items,        │
                                        │    suggested_assignee,      │
                                        │    sentiment)               │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Map Feedback to Labels    │
                                        │   bug → [bug, feedback]     │
                                        │   feature → [enhancement,   │
                                        │             feedback]       │
                                        │   content → [content,       │
                                        │             feedback]       │
                                        │   other → [feedback,        │
                                        │           triage-needed]    │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Use Stubs for Feedback    │
                                        │   GitHub?                   │
                                        └───────┬─────────────┬───────┘
                                                │             │
                        ┌───────────────────────▼───────┐  ┌──▼──────────────────────┐
                        │   Feedback GitHub Stub        │  │  Create Feedback GitHub │
                        │   (mock issue URL)            │  │  Issue                  │
                        └───────────────────────┬───────┘  │  Labels: category-based │
                                                │          └──┬───────────────────────┘
                                                │             │
                                                └──────┬──────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Update Feedback           │
                                        │   Submission                │
                                        │   (set status='triaged',    │
                                        │    github_issue_url)        │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Feedback Success Summary  │
                                        └──────────────┬──────────────┘
                                                       │
                                        ┌──────────────▼──────────────┐
                                        │   Respond to Webhook        │
                                        │   (201 Created)             │
                                        └─────────────────────────────┘
```

## Phase Summary

| Phase | Description | Key Decision Points |
|-------|-------------|---------------------|
| **1. Init** | Rate limit check, parallel fetch of config + intake-classify prompt | - |
| **2. Classify** | Classify submission (stub or real Claude) | `use_stubs` toggle |
| **3. Route** | Route to type-specific processing | `Is Story?` → `Is Project?` → Feedback |
| **3a. Story** | Fetch source, classify story, queue for insight if high-signal | `Has Source URL?` → `Queue for Insight?` |
| **3b. Project** | Evaluate project idea, insert to project_ideas table | `use_stubs` for evaluate and GitHub |
| **3c. Feedback** | Standard intake processing | Direct to GitHub issue |
| **4. GitHub** | Create GitHub issue for triage | `use_stubs` for GitHub |
| **5. Response** | Update DB with issue URL, respond to webhook | - |

## Submission Types

| Type | Form Fields | Processing | GitHub Labels |
|------|-------------|------------|---------------|
| **story** | title, description, sourceUrl, region, urgency | Story classify → source_items queue → GitHub issue | `intake`, `story`, `{priority}` |
| **project** | title, problemStatement, description, urgency | Project evaluate → project_ideas insert → GitHub issue | `project-idea`, `community-submitted`, `intake` |
| **feedback** | message, category, contact | Feedback assess → category-label GitHub issue | Category-based (see below) |

### Feedback Category → Label Mapping (1.13c)

| Category | GitHub Labels | Issue Title Prefix |
|----------|---------------|-------------------|
| `bug` | `bug`, `feedback` | `[Bug Report]` |
| `feature` | `enhancement`, `feedback` | `[Feature Request]` |
| `content` | `content`, `feedback` | `[Content Suggestion]` |
| `other` | `feedback`, `triage-needed` | `[Feedback]` |

Note: If priority is `urgent`, the label `priority-urgent` is also added.

## Project Idea Assessment

The project evaluation agent (`intake-project-evaluate.md`) assesses community-submitted project ideas:

### Evaluation Outputs

| Field | Type | Description |
|-------|------|-------------|
| `threat_model` | string | Who is the adversary and their capabilities |
| `affected_groups` | string[] | Who would benefit from the solution |
| `feasibility_score` | 0-100 | Technical feasibility assessment |
| `impact_score` | 0-100 | Potential impact on freedom tech users |
| `misuse_risks` | string | How could the tool be misused |
| `technical_dependencies` | string[] | Required technical components |
| `suggested_stack` | string[] | Recommended technology stack |
| `prior_art` | string[] | Existing projects to learn from |
| `open_questions` | string[] | Unresolved questions requiring research |
| `is_spam` | boolean | Whether submission appears to be spam |

### Scoring Guidelines

**Feasibility Score:**
- 90-100: Uses existing, proven tech; clear implementation path
- 70-89: Moderate complexity; some unknowns but solvable
- 50-69: Significant technical challenges; research required
- 30-49: Cutting-edge; high uncertainty
- 0-29: Likely impossible with current tech

**Impact Score:**
- 90-100: Addresses life-threatening situations at scale
- 70-89: Significant improvement for vulnerable populations
- 50-69: Meaningful benefit for niche use cases
- 30-49: Nice-to-have; incremental improvement
- 0-29: Minimal real-world impact

## Runtime Mode Toggle

The workflow supports stub/real mode via `thresholds.runtime.use_stubs`:

- **`use_stubs: true`** (default): Uses keyword-based stubs for all AI operations and GitHub, logs without executing
- **`use_stubs: false`**: Calls real Claude API and GitHub API

Stubs are controlled independently for:
1. Initial classification (`Use Stubs for Classify?`)
2. Story classification (`Use Stubs for Story Classify?`)
3. Project evaluation (`Use Stubs for Project Evaluate?`)
4. Feedback assessment (`Use Stubs for Feedback Assess?`)
5. GitHub issue creation (`Use Stubs for GitHub?`, `Use Stubs for Project GitHub?`, `Use Stubs for Feedback GitHub?`)

## Node Reference

### Project Processing Nodes (1.13b)

| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `is-project-check` | Is Project? | if | Branch on submission type |
| `fetch-project-evaluate-prompt` | Fetch Project Evaluate Prompt | httpRequest | GET /api/agents/intake-project-evaluate |
| `use-stubs-project-evaluate` | Use Stubs for Project Evaluate? | if | Branch on use_stubs flag |
| `project-evaluate-stub` | Project Evaluate Stub | code | Keyword-based project assessment |
| `project-evaluate-claude` | Project Evaluate with Claude API | httpRequest | POST to Claude API |
| `wrap-project-evaluate-response` | Wrap Project Evaluate Response | code | Normalize API response |
| `handle-project-evaluate-error` | Handle Project Evaluate Error | code | Graceful error handling |
| `parse-project-llm-response` | Parse Project LLM Response | code | Extract JSON from response |
| `build-project-idea-query` | Build Project Idea Query | code | Construct INSERT SQL |
| `insert-project-idea` | Insert Project Idea | postgres | INSERT into project_ideas |
| `prepare-project-for-github` | Prepare Project for GitHub | code | Build issue title/body |
| `use-stubs-project-github` | Use Stubs for Project GitHub? | if | Branch on use_stubs flag |
| `project-github-stub` | Project GitHub Stub | code | Mock issue creation |
| `create-project-github-issue` | Create Project GitHub Issue | httpRequest | POST to GitHub API |
| `wrap-project-github-response` | Wrap Project GitHub Response | code | Normalize API response |
| `handle-project-github-error` | Handle Project GitHub Error | code | Graceful error handling |
| `build-project-update-query` | Build Project Update Query | code | UPDATE project_ideas + submissions |
| `update-project-idea-url` | Update Project Idea URL | postgres | Execute update query |
| `project-success-summary` | Project Success Summary | code | Prepare webhook response |

### Feedback Processing Nodes (1.13c)

| Node ID | Name | Type | Purpose |
|---------|------|------|---------|
| `is-feedback-check` | Is Feedback? | if | Branch on submission type |
| `fetch-feedback-assess-prompt` | Fetch Feedback Assess Prompt | httpRequest | GET /api/agents/intake-feedback-assess |
| `use-stubs-feedback-assess` | Use Stubs for Feedback Assess? | if | Branch on use_stubs flag |
| `feedback-assess-stub` | Feedback Assess Stub | code | Keyword-based feedback assessment |
| `feedback-assess-claude` | Feedback Assess with Claude API | httpRequest | POST to Claude API |
| `wrap-feedback-assess-response` | Wrap Feedback Assess Response | code | Normalize API response |
| `handle-feedback-assess-error` | Handle Feedback Assess Error | code | Graceful error handling |
| `parse-feedback-llm-response` | Parse Feedback LLM Response | code | Extract JSON from response |
| `map-feedback-to-labels` | Map Feedback to Labels | code | Category → GitHub labels mapping |
| `use-stubs-feedback-github` | Use Stubs for Feedback GitHub? | if | Branch on use_stubs flag |
| `feedback-github-stub` | Feedback GitHub Stub | code | Mock issue creation |
| `create-feedback-github-issue` | Create Feedback GitHub Issue | httpRequest | POST to GitHub API |
| `wrap-feedback-github-response` | Wrap Feedback GitHub Response | code | Normalize API response |
| `handle-feedback-github-error` | Handle Feedback GitHub Error | code | Graceful error handling |
| `update-feedback-submission` | Update Feedback Submission | postgres | Update status to 'triaged' |
| `feedback-success-summary` | Feedback Success Summary | code | Prepare webhook response |

## Feedback Assessment Agent

The feedback assessment agent (`intake-feedback-assess.md`) analyzes platform feedback submissions:

### Assessment Outputs

| Field | Type | Description |
|-------|------|-------------|
| `is_spam` | boolean | Whether submission appears to be spam/abuse |
| `priority` | string | `urgent`, `normal`, or `low` |
| `actionable_items` | string[] | Specific actions to address feedback |
| `suggested_assignee` | string | Team best suited (engineering, design, content, community, triage) |
| `summary` | string | Brief summary of the feedback (max 200 chars) |
| `sentiment` | string | `positive`, `negative`, `neutral`, or `constructive` |
| `requires_clarification` | boolean | Whether more detail is needed |
| `clarification_needed` | string | What clarification would help |

### Priority Guidelines

- **urgent**: Security issues, data loss bugs, accessibility blockers, or issues affecting many users
- **normal**: Standard feature requests, non-critical bugs, content suggestions
- **low**: Minor cosmetic issues, nice-to-haves, general comments

## Data Models

### Submission → Project Idea Field Mapping

| Submission Field | Project Idea Field | Notes |
|------------------|-------------------|-------|
| `title` | Issue title | Used in `[Project Idea] {title}` |
| `problemStatement` | `problem_statement` | Core problem being addressed |
| `description` (message) | `proposed_solution` | Submitter's proposed approach |
| - | `threat_model` | Generated by AI evaluation |
| - | `affected_groups` | Generated by AI evaluation |
| - | `feasibility_score` | Generated by AI evaluation |
| - | `impact_score` | Generated by AI evaluation |
| - | `misuse_risks` | Generated by AI evaluation |
| - | `technical_dependencies` | Generated by AI evaluation |
| - | `suggested_stack` | Generated by AI evaluation |
| - | `mvp_scope` | Set to placeholder, defined during triage |
| - | `status` | Set to `'new'` |
| - | `derived_from_insight_ids` | Empty array (community submission) |

## External Dependencies

| Service | Purpose | Credentials |
|---------|---------|-------------|
| **Postgres (Cloud SQL)** | Store submissions, project_ideas | `postgres` credential |
| **Claude API (Anthropic)** | Classification & project evaluation | `httpHeaderAuth` with API key |
| **GitHub API** | Create issues for triage | `httpHeaderAuth` with token |
| **Libertas Website API** | Fetch configs and prompts | None (public endpoints) |

## GitHub Issue Format (Project Ideas)

Issues created for project submissions include:

**Labels:** `project-idea`, `community-submitted`, `intake`

**Body sections:**
- Problem Statement
- Proposed Solution
- Threat Model
- Affected Groups
- Misuse Risks
- Scores (Feasibility, Impact)
- Technical Dependencies
- Suggested Stack
- Prior Art
- Open Questions
- Metadata (Submission ID, Project Idea ID)

## Comparison with Workflow D

| Aspect | Workflow C (Community Projects) | Workflow D (Auto-Generated Ideas) |
|--------|--------------------------------|-----------------------------------|
| **Trigger** | Webhook from intake form | Scheduled (daily at 10am UTC) |
| **Source** | Community submissions | High-signal published insights |
| **Input** | User-provided problem + solution | Clustered insights by topic |
| **derived_from_insight_ids** | Empty array | Array of source insight IDs |
| **GitHub Labels** | `community-submitted` | `auto-generated` |
| **Status** | `new` | `new` |
| **Evaluation** | intake-project-evaluate agent | generate-idea agent |
