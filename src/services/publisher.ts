/**
 * Publisher Service
 *
 * Handles publishing insights to various formats (Markdown, RSS, JSON Feed).
 * Manages git commits and file generation.
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  generateRSSFeed,
  generateJSONFeed,
  generateInsightMarkdown,
  generateDigestMarkdown,
} from '../utils/feeds.js';
import type { Insight, DigestResult } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_CONTENT_DIR = join(__dirname, '..', '..', 'site-content');

export interface PublishResult {
  success: boolean;
  filePath?: string;
  publishedUrl?: string;
  error?: string;
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Publish an insight as a markdown file
 */
export function publishInsightMarkdown(insight: Insight): PublishResult {
  try {
    const postsDir = join(SITE_CONTENT_DIR, 'posts');
    ensureDir(postsDir);

    const slug = generateSlug(insight.title);
    const fileName = `${insight.id}-${slug}.md`;
    const filePath = join(postsDir, fileName);

    const markdown = generateInsightMarkdown(insight);
    writeFileSync(filePath, markdown, 'utf-8');

    const siteBaseUrl = process.env.SITE_BASE_URL || 'https://libertas.fgu.tech';
    const publishedUrl = `${siteBaseUrl}/signals/${insight.id}`;

    return {
      success: true,
      filePath,
      publishedUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown publish error',
    };
  }
}

/**
 * Publish a weekly digest as a markdown file
 */
export function publishDigestMarkdown(
  digest: DigestResult,
  periodStart: string,
  periodEnd: string
): PublishResult {
  try {
    const digestsDir = join(SITE_CONTENT_DIR, 'digests');
    ensureDir(digestsDir);

    const fileName = `digest-${periodEnd}.md`;
    const filePath = join(digestsDir, fileName);

    const markdown = generateDigestMarkdown(
      {
        executiveTldr: digest.executive_tldr,
        sections: digest.sections,
        emergingPatterns: digest.emerging_patterns,
        lookingAhead: digest.looking_ahead,
        insightCount: digest.insight_count,
        topTopics: digest.top_topics,
      },
      periodStart,
      periodEnd
    );
    writeFileSync(filePath, markdown, 'utf-8');

    const siteBaseUrl = process.env.SITE_BASE_URL || 'https://libertas.fgu.tech';
    const publishedUrl = `${siteBaseUrl}/digests/digest-${periodEnd}`;

    return {
      success: true,
      filePath,
      publishedUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown publish error',
    };
  }
}

/**
 * Update RSS feed with all published insights
 */
export function updateRSSFeed(insights: Insight[]): PublishResult {
  try {
    ensureDir(SITE_CONTENT_DIR);

    const rssPath = join(SITE_CONTENT_DIR, 'rss.xml');
    const rss = generateRSSFeed(insights);
    writeFileSync(rssPath, rss, 'utf-8');

    return {
      success: true,
      filePath: rssPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown RSS generation error',
    };
  }
}

/**
 * Update JSON Feed with all published insights
 */
export function updateJSONFeed(insights: Insight[]): PublishResult {
  try {
    ensureDir(SITE_CONTENT_DIR);

    const jsonPath = join(SITE_CONTENT_DIR, 'feed.json');
    const feed = generateJSONFeed(insights);
    writeFileSync(jsonPath, JSON.stringify(feed, null, 2), 'utf-8');

    return {
      success: true,
      filePath: jsonPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON Feed generation error',
    };
  }
}

/**
 * Publish all feeds (RSS + JSON)
 */
export function publishFeeds(insights: Insight[]): { rss: PublishResult; json: PublishResult } {
  return {
    rss: updateRSSFeed(insights),
    json: updateJSONFeed(insights),
  };
}

/**
 * Check if content should be auto-published based on quality gates
 */
export function shouldAutoPublish(
  freedomRelevanceScore: number,
  credibilityScore: number,
  hasCitations: boolean,
  safetyConcern: boolean,
  thresholds: {
    autoPublishRelevance: number;
    autoPublishCredibility: number;
    requireCitations: boolean;
    requireSafetyCheck: boolean;
  }
): { autoPublish: boolean; reason: string } {
  if (safetyConcern && thresholds.requireSafetyCheck) {
    return { autoPublish: false, reason: 'Safety concern flagged - requires review' };
  }

  if (!hasCitations && thresholds.requireCitations) {
    return { autoPublish: false, reason: 'Missing citations - requires review' };
  }

  if (freedomRelevanceScore < thresholds.autoPublishRelevance) {
    return {
      autoPublish: false,
      reason: `Relevance score ${freedomRelevanceScore} below threshold ${thresholds.autoPublishRelevance}`,
    };
  }

  if (credibilityScore < thresholds.autoPublishCredibility) {
    return {
      autoPublish: false,
      reason: `Credibility score ${credibilityScore} below threshold ${thresholds.autoPublishCredibility}`,
    };
  }

  return { autoPublish: true, reason: 'Meets all quality gates' };
}

/**
 * Create a new insight record from summarizer output
 */
export function createInsightRecord(
  sourceItemIds: string[],
  classification: {
    topics: string[];
    freedomRelevanceScore: number;
    credibilityScore: number;
    geo?: string[];
  },
  summary: {
    title: string;
    tldr: string;
    summaryBullets: string[];
    deepDiveMarkdown?: string;
    citations: string[];
  },
  status: 'draft' | 'queued' | 'published' = 'draft'
): Insight {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    sourceItemIds,
    title: summary.title,
    tldr: summary.tldr,
    summaryBullets: summary.summaryBullets,
    deepDiveMarkdown: summary.deepDiveMarkdown,
    topics: classification.topics as Insight['topics'],
    geo: classification.geo,
    freedomRelevanceScore: classification.freedomRelevanceScore,
    credibilityScore: classification.credibilityScore,
    citations: summary.citations,
    status,
    createdAt: now,
    updatedAt: now,
  };
}
