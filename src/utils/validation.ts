/**
 * Validation utilities for LLM outputs and data models
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ClassificationResult, SummarizerResult } from '../types/index.js';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Load and compile a JSON schema
 */
export function loadSchema(schemaPath: string): ReturnType<typeof ajv.compile> {
  // Dynamic import would be used here in actual implementation
  // For now, we'll use inline validation
  throw new Error(`Schema loading not yet implemented for: ${schemaPath}`);
}

/**
 * Validate classification result from LLM
 */
export function validateClassificationResult(data: unknown): data is ClassificationResult {
  if (!data || typeof data !== 'object') return false;
  const result = data as Record<string, unknown>;

  // Check required fields
  if (!Array.isArray(result.topics) || result.topics.length === 0) return false;
  if (typeof result.freedom_relevance_score !== 'number') return false;
  if (typeof result.credibility_score !== 'number') return false;
  if (!Array.isArray(result.geo)) return false;
  if (typeof result.safety_concern !== 'boolean') return false;
  if (typeof result.reasoning !== 'string') return false;

  // Validate score ranges
  if (result.freedom_relevance_score < 0 || result.freedom_relevance_score > 100) return false;
  if (result.credibility_score < 0 || result.credibility_score > 100) return false;

  // Validate topics
  const validTopics = [
    'bitcoin',
    'zk',
    'censorship-resistance',
    'comms',
    'payments',
    'identity',
    'privacy',
    'surveillance',
    'activism',
    'sovereignty',
  ];
  for (const topic of result.topics) {
    if (!validTopics.includes(topic as string)) return false;
  }

  return true;
}

/**
 * Validate summarizer result from LLM
 */
export function validateSummarizerResult(data: unknown): data is SummarizerResult {
  if (!data || typeof data !== 'object') return false;
  const result = data as Record<string, unknown>;

  // Check required fields
  if (typeof result.title !== 'string' || result.title.length === 0) return false;
  if (typeof result.tldr !== 'string' || result.tldr.length === 0) return false;
  if (!Array.isArray(result.summary_bullets) || result.summary_bullets.length < 5) return false;
  if (!Array.isArray(result.citations) || result.citations.length === 0) return false;

  // Validate max lengths
  if (result.title.length > 120) return false;
  if (result.tldr.length > 280) return false;
  if (result.summary_bullets.length > 10) return false;

  return true;
}

/**
 * Check for sensitive patterns that should trigger review
 */
const sensitivePatterns = [
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // IP addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /coordinates?:?\s*[-\d.]+,\s*[-\d.]+/i, // GPS coordinates
  /\b(passport|ID|license)\s*(number|#|no\.?)?\s*[:=]?\s*\w+/i, // ID numbers
  /safe\s*house|hideout|location\s*of\s*(activist|dissident)/i, // Operational
];

export function containsSensitivePatterns(text: string): boolean {
  return sensitivePatterns.some((pattern) => pattern.test(text));
}

/**
 * Validate that content is grounded in source material
 */
export function checkSourceGrounding(output: Record<string, unknown>, sourceText: string): boolean {
  // Extract key claims from output
  const outputText = JSON.stringify(output).toLowerCase();
  const sourceLower = sourceText.toLowerCase();

  // Simple heuristic: check if key entities mentioned in output appear in source
  // This is a basic implementation - more sophisticated NLP could be used
  const words = outputText.match(/\b\w{4,}\b/g) || [];
  const uniqueWords = [...new Set(words)];

  // At least 30% of multi-character words should appear in source
  const matchingWords = uniqueWords.filter((word) => sourceLower.includes(word));
  const matchRatio = matchingWords.length / uniqueWords.length;

  return matchRatio >= 0.3;
}

/**
 * Full validation pipeline for LLM output before publishing
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateForPublishing(
  output: unknown,
  sourceText: string,
  requireCitations: boolean = true
): ValidationResult {
  const errors: string[] = [];

  if (!output || typeof output !== 'object') {
    errors.push('Output is not a valid object');
    return { valid: false, errors };
  }

  const data = output as Record<string, unknown>;

  // Check citations
  if (requireCitations) {
    if (!Array.isArray(data.citations) || data.citations.length === 0) {
      errors.push('Missing citations');
    }
  }

  // Check safety
  const outputText = JSON.stringify(data);
  if (containsSensitivePatterns(outputText)) {
    errors.push('Contains sensitive patterns that require review');
  }

  // Check grounding
  if (!checkSourceGrounding(data, sourceText)) {
    errors.push('Output may not be grounded in source material');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
