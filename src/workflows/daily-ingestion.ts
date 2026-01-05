/**
 * Workflow A: Daily Ingestion
 *
 * This is the core ingestion loop that:
 * 1. Fetches content from configured sources
 * 2. Extracts and normalizes text
 * 3. Checks for duplicates
 * 4. Classifies content with LLM
 * 5. Generates summaries for qualifying content
 * 6. Publishes or queues for review
 *
 * Designed to be called by n8n or run standalone.
 */

import { loadSources, loadThresholds, getLLMConfig } from '../services/config.js';
import { fetchSource, type FetchedItem } from '../services/fetcher.js';
import { checkDuplicate } from '../services/deduper.js';
import { classifyContent, summarizeContent } from '../services/llm.js';
import {
  publishInsightMarkdown,
  publishFeeds,
  shouldAutoPublish,
  createInsightRecord,
} from '../services/publisher.js';
import {
  initDatabase,
  insertSourceItem,
  insertInsight,
  updateInsightStatus,
  getAllContentHashes,
  getInsightsByStatus,
  recordSourceSuccess,
  recordSourceFailure,
  isSourceInCooldown,
} from '../services/database.js';
import type { SourceItem, Insight, SourceConfig } from '../types/index.js';

export interface IngestionResult {
  success: boolean;
  sourcesProcessed: number;
  itemsFetched: number;
  itemsProcessed: number;
  itemsDeduplicated: number;
  insightsCreated: number;
  insightsPublished: number;
  insightsQueued: number;
  errors: string[];
  duration: number;
}

export interface IngestionOptions {
  maxItemsPerRun?: number;
  skipSources?: string[];
  dryRun?: boolean;
}

/**
 * Run the daily ingestion workflow
 */
