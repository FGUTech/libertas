import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadSources, loadThresholds, clearConfigCache } from '../../src/services/config.js';

describe('config utilities', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  afterEach(() => {
    clearConfigCache();
  });

  describe('loadSources', () => {
    it('should load sources from config file', () => {
      const sources = loadSources();
      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
    });

    it('should only include enabled sources', () => {
      const sources = loadSources();
      for (const source of sources) {
        expect(source.enabled).not.toBe(false);
      }
    });

    it('should have required fields for each source', () => {
      const sources = loadSources();
      for (const source of sources) {
        expect(source.name).toBeDefined();
        expect(source.url).toBeDefined();
        expect(source.type).toBeDefined();
        expect(source.tier).toBeDefined();
      }
    });

    it('should cache results', () => {
      const sources1 = loadSources();
      const sources2 = loadSources();
      expect(sources1).toBe(sources2); // Same reference
    });

    it('should reload when forced', () => {
      const sources1 = loadSources();
      const sources2 = loadSources(true);
      expect(sources1).not.toBe(sources2); // Different reference
      expect(sources1).toEqual(sources2); // Same content
    });
  });

  describe('loadThresholds', () => {
    it('should load thresholds from config file', () => {
      const thresholds = loadThresholds();
      expect(thresholds).toBeDefined();
    });

    it('should have ingestion section', () => {
      const thresholds = loadThresholds();
      expect(thresholds.ingestion).toBeDefined();
      expect(thresholds.ingestion.relevance_threshold).toBeGreaterThan(0);
      expect(thresholds.ingestion.max_items_per_run).toBeGreaterThan(0);
    });

    it('should have publishing section', () => {
      const thresholds = loadThresholds();
      expect(thresholds.publishing).toBeDefined();
      expect(thresholds.publishing.auto_publish_relevance).toBeGreaterThan(0);
      expect(thresholds.publishing.auto_publish_credibility).toBeGreaterThan(0);
    });

    it('should have review section', () => {
      const thresholds = loadThresholds();
      expect(thresholds.review).toBeDefined();
    });

    it('should have deduplication section', () => {
      const thresholds = loadThresholds();
      expect(thresholds.deduplication).toBeDefined();
      expect(typeof thresholds.deduplication.exact_match).toBe('boolean');
    });

    it('should have ideas section', () => {
      const thresholds = loadThresholds();
      expect(thresholds.ideas).toBeDefined();
      expect(thresholds.ideas.min_relevance_for_idea).toBeGreaterThan(0);
    });

    it('should have vibe_coding section', () => {
      const thresholds = loadThresholds();
      expect(thresholds.vibe_coding).toBeDefined();
      expect(thresholds.vibe_coding.requires_human_approval).toBe(true);
    });

    it('should cache results', () => {
      const thresholds1 = loadThresholds();
      const thresholds2 = loadThresholds();
      expect(thresholds1).toBe(thresholds2);
    });
  });
});
