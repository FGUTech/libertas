-- Libertas - Rename executive_tldr to tldr
-- Migration: 004_rename_executive_tldr
-- Description: Renames executive_tldr column to tldr in digests table for consistency

-- Rename the column
ALTER TABLE digests RENAME COLUMN executive_tldr TO tldr;

-- Update comment if exists
COMMENT ON COLUMN digests.tldr IS 'TL;DR summary of the weekly digest (2-3 sentences, max 500 chars)';
