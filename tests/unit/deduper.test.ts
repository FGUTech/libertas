import { describe, it, expect } from 'vitest';
import { hashContent, checkExactDuplicate, checkDuplicate } from '../../src/services/deduper.js';

describe('deduper utilities', () => {
  describe('hashContent', () => {
    it('should generate consistent hash for same content', () => {
      const content = 'Test content for hashing';
      const hash1 = hashContent(content);
      const hash2 = hashContent(content);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', () => {
      const hash1 = hashContent('Content A');
      const hash2 = hashContent('Content B');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64-char hex string', () => {
      const hash = hashContent('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should normalize content before hashing', () => {
      const hash1 = hashContent('Hello, World!');
      const hash2 = hashContent('hello world');
      expect(hash1).toBe(hash2);
    });
  });

  describe('checkExactDuplicate', () => {
    it('should detect existing hash', () => {
      const existingHashes = new Set(['hash1', 'hash2', 'hash3']);
      const result = checkExactDuplicate('hash2', existingHashes);
      expect(result.isDuplicate).toBe(true);
      expect(result.existingHash).toBe('hash2');
    });

    it('should not flag new hash', () => {
      const existingHashes = new Set(['hash1', 'hash2']);
      const result = checkExactDuplicate('hash3', existingHashes);
      expect(result.isDuplicate).toBe(false);
    });

    it('should handle empty set', () => {
      const existingHashes = new Set<string>();
      const result = checkExactDuplicate('hash1', existingHashes);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('checkDuplicate', () => {
    it('should detect duplicate by content', async () => {
      const existingHashes = new Set([hashContent('Test content')]);
      const result = await checkDuplicate('Test content', existingHashes, false);
      expect(result.isDuplicate).toBe(true);
    });

    it('should not flag unique content', async () => {
      const existingHashes = new Set([hashContent('Old content')]);
      const result = await checkDuplicate('New content', existingHashes, false);
      expect(result.isDuplicate).toBe(false);
    });

    it('should include content hash in result', async () => {
      const existingHashes = new Set<string>();
      const result = await checkDuplicate('Test', existingHashes, false);
      expect(result.contentHash).toBeDefined();
      expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle semantic matching disabled', async () => {
      const existingHashes = new Set<string>();
      const result = await checkDuplicate('Content', existingHashes, false);
      expect(result.isDuplicate).toBe(false);
      expect(result.similarityScore).toBeUndefined();
    });
  });
});
