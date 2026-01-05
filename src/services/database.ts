/**
 * Database Service
 *
 * Handles all database operations for the signal engine.
 * Uses PostgreSQL with the pg library.
 */

import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import type {
  SourceItem,
  Insight,
  ProjectIdea,
  Submission,
  Digest,
  SourceHealth,
  InsightStatus,
  IdeaStatus,
  SubmissionStatus,
  SourceHealthStatus,
} from '../types/index.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Initialize database connection pool
 */
export function initDatabase(connectionString?: string): pg.Pool {
  if (pool) return pool;

  const dbUrl = connectionString || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not configured');
  }

  pool = new Pool({ connectionString: dbUrl });
  return pool;
}

/**
 * Get database pool (must be initialized first)
 */
export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// =============================================================================
// Source Items
// =============================================================================

export async function insertSourceItem(item: Omit<SourceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SourceItem> {
  const db = getPool();
  const id = uuidv4();
  const now = new Date().toISOString();

  const result = await db.query(
    `INSERT INTO source_items
     (id, url, platform, fetched_at, raw_content_ref, extracted_text, content_hash,
      author, account_handle, published_at, language, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      id,
      item.url,
      item.platform,
      item.fetchedAt,
      item.rawContentRef,
      item.extractedText,
      item.contentHash,
      item.author,
      item.accountHandle,
      item.publishedAt,
      item.language,
      JSON.stringify(item.metadata || {}),
    ]
  );

  return mapRowToSourceItem(result.rows[0]);
}

export async function findSourceItemByHash(contentHash: string): Promise<SourceItem | null> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM source_items WHERE content_hash = $1',
    [contentHash]
  );
  return result.rows[0] ? mapRowToSourceItem(result.rows[0]) : null;
}

export async function getAllContentHashes(): Promise<Set<string>> {
  const db = getPool();
  const result = await db.query('SELECT content_hash FROM source_items');
  return new Set(result.rows.map((row) => row.content_hash));
}

function mapRowToSourceItem(row: Record<string, unknown>): SourceItem {
  return {
    id: row.id as string,
    url: row.url as string,
    platform: row.platform as SourceItem['platform'],
    fetchedAt: (row.fetched_at as Date).toISOString(),
    rawContentRef: row.raw_content_ref as string | undefined,
    extractedText: row.extracted_text as string,
    contentHash: row.content_hash as string,
    author: row.author as string | undefined,
    accountHandle: row.account_handle as string | undefined,
    publishedAt: row.published_at ? (row.published_at as Date).toISOString() : undefined,
    language: row.language as string | undefined,
    metadata: row.metadata as Record<string, unknown>,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// =============================================================================
// Insights
// =============================================================================

export async function insertInsight(insight: Insight): Promise<Insight> {
  const db = getPool();

  const result = await db.query(
    `INSERT INTO insights
     (id, source_item_ids, title, tldr, summary_bullets, deep_dive_markdown,
      topics, geo, freedom_relevance_score, credibility_score, citations,
      status, published_url, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      insight.id,
      insight.sourceItemIds,
      insight.title,
      insight.tldr,
      insight.summaryBullets,
      insight.deepDiveMarkdown,
      insight.topics,
      insight.geo,
      insight.freedomRelevanceScore,
      insight.credibilityScore,
      insight.citations,
      insight.status,
      insight.publishedUrl,
      insight.publishedAt,
    ]
  );

  return mapRowToInsight(result.rows[0]);
}

export async function updateInsightStatus(
  id: string,
  status: InsightStatus,
  publishedUrl?: string
): Promise<Insight | null> {
  const db = getPool();
  const publishedAt = status === 'published' ? new Date().toISOString() : null;

  const result = await db.query(
    `UPDATE insights
     SET status = $2, published_url = COALESCE($3, published_url),
         published_at = COALESCE($4, published_at)
     WHERE id = $1
     RETURNING *`,
    [id, status, publishedUrl, publishedAt]
  );

  return result.rows[0] ? mapRowToInsight(result.rows[0]) : null;
}

export async function getInsightsByStatus(status: InsightStatus): Promise<Insight[]> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM insights WHERE status = $1 ORDER BY created_at DESC',
    [status]
  );
  return result.rows.map(mapRowToInsight);
}

