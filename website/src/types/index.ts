/**
 * Core TypeScript types for the Libertas website
 *
 * Types are organized into sections:
 * 1. Enums and constants (matching JSON schemas)
 * 2. Zod schemas for runtime validation
 * 3. Core data models (derived from Zod)
 * 4. Frontend-specific types
 * 5. API response types
 */

import { z } from 'zod';

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

/**
 * Topic categories for freedom tech content
 * Matches: schemas/insight.schema.json#/properties/topics
 */
export const TOPICS = [
  'bitcoin',
  'zk',
  'censorship-resistance',
  'comms',
  'payments',
  'identity',
  'privacy',
  'surveillance',
  'activism',
  'sovereignty',
] as const;

export type Topic = (typeof TOPICS)[number];

/**
 * Source platform types
 * Matches: schemas/source-item.schema.json#/properties/platform
 */
export const PLATFORMS = ['rss', 'web', 'x', 'nostr', 'github', 'email'] as const;
export type Platform = (typeof PLATFORMS)[number];

/**
 * Insight workflow status
 * Matches: schemas/insight.schema.json#/properties/status
 */
export const INSIGHT_STATUSES = ['draft', 'queued', 'published', 'rejected'] as const;
export type InsightStatus = (typeof INSIGHT_STATUSES)[number];

/**
 * Submission workflow status
 * Matches: schemas/submission.schema.json#/properties/status
 */
export const SUBMISSION_STATUSES = ['new', 'triaged', 'responded', 'archived'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/**
 * Submission intake channels
 * Matches: schemas/submission.schema.json#/properties/channel
 */
export const SUBMISSION_CHANNELS = ['web', 'email', 'nostr'] as const;
export type SubmissionChannel = (typeof SUBMISSION_CHANNELS)[number];

/**
 * Submission categories
 * Matches: schemas/submission.schema.json#/properties/category
 */
export const SUBMISSION_CATEGORIES = [
  'tool-request',
  'idea',
  'report',
  'question',
  'collaboration',
  'other',
] as const;
export type SubmissionCategory = (typeof SUBMISSION_CATEGORIES)[number];

/**
 * Risk/priority levels
 * Matches: schemas/submission.schema.json#/properties/riskLevel
 */
export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

/**
 * Priority levels
 * Matches: schemas/submission.schema.json#/properties/priority
 */
export const PRIORITY_LEVELS = ['urgent', 'normal', 'low'] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

/**
 * Project idea workflow status
 * Matches: schemas/project-idea.schema.json#/properties/status
 */
export const PROJECT_IDEA_STATUSES = [
  'new',
  'triaged',
  'build_candidate',
  'prototyped',
  'rejected',
] as const;
export type ProjectIdeaStatus = (typeof PROJECT_IDEA_STATUSES)[number];

// =============================================================================
// ZOD SCHEMAS - Runtime Validation
// =============================================================================

/**
 * SourceItem schema - raw fetched content
 * Matches: schemas/source-item.schema.json
 */
export const SourceItemSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  platform: z.enum(PLATFORMS),
  fetchedAt: z.string().datetime(),
  rawContentRef: z.string().optional(),
  extractedText: z.string(),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  author: z.string().optional(),
  accountHandle: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  language: z.string().regex(/^[a-z]{2}$/).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Citation schema for insights
 */
export const CitationSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  source: z.string(),
  accessedAt: z.string().datetime(),
});

/**
 * Insight schema - generated analysis
 * Matches: schemas/insight.schema.json
 */
