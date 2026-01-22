-- =============================================================================
-- Migration 007: User Story Items Table
-- Creates a table for user-submitted stories that have been classified
-- and are queued for insight generation via Workflow A
-- =============================================================================

-- This table stores user-submitted stories in a format compatible with Workflow A's
-- summarization pipeline. Stories are classified by intake-story-classify in Workflow C,
-- then queued here for Workflow A to process alongside regular RSS sources.

CREATE TABLE user_story_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link back to original submission for traceability
  submission_id UUID NOT NULL REFERENCES submissions(id),

  -- Source item compatible fields (for Workflow A processing)
  url TEXT NOT NULL,                    -- sourceUrl if provided, or 'intake://submission/{id}'
  platform VARCHAR(20) NOT NULL DEFAULT 'web',
  extracted_text TEXT NOT NULL,         -- User's story description
  content_hash VARCHAR(64) NOT NULL,    -- SHA256 hash for deduplication
  author TEXT DEFAULT 'community',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',          -- Additional context

  -- Story-specific fields
  title TEXT NOT NULL,
  region VARCHAR(100),
  urgency VARCHAR(20) DEFAULT 'normal',
  source_content TEXT,                  -- Fetched content from sourceUrl (if any)
  tier INTEGER NOT NULL DEFAULT 2,      -- Hardcoded to tier 2 for user submissions

  -- Classification output (from intake-story-classify agent)
  topics VARCHAR(50)[] NOT NULL DEFAULT '{}',
  freedom_relevance_score INTEGER NOT NULL CHECK (freedom_relevance_score BETWEEN 0 AND 100),
  credibility_score INTEGER NOT NULL CHECK (credibility_score BETWEEN 0 AND 100),
  geo VARCHAR(100)[] DEFAULT '{}',
  safety_concern BOOLEAN NOT NULL DEFAULT FALSE,
  reasoning TEXT,
  risk_level VARCHAR(10) NOT NULL DEFAULT 'low',
  priority VARCHAR(10) NOT NULL DEFAULT 'normal',
  summary_text VARCHAR(200),            -- Brief summary from classification
  key_entities TEXT[] DEFAULT '{}',

  -- Processing state (for Workflow A)
  insight_generated BOOLEAN NOT NULL DEFAULT FALSE,
  insight_id UUID REFERENCES insights(id),
  processed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT user_story_items_platform_check CHECK (platform IN ('web')),
  CONSTRAINT user_story_items_risk_check CHECK (risk_level IN ('low', 'medium', 'high')),
  CONSTRAINT user_story_items_priority_check CHECK (priority IN ('urgent', 'normal', 'low')),
  CONSTRAINT user_story_items_urgency_check CHECK (urgency IN ('urgent', 'normal', 'low')),
  CONSTRAINT unique_user_story_content_hash UNIQUE (content_hash)
);

-- Indexes for Workflow A queries
CREATE INDEX idx_user_story_items_pending ON user_story_items(insight_generated)
  WHERE insight_generated = FALSE;
CREATE INDEX idx_user_story_items_submission ON user_story_items(submission_id);
CREATE INDEX idx_user_story_items_created ON user_story_items(created_at);
CREATE INDEX idx_user_story_items_relevance ON user_story_items(freedom_relevance_score);
CREATE INDEX idx_user_story_items_content_hash ON user_story_items(content_hash);

-- Updated_at trigger
CREATE TRIGGER update_user_story_items_updated_at
    BEFORE UPDATE ON user_story_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE user_story_items IS 'User-submitted stories classified and queued for insight generation';
COMMENT ON COLUMN user_story_items.submission_id IS 'Link to original submission in submissions table';
COMMENT ON COLUMN user_story_items.tier IS 'Source tier (always 2 for user submissions)';
COMMENT ON COLUMN user_story_items.insight_generated IS 'Whether Workflow A has processed this story';
COMMENT ON COLUMN user_story_items.insight_id IS 'Link to generated insight (if any)';
COMMENT ON COLUMN user_story_items.summary_text IS 'Brief 200-char summary from classification agent';