export async function getInsightsByDateRange(start: string, end: string): Promise<Insight[]> {
  const db = getPool();
  const result = await db.query(
    `SELECT * FROM insights
     WHERE created_at >= $1 AND created_at <= $2
     AND status = 'published'
     ORDER BY freedom_relevance_score DESC`,
    [start, end]
  );
  return result.rows.map(mapRowToInsight);
}

export async function getHighSignalInsights(
  minRelevance: number,
  days: number
): Promise<Insight[]> {
  const db = getPool();
  const result = await db.query(
    `SELECT * FROM insights
     WHERE freedom_relevance_score >= $1
     AND created_at >= NOW() - INTERVAL '${days} days'
     AND status = 'published'
     ORDER BY freedom_relevance_score DESC`,
    [minRelevance]
  );
  return result.rows.map(mapRowToInsight);
}

function mapRowToInsight(row: Record<string, unknown>): Insight {
  return {
    id: row.id as string,
    sourceItemIds: row.source_item_ids as string[],
    title: row.title as string,
    tldr: row.tldr as string,
    summaryBullets: row.summary_bullets as string[],
    deepDiveMarkdown: row.deep_dive_markdown as string | undefined,
    topics: row.topics as Insight['topics'],
    geo: row.geo as string[] | undefined,
    freedomRelevanceScore: row.freedom_relevance_score as number,
    credibilityScore: row.credibility_score as number,
    citations: row.citations as string[],
    status: row.status as InsightStatus,
    publishedUrl: row.published_url as string | undefined,
    publishedAt: row.published_at ? (row.published_at as Date).toISOString() : undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// =============================================================================
// Project Ideas
// =============================================================================

export async function insertProjectIdea(idea: Omit<ProjectIdea, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectIdea> {
  const db = getPool();
  const id = uuidv4();

  const result = await db.query(
    `INSERT INTO project_ideas
     (id, derived_from_insight_ids, problem_statement, threat_model, affected_groups,
      proposed_solution, mvp_scope, misuse_risks, feasibility_score, impact_score,
      status, github_issue_url, technical_dependencies, suggested_stack, prior_art, open_questions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      id,
      idea.derivedFromInsightIds,
      idea.problemStatement,
      idea.threatModel,
      idea.affectedGroups,
      idea.proposedSolution,
      idea.mvpScope,
      idea.misuseRisks,
      idea.feasibilityScore,
      idea.impactScore,
      idea.status,
      idea.githubIssueUrl,
      idea.technicalDependencies,
      idea.suggestedStack,
      idea.priorArt,
      idea.openQuestions,
    ]
  );

  return mapRowToProjectIdea(result.rows[0]);
}

export async function updateProjectIdeaStatus(
  id: string,
  status: IdeaStatus,
  githubIssueUrl?: string
): Promise<ProjectIdea | null> {
  const db = getPool();

  const result = await db.query(
    `UPDATE project_ideas
     SET status = $2, github_issue_url = COALESCE($3, github_issue_url)
     WHERE id = $1
     RETURNING *`,
    [id, status, githubIssueUrl]
  );

  return result.rows[0] ? mapRowToProjectIdea(result.rows[0]) : null;
}

function mapRowToProjectIdea(row: Record<string, unknown>): ProjectIdea {
  return {
    id: row.id as string,
    derivedFromInsightIds: row.derived_from_insight_ids as string[],
    problemStatement: row.problem_statement as string,
    threatModel: row.threat_model as string,
    affectedGroups: row.affected_groups as string[],
    proposedSolution: row.proposed_solution as string,
    mvpScope: row.mvp_scope as string,
    misuseRisks: row.misuse_risks as string,
    feasibilityScore: row.feasibility_score as number,
    impactScore: row.impact_score as number,
    status: row.status as IdeaStatus,
    githubIssueUrl: row.github_issue_url as string | undefined,
    technicalDependencies: row.technical_dependencies as string[] | undefined,
    suggestedStack: row.suggested_stack as string[] | undefined,
    priorArt: row.prior_art as string[] | undefined,
    openQuestions: row.open_questions as string[] | undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// =============================================================================
// Submissions
// =============================================================================

export async function insertSubmission(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
  const db = getPool();
  const id = uuidv4();

  const result = await db.query(
    `INSERT INTO submissions
     (id, submitted_at, channel, contact, message, tags, risk_level, status,
      github_issue_url, category, priority, is_spam, requires_response)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id,
      submission.submittedAt,
      submission.channel,
      submission.contact,
      submission.message,
      submission.tags,
      submission.riskLevel,
      submission.status,
      submission.githubIssueUrl,
      submission.category,
      submission.priority,
      submission.isSpam,
      submission.requiresResponse,
    ]
  );

  return mapRowToSubmission(result.rows[0]);
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  githubIssueUrl?: string
): Promise<Submission | null> {
  const db = getPool();

  const result = await db.query(
    `UPDATE submissions
     SET status = $2, github_issue_url = COALESCE($3, github_issue_url)
     WHERE id = $1
     RETURNING *`,
    [id, status, githubIssueUrl]
  );

  return result.rows[0] ? mapRowToSubmission(result.rows[0]) : null;
}

function mapRowToSubmission(row: Record<string, unknown>): Submission {
  return {
    id: row.id as string,
    submittedAt: (row.submitted_at as Date).toISOString(),
    channel: row.channel as Submission['channel'],
    contact: row.contact as string | undefined,
    message: row.message as string,
    tags: row.tags as string[],
    riskLevel: row.risk_level as Submission['riskLevel'],
    status: row.status as SubmissionStatus,
    githubIssueUrl: row.github_issue_url as string | undefined,
    category: row.category as Submission['category'] | undefined,
    priority: row.priority as Submission['priority'] | undefined,
    isSpam: row.is_spam as boolean | undefined,
    requiresResponse: row.requires_response as boolean | undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// =============================================================================
// Source Health (Circuit Breaker)
// =============================================================================

export async function getSourceHealth(sourceUrl: string): Promise<SourceHealth | null> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM source_health WHERE source_url = $1',
    [sourceUrl]
  );
  return result.rows[0] ? mapRowToSourceHealth(result.rows[0]) : null;
}

export async function recordSourceSuccess(sourceUrl: string): Promise<void> {
  const db = getPool();
  await db.query(
    `INSERT INTO source_health (id, source_url, consecutive_failures, last_success_at, status)
     VALUES ($1, $2, 0, NOW(), 'healthy')
     ON CONFLICT (source_url)
     DO UPDATE SET consecutive_failures = 0, last_success_at = NOW(), status = 'healthy', cooldown_until = NULL`,
    [uuidv4(), sourceUrl]
  );
}

export async function recordSourceFailure(
  sourceUrl: string,
  errorMessage: string,
  failureThreshold: number = 5,
  cooldownHours: number = 24
): Promise<SourceHealth> {
  const db = getPool();

  // Get current state
  let health = await getSourceHealth(sourceUrl);

  if (!health) {
    // Create new record
    const result = await db.query(
      `INSERT INTO source_health
       (id, source_url, consecutive_failures, last_failure_at, last_error_message, status)
       VALUES ($1, $2, 1, NOW(), $3, 'healthy')
       RETURNING *`,
      [uuidv4(), sourceUrl, errorMessage]
    );
    return mapRowToSourceHealth(result.rows[0]);
  }

  // Update existing record
  const newFailures = health.consecutiveFailures + 1;
  const newStatus: SourceHealthStatus = newFailures >= failureThreshold ? 'degraded' : 'healthy';
  const cooldownUntil = newStatus === 'degraded'
    ? new Date(Date.now() + cooldownHours * 60 * 60 * 1000).toISOString()
    : null;

  const result = await db.query(
    `UPDATE source_health
     SET consecutive_failures = $2, last_failure_at = NOW(),
         last_error_message = $3, status = $4, cooldown_until = $5
     WHERE source_url = $1
     RETURNING *`,
    [sourceUrl, newFailures, errorMessage, newStatus, cooldownUntil]
  );

  return mapRowToSourceHealth(result.rows[0]);
}

export async function isSourceInCooldown(sourceUrl: string): Promise<boolean> {
  const health = await getSourceHealth(sourceUrl);
  if (!health || !health.cooldownUntil) return false;
  return new Date(health.cooldownUntil) > new Date();
}

function mapRowToSourceHealth(row: Record<string, unknown>): SourceHealth {
  return {
    id: row.id as string,
    sourceUrl: row.source_url as string,
    consecutiveFailures: row.consecutive_failures as number,
    lastSuccessAt: row.last_success_at ? (row.last_success_at as Date).toISOString() : undefined,
    lastFailureAt: row.last_failure_at ? (row.last_failure_at as Date).toISOString() : undefined,
    lastErrorMessage: row.last_error_message as string | undefined,
    status: row.status as SourceHealthStatus,
    cooldownUntil: row.cooldown_until ? (row.cooldown_until as Date).toISOString() : undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}
