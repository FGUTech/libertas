/**
 * Libertas - Core Type Definitions
 */

// =============================================================================
// Platform Types
// =============================================================================

export type Platform = 'rss' | 'web' | 'x' | 'nostr' | 'github' | 'email';

export type Topic =
  | 'bitcoin'
  | 'zk'
  | 'censorship-resistance'
  | 'comms'
  | 'payments'
  | 'identity'
  | 'privacy'
  | 'surveillance'
  | 'activism'
  | 'sovereignty';

export type InsightStatus = 'draft' | 'queued' | 'published' | 'rejected';

export type IdeaStatus = 'new' | 'triaged' | 'build_candidate' | 'prototyped' | 'rejected';

export type SubmissionChannel = 'web' | 'email' | 'nostr';

export type RiskLevel = 'low' | 'medium' | 'high';

export type SubmissionStatus = 'new' | 'triaged' | 'responded' | 'archived';

export type SubmissionCategory =
  | 'tool-request'
  | 'idea'
  | 'report'
  | 'question'
  | 'collaboration'
  | 'other';

export type Priority = 'urgent' | 'normal' | 'low';

export type SourceHealthStatus = 'healthy' | 'degraded' | 'failed';

// =============================================================================
// Core Entities
// =============================================================================

export interface SourceItem {
  id: string;
  url: string;
  platform: Platform;
  fetchedAt: string;
  rawContentRef?: string;
  extractedText: string;
  contentHash: string;
  author?: string;
  accountHandle?: string;
  publishedAt?: string;
  language?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  sourceItemIds: string[];
  title: string;
  tldr: string;
  summaryBullets: string[];
  deepDiveMarkdown?: string;
  topics: Topic[];
  geo?: string[];
  freedomRelevanceScore: number;
  credibilityScore: number;
  citations: string[];
  status: InsightStatus;
  publishedUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectIdea {
  id: string;
  derivedFromInsightIds: string[];
  problemStatement: string;
  threatModel: string;
  affectedGroups: string[];
  proposedSolution: string;
  mvpScope: string;
  misuseRisks: string;
  feasibilityScore: number;
  impactScore: number;
  status: IdeaStatus;
  githubIssueUrl?: string;
  technicalDependencies?: string[];
  suggestedStack?: string[];
  priorArt?: string[];
  openQuestions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  submittedAt: string;
  channel: SubmissionChannel;
  contact?: string;
  message: string;
  tags: string[];
  riskLevel: RiskLevel;
  status: SubmissionStatus;
  githubIssueUrl?: string;
  category?: SubmissionCategory;
  priority?: Priority;
  isSpam?: boolean;
  requiresResponse?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Digest {
  id: string;
  periodStart: string;
  periodEnd: string;
  insightCount: number;
  executiveTldr: string;
  contentMarkdown: string;
  topTopics: string[];
  publishedUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceHealth {
  id: string;
  sourceUrl: string;
  consecutiveFailures: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastErrorMessage?: string;
  status: SourceHealthStatus;
  cooldownUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// LLM Output Types
// =============================================================================

export interface ClassificationResult {
  topics: Topic[];
  freedom_relevance_score: number;
  credibility_score: number;
  geo: string[];
  safety_concern: boolean;
  reasoning: string;
  key_entities?: string[];
  should_summarize: boolean;
}

export interface SummarizerResult {
  title: string;
  tldr: string;
  summary_bullets: string[];
  deep_dive_markdown?: string;
  citations: string[];
  recommended_actions?: string[];
  related_projects?: string[];
  project_idea_trigger?: {
    should_generate: boolean;
    reason: string;
  };
}

export interface IdeaSynthesizerResult {
  problem_statement: string;
  threat_model: string;
  affected_groups: string[];
  proposed_solution: string;
  mvp_scope: string;
  misuse_risks: string;
  feasibility_score: number;
  impact_score: number;
  technical_dependencies?: string[];
  suggested_stack?: string[];
  prior_art?: string[];
  open_questions?: string[];
}

export interface DigestSection {
  title: string;
  content_markdown: string;
  insight_ids?: string[];
}

export interface EmergingPattern {
  pattern: string;
  supporting_signals: string[];
}

export interface DigestResult {
  executive_tldr: string;
  sections: DigestSection[];
  emerging_patterns?: EmergingPattern[];
  looking_ahead?: string[];
  insight_count: number;
  top_topics?: string[];
}

export interface IntakeClassificationResult {
  category: SubmissionCategory;
  tags: string[];
  risk_level: RiskLevel;
  priority: Priority;
  summary: string;
  is_spam?: boolean;
  requires_response?: boolean;
  suggested_assignee?: string;
}

// =============================================================================
// Configuration Types
// =============================================================================

export interface SourceConfig {
  name: string;
  type: 'rss' | 'web' | 'x_account' | 'nostr' | 'github';
  url: string;
  tier: 1 | 2 | 3;
  tags: string[];
  enabled: boolean;
}

export interface ThresholdsConfig {
  ingestion: {
    relevance_threshold: number;
    max_items_per_run: number;
    retry_attempts: number;
    retry_delay_seconds: number;
  };
  publishing: {
    auto_publish_relevance: number;
    auto_publish_credibility: number;
    require_citations: boolean;
    require_safety_check: boolean;
  };
  review: {
    relevance_below: number;
    credibility_below: number;
    safety_concern_always_review: boolean;
  };
  deduplication: {
    exact_match: boolean;
    semantic_threshold: number;
    semantic_enabled: boolean;
  };
  ideas: {
    min_relevance_for_idea: number;
    min_feasibility: number;
    min_impact: number;
    lookback_days: number;
  };
  vibe_coding: {
    requires_human_approval: boolean;
    allowed_categories: string[];
    blocked_categories: string[];
    min_feasibility: number;
    min_impact: number;
  };
  digest: {
    min_insights: number;
    max_per_section: number;
  };
  rate_limiting: {
    requests_per_minute: number;
    requests_per_hour: number;
    global_per_minute: number;
  };
  circuit_breaker: {
    failure_threshold: number;
    cooldown_hours: number;
  };
  performance: {
    ingestion_latency_target: number;
    classification_latency_target: number;
    end_to_end_target: number;
    webhook_response_target: number;
  };
}

// =============================================================================
// Feed Types
// =============================================================================

export interface FeedItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  content_text?: string;
  date_published: string;
  tags: string[];
  _libertas: {
    freedom_relevance_score: number;
    credibility_score: number;
    citations: string[];
    geo?: string[];
  };
}

export interface JSONFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  items: FeedItem[];
}

// =============================================================================
// Webhook Types
// =============================================================================

export interface IntakeRequest {
  message: string;
  contact?: string;
  category?: string;
  safetyMode?: boolean;
}

export interface IntakeResponse {
  id: string;
  status: 'received';
  message: string;
}

export interface RateLimitResponse {
  error: 'rate_limit_exceeded';
  retryAfter: number;
}

export interface ValidationErrorResponse {
  error: 'validation_error';
  details: string[];
}
