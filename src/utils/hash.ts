/**
 * Hashing utilities for content deduplication
 */

import { createHash } from 'crypto';

/**
 * Generate SHA-256 hash of content
 */
export function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Normalize text before hashing to improve deduplication
 * - Lowercase
 * - Remove extra whitespace
 * - Remove common variations
 */
export function normalizeForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Generate content hash for deduplication
 */
export function generateContentHash(text: string): string {
  const normalized = normalizeForHash(text);
  return sha256(normalized);
}
