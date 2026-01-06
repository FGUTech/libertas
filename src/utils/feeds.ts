/**
 * Feed generation utilities for RSS and JSON Feed
 */

import { Feed } from 'feed';
import type { Insight, JSONFeed, FeedItem } from '../types/index.js';

const SITE_URL = process.env.SITE_BASE_URL || 'https://libertas.fgu.tech';
const FEED_TITLE = 'Libertas Signals';
const FEED_DESCRIPTION = 'Freedom Tech signals and insights';

/**
 * Generate RSS 2.0 feed from insights
 */
export function generateRSSFeed(insights: Insight[]): string {
  const feed = new Feed({
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Libertas`,
    feedLinks: {
      rss2: `${SITE_URL}/rss.xml`,
      json: `${SITE_URL}/feed.json`,
    },
  });

  for (const insight of insights) {
    if (insight.status !== 'published') continue;

    feed.addItem({
      title: insight.title,
      id: insight.publishedUrl || `${SITE_URL}/signals/${insight.id}`,
      link: insight.publishedUrl || `${SITE_URL}/signals/${insight.id}`,
      description: insight.tldr,
      content: insight.summaryBullets.map((b) => `• ${b}`).join('\n'),
      date: new Date(insight.publishedAt || insight.createdAt),
      category: insight.topics.map((t) => ({ name: t })),
    });
  }

  return feed.rss2();
}

/**
 * Generate JSON Feed 1.1 from insights
 */
export function generateJSONFeed(insights: Insight[]): JSONFeed {
  const items: FeedItem[] = insights
    .filter((i) => i.status === 'published')
    .map((insight) => ({
      id: insight.id,
      url: insight.publishedUrl || `${SITE_URL}/signals/${insight.id}`,
      title: insight.title,
      summary: insight.tldr,
      content_text: [insight.tldr, '', ...insight.summaryBullets.map((b) => `• ${b}`)].join('\n'),
      date_published: insight.publishedAt || insight.createdAt,
      tags: insight.topics,
      _libertas: {
        freedom_relevance_score: insight.freedomRelevanceScore,
        credibility_score: insight.credibilityScore,
        citations: insight.citations,
        geo: insight.geo,
      },
    }));

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: FEED_TITLE,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: FEED_DESCRIPTION,
    items,
  };
}

/**
 * Generate markdown file content for an insight
 */
export function generateInsightMarkdown(insight: Insight): string {
  const frontmatter = {
    id: insight.id,
    type: 'signal',
    published_at: insight.publishedAt || new Date().toISOString(),
    topics: insight.topics,
    geo: insight.geo || [],
    freedom_relevance_score: insight.freedomRelevanceScore,
    credibility_score: insight.credibilityScore,
    citations: insight.citations,
    tldr: insight.tldr,
  };

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map((v) => `  - "${v}"`).join('\n')}`;
      }
      return `${key}: "${value}"`;
    })
    .join('\n');

  const bullets = insight.summaryBullets.map((b) => `- ${b}`).join('\n');

  let content = `---
${yaml}
---

# ${insight.title}

## TL;DR

${insight.tldr}

## Key Points

${bullets}
`;

  if (insight.deepDiveMarkdown) {
    content += `
## Deep Dive

${insight.deepDiveMarkdown}
`;
  }

  content += `
## Sources

${insight.citations.map((c) => `- ${c}`).join('\n')}
`;

  return content;
}

/**
 * Generate markdown file content for a weekly digest
 */
export function generateDigestMarkdown(
  digest: {
    executiveTldr: string;
    sections: Array<{ title: string; content_markdown: string }>;
    emergingPatterns?: Array<{ pattern: string }>;
    lookingAhead?: string[];
    insightCount: number;
    topTopics?: string[];
  },
  periodStart: string,
  periodEnd: string
): string {
  const frontmatter = `---
id: "digest-${periodEnd}"
type: "weekly-digest"
published_at: "${new Date().toISOString()}"
period_start: "${periodStart}"
period_end: "${periodEnd}"
insight_count: ${digest.insightCount}
---`;

  let content = `${frontmatter}

# Weekly Freedom Tech Digest

## TL;DR

${digest.executiveTldr}

## Top Signals
`;

  for (const section of digest.sections) {
    content += `
### ${section.title}

${section.content_markdown}
`;
  }

  if (digest.emergingPatterns && digest.emergingPatterns.length > 0) {
    content += `
## Emerging Patterns

${digest.emergingPatterns.map((p) => `- ${p.pattern}`).join('\n')}
`;
  }

  if (digest.lookingAhead && digest.lookingAhead.length > 0) {
    content += `
## Looking Ahead

${digest.lookingAhead.map((l) => `- ${l}`).join('\n')}
`;
  }

  return content;
}
