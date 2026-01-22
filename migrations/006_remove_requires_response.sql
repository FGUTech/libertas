-- Migration: 006_remove_requires_response
-- Description: Remove unused requires_response column from submissions table
-- Date: 2026-01-22
-- Reason: intake-classify prompt removed; requires_response was never read downstream

-- Remove the column (safe - column was written but never read)
ALTER TABLE submissions DROP COLUMN IF EXISTS requires_response;

-- Note: The n8n workflow-c-intake.json must also be updated to:
-- 1. Remove nodes that reference intake-classify prompt
-- 2. Remove the UPDATE query that writes requires_response
-- 3. Route directly by form type instead of initial classification
