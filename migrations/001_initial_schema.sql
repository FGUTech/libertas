-- FGU Signal Engine - Initial Database Schema
-- Migration: 001_initial_schema
-- Description: Creates core tables for the signal engine

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SOURCE ITEMS TABLE
-- Represents a single piece of fetched content from any source
-- =============================================================================
CREATE TABLE source_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_content_ref TEXT,
  extracted_text TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  author TEXT,
  account_handle TEXT,
  published_at TIMESTAMPTZ,
  language VARCHAR(10),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT source_items_platform_check CHECK (platform IN ('rss', 'web', 'x', 'nostr', 'github', 'email')),
  CONSTRAINT unique_content_hash UNIQUE (content_hash)
);

CREATE INDEX idx_source_items_platform ON source_items(platform);
CREATE INDEX idx_source_items_fetched_at ON source_items(fetched_at);
CREATE INDEX idx_source_items_content_hash ON source_items(content_hash);
CREATE INDEX idx_source_items_url ON source_items(url);

-- =============================================================================
-- INSIGHTS TABLE
-- Generated analysis derived from one or more SourceItems
-- =============================================================================
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_item_ids UUID[] NOT NULL,
  title TEXT NOT NULL,
  tldr TEXT NOT NULL,
  summary_bullets TEXT[] NOT NULL,
  deep_dive_markdown TEXT,
  topics VARCHAR(50)[] NOT NULL,
  geo VARCHAR(100)[],
  freedom_relevance_score INTEGER NOT NULL CHECK (freedom_relevance_score BETWEEN 0 AND 100),
  credibility_score INTEGER NOT NULL CHECK (credibility_score BETWEEN 0 AND 100),
  citations TEXT[] NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT insights_status_check CHECK (status IN ('draft', 'queued', 'published', 'rejected'))
);

CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_topics ON insights USING GIN(topics);
CREATE INDEX idx_insights_created_at ON insights(created_at);
CREATE INDEX idx_insights_scores ON insights(freedom_relevance_score, credibility_score);
CREATE INDEX idx_insights_published_at ON insights(published_at);

-- =============================================================================
-- PROJECT IDEAS TABLE
-- Generated project proposals derived from insights
-- =============================================================================
CREATE TABLE project_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derived_from_insight_ids UUID[] NOT NULL,
  problem_statement TEXT NOT NULL,
  threat_model TEXT NOT NULL,
  affected_groups TEXT[] NOT NULL,
  proposed_solution TEXT NOT NULL,
  mvp_scope TEXT NOT NULL,
  misuse_risks TEXT NOT NULL,
  feasibility_score INTEGER NOT NULL CHECK (feasibility_score BETWEEN 0 AND 100),
  impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN 0 AND 100),
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  github_issue_url TEXT,
  technical_dependencies TEXT[],
  suggested_stack TEXT[],
  prior_art TEXT[],
  open_questions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT project_ideas_status_check CHECK (status IN ('new', 'triaged', 'build_candidate', 'prototyped', 'rejected'))
);

CREATE INDEX idx_project_ideas_status ON project_ideas(status);
CREATE INDEX idx_project_ideas_scores ON project_ideas(feasibility_score, impact_score);
CREATE INDEX idx_project_ideas_created_at ON project_ideas(created_at);

-- =============================================================================
-- SUBMISSIONS TABLE
-- Public intake from external parties
-- =============================================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel VARCHAR(20) NOT NULL,
  contact TEXT,  -- Consider encryption at rest
  message TEXT NOT NULL,
  tags VARCHAR(50)[] DEFAULT '{}',
  risk_level VARCHAR(10) NOT NULL DEFAULT 'low',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  github_issue_url TEXT,
  category VARCHAR(30),
  priority VARCHAR(10),
  is_spam BOOLEAN DEFAULT FALSE,
  requires_response BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT submissions_channel_check CHECK (channel IN ('web', 'email', 'nostr')),
  CONSTRAINT submissions_risk_level_check CHECK (risk_level IN ('low', 'medium', 'high')),
  CONSTRAINT submissions_status_check CHECK (status IN ('new', 'triaged', 'responded', 'archived')),
  CONSTRAINT submissions_category_check CHECK (category IS NULL OR category IN ('tool-request', 'idea', 'report', 'question', 'collaboration', 'other')),
  CONSTRAINT submissions_priority_check CHECK (priority IS NULL OR priority IN ('urgent', 'normal', 'low'))
);

-- Do NOT index contact field to avoid accidental exposure
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_risk_level ON submissions(risk_level);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_submissions_is_spam ON submissions(is_spam) WHERE is_spam = FALSE;

-- =============================================================================
-- DIGESTS TABLE
-- Weekly digest records
-- =============================================================================
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  insight_count INTEGER NOT NULL DEFAULT 0,
  executive_tldr TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  top_topics VARCHAR(50)[] DEFAULT '{}',
  published_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_digest_period UNIQUE (period_start, period_end)
);

CREATE INDEX idx_digests_period ON digests(period_start, period_end);

-- =============================================================================
-- SOURCE HEALTH TABLE
-- Circuit breaker tracking for sources
-- =============================================================================
CREATE TABLE source_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL UNIQUE,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error_message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'healthy',
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT source_health_status_check CHECK (status IN ('healthy', 'degraded', 'failed'))
);

CREATE INDEX idx_source_health_status ON source_health(status);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_source_items_updated_at
    BEFORE UPDATE ON source_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
    BEFORE UPDATE ON insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_ideas_updated_at
    BEFORE UPDATE ON project_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digests_updated_at
    BEFORE UPDATE ON digests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_source_health_updated_at
    BEFORE UPDATE ON source_health
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE source_items IS 'Raw content fetched from sources';
COMMENT ON TABLE insights IS 'Generated analysis from source content';
COMMENT ON TABLE project_ideas IS 'Project proposals derived from insights';
COMMENT ON TABLE submissions IS 'Public intake from external parties';
COMMENT ON TABLE digests IS 'Weekly digest records';
COMMENT ON TABLE source_health IS 'Circuit breaker tracking for sources';
