#!/usr/bin/env node
/**
 * Backfill Script: Reconstruct source_items and insights from published JSON feeds
 *
 * Usage:
 *   node scripts/backfill-from-feeds.js > backfill.sql
 *   # Then: psql $DATABASE_URL < backfill.sql
 *
 * Or with direct execution:
 *   DATABASE_URL=postgresql://... node scripts/backfill-from-feeds.js --execute
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const FEEDS_DIR = path.join(__dirname, '../website/public');
const INSIGHTS_FEED = path.join(FEEDS_DIR, 'insights-feed.json');
const DIGESTS_FEED = path.join(FEEDS_DIR, 'digests-feed.json');

// Platform detection from URL
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('github.com')) return 'github';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'x';
  // Most of our sources are RSS-based news sites
  return 'rss';
}

// Generate content hash (SHA-256, first 64 chars)
function generateContentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Escape SQL string
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Escape SQL array
function escapeSqlArray(arr, type = 'text') {
  if (!arr || arr.length === 0) return "'{}'";
  if (type === 'uuid') {
    return "ARRAY[" + arr.map(v => escapeSql(v) + "::uuid").join(', ') + "]";
  }
  return "ARRAY[" + arr.map(v => escapeSql(v)).join(', ') + "]";
}

// Main backfill function
async function generateBackfillSql() {
  // Read insights feed
  const insightsFeed = JSON.parse(fs.readFileSync(INSIGHTS_FEED, 'utf-8'));

  const sourceItemsInserts = [];
  const insightsInserts = [];
  const sourceItemIdMap = new Map(); // citation URL -> generated UUID

  console.log('-- Libertas Backfill Script');
  console.log('-- Generated:', new Date().toISOString());
  console.log('-- Source: insights-feed.json');
  console.log('');
  console.log('BEGIN;');
  console.log('');

  // Process each insight
  for (const item of insightsFeed.items) {
    const citations = item._libertas?.citations || [];
    const sourceItemIds = [];

    // Create source_items for each citation
    for (const citationUrl of citations) {
      // Dedupe: if we've seen this URL, reuse the ID
      if (sourceItemIdMap.has(citationUrl)) {
        sourceItemIds.push(sourceItemIdMap.get(citationUrl));
        continue;
      }

      // Generate a deterministic UUID from the URL (so reruns are idempotent)
      const sourceItemId = crypto.createHash('md5').update(citationUrl).digest('hex');
      const formattedUuid = [
        sourceItemId.slice(0, 8),
        sourceItemId.slice(8, 12),
        sourceItemId.slice(12, 16),
        sourceItemId.slice(16, 20),
        sourceItemId.slice(20, 32)
      ].join('-');

      sourceItemIdMap.set(citationUrl, formattedUuid);
      sourceItemIds.push(formattedUuid);

      // We don't have the original extracted_text, so use the insight's content as proxy
      // The content_hash is generated from the URL to ensure uniqueness
      const contentHash = generateContentHash(citationUrl);
      const platform = detectPlatform(citationUrl);

      console.log(`-- Source Item: ${citationUrl}`);
      console.log(`INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)`);
      console.log(`VALUES (`);
      console.log(`  ${escapeSql(formattedUuid)}::uuid,`);
      console.log(`  ${escapeSql(citationUrl)},`);
      console.log(`  ${escapeSql(platform)},`);
      console.log(`  ${escapeSql(item.date_published)}::timestamptz,`);
      console.log(`  ${escapeSql('[Content recovered from citation - original text not available]')},`);
      console.log(`  ${escapeSql(contentHash)},`);
      console.log(`  ${escapeSql(item.date_published)}::timestamptz,`);
      console.log(`  NOW(),`);
      console.log(`  NOW()`);
      console.log(`)`);
      console.log(`ON CONFLICT (content_hash) DO NOTHING;`);
      console.log('');
    }

    // Create insight record
    const tags = item.tags || [];
    const libertas = item._libertas || {};

    // Parse content_text into bullet points
    const bullets = item.content_text
      ? item.content_text.split('\n').filter(line => line.trim().startsWith('•') || line.trim())
      : [];

    console.log(`-- Insight: ${item.title}`);
    console.log(`INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)`);
    console.log(`VALUES (`);
    console.log(`  ${escapeSql(item.id)}::uuid,`);
    console.log(`  ${escapeSqlArray(sourceItemIds, 'uuid')},`);
    console.log(`  ${escapeSql(item.title)},`);
    console.log(`  ${escapeSql(item.summary)},`);
    console.log(`  ${escapeSqlArray(bullets)},`);
    console.log(`  ${escapeSqlArray(tags)},`);
    console.log(`  ${libertas.freedom_relevance_score || 50},`);
    console.log(`  ${libertas.credibility_score || 50},`);
    console.log(`  ${escapeSqlArray(libertas.citations || [])},`);
    console.log(`  'published',`);
    console.log(`  ${escapeSql(item.url)},`);
    console.log(`  ${escapeSql(item.date_published)}::timestamptz,`);
    console.log(`  NOW(),`);
    console.log(`  NOW()`);
    console.log(`)`);
    console.log(`ON CONFLICT (id) DO NOTHING;`);
    console.log('');
  }

  // Process digests feed if it exists
  if (fs.existsSync(DIGESTS_FEED)) {
    const digestsFeed = JSON.parse(fs.readFileSync(DIGESTS_FEED, 'utf-8'));

    console.log('-- ===========================================');
    console.log('-- DIGESTS');
    console.log('-- ===========================================');
    console.log('');

    for (const item of digestsFeed.items || []) {
      const libertas = item._libertas || {};

      console.log(`-- Digest: ${item.title}`);
      console.log(`INSERT INTO digests (id, period_start, period_end, insight_count, tldr, content_markdown, top_topics, published_url, published_at, created_at, updated_at)`);
      console.log(`VALUES (`);
      console.log(`  ${escapeSql(item.id)}::uuid,`);
      console.log(`  ${escapeSql(libertas.period_start || item.date_published?.slice(0, 10))}::date,`);
      console.log(`  ${escapeSql(libertas.period_end || item.date_published?.slice(0, 10))}::date,`);
      console.log(`  ${libertas.insight_count || 0},`);
      console.log(`  ${escapeSql(item.summary || item.title)},`);
      console.log(`  ${escapeSql(item.content_text || '')},`);
      console.log(`  ${escapeSqlArray(libertas.top_topics || item.tags || [])},`);
      console.log(`  ${escapeSql(item.url)},`);
      console.log(`  ${escapeSql(item.date_published)}::timestamptz,`);
      console.log(`  NOW(),`);
      console.log(`  NOW()`);
      console.log(`)`);
      console.log(`ON CONFLICT (period_start, period_end) DO NOTHING;`);
      console.log('');
    }
  }

  console.log('COMMIT;');
  console.log('');
  console.log('-- Summary:');
  console.log(`-- Source Items: ${sourceItemIdMap.size}`);
  console.log(`-- Insights: ${insightsFeed.items.length}`);
}

// Run
generateBackfillSql().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
