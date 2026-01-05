/**
 * FGU Signal Engine - Main Entry Point
 *
 * This module exports the core utilities and types for the signal engine.
 * The actual orchestration happens in n8n workflows.
 */

// Types
export * from './types/index.js';

// Utilities
export * from './utils/hash.js';
export * from './utils/validation.js';
export * from './utils/feeds.js';

// Version
export const VERSION = '0.1.0';
