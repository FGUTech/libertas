# Workflow C: Intake - Test Documentation

## Overview

**Purpose:** Handle user submissions (stories, feedback, project ideas) via webhook, classify and assess risk, optionally queue stories for insight generation or create GitHub issues.

**Trigger:** Webhook - POST to `/intake` endpoint

**Tables Affected:**
- `submissions` (INSERT new submission record)
- `user_story_items` (INSERT if story qualifies for insight generation)

**External Services:**
- Claude API (intake-story-classify for stories)
- GitHub API (optional issue creation)

---

## Pre-Test Database Queries

Run these queries to capture the state before testing:

```sql
-- 1. Count existing submissions
SELECT COUNT(*) AS total_submissions FROM submissions;

-- 2. Get recent submissions
SELECT id, submission_type, channel, title, message, status, risk_level, is_spam, created_at
FROM submissions
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count submissions by type
SELECT submission_type, COUNT(*) FROM submissions GROUP BY submission_type;

-- 4. Count submissions by status
SELECT status, COUNT(*) FROM submissions GROUP BY status;

-- 5. Count user_story_items
SELECT COUNT(*) AS total_user_stories FROM user_story_items;

-- 6. Get recent user_story_items (queued stories)
SELECT id, submission_id, title, freedom_relevance_score, credibility_score, insight_generated, created_at
FROM user_story_items
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check queued stories pending insight generation
SELECT COUNT(*) AS pending_stories
FROM user_story_items
WHERE insight_generated = false;
```

---

## Test Execution Steps

### Option A: Test via Frontend Form

1. **Navigate to Submission Form:**
   - Go to `localhost:3000/submit` (or production URL)

2. **Test Story Submission:**
   ```
   Type: Story
   Title: "Test Story: Internet Shutdown in Test Region"
   Message: "Testing the intake workflow. This simulates a report about
             internet censorship affecting journalists in a test region.
             Include details about VPN blocks and communication tools."
   Source URL: https://example.com/test-article (optional)
   Region: Test Region
   Urgency: Normal
   Contact: test@example.com (optional)
   ```

3. **Test Feedback Submission:**
   ```
   Type: Feedback
   Message: "This is a test feedback submission. The platform is working well.
             Suggestion: Add more filtering options."
   Contact: test@example.com (optional)
   ```

4. **Test Project Idea Submission:**
   ```
   Type: Project
   Title: "Test Project: Censorship Detection Tool"
   Message: "Idea for an automated tool that detects internet censorship
             patterns across different regions using public data."
   Contact: test@example.com (optional)
   ```

### Option B: Test via Direct API Call

```bash
# Story submission
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "submission_type": "story",
    "title": "Test Story: Censorship Event",
    "message": "Testing intake workflow with a story about internet censorship affecting activists.",
    "source_url": "https://example.com/test",
    "region": "Test Region",
    "urgency": "normal",
    "channel": "web"
  }'

# Feedback submission
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "submission_type": "feedback",
    "message": "Test feedback: Platform is working well.",
    "channel": "web"
  }'

# Project submission
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "submission_type": "project",
    "title": "Test Project Idea",
    "message": "Automated censorship detection tool using public data.",
    "channel": "web"
  }'
```

### Option C: Test in n8n Directly

1. **Navigate to Workflow C** (Intake workflow)
2. **Use Test Webhook feature** to send test payload
3. **Or trigger via Postman/curl** to the n8n webhook URL

---

## Post-Test Database Queries

Run these queries after each submission test:

```sql
-- 1. Count submissions after (compare to pre-test)
SELECT COUNT(*) AS total_submissions FROM submissions;

-- 2. Get NEW submission created during test
SELECT id, submission_type, channel, title, message, status, risk_level,
       freedom_relevance_score, credibility_score, safety_concern,
       queued_for_insight, is_spam, created_at
FROM submissions
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Check if user_story_item was created (for stories)
SELECT id, submission_id, title, freedom_relevance_score, credibility_score,
       safety_concern, topics, insight_generated, created_at
FROM user_story_items
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 4. Verify submission classification scores (for stories)
SELECT id, title,
       freedom_relevance_score,
       credibility_score,
       safety_concern,
       queued_for_insight
FROM submissions
WHERE submission_type = 'story'
  AND created_at > NOW() - INTERVAL '1 hour';
```

---

## n8n Execution History Checks

### What to Look For:

1. **Webhook Trigger Node:**
   - Received POST request
   - Payload parsed correctly
   - Rate limit check passed

2. **Rate Limit Check:**
   - Per IP: 10 req/min, 100 req/hour
   - Global: 100 req/min
   - If exceeded, should return 429 response

3. **Parse Submission Type:**
   - Routes to correct handler (story/feedback/project)

