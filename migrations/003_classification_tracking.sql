-- Migration 003: Add classification score tracking to source_items
-- This allows debugging why items didn't result in insights

-- Drop JSONB column if it exists (from previous version)
ALTER TABLE source_items DROP COLUMN IF EXISTS classification_result;

-- Add simple integer score columns
ALTER TABLE source_items
ADD COLUMN IF NOT EXISTS freedom_relevance_score INTEGER,
ADD COLUMN IF NOT EXISTS credibility_score INTEGER;

-- Add index for querying by relevance score
CREATE INDEX IF NOT EXISTS idx_source_items_relevance_score
ON source_items (freedom_relevance_score);

-- Add index for querying by credibility score
CREATE INDEX IF NOT EXISTS idx_source_items_credibility_score
ON source_items (credibility_score);

COMMENT ON COLUMN source_items.freedom_relevance_score IS 'Classification score 0-100 indicating relevance to freedom tech mission';
COMMENT ON COLUMN source_items.credibility_score IS 'Classification score 0-100 indicating source credibility';
