/**
 * Environment configuration with Zod validation.
 *
 * This module provides typed, validated access to environment variables.
 * Validation runs at module load time, failing fast if config is invalid.
 *
 * Usage:
 *   import { env } from '@/lib/config';
 *   console.log(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
 *
 * IMPORTANT:
 * - Server-only variables must NOT be accessed in client components
 * - Use `publicEnv` for client-safe access
 */

import { z } from 'zod';

// =============================================================================
// Schema Definitions
// =============================================================================

/**
 * Public environment variables (safe for browser exposure).
 * All variables must be prefixed with NEXT_PUBLIC_.
 */
const publicEnvSchema = z.object({
  // Firebase Auth
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1)
    .optional()
    .describe('Firebase web app API key'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1)
    .optional()
    .describe('Firebase auth domain'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1)
    .optional()
    .describe('Firebase/GCP project ID'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string()
    .min(1)
    .optional()
    .describe('Firebase app ID'),

  // Starknet
  NEXT_PUBLIC_STARKNET_NETWORK: z
    .enum(['mainnet', 'sepolia'])
    .default('sepolia')
    .describe('Starknet network'),
  NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS: z
    .string()
    .optional()
    .describe('Reactions contract address'),
  NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS: z
    .string()
    .optional()
    .describe('Comments contract address'),
});

/**
 * Server-only environment variables (never expose to client).
 * These are validated only on the server side.
 */
const serverEnvSchema = z.object({
  // Database (Cloud SQL)
  DATABASE_URL: z
    .string()
    .min(1)
    .optional()
    .describe('Cloud SQL Postgres connection string (server-only)'),

  // n8n Integration
  N8N_WEBHOOK_URL: z
    .string()
    .url()
    .optional()
    .describe('n8n webhook URL for intake submissions'),
  N8N_WEBHOOK_SECRET: z
    .string()
    .min(1)
    .optional()
    .describe('Shared secret for webhook authentication'),

  // Content
  CONTENT_BASE_URL: z
    .string()
    .url()
    .optional()
    .describe('Base URL for site-content'),
  GCS_BUCKET_NAME: z
    .string()
    .default('libertas-content')
    .describe('GCS bucket name'),

  // Node
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Combined schema for full environment (server-side only).
 */
const envSchema = publicEnvSchema.merge(serverEnvSchema);

// =============================================================================
// Type Exports
// =============================================================================

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = z.infer<typeof envSchema>;

// =============================================================================
// Validation & Export
// =============================================================================

/**
 * Validates environment variables and returns typed config.
 * Throws descriptive error if validation fails.
 */
function validateEnv(): Env {
  const isServer = typeof window === 'undefined';

  // On client, only validate public env vars
  if (!isServer) {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_STARKNET_NETWORK: process.env.NEXT_PUBLIC_STARKNET_NETWORK,
      NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS:
        process.env.NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS,
      NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS:
        process.env.NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS,
    });

    if (!result.success) {
      console.error('❌ Invalid public environment variables:');
      console.error(result.error.format());
      throw new Error('Invalid public environment configuration');
    }

    // Return partial env with only public vars (server vars will be undefined)
    return result.data as Env;
  }

  // On server, validate all env vars
  const result = envSchema.safeParse({
    // Public
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_STARKNET_NETWORK: process.env.NEXT_PUBLIC_STARKNET_NETWORK,
    NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS,
    NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS,
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
    CONTENT_BASE_URL: process.env.CONTENT_BASE_URL,
    GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

/**
 * Validated environment configuration.
 * Access via `env.VARIABLE_NAME`.
 *
 * @example
 * import { env } from '@/lib/config';
 * const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
 */
export const env = validateEnv();

/**
 * Public-only environment variables (safe for client components).
 * Use this when you need to pass env to client code.
 */
export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_STARKNET_NETWORK: env.NEXT_PUBLIC_STARKNET_NETWORK,
  NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS:
    env.NEXT_PUBLIC_REACTIONS_CONTRACT_ADDRESS,
  NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS:
    env.NEXT_PUBLIC_COMMENTS_CONTRACT_ADDRESS,
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if running in development mode.
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode.
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if running on the server.
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get a required server-only env var. Throws if accessed on client.
 */
export function getServerEnv<K extends keyof ServerEnv>(key: K): ServerEnv[K] {
  if (!isServer()) {
    throw new Error(
      `❌ Attempted to access server-only env var "${key}" on client`
    );
  }
  return env[key] as ServerEnv[K];
}
