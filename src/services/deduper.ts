/**
 * Deduplication Service
 *
 * Handles both exact hash-based deduplication and (optionally) semantic deduplication.
 */

import { generateContentHash } from '../utils/hash.js';

export interface DedupeResult {
  isDuplicate: boolean;
  existingHash?: string;
  similarityScore?: number;
}

/**
 * Check if content already exists by exact hash match
 *
 * In production, this would query the database.
 * For now, we provide the interface and hash generation.
 */
export function checkExactDuplicate(
  contentHash: string,
  existingHashes: Set<string>
): DedupeResult {
  if (existingHashes.has(contentHash)) {
    return {
      isDuplicate: true,
      existingHash: contentHash,
    };
  }
  return { isDuplicate: false };
}

/**
 * Generate hash for content deduplication
 */
export function hashContent(text: string): string {
  return generateContentHash(text);
}

/**
 * Check for semantic duplicates using embeddings
 *
 * This is a placeholder - actual implementation would:
 * 1. Generate embedding for the content
 * 2. Query vector store for similar embeddings
 * 3. Return similarity score above threshold
 */
export async function checkSemanticDuplicate(
  _text: string,
  _threshold: number = 0.85
): Promise<DedupeResult> {
  // Semantic deduplication is optional and requires vector store
  // Return not-duplicate for now
  return { isDuplicate: false };
}

/**
 * Full deduplication check (exact + semantic)
 */
export async function checkDuplicate(
  text: string,
  existingHashes: Set<string>,
  semanticEnabled: boolean = false,
  semanticThreshold: number = 0.85
): Promise<DedupeResult & { contentHash: string }> {
  const contentHash = hashContent(text);

  // Check exact match first (fast)
  const exactResult = checkExactDuplicate(contentHash, existingHashes);
  if (exactResult.isDuplicate) {
    return { ...exactResult, contentHash };
  }

  // Check semantic similarity if enabled (slower)
  if (semanticEnabled) {
    const semanticResult = await checkSemanticDuplicate(text, semanticThreshold);
    if (semanticResult.isDuplicate) {
      return { ...semanticResult, contentHash };
    }
  }

  return { isDuplicate: false, contentHash };
}

/**
 * Batch deduplication for multiple items
 */
export async function batchDedupe(
  items: Array<{ id: string; text: string }>,
  existingHashes: Set<string>,
  semanticEnabled: boolean = false
): Promise<Map<string, DedupeResult & { contentHash: string }>> {
  const results = new Map<string, DedupeResult & { contentHash: string }>();

  for (const item of items) {
    const result = await checkDuplicate(item.text, existingHashes, semanticEnabled);
    results.set(item.id, result);
  }

  return results;
}