export async function runDailyIngestion(options: IngestionOptions = {}): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    success: true,
    sourcesProcessed: 0,
    itemsFetched: 0,
    itemsProcessed: 0,
    itemsDeduplicated: 0,
    insightsCreated: 0,
    insightsPublished: 0,
    insightsQueued: 0,
    errors: [],
    duration: 0,
  };

  try {
    // Load configuration
    const sources = loadSources();
    const thresholds = loadThresholds();
    const llmConfig = getLLMConfig();

    // Initialize database
    initDatabase();

    // Get existing content hashes for deduplication
    const existingHashes = await getAllContentHashes();

    // Track items processed in this run
    let totalProcessed = 0;
    const maxItems = options.maxItemsPerRun || thresholds.ingestion.max_items_per_run;

    // Process each source
    for (const source of sources) {
      if (totalProcessed >= maxItems) {
        break;
      }

      if (options.skipSources?.includes(source.name)) {
        continue;
      }

      // Check circuit breaker
      if (await isSourceInCooldown(source.url)) {
        result.errors.push(`Source ${source.name} is in cooldown, skipping`);
        continue;
      }

      try {
        const sourceResult = await processSource(
          source,
          existingHashes,
          thresholds,
          llmConfig,
          maxItems - totalProcessed,
          options.dryRun || false
        );

        result.sourcesProcessed++;
        result.itemsFetched += sourceResult.fetched;
        result.itemsProcessed += sourceResult.processed;
        result.itemsDeduplicated += sourceResult.deduplicated;
        result.insightsCreated += sourceResult.insights;
        result.insightsPublished += sourceResult.published;
        result.insightsQueued += sourceResult.queued;
        result.errors.push(...sourceResult.errors);

        totalProcessed += sourceResult.processed;

        // Record success
        await recordSourceSuccess(source.url);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Source ${source.name} failed: ${errorMsg}`);
        await recordSourceFailure(
          source.url,
          errorMsg,
          thresholds.circuit_breaker.failure_threshold,
          thresholds.circuit_breaker.cooldown_hours
        );
      }
    }

    // Update feeds with all published insights
    if (!options.dryRun) {
      const publishedInsights = await getInsightsByStatus('published');
      const feedResults = publishFeeds(publishedInsights);
      if (!feedResults.rss.success) {
        result.errors.push(`RSS feed generation failed: ${feedResults.rss.error}`);
      }
      if (!feedResults.json.success) {
        result.errors.push(`JSON feed generation failed: ${feedResults.json.error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown workflow error');
  }

  result.duration = Date.now() - startTime;
  return result;
}

interface SourceProcessResult {
  fetched: number;
  processed: number;
  deduplicated: number;
  insights: number;
  published: number;
  queued: number;
  errors: string[];
}

/**
 * Process a single source
 */
async function processSource(
  source: SourceConfig,
  existingHashes: Set<string>,
  thresholds: ReturnType<typeof loadThresholds>,
  llmConfig: ReturnType<typeof getLLMConfig>,
  maxItems: number,
  dryRun: boolean
): Promise<SourceProcessResult> {
  const result: SourceProcessResult = {
    fetched: 0,
    processed: 0,
    deduplicated: 0,
    insights: 0,
    published: 0,
    queued: 0,
    errors: [],
  };

  // Fetch content
  const fetchResult = await fetchSource(source.url, source.type);
  if (!fetchResult.success) {
    result.errors.push(`Fetch failed: ${fetchResult.error}`);
    return result;
  }

  result.fetched = fetchResult.items.length;

  // Process each item
  for (const item of fetchResult.items.slice(0, maxItems)) {
    try {
      const itemResult = await processItem(
        item,
        source,
        existingHashes,
        thresholds,
        llmConfig,
        dryRun
      );

      if (itemResult.deduplicated) {
        result.deduplicated++;
      } else {
        result.processed++;
        if (itemResult.insight) {
          result.insights++;
          if (itemResult.insight.status === 'published') {
            result.published++;
          } else if (itemResult.insight.status === 'queued') {
            result.queued++;
          }
        }
      }

      // Add new hash to tracking set
      if (itemResult.contentHash) {
        existingHashes.add(itemResult.contentHash);
      }
    } catch (error) {
      result.errors.push(
        `Item ${item.url} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return result;
}

interface ItemProcessResult {
  deduplicated: boolean;
  contentHash?: string;
  sourceItem?: SourceItem;
  insight?: Insight;
}

/**
 * Process a single fetched item
 */
async function processItem(
  item: FetchedItem,
  source: SourceConfig,
  existingHashes: Set<string>,
  thresholds: ReturnType<typeof loadThresholds>,
  llmConfig: ReturnType<typeof getLLMConfig>,
  dryRun: boolean
): Promise<ItemProcessResult> {
  // Check for duplicates
  const dedupeResult = await checkDuplicate(
    item.content,
    existingHashes,
    thresholds.deduplication.semantic_enabled,
    thresholds.deduplication.semantic_threshold
  );

  if (dedupeResult.isDuplicate) {
    return { deduplicated: true, contentHash: dedupeResult.contentHash };
  }

  // Create source item record
  const sourceItemData = {
    url: item.url,
    platform: item.platform,
    fetchedAt: new Date().toISOString(),
    extractedText: item.content,
    contentHash: dedupeResult.contentHash,
    author: item.author,
    publishedAt: item.publishedAt,
    metadata: { sourceConfig: source.name, title: item.title },
  };

  let sourceItem: SourceItem | undefined;
  if (!dryRun) {
    sourceItem = await insertSourceItem(sourceItemData);
  }

  // Classify content with LLM
  const classificationResult = await classifyContent(llmConfig, {
    sourceUrl: item.url,
    extractedText: item.content,
    platform: source.type,
    author: item.author,
    publishedAt: item.publishedAt,
  });

  if (!classificationResult.success || !classificationResult.data) {
    return {
      deduplicated: false,
      contentHash: dedupeResult.contentHash,
      sourceItem,
    };
  }

  const classification = classificationResult.data;

  // Check if content meets relevance threshold
  if (classification.freedom_relevance_score < thresholds.ingestion.relevance_threshold) {
    return {
      deduplicated: false,
      contentHash: dedupeResult.contentHash,
      sourceItem,
    };
  }

  // Skip if safety concern flagged and summarization shouldn't proceed
  if (classification.safety_concern && !classification.should_summarize) {
    return {
      deduplicated: false,
      contentHash: dedupeResult.contentHash,
      sourceItem,
    };
  }

  // Generate summary
  const includeDeepDive = classification.freedom_relevance_score >= 85;
  const summaryResult = await summarizeContent(llmConfig, {
    sourceUrl: item.url,
    extractedText: item.content,
    classification,
    includeDeepDive,
  });

  if (!summaryResult.success || !summaryResult.data) {
    return {
      deduplicated: false,
      contentHash: dedupeResult.contentHash,
      sourceItem,
    };
  }

  const summary = summaryResult.data;

  // Determine publish status
  const publishDecision = shouldAutoPublish(
    classification.freedom_relevance_score,
    classification.credibility_score,
    summary.citations.length > 0,
    classification.safety_concern,
    {
      autoPublishRelevance: thresholds.publishing.auto_publish_relevance,
      autoPublishCredibility: thresholds.publishing.auto_publish_credibility,
      requireCitations: thresholds.publishing.require_citations,
      requireSafetyCheck: thresholds.publishing.require_safety_check,
    }
  );

  const initialStatus = publishDecision.autoPublish ? 'published' : 'queued';

  // Create insight record
  const insight = createInsightRecord(
    sourceItem ? [sourceItem.id] : ['mock-source-id'],
    {
      topics: classification.topics,
      freedomRelevanceScore: classification.freedom_relevance_score,
      credibilityScore: classification.credibility_score,
      geo: classification.geo,
    },
    {
      title: summary.title,
      tldr: summary.tldr,
      summaryBullets: summary.summary_bullets,
      deepDiveMarkdown: summary.deep_dive_markdown,
      citations: summary.citations,
    },
    initialStatus
  );

  if (!dryRun) {
    // Save insight to database
    await insertInsight(insight);

    // Publish if auto-approved
    if (publishDecision.autoPublish) {
      const publishResult = publishInsightMarkdown(insight);
      if (publishResult.success && publishResult.publishedUrl) {
        await updateInsightStatus(insight.id, 'published', publishResult.publishedUrl);
        insight.publishedUrl = publishResult.publishedUrl;
        insight.publishedAt = new Date().toISOString();
      }
    }
  }

  return {
    deduplicated: false,
    contentHash: dedupeResult.contentHash,
    sourceItem,
    insight,
  };
}

/**
 * Export for n8n integration
 */
export default {
  runDailyIngestion,
};
