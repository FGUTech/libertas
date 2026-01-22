-- Libertas - Add Detected Pattern to Project Ideas
-- Migration: 005_add_detected_pattern
-- Description: Adds detected_pattern column to store the pattern/gap that inspired each project idea

-- Add detected_pattern column
ALTER TABLE project_ideas ADD COLUMN IF NOT EXISTS detected_pattern TEXT;

-- Add comment
COMMENT ON COLUMN project_ideas.detected_pattern IS 'Brief description of the pattern/gap identified across insights that inspired this project idea';
