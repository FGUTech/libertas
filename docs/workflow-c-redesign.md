# Workflow C Redesign: Remove intake-classify

## Overview

This document describes a simplified Workflow C that removes the redundant `intake-classify` prompt. The form already provides `type` for routing, and each type-specific prompt already handles classification.

## Current Flow (Redundant)

```
Webhook
    ↓
Rate Limit + Fetch Config + Fetch intake-classify prompt  ← REMOVE
    ↓
Validate Input → Insert Submission
    ↓
Use Stubs for Classify? → Classify (stub/Claude)  ← REMOVE
    ↓
Parse LLM Response → Update Submission  ← REMOVE
    ↓
Route by type → type-specific processing
```

**Problem**: Initial classification is redundant because:
1. Form already sends `type` (project/story/feedback)
2. Type-specific prompts already output: risk_level, priority, is_spam, summary
3. `requires_response` field is never read downstream

## Simplified Flow

```
Webhook
    ↓
Rate Limit + Fetch Config (thresholds only)
    ↓
Validate Input → Insert Submission (status='new')
    ↓
Route by Type (direct, using form's type field)
    ├── type='story'   → Story branch (unchanged)
    ├── type='project' → Project branch (unchanged)
    └── type='feedback'→ Feedback branch (unchanged)
```

## Nodes to Remove

| Node ID | Node Name | Reason |
|---------|-----------|--------|
| `fetch-intake-classify-prompt` | Fetch Intake Classify Prompt | No longer needed |
| `wait-for-fetches` | Wait for Fetches | Simplify to single config fetch |
| `merge-config-agents` | Merge Config & Agents | Simplify |
| `use-stubs-classify` | Use Stubs for Classify? | No initial classification |
| `b0d80e32-5e56-4553-8037-9011a2c680f1` | Classify Stub | No initial classification |
| `8d4a91f3-2fb2-4be9-9d5f-0bc2ebc6a3be` | Classify with Claude API | No initial classification |
| `wrap-classify-response` | Wrap Claude Classify Response | No initial classification |
| `handle-claude-error` | Handle Claude Error (classify) | No initial classification |
| `2c3ce832-b8bc-4645-a849-4d340ec89943` | Parse LLM Response | No initial classification |
| `584cdc58-21d3-4526-accc-14cfdc4c4f3d` | Update Submission | Move to type-specific branches |

## Nodes to Modify

### 1. Validate Input (simplified)

Remove `_agents` passthrough, keep only what's needed:

```javascript
// Validate input - simplified
const input = $input.first().json;
const runtimeConfig = input.runtime || { use_stubs: true };

const messageContent = input.description || input.message || '';
if (!messageContent || messageContent.trim().length < 10) {
  throw new Error('Message/description required (min 10 chars)');
}

const submissionType = input.type || 'feedback';

return [{
  json: {
    // Database columns
    message: messageContent.trim(),
    contact: input.contact || null,
    category: mapTypeToCategory(submissionType),
    channel: 'web',
    submission_type: submissionType,
    title: input.title || null,
    source_url: input.sourceUrl || null,
    region: input.region || null,
    urgency: input.urgency || 'normal',
    problemStatement: input.problemStatement || null,
    safetyMode: input.safetyMode || false,
    type: submissionType,
    sourceUrl: input.sourceUrl || null,
    _runtime: runtimeConfig
  }
}];

function mapTypeToCategory(type) {
  switch(type) {
    case 'story': return 'report';
    case 'project': return 'idea';
    default: return 'other';
  }
}
```

### 2. New "Route by Type" node

Replace `Is Story?` check to read directly from `Validate Input`:

```javascript
// Route by Type - reads type from Validate Input
const data = $('Insert Submission').first().json;
const validateData = $('Validate Input').first().json;

return [{
  json: {
    ...data,
    _type: validateData.type,
    _runtime: validateData._runtime,
    _formData: {
      type: validateData.type,
      title: validateData.title,
      sourceUrl: validateData.sourceUrl,
      region: validateData.region,
      urgency: validateData.urgency,
      problemStatement: validateData.problemStatement
    }
  }
}];
```

### 3. Update "Is Story?" condition

Change from:
```
$('Parse LLM Response').first().json._storyData?.type
```

To:
```
$('Route by Type').first().json._type
```

### 4. Update "Is Project?" condition

Same change - read from `Route by Type` node.

### 5. Move submission update to type-specific branches

Each branch should update the submission with its classification results. Add an "Update Submission" step after each type-specific Parse LLM Response:

**For Story branch** (after Parse Story LLM Response):
```sql
UPDATE submissions
SET tags = $1::text[],
    risk_level = $2,
    priority = $3,
    is_spam = FALSE,
    status = 'triaged'
WHERE id = $4::uuid
```

**For Project branch** (after Parse Project LLM Response):
```sql
UPDATE submissions
SET risk_level = 'low',
    priority = $1,
    is_spam = $2,
    status = 'triaged'
WHERE id = $3::uuid
```

**For Feedback branch** (after Parse Feedback LLM Response):
```sql
UPDATE submissions
SET risk_level = 'low',
    priority = $1,
    is_spam = $2,
    status = 'triaged'
WHERE id = $3::uuid
```

## Database Schema Change

Remove unused column:

```sql
-- migrations/006_remove_requires_response.sql
ALTER TABLE submissions DROP COLUMN IF EXISTS requires_response;
```

## Files to Update

1. **n8n/workflows/workflow-c-intake.json** - Remove/modify nodes as described above
2. **n8n/workflows/workflow-c.md** - Update documentation
3. **agents/intake-classify.md** - DELETE (no longer used)
4. **website/src/app/api/agents/intake-classify/route.ts** - DELETE
5. **schemas/submission.schema.json** - Remove `requiresResponse` field
6. **website/src/types/index.ts** - Remove `requiresResponse` from schema
7. **migrations/006_remove_requires_response.sql** - New migration

## Benefits

1. **Fewer API calls**: Removes 1 Claude API call per submission (cost savings)
2. **Faster processing**: Direct routing instead of classify→parse→route
3. **Simpler maintenance**: One less prompt to maintain
4. **Cleaner data flow**: Type comes from form, not AI inference

## Estimated Savings

- **Per submission**: 1 fewer Claude API call (~$0.003-0.015 depending on model)
- **Latency reduction**: ~2-5 seconds per submission
- **Code reduction**: ~400 lines of workflow JSON, 1 prompt file

## Implementation Steps

1. Create migration to drop `requires_response` column
2. Update type definitions (remove requiresResponse)
3. Delete intake-classify.md and its API route
4. Update workflow JSON (remove nodes, update routing)
5. Update workflow-c.md documentation
6. Test all three submission types
