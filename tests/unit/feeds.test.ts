import { describe, it, expect } from 'vitest';
import {
  generateRSSFeed,
  generateJSONFeed,
  generateInsightMarkdown,
  generateDigestMarkdown,
} from '../../src/utils/feeds.js';
import type { Insight } from '../../src/types/index.js';

const mockInsight: Insight = {
  id: 'test-insight-001',
  sourceItemIds: ['source-001'],
  title: 'Uganda Govt Warns Against Mesh Network App',
  tldr: "Uganda's telecom regulator is warning citizens against Bitchat, a mesh networking app enabling offline Bitcoin payments.",
  summaryBullets: [
    'Uganda Communications Commission issued warning against Bitchat app',
    'Bitchat enables offline Bitcoin payments via mesh networking',
    'App provides encrypted messaging without internet connectivity',
    'Activists reportedly used it to coordinate protests during shutdowns',
    'Government response suggests tool is effective at circumventing controls',
  ],
  deepDiveMarkdown:
    '## Context\n\nUganda has a history of internet shutdowns during politically sensitive periods.',
  topics: ['comms', 'bitcoin', 'censorship-resistance'],
  geo: ['Uganda'],
  freedomRelevanceScore: 92,
  credibilityScore: 75,
  citations: ['https://nilepost.co.ug/news/312962/dont-be-excited-by-bitchat-ucc-boss-warns-ugandans'],
  status: 'published',
  publishedUrl: 'https://fgu.tech/signals/test-insight-001',
  publishedAt: '2026-01-05T00:00:00Z',
  createdAt: '2026-01-05T00:00:00Z',
  updatedAt: '2026-01-05T00:00:00Z',
};

describe('feed utilities', () => {
  describe('generateRSSFeed', () => {
    it('should generate valid RSS 2.0 XML', () => {
      const rss = generateRSSFeed([mockInsight]);
      expect(rss).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(rss).toContain('<rss version="2.0"');
      expect(rss).toContain('<channel>');
      expect(rss).toContain('<item>');
    });

    it('should include insight title and description', () => {
      const rss = generateRSSFeed([mockInsight]);
      expect(rss).toContain(mockInsight.title);
      expect(rss).toContain(mockInsight.tldr);
    });

    it('should only include published insights', () => {
      const draftInsight = { ...mockInsight, status: 'draft' as const };
      const rss = generateRSSFeed([draftInsight]);
      expect(rss).not.toContain(mockInsight.title);
    });

    it('should handle empty array', () => {
      const rss = generateRSSFeed([]);
      expect(rss).toContain('<channel>');
      expect(rss).not.toContain('<item>');
    });
  });

  describe('generateJSONFeed', () => {
    it('should generate valid JSON Feed structure', () => {
      const feed = generateJSONFeed([mockInsight]);
      expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
      expect(feed.title).toBe('FGU.tech Signals');
      expect(feed.items).toHaveLength(1);
    });

    it('should include FGU-specific metadata', () => {
      const feed = generateJSONFeed([mockInsight]);
      const item = feed.items[0];
      expect(item?._fgu).toBeDefined();
      expect(item?._fgu.freedom_relevance_score).toBe(92);
      expect(item?._fgu.credibility_score).toBe(75);
      expect(item?._fgu.citations).toHaveLength(1);
    });

    it('should only include published insights', () => {
      const draftInsight = { ...mockInsight, status: 'draft' as const };
      const feed = generateJSONFeed([draftInsight]);
      expect(feed.items).toHaveLength(0);
    });

    it('should include tags', () => {
      const feed = generateJSONFeed([mockInsight]);
      const item = feed.items[0];
      expect(item?.tags).toContain('comms');
      expect(item?.tags).toContain('bitcoin');
    });
  });

  describe('generateInsightMarkdown', () => {
    it('should generate markdown with frontmatter', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain('---');
      expect(md).toContain('id: "test-insight-001"');
      expect(md).toContain('type: "signal"');
    });

    it('should include title as heading', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain(`# ${mockInsight.title}`);
    });

    it('should include TL;DR section', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain('## TL;DR');
      expect(md).toContain(mockInsight.tldr);
    });

    it('should include bullet points', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain('## Key Points');
      for (const bullet of mockInsight.summaryBullets) {
        expect(md).toContain(`- ${bullet}`);
      }
    });

    it('should include deep dive when present', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain('## Deep Dive');
      expect(md).toContain('Uganda has a history');
    });

    it('should include sources section', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain('## Sources');
      expect(md).toContain(mockInsight.citations[0]);
    });

    it('should include scores in frontmatter', () => {
      const md = generateInsightMarkdown(mockInsight);
      expect(md).toContain('freedom_relevance_score: "92"');
      expect(md).toContain('credibility_score: "75"');
    });
  });

  describe('generateDigestMarkdown', () => {
    const mockDigest = {
      executiveTldr: 'This week saw significant developments in censorship-resistant communications.',
      sections: [
        {
          title: 'Censorship Resistance',
          content_markdown: '- [Uganda story](link) — Government warning validates mesh networking',
        },
      ],
      emergingPatterns: [{ pattern: 'Government responses validate freedom tech effectiveness' }],
      lookingAhead: ['Monitor mesh networking adoption in other regions'],
      insightCount: 5,
      topTopics: ['censorship-resistance', 'bitcoin'],
    };

    it('should generate markdown with frontmatter', () => {
      const md = generateDigestMarkdown(mockDigest, '2025-12-29', '2026-01-04');
      expect(md).toContain('---');
      expect(md).toContain('type: "weekly-digest"');
      expect(md).toContain('period_start: "2025-12-29"');
      expect(md).toContain('period_end: "2026-01-04"');
    });

    it('should include executive summary', () => {
      const md = generateDigestMarkdown(mockDigest, '2025-12-29', '2026-01-04');
      expect(md).toContain('## TL;DR');
      expect(md).toContain(mockDigest.executiveTldr);
    });

    it('should include sections', () => {
      const md = generateDigestMarkdown(mockDigest, '2025-12-29', '2026-01-04');
      expect(md).toContain('### Censorship Resistance');
      expect(md).toContain('Government warning validates mesh networking');
    });

    it('should include emerging patterns', () => {
      const md = generateDigestMarkdown(mockDigest, '2025-12-29', '2026-01-04');
      expect(md).toContain('## Emerging Patterns');
      expect(md).toContain('Government responses validate freedom tech effectiveness');
    });

    it('should include looking ahead section', () => {
      const md = generateDigestMarkdown(mockDigest, '2025-12-29', '2026-01-04');
      expect(md).toContain('## Looking Ahead');
      expect(md).toContain('Monitor mesh networking adoption');
    });
  });
});