export const InsightSchema = z.object({
  id: z.string().uuid(),
  sourceItemIds: z.array(z.string().uuid()).min(1),
  title: z.string().max(120),
  tldr: z.string().max(280),
  summaryBullets: z.array(z.string()).min(5).max(10),
  deepDiveMarkdown: z.string().optional(),
  topics: z.array(z.enum(TOPICS)).min(1).max(5),
  geo: z.array(z.string()).optional(),
  freedomRelevanceScore: z.number().int().min(0).max(100),
  credibilityScore: z.number().int().min(0).max(100),
  citations: z.array(z.string().url()).min(1),
  status: z.enum(INSIGHT_STATUSES),
  publishedUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Submission schema - public intake
 * Matches: schemas/submission.schema.json
 */
export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  submittedAt: z.string().datetime(),
  channel: z.enum(SUBMISSION_CHANNELS),
  contact: z.string().optional(),
  message: z.string().min(1),
  tags: z.array(z.string()),
  riskLevel: z.enum(RISK_LEVELS),
  status: z.enum(SUBMISSION_STATUSES),
  githubIssueUrl: z.string().url().optional(),
  category: z.enum(SUBMISSION_CATEGORIES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  isSpam: z.boolean().optional(),
  requiresResponse: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * ProjectIdea schema - generated project proposals
 * Matches: schemas/project-idea.schema.json
 */
export const ProjectIdeaSchema = z.object({
  id: z.string().uuid(),
  derivedFromInsightIds: z.array(z.string().uuid()).min(1),
  problemStatement: z.string().min(50).max(500),
  threatModel: z.string().min(50).max(500),
  affectedGroups: z.array(z.string()).min(1),
  proposedSolution: z.string().min(100).max(1000),
  mvpScope: z.string().min(50).max(500),
  misuseRisks: z.string().min(50).max(500),
  feasibilityScore: z.number().int().min(0).max(100),
  impactScore: z.number().int().min(0).max(100),
  status: z.enum(PROJECT_IDEA_STATUSES),
  githubIssueUrl: z.string().url().optional(),
  technicalDependencies: z.array(z.string()).optional(),
  suggestedStack: z.array(z.string()).optional(),
  priorArt: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Classification result from LLM
 * Matches: schemas/llm-outputs/classification-result.schema.json
 */
export const ClassificationResultSchema = z.object({
  topics: z.array(z.enum(TOPICS)).min(1).max(5),
  freedom_relevance_score: z.number().int().min(0).max(100),
  credibility_score: z.number().int().min(0).max(100),
  geo: z.array(z.string()),
  safety_concern: z.boolean(),
  reasoning: z.string(),
  key_entities: z.array(z.string()).optional(),
  should_summarize: z.boolean().optional(),
});

// =============================================================================
// CORE DATA TYPES - Derived from Zod schemas
// =============================================================================

export type SourceItem = z.infer<typeof SourceItemSchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type ProjectIdea = z.infer<typeof ProjectIdeaSchema>;
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

// =============================================================================
// FRONTEND-SPECIFIC TYPES
// =============================================================================

/**
 * Post - frontend view of published content
 * Simplified version of Insight for display
 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  topics: Topic[];
  citations: PostCitation[];
  freedomRelevanceScore: number;
  credibilityScore: number;
  geo?: string[];
}

/**
 * Citation for frontend display
 */
export interface PostCitation {
  url: string;
  title: string;
  source: string;
  accessedAt: string;
}

/**
 * User identity
 */
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  starknetAddress?: string;
  createdAt: string;
}

/**
 * Extended user profile
 */
export interface UserProfile extends User {
  avatarUrl?: string;
  bio?: string;
}

/**
 * Reaction types for posts
 */
export type ReactionType = 'like' | 'dislike';

/**
 * Individual reaction record
 */
export interface Reaction {
  id: string;
  userId: string;
  postSlug: string;
  type: ReactionType;
  starknetTxHash?: string;
  createdAt: string;
}

/**
 * Aggregated reaction counts for display
 */
export interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction?: ReactionType;
}

/**
 * Comment on a post
 */
export interface Comment {
  id: string;
  userId: string;
  postSlug: string;
  parentId?: string;
  content: string;
  starknetTxHash?: string;
  createdAt: string;
  updatedAt?: string;
  author?: UserProfile;
  replies?: Comment[];
}

// =============================================================================
// INTAKE FORM TYPES
// =============================================================================

/**
 * Intake form submission data (frontend form)
 */
export const IntakeFormSchema = z.object({
  category: z.enum(SUBMISSION_CATEGORIES),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  contact: z.string().email().optional().or(z.literal('')),
  urgency: z.enum(RISK_LEVELS).optional(),
});

export type IntakeFormData = z.infer<typeof IntakeFormSchema>;

/**
 * Legacy intake types (for backwards compatibility)
 */
export type IntakeType = 'project' | 'story' | 'feedback';
export type UrgencyLevel = RiskLevel;

export interface IntakeSubmission {
  type: IntakeType;
  title: string;
  description: string;
  contact?: string;
  urgency?: UrgencyLevel;
}

/**
 * Intake form response from n8n webhook
 */
export interface IntakeResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Generic API response wrapper
 */
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };

/**
 * Feed metadata for RSS/JSON feeds
 */
export interface FeedMeta {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language: string;
  lastBuildDate: string;
  generator: string;
}

/**
 * Feed item for RSS/JSON feeds
 */
export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  tags: string[];
  topics: Topic[];
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate and parse SourceItem data
 */
export function parseSourceItem(data: unknown): SourceItem {
  return SourceItemSchema.parse(data);
}

/**
 * Validate and parse Insight data
 */
export function parseInsight(data: unknown): Insight {
  return InsightSchema.parse(data);
}

/**
 * Validate and parse Submission data
 */
export function parseSubmission(data: unknown): Submission {
  return SubmissionSchema.parse(data);
}

/**
 * Validate and parse ProjectIdea data
 */
export function parseProjectIdea(data: unknown): ProjectIdea {
  return ProjectIdeaSchema.parse(data);
}

/**
 * Validate intake form data
 */
export function parseIntakeForm(data: unknown): IntakeFormData {
  return IntakeFormSchema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
