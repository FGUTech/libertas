-- Libertas - Add Title to Project Ideas
-- Migration: 011_project_ideas_title
-- Description: Adds title column for short, descriptive project idea titles

-- Add title column
ALTER TABLE project_ideas ADD COLUMN IF NOT EXISTS title TEXT;

-- Add comment
COMMENT ON COLUMN project_ideas.title IS 'Short, descriptive title for the project idea (5-10 words, max 80 chars)';
