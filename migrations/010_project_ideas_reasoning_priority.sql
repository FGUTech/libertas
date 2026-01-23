-- Libertas - Add Reasoning and Priority to Project Ideas
-- Migration: 010_project_ideas_reasoning_priority
-- Description: Adds reasoning and priority columns to project_ideas table for better triage support

-- Add reasoning column to store the LLM's scoring rationale
ALTER TABLE project_ideas ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Add priority column (urgent/normal/low) for triage
ALTER TABLE project_ideas ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'normal';

-- Add constraint for priority values
ALTER TABLE project_ideas ADD CONSTRAINT project_ideas_priority_check
  CHECK (priority IN ('urgent', 'normal', 'low'));

-- Add comments
COMMENT ON COLUMN project_ideas.reasoning IS 'Brief explanation of scoring rationale from LLM evaluation';
COMMENT ON COLUMN project_ideas.priority IS 'Triage priority: urgent, normal, or low';

-- Add index for priority-based queries
CREATE INDEX IF NOT EXISTS idx_project_ideas_priority ON project_ideas(priority);
