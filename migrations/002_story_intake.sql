-- =============================================================================
-- Migration 002: Story Intake Support
-- Adds support for story submissions (1.13a Workflow C Story Intake Processing)
-- =============================================================================

-- Add submission_type column to track original intake type
-- Values: 'story', 'project', 'feedback' (default)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submission_type VARCHAR(20) DEFAULT 'feedback';

-- Add story-specific columns
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'normal';

-- Add story classification scores (populated by intake-story-classify agent)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS freedom_relevance_score INTEGER,
ADD COLUMN IF NOT EXISTS credibility_score INTEGER,
ADD COLUMN IF NOT EXISTS safety_concern BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS queued_for_insight BOOLEAN DEFAULT FALSE;

-- Drop and recreate category constraint to be more permissive
-- This allows the workflow to store any category value
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_category_check;

ALTER TABLE submissions
ADD CONSTRAINT submissions_category_check
CHECK (category IS NULL OR category IN (
  -- Original categories
  'tool-request', 'idea', 'report', 'question', 'collaboration', 'other',
  -- Feedback form categories (mapped to 'other' in workflow, but allow direct storage as fallback)
  'bug', 'feature', 'content',
  -- Story/project types (in case they get stored directly)
  'story', 'project', 'feedback'
));

-- Add constraint for submission_type
ALTER TABLE submissions
ADD CONSTRAINT submissions_type_check
CHECK (submission_type IS NULL OR submission_type IN ('story', 'project', 'feedback'));

-- Add constraint for urgency
ALTER TABLE submissions
ADD CONSTRAINT submissions_urgency_check
CHECK (urgency IS NULL OR urgency IN ('urgent', 'normal', 'low'));

-- Add index for submission_type to support filtering
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(submission_type);

-- Add index for queued stories
CREATE INDEX IF NOT EXISTS idx_submissions_queued ON submissions(queued_for_insight)
WHERE queued_for_insight = TRUE;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON COLUMN submissions.submission_type IS 'Original intake type: story, project, or feedback';
COMMENT ON COLUMN submissions.title IS 'Story title (for story submissions)';
COMMENT ON COLUMN submissions.source_url IS 'Source URL for story verification';
COMMENT ON COLUMN submissions.region IS 'Geographic region relevant to the story';
COMMENT ON COLUMN submissions.urgency IS 'Submitter-indicated urgency level';
COMMENT ON COLUMN submissions.freedom_relevance_score IS 'AI-assessed freedom tech relevance (0-100)';
COMMENT ON COLUMN submissions.credibility_score IS 'AI-assessed credibility (0-100)';
COMMENT ON COLUMN submissions.safety_concern IS 'Flag if story could endanger individuals';
COMMENT ON COLUMN submissions.queued_for_insight IS 'Whether story was queued for insight generation';
