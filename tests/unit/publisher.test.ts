import { describe, it, expect } from 'vitest';
import { generateSlug, shouldAutoPublish, createInsightRecord } from '../../src/services/publisher.js';

describe('publisher utilities', () => {
  describe('generateSlug', () => {
    it('should convert title to slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      const slug = generateSlug("What's New in Bitcoin?");
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).not.toContain('?');
    });

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(generateSlug('---Hello---')).toBe('hello');
    });

    it('should limit length to 50 chars', () => {
      const longTitle = 'A'.repeat(100);
      expect(generateSlug(longTitle).length).toBeLessThanOrEqual(50);
    });

    it('should handle unicode characters', () => {
      const slug = generateSlug('Bitcoin in Español');
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug.startsWith('bitcoin-in-espa')).toBe(true);
    });
  });

  describe('shouldAutoPublish', () => {
    const defaultThresholds = {
      autoPublishRelevance: 70,
      autoPublishCredibility: 60,
      requireCitations: true,
      requireSafetyCheck: true,
    };

    it('should approve when all criteria met', () => {
      const result = shouldAutoPublish(85, 75, true, false, defaultThresholds);
      expect(result.autoPublish).toBe(true);
    });

    it('should reject when relevance too low', () => {
      const result = shouldAutoPublish(65, 75, true, false, defaultThresholds);
      expect(result.autoPublish).toBe(false);
      expect(result.reason).toContain('Relevance score');
    });

    it('should reject when credibility too low', () => {
      const result = shouldAutoPublish(85, 55, true, false, defaultThresholds);
      expect(result.autoPublish).toBe(false);
      expect(result.reason).toContain('Credibility score');
    });

    it('should reject when missing citations', () => {
      const result = shouldAutoPublish(85, 75, false, false, defaultThresholds);
      expect(result.autoPublish).toBe(false);
      expect(result.reason).toContain('citations');
    });

    it('should reject when safety concern flagged', () => {
      const result = shouldAutoPublish(85, 75, true, true, defaultThresholds);
      expect(result.autoPublish).toBe(false);
      expect(result.reason).toContain('Safety');
    });

    it('should allow missing citations when not required', () => {
      const thresholds = { ...defaultThresholds, requireCitations: false };
      const result = shouldAutoPublish(85, 75, false, false, thresholds);
      expect(result.autoPublish).toBe(true);
    });

    it('should check criteria in priority order', () => {
      // Safety is checked first
      const result = shouldAutoPublish(50, 50, false, true, defaultThresholds);
      expect(result.reason).toContain('Safety');
    });
  });

  describe('createInsightRecord', () => {
    it('should create insight with required fields', () => {
      const insight = createInsightRecord(
        ['source-1'],
        {
          topics: ['bitcoin', 'privacy'],
          freedomRelevanceScore: 85,
          credibilityScore: 70,
          geo: ['Uganda'],
        },
        {
          title: 'Test Title',
          tldr: 'Test summary',
          summaryBullets: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
          citations: ['https://example.com'],
        }
      );

      expect(insight.id).toBeDefined();
      expect(insight.sourceItemIds).toEqual(['source-1']);
      expect(insight.title).toBe('Test Title');
      expect(insight.topics).toContain('bitcoin');
      expect(insight.status).toBe('draft');
      expect(insight.createdAt).toBeDefined();
    });

    it('should set correct status', () => {
      const published = createInsightRecord(
        ['source-1'],
        { topics: ['bitcoin'], freedomRelevanceScore: 85, credibilityScore: 70 },
        { title: 'Test', tldr: 'Test', summaryBullets: ['1','2','3','4','5'], citations: ['url'] },
        'published'
      );
      expect(published.status).toBe('published');

      const queued = createInsightRecord(
        ['source-1'],
        { topics: ['bitcoin'], freedomRelevanceScore: 85, credibilityScore: 70 },
        { title: 'Test', tldr: 'Test', summaryBullets: ['1','2','3','4','5'], citations: ['url'] },
        'queued'
      );
      expect(queued.status).toBe('queued');
    });

    it('should handle optional deep dive', () => {
      const withDeepDive = createInsightRecord(
        ['source-1'],
        { topics: ['bitcoin'], freedomRelevanceScore: 85, credibilityScore: 70 },
        {
          title: 'Test',
          tldr: 'Test',
          summaryBullets: ['1','2','3','4','5'],
          citations: ['url'],
          deepDiveMarkdown: '## Deep analysis',
        }
      );
      expect(withDeepDive.deepDiveMarkdown).toBe('## Deep analysis');

      const withoutDeepDive = createInsightRecord(
        ['source-1'],
        { topics: ['bitcoin'], freedomRelevanceScore: 85, credibilityScore: 70 },
        { title: 'Test', tldr: 'Test', summaryBullets: ['1','2','3','4','5'], citations: ['url'] }
      );
      expect(withoutDeepDive.deepDiveMarkdown).toBeUndefined();
    });

    it('should generate unique IDs', () => {
      const insight1 = createInsightRecord(
        ['source-1'],
        { topics: ['bitcoin'], freedomRelevanceScore: 85, credibilityScore: 70 },
        { title: 'Test', tldr: 'Test', summaryBullets: ['1','2','3','4','5'], citations: ['url'] }
      );
      const insight2 = createInsightRecord(
        ['source-1'],
        { topics: ['bitcoin'], freedomRelevanceScore: 85, credibilityScore: 70 },
        { title: 'Test', tldr: 'Test', summaryBullets: ['1','2','3','4','5'], citations: ['url'] }
      );
      expect(insight1.id).not.toBe(insight2.id);
    });
  });
});
