/**
 * Content Fetcher Service
 *
 * Responsible for fetching content from various source types (RSS, web pages).
 * All fetched content is treated as untrusted.
 */

import Parser from 'rss-parser';
import { load as cheerioLoad } from 'cheerio';
import type { Platform } from '../types/index.js';

export interface FetchedItem {
  url: string;
  title?: string;
  content: string;
  author?: string;
  publishedAt?: string;
  platform: Platform;
  rawHtml?: string;
}

export interface FetchResult {
  success: boolean;
  items: FetchedItem[];
  error?: string;
}

const parser = new Parser({
  timeout: 30000,
  headers: {
    'User-Agent': 'FGU-Signal-Engine/1.0 (https://fgu.tech)',
  },
});

/**
 * Fetch content from an RSS/Atom feed
 */
export async function fetchRSS(url: string): Promise<FetchResult> {
  try {
    const feed = await parser.parseURL(url);
    const items: FetchedItem[] = (feed.items || []).map((item) => ({
      url: item.link || url,
      title: item.title,
      content: extractTextFromHtml(item.content || item.contentSnippet || item.summary || ''),
      author: item.creator || item.author,
      publishedAt: item.isoDate || item.pubDate,
      platform: 'rss' as Platform,
      rawHtml: item.content,
    }));

    return { success: true, items };
  } catch (error) {
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown RSS fetch error',
    };
  }
}

/**
 * Fetch content from a web page
 */
export async function fetchWebPage(url: string): Promise<FetchResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FGU-Signal-Engine/1.0 (https://fgu.tech)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        success: false,
        items: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const content = extractTextFromHtml(html);
    const title = extractTitle(html);

    const item: FetchedItem = {
      url,
      title,
      content,
      platform: 'web' as Platform,
      rawHtml: html,
    };

    return { success: true, items: [item] };
  } catch (error) {
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown web fetch error',
    };
  }
}

/**
 * Extract readable text from HTML content
 */
export function extractTextFromHtml(html: string): string {
  if (!html) return '';

  try {
    const $ = cheerioLoad(html);

    // Remove script and style elements
    $('script, style, nav, header, footer, aside, .advertisement, .ad, .sidebar').remove();

    // Try to find main content areas
    let content =
      $('article').text() ||
      $('main').text() ||
      $('.content').text() ||
      $('.post-content').text() ||
      $('body').text();

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return content;
  } catch {
    // Fallback: strip HTML tags with regex
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Extract title from HTML
 */
export function extractTitle(html: string): string | undefined {
  try {
    const $ = cheerioLoad(html);
    return (
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content')?.trim()
    );
  } catch {
    return undefined;
  }
}

/**
 * Fetch content based on source type
 */
export async function fetchSource(
  url: string,
  type: 'rss' | 'web' | 'x_account' | 'nostr' | 'github'
): Promise<FetchResult> {
  switch (type) {
    case 'rss':
      return fetchRSS(url);
    case 'web':
      return fetchWebPage(url);
    case 'x_account':
      // X/Twitter requires API access - return placeholder for now
      return {
        success: false,
        items: [],
        error: 'X/Twitter integration requires API credentials',
      };
    case 'nostr':
      // Nostr integration not yet implemented
      return {
        success: false,
        items: [],
        error: 'Nostr integration not yet implemented',
      };
    case 'github':
      // GitHub integration not yet implemented
      return {
        success: false,
        items: [],
        error: 'GitHub integration not yet implemented',
      };
    default:
      return {
        success: false,
        items: [],
        error: `Unknown source type: ${type}`,
      };
  }
}
