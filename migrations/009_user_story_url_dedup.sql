-- =============================================================================
-- Migration 009: Add URL Deduplication for User Stories
-- Prevents duplicate stories from being queued based on source URL
-- =============================================================================

-- Add unique index on URL for real source URLs (not intake:// generated URLs)
-- This allows multiple stories without source URLs (intake://...) but prevents
-- duplicate submissions of the same external URL
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_story_items_source_url
ON user_story_items (url)
WHERE url NOT LIKE 'intake://%';

-- Also add an index to efficiently check for existing URLs
CREATE INDEX IF NOT EXISTS idx_user_story_items_url_lookup
ON user_story_items (url);

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON INDEX idx_user_story_items_source_url IS 'Ensures unique external source URLs (excludes intake:// generated URLs)';
