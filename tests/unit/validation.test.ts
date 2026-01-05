import { describe, it, expect } from 'vitest';
import {
  validateClassificationResult,
  validateSummarizerResult,
  containsSensitivePatterns,
  checkSourceGrounding,
  validateForPublishing,
} from '../../src/utils/validation.js';

describe('validation utilities', () => {
  describe('validateClassificationResult', () => {
    it('should validate correct classification result', () => {
      const result = {
        topics: ['bitcoin', 'censorship-resistance'],
        freedom_relevance_score: 85,
        credibility_score: 70,
        geo: ['Uganda'],
        safety_concern: false,
        reasoning: 'Test reasoning',
        should_summarize: true,
      };
      expect(validateClassificationResult(result)).toBe(true);
    });

    it('should reject missing topics', () => {
      const result = {
        freedom_relevance_score: 85,
        credibility_score: 70,
        geo: [],
        safety_concern: false,
        reasoning: 'Test',
      };
      expect(validateClassificationResult(result)).toBe(false);
    });

    it('should reject empty topics array', () => {
      const result = {
        topics: [],
        freedom_relevance_score: 85,
        credibility_score: 70,
        geo: [],
        safety_concern: false,
        reasoning: 'Test',
      };
      expect(validateClassificationResult(result)).toBe(false);
    });

    it('should reject invalid topic values', () => {
      const result = {
        topics: ['invalid-topic'],
        freedom_relevance_score: 85,
        credibility_score: 70,
        geo: [],
        safety_concern: false,
        reasoning: 'Test',
      };
      expect(validateClassificationResult(result)).toBe(false);
    });

    it('should reject scores out of range', () => {
      const result = {
        topics: ['bitcoin'],
        freedom_relevance_score: 150,
        credibility_score: 70,
        geo: [],
        safety_concern: false,
        reasoning: 'Test',
      };
      expect(validateClassificationResult(result)).toBe(false);
    });

    it('should reject negative scores', () => {
      const result = {
        topics: ['bitcoin'],
        freedom_relevance_score: -10,
        credibility_score: 70,
        geo: [],
        safety_concern: false,
        reasoning: 'Test',
      };
      expect(validateClassificationResult(result)).toBe(false);
    });

    it('should reject null input', () => {
      expect(validateClassificationResult(null)).toBe(false);
    });

    it('should reject non-object input', () => {
      expect(validateClassificationResult('string')).toBe(false);
    });
  });

  describe('validateSummarizerResult', () => {
    it('should validate correct summarizer result', () => {
      const result = {
        title: 'Test Title',
        tldr: 'Test summary in one or two sentences.',
        summary_bullets: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
        citations: ['https://example.com'],
      };
      expect(validateSummarizerResult(result)).toBe(true);
    });

    it('should reject missing title', () => {
      const result = {
        tldr: 'Test summary',
        summary_bullets: ['1', '2', '3', '4', '5'],
        citations: ['https://example.com'],
      };
      expect(validateSummarizerResult(result)).toBe(false);
    });

    it('should reject too few bullets', () => {
      const result = {
        title: 'Test',
        tldr: 'Test summary',
        summary_bullets: ['1', '2'],
        citations: ['https://example.com'],
      };
      expect(validateSummarizerResult(result)).toBe(false);
    });

    it('should reject too many bullets', () => {
      const result = {
        title: 'Test',
        tldr: 'Test summary',
        summary_bullets: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        citations: ['https://example.com'],
      };
      expect(validateSummarizerResult(result)).toBe(false);
    });

    it('should reject empty citations', () => {
      const result = {
        title: 'Test',
        tldr: 'Test summary',
        summary_bullets: ['1', '2', '3', '4', '5'],
        citations: [],
      };
      expect(validateSummarizerResult(result)).toBe(false);
    });

    it('should reject title over 120 chars', () => {
      const result = {
        title: 'a'.repeat(121),
        tldr: 'Test summary',
        summary_bullets: ['1', '2', '3', '4', '5'],
        citations: ['https://example.com'],
      };
      expect(validateSummarizerResult(result)).toBe(false);
    });

    it('should reject tldr over 280 chars', () => {
      const result = {
        title: 'Test',
        tldr: 'a'.repeat(281),
        summary_bullets: ['1', '2', '3', '4', '5'],
        citations: ['https://example.com'],
      };
      expect(validateSummarizerResult(result)).toBe(false);
    });
  });

  describe('containsSensitivePatterns', () => {
    it('should detect IP addresses', () => {
      expect(containsSensitivePatterns('The server is at 192.168.1.1')).toBe(true);
    });

    it('should detect email addresses', () => {
      expect(containsSensitivePatterns('Contact user@example.com')).toBe(true);
    });

    it('should detect GPS coordinates', () => {
      expect(containsSensitivePatterns('Coordinates: 40.7128, -74.0060')).toBe(true);
    });

    it('should detect ID numbers', () => {
      expect(containsSensitivePatterns('Passport number: AB123456')).toBe(true);
    });

    it('should detect operational terms', () => {
      expect(containsSensitivePatterns('The safe house location')).toBe(true);
    });

    it('should not flag normal text', () => {
      expect(containsSensitivePatterns('Bitcoin adoption is growing in Uganda')).toBe(false);
    });
  });

  describe('checkSourceGrounding', () => {
    it('should pass when output matches source', () => {
      const output = { text: 'Bitcoin adoption in Uganda is growing rapidly' };
      const source = 'Bitcoin adoption in Uganda has been growing rapidly over the past year.';
      expect(checkSourceGrounding(output, source)).toBe(true);
    });

    it('should fail when output has no connection to source', () => {
      const output = { text: 'Completely unrelated content about space exploration' };
      const source = 'Bitcoin adoption in Uganda has been growing.';
      expect(checkSourceGrounding(output, source)).toBe(false);
    });
  });

  describe('validateForPublishing', () => {
    it('should pass valid output', () => {
      const output = {
        title: 'Test',
        citations: ['https://example.com'],
        content: 'Bitcoin adoption in Uganda',
      };
      const source = 'Bitcoin adoption in Uganda is growing.';
      const result = validateForPublishing(output, source);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when missing citations', () => {
      const output = { title: 'Test', content: 'Bitcoin adoption' };
      const source = 'Bitcoin adoption in Uganda';
      const result = validateForPublishing(output, source, true);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing citations');
    });

    it('should fail when containing sensitive patterns', () => {
      const output = {
        title: 'Test',
        citations: ['https://example.com'],
        content: 'Contact user@example.com for more info',
      };
      const source = 'Contact user@example.com for more information about Bitcoin.';
      const result = validateForPublishing(output, source);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('sensitive'))).toBe(true);
    });

    it('should fail on null input', () => {
      const result = validateForPublishing(null, 'source');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Output is not a valid object');
    });
  });
});
