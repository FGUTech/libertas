/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * Used for environment validation and early initialization.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Validate environment configuration on server start
  // This import triggers validation via the config module
  const { env, isDevelopment } = await import('@/lib/config');

  if (isDevelopment()) {
    console.log('✅ Environment configuration validated');
    console.log(`   NODE_ENV: ${env.NODE_ENV}`);
    console.log(`   Supabase: ${env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured'}`);
    console.log(`   n8n: ${env.N8N_WEBHOOK_URL ? 'configured' : 'not configured'}`);
    console.log(`   Starknet: ${env.NEXT_PUBLIC_STARKNET_NETWORK}`);
  }
}
