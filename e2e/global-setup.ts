import { FullConfig } from '@playwright/test';

/**
 * Global Setup for Playwright E2E Tests
 *
 * This file runs once before all tests.
 * Use it to validate environment and perform any required setup.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n[Global Setup] Starting E2E test environment validation...\n');

  // Validate required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.warn(
      `[Global Setup] Warning: Missing environment variables: ${missingVars.join(', ')}\n` +
      'Tests may fail if these are required for your application.\n' +
      'Consider creating a .env.local file with the required values.\n'
    );
  } else {
    console.log('[Global Setup] All required environment variables are set.\n');
  }

  // Log test configuration
  console.log(`[Global Setup] Base URL: ${config.projects[0]?.use?.baseURL || 'http://localhost:3000'}`);
  console.log(`[Global Setup] Test directory: ${config.testDir}`);
  console.log(`[Global Setup] Projects: ${config.projects.map(p => p.name).join(', ')}`);
  console.log(`[Global Setup] Retries: ${config.projects[0]?.retries ?? 0}`);
  console.log('\n[Global Setup] Environment validation complete.\n');
}

export default globalSetup;