4. **For Story Submissions - Classify Node:**
   - Calls `intake-story-classify.md` agent
   - Input: message, title, source_url, region, urgency
   - Output should contain:
     - `freedom_relevance_score` (0-100)
     - `credibility_score` (0-100)
     - `safety_concern` (boolean)
     - `topics[]`
     - `geo[]`
     - `reasoning`

5. **Story Queue Check:**
   - Conditions to queue for insight (ALL must be true):
     - `freedom_relevance_score >= 80` (story_queue_relevance_threshold)
     - `credibility_score >= 40` (story_queue_credibility_threshold)
     - `safety_concern = false`
   - If met: creates `user_story_items` record

6. **Database Insert (submissions):**
   - All fields populated correctly
   - Classification scores stored (for stories)

7. **Database Insert (user_story_items):**
   - Only if story qualifies
   - `insight_generated = false` initially
   - Correct `submission_id` reference

8. **Webhook Response:**
   - Returns success/created response
   - Includes submission ID

---

## Expected Behaviors

### Story Submission:
- [ ] New `submissions` record created with type='story'
- [ ] Claude classification scores populated
- [ ] If relevance >= 80 AND credibility >= 40 AND no safety concern:
  - [ ] `queued_for_insight = true` in submissions
  - [ ] New `user_story_items` record created
  - [ ] `insight_generated = false` initially
- [ ] If scores below threshold or safety concern:
  - [ ] `queued_for_insight = false`
  - [ ] No user_story_items record

### Feedback Submission:
- [ ] New `submissions` record created with type='feedback'
- [ ] Status = 'new'
- [ ] No user_story_items created

### Project Submission:
- [ ] New `submissions` record created with type='project'
- [ ] Status = 'new'
- [ ] May create GitHub issue (check workflow config)

### Rate Limiting:
- [ ] First 10 requests in a minute succeed
- [ ] 11th request returns 429 (if testing limits)

---

## Classification Thresholds Reference

From `config/thresholds.yml`:

```yaml
intake:
  story_queue_relevance_threshold: 80  # Min relevance to queue for insight
  story_queue_credibility_threshold: 40  # Min credibility to queue
  max_stories_per_run: 5  # Workflow A processes max 5 per run

rate_limits:
  requests_per_minute: 10  # Per IP
  requests_per_hour: 100   # Per IP
  global_per_minute: 100   # All IPs combined
```

---

## Test Scenarios

### Scenario 1: High-Quality Story (Should Queue)
```json
{
  "submission_type": "story",
  "title": "Documented Internet Shutdown During Elections",
  "message": "Verified reports from multiple journalists confirm complete
              internet blackout in [Region] during election period.
              Evidence includes network measurement data from OONI and
              statements from press freedom organizations.",
  "source_url": "https://ooni.org/example-report",
  "region": "Test Region",
  "urgency": "urgent"
}
```
**Expected:** High relevance (80+), medium credibility (60+), no safety concern → queued

### Scenario 2: Low-Relevance Story (Should NOT Queue)
```json
{
  "submission_type": "story",
  "title": "New Coffee Shop Opens",
  "message": "A new coffee shop opened in downtown. Great lattes!",
  "region": "Test City"
}
```
**Expected:** Low relevance (<50), no queue

### Scenario 3: Safety Concern Story (Should NOT Queue)
```json
{
  "submission_type": "story",
  "title": "Activist Identity Exposed",
  "message": "This story contains details about an activist whose identity
              should remain protected. Includes personal information that
              could put them at risk.",
  "urgency": "urgent"
}
```
**Expected:** May have high relevance, but `safety_concern = true` → NOT queued

---

## Data Validation Checklist

For `submissions` record:
- [ ] `id` is valid UUID
- [ ] `submission_type` is one of: story, feedback, project
- [ ] `channel` is one of: web, email, nostr
- [ ] `message` contains submitted text
- [ ] `status` is 'new' initially
- [ ] `created_at` is set
- [ ] For stories: classification scores are populated
- [ ] `contact` field is NOT indexed (privacy)

For `user_story_items` record (if created):
- [ ] `submission_id` references correct submission
- [ ] `url` format: `intake://submission/{submission_id}` or actual URL
- [ ] `platform` = 'web'
- [ ] `tier` = 2
- [ ] `insight_generated` = false initially
- [ ] `content_hash` is unique
- [ ] Classification fields match submission

---

## Paste Test Results Here

### Pre-Test Snapshot
```
(Paste pre-test query results here)
```

### Test Submission Details
```
Submission Type: story/feedback/project
Title:
Message (first 100 chars):
Timestamp:
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

### Classification Results (for stories)
```
Freedom Relevance Score: X/100
Credibility Score: X/100
Safety Concern: true/false
Topics: [...]
Queued for Insight: true/false
```
