/**
 * Configuration Service
 *
 * Loads and validates configuration from YAML files.
 * Configuration can be changed without code deployment.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import type { SourceConfig, ThresholdsConfig } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(__dirname, '..', '..', 'config');

let sourcesCache: SourceConfig[] | null = null;
let thresholdsCache: ThresholdsConfig | null = null;

/**
 * Load sources configuration
 */
export function loadSources(forceReload: boolean = false): SourceConfig[] {
  if (sourcesCache && !forceReload) {
    return sourcesCache;
  }

  const sourcesPath = join(CONFIG_DIR, 'sources.yml');
  if (!existsSync(sourcesPath)) {
    throw new Error(`Sources config not found: ${sourcesPath}`);
  }

  const content = readFileSync(sourcesPath, 'utf-8');
  const parsed = parseYaml(content) as { sources: SourceConfig[] };

  if (!parsed.sources || !Array.isArray(parsed.sources)) {
    throw new Error('Invalid sources.yml: missing sources array');
  }

  // Validate and filter enabled sources
  sourcesCache = parsed.sources.filter((source) => {
    if (!source.name || !source.url || !source.type) {
      console.warn(`Skipping invalid source: ${JSON.stringify(source)}`);
      return false;
    }
    return source.enabled !== false;
  });

  return sourcesCache;
}

/**
 * Load thresholds configuration
 */
export function loadThresholds(forceReload: boolean = false): ThresholdsConfig {
  if (thresholdsCache && !forceReload) {
    return thresholdsCache;
  }

  const thresholdsPath = join(CONFIG_DIR, 'thresholds.yml');
  if (!existsSync(thresholdsPath)) {
    throw new Error(`Thresholds config not found: ${thresholdsPath}`);
  }

  const content = readFileSync(thresholdsPath, 'utf-8');
  const parsed = parseYaml(content) as ThresholdsConfig;

  // Validate required sections
  if (!parsed.ingestion || !parsed.publishing || !parsed.review) {
    throw new Error('Invalid thresholds.yml: missing required sections');
  }

  thresholdsCache = parsed;
  return thresholdsCache;
}

/**
 * Get sources by tier
 */
export function getSourcesByTier(tier: 1 | 2 | 3): SourceConfig[] {
  const sources = loadSources();
  return sources.filter((s) => s.tier === tier);
}

/**
 * Get sources by type
 */
export function getSourcesByType(type: SourceConfig['type']): SourceConfig[] {
  const sources = loadSources();
  return sources.filter((s) => s.type === type);
}

/**
 * Get LLM configuration from environment
 */
export function getLLMConfig(): {
  provider: 'anthropic' | 'openai';
  apiKey: string;
  model: string;
} {
  const provider = (process.env.LLM_PROVIDER as 'anthropic' | 'openai') || 'anthropic';
  const apiKey = process.env.LLM_API_KEY || '';
  const model = process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022';

  return { provider, apiKey, model };
}

/**
 * Get GitHub configuration from environment
 */
export function getGitHubConfig(): {
  token: string;
  org: string;
  repo: string;
} {
  return {
    token: process.env.GITHUB_TOKEN || '',
    org: process.env.GITHUB_ORG || '',
    repo: process.env.GITHUB_REPO || '',
  };
}

/**
 * Clear configuration cache (useful for testing)
 */
export function clearConfigCache(): void {
  sourcesCache = null;
  thresholdsCache = null;
}
