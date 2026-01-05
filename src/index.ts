/**
 * FGU Signal Engine - Main Entry Point
 *
 * This module exports the core utilities, services, and workflows for the signal engine.
 * Designed for use with n8n orchestration or standalone execution.
 */

// Types
export * from './types/index.js';

// Utilities
export * from './utils/hash.js';
export * from './utils/validation.js';
export * from './utils/feeds.js';

// Services
export * from './services/config.js';
export * from './services/fetcher.js';
export * from './services/deduper.js';
export * from './services/llm.js';
export * from './services/publisher.js';
export * from './services/database.js';

// Workflows
export { runDailyIngestion } from './workflows/daily-ingestion.js';
export { processIntake } from './workflows/intake.js';
export { runIdeaGenerator } from './workflows/idea-generator.js';
export { runWeeklyDigest } from './workflows/weekly-digest.js';

// Version
export const VERSION = '0.1.0';
