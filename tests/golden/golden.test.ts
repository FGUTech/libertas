/**
 * Golden Tests for LLM Output Schema Conformance
 *
 * These tests validate that LLM outputs conform to expected schemas.
 * They don't test actual LLM responses, but rather validate the schema
 * structure of expected outputs.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateClassificationResult, validateSummarizerResult } from '../../src/utils/validation.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadJSON(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function getTestPairs(agentDir: string): Array<{ input: unknown; expected: unknown; name: string }> {
  const dir = join(__dirname, agentDir);
  const files = readdirSync(dir);
  const inputs = files.filter((f) => f.startsWith('input-'));

  return inputs.map((inputFile) => {
    const num = inputFile.match(/input-(\d+)\.json/)?.[1];
    const expectedFile = `expected-${num}.json`;
    return {
      name: `Test case ${num}`,
      input: loadJSON(join(dir, inputFile)),
      expected: loadJSON(join(dir, expectedFile)),
    };
  });
}

describe('Golden Tests', () => {
  describe('Classifier Agent', () => {
    const testCases = getTestPairs('classifier');

    for (const testCase of testCases) {
      it(`${testCase.name}: expected output validates against schema`, () => {
        expect(validateClassificationResult(testCase.expected)).toBe(true);
      });

      it(`${testCase.name}: has required topics field`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(Array.isArray(expected.topics)).toBe(true);
        expect((expected.topics as unknown[]).length).toBeGreaterThan(0);
      });

      it(`${testCase.name}: has valid score ranges`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(expected.freedom_relevance_score).toBeGreaterThanOrEqual(0);
        expect(expected.freedom_relevance_score).toBeLessThanOrEqual(100);
        expect(expected.credibility_score).toBeGreaterThanOrEqual(0);
        expect(expected.credibility_score).toBeLessThanOrEqual(100);
      });

      it(`${testCase.name}: has safety_concern boolean`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(typeof expected.safety_concern).toBe('boolean');
      });

      it(`${testCase.name}: has reasoning explanation`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(typeof expected.reasoning).toBe('string');
        expect((expected.reasoning as string).length).toBeGreaterThan(10);
      });
    }
  });

  describe('Summarizer Agent', () => {
    const testCases = getTestPairs('summarizer');

    for (const testCase of testCases) {
      it(`${testCase.name}: expected output validates against schema`, () => {
        expect(validateSummarizerResult(testCase.expected)).toBe(true);
      });

      it(`${testCase.name}: has title under 120 chars`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(typeof expected.title).toBe('string');
        expect((expected.title as string).length).toBeLessThanOrEqual(120);
      });

      it(`${testCase.name}: has tldr under 280 chars`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(typeof expected.tldr).toBe('string');
        expect((expected.tldr as string).length).toBeLessThanOrEqual(280);
      });

      it(`${testCase.name}: has 5-10 summary bullets`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(Array.isArray(expected.summary_bullets)).toBe(true);
        expect((expected.summary_bullets as unknown[]).length).toBeGreaterThanOrEqual(5);
        expect((expected.summary_bullets as unknown[]).length).toBeLessThanOrEqual(10);
      });

      it(`${testCase.name}: has at least one citation`, () => {
        const expected = testCase.expected as Record<string, unknown>;
        expect(Array.isArray(expected.citations)).toBe(true);
        expect((expected.citations as unknown[]).length).toBeGreaterThanOrEqual(1);
      });
    }
  });
});
