-- =============================================================================
-- Migration 008: Add Story Classification Output Columns
-- Adds columns to store all outputs from intake-story-classify agent
-- =============================================================================

-- Add geo array column (classification output - may differ from user-provided region)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS geo VARCHAR(100)[] DEFAULT '{}';

-- Add reasoning column (explanation of scoring rationale)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Add summary_text column (brief summary from classification, max 200 chars)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS summary_text VARCHAR(200);

-- Add key_entities column (people, organizations, projects mentioned)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS key_entities TEXT[] DEFAULT '{}';

-- Create index on geo for geographic queries
CREATE INDEX IF NOT EXISTS idx_submissions_geo ON submissions USING GIN(geo);

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON COLUMN submissions.geo IS 'Geographic regions from classification (may differ from user-provided region)';
COMMENT ON COLUMN submissions.reasoning IS 'LLM explanation of scoring rationale';
COMMENT ON COLUMN submissions.summary_text IS 'Brief non-sensitive summary from classification (max 200 chars)';
COMMENT ON COLUMN submissions.key_entities IS 'Key people, organizations, or projects mentioned in the story';
