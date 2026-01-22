/**
 * Search utilities for posts and digests
 * Works client-side with pre-loaded content data
 */

import type { Post, Digest, ContentItem, Topic } from "@/types";
import { isPost, isDigest } from "@/types";

/**
 * Search options for filtering content
 */
export interface SearchOptions {
  query?: string;
  topics?: Topic[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'newest' | 'oldest';
  contentType?: 'all' | 'posts' | 'digests';
}

/**
 * Search result with match information
 */
export interface SearchResult {
  item: ContentItem;
  score: number;
  matchedFields: ('title' | 'summary' | 'content' | 'tags' | 'topics')[];
  highlights: {
    title?: string;
    summary?: string;
  };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a highlighted snippet with search terms marked
 */
function createHighlight(text: string, query: string, maxLength: number = 200): string {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return text.slice(0, maxLength);

  const lowerText = text.toLowerCase();
  let firstMatchIndex = text.length;

  for (const word of words) {
    const index = lowerText.indexOf(word);
    if (index !== -1 && index < firstMatchIndex) {
      firstMatchIndex = index;
    }
  }

  let start = Math.max(0, firstMatchIndex - 50);
  if (start > 0) {
    while (start > 0 && text[start - 1] !== ' ') {
      start--;
    }
  }

  let snippet = text.slice(start, start + maxLength);
  if (start > 0) snippet = '...' + snippet;
  if (start + maxLength < text.length) snippet = snippet + '...';

  for (const word of words) {
    const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
  }

  return snippet;
}

/**
 * Get summary text from a content item
 */
function getSummary(item: ContentItem): string {
  if (isPost(item)) {
    return item.summary;
  } else if (isDigest(item)) {
    return item.executiveTldr;
  }
  return '';
}

/**
 * Get content text from a content item
 */
function getContent(item: ContentItem): string {
  return item.content || '';
}

/**
 * Get tags from a content item
 */
function getTags(item: ContentItem): string[] {
  if (isPost(item)) {
    return item.tags;
  }
  return [];
}

/**
 * Get topics from a content item
 */
function getTopics(item: ContentItem): Topic[] {
  if (isPost(item)) {
    return item.topics;
  } else if (isDigest(item)) {
    return item.topTopics;
  }
  return [];
}

/**
 * Calculate search relevance score for a content item
 */
function calculateScore(item: ContentItem, query: string): { score: number; matchedFields: SearchResult['matchedFields'] } {
  if (!query.trim()) {
    return { score: 0, matchedFields: [] };
  }

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  const matchedFields: SearchResult['matchedFields'] = [];

  // Title matches (highest weight)
  const titleLower = item.title.toLowerCase();
  for (const word of words) {
    if (titleLower.includes(word)) {
      score += 10;
      if (!matchedFields.includes('title')) matchedFields.push('title');
    }
  }
  if (words.every(word => titleLower.includes(word))) {
    score += 5;
  }

  // Summary matches (high weight)
  const summary = getSummary(item);
  const summaryLower = summary.toLowerCase();
  for (const word of words) {
    if (summaryLower.includes(word)) {
      score += 5;
      if (!matchedFields.includes('summary')) matchedFields.push('summary');
    }
  }

  // Tag matches (high weight) - posts only
  const tags = getTags(item);
  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    for (const word of words) {
      if (tagLower.includes(word)) {
        score += 8;
        if (!matchedFields.includes('tags')) matchedFields.push('tags');
      }
    }
  }

  // Topic matches (medium weight)
  const topics = getTopics(item);
  for (const topic of topics) {
    const topicLower = topic.toLowerCase();
    for (const word of words) {
      if (topicLower.includes(word)) {
        score += 6;
        if (!matchedFields.includes('topics')) matchedFields.push('topics');
      }
    }
  }

  // Content matches (lower weight)
  const content = getContent(item);
  const contentLower = content.toLowerCase();
  for (const word of words) {
    const matches = (contentLower.match(new RegExp(escapeRegex(word), 'g')) || []).length;
    if (matches > 0) {
      score += Math.min(matches, 5);
      if (!matchedFields.includes('content')) matchedFields.push('content');
    }
  }

  return { score, matchedFields };
}

/**
 * Search content with full-text search and filtering
 */
export function searchContent(items: ContentItem[], options: SearchOptions): SearchResult[] {
  const { query = '', topics = [], dateFrom, dateTo, sortBy = 'relevance', contentType = 'all' } = options;

  const results: SearchResult[] = [];

  for (const item of items) {
    // Filter by content type
    if (contentType === 'posts' && !isPost(item)) continue;
    if (contentType === 'digests' && !isDigest(item)) continue;

    // Apply topic filter
    if (topics.length > 0) {
      const itemTopics = getTopics(item);
      const hasMatchingTopic = topics.some(topic => itemTopics.includes(topic));
      if (!hasMatchingTopic) continue;
    }

    // Apply date range filter
    const itemDate = new Date(item.publishedAt);
    if (dateFrom && itemDate < new Date(dateFrom)) continue;
    if (dateTo) {
      // Make dateTo inclusive of the entire day by comparing against end of day
      const dateToEnd = new Date(dateTo);
      dateToEnd.setHours(23, 59, 59, 999);
      if (itemDate > dateToEnd) continue;
    }

    // Calculate search score
    const { score, matchedFields } = calculateScore(item, query);

    // If there's a query, only include items with matches
    if (query.trim() && score === 0) continue;

    // Create highlights
    const highlights: SearchResult['highlights'] = {};
    if (query.trim()) {
      if (matchedFields.includes('title')) {
        highlights.title = createHighlight(item.title, query, 100);
      }
      const summary = getSummary(item);
      const content = getContent(item);
      if (matchedFields.includes('summary') || matchedFields.includes('content')) {
        highlights.summary = createHighlight(
          matchedFields.includes('summary') ? summary : content,
          query,
          200
        );
      }
    }

    results.push({
      item,
      score,
      matchedFields,
      highlights,
    });
  }

  // Sort results
  switch (sortBy) {
    case 'relevance':
      results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime();
      });
      break;
    case 'newest':
      results.sort((a, b) =>
        new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime()
      );
      break;
    case 'oldest':
      results.sort((a, b) =>
        new Date(a.item.publishedAt).getTime() - new Date(b.item.publishedAt).getTime()
      );
      break;
  }

  return results;
}
