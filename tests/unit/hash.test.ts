import { describe, it, expect } from 'vitest';
import { sha256, normalizeForHash, generateContentHash } from '../../src/utils/hash.js';

describe('hash utilities', () => {
  describe('sha256', () => {
    it('should generate consistent hash for same input', () => {
      const input = 'Hello, World!';
      const hash1 = sha256(input);
      const hash2 = sha256(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = sha256('Hello');
      const hash2 = sha256('World');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64 character hex string', () => {
      const hash = sha256('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should match known SHA-256 value', () => {
      // SHA-256 of empty string
      const hash = sha256('');
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
  });

  describe('normalizeForHash', () => {
    it('should lowercase text', () => {
      expect(normalizeForHash('Hello World')).toBe('hello world');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeForHash('hello    world')).toBe('hello world');
    });

    it('should remove punctuation', () => {
      expect(normalizeForHash('hello, world!')).toBe('hello world');
    });

    it('should trim whitespace', () => {
      expect(normalizeForHash('  hello world  ')).toBe('hello world');
    });

    it('should handle newlines and tabs', () => {
      expect(normalizeForHash('hello\n\tworld')).toBe('hello world');
    });
  });

  describe('generateContentHash', () => {
    it('should generate same hash for semantically equivalent content', () => {
      const hash1 = generateContentHash('Hello, World!');
      const hash2 = generateContentHash('hello world');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', () => {
      const hash1 = generateContentHash('Hello World');
      const hash2 = generateContentHash('Goodbye World');
      expect(hash1).not.toBe(hash2);
    });

    it('should be case insensitive', () => {
      const hash1 = generateContentHash('HELLO');
      const hash2 = generateContentHash('hello');
      expect(hash1).toBe(hash2);
    });
  });
});
