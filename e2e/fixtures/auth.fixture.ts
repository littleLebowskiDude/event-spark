import { Page, expect } from '@playwright/test';

/**
 * Demo credentials for admin login (development mode only)
 */
export const DEMO_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin',
} as const;

/**
 * Admin routes in the application
 */
export const ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin',
  events: '/admin/events',
  newEvent: '/admin/events/new',
} as const;

/**
 * Session storage key used for demo admin session
 */
export const DEMO_SESSION_KEY = 'demo_admin_session';

/**
 * Logs in as admin by directly seeding the demo session.
 * This bypasses the login form and directly sets up the session,
 * which works regardless of Supabase configuration.
 *
 * @param page - Playwright page object
 * @param options - Optional configuration
 * @param options.useForm - Whether to use the login form (only works when Supabase is not configured)
 */
export async function loginAsAdmin(
  page: Page,
  options: { useForm?: boolean } = {}
): Promise<void> {
  const { useForm = false } = options;

  if (useForm) {
    // Navigate to login page and use the form (only works in demo mode)
    await page.goto(ADMIN_ROUTES.login);
    await page.waitForSelector('form');
    await page.locator('input#email').fill(DEMO_CREDENTIALS.email);
    await page.locator('input#password').fill(DEMO_CREDENTIALS.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin', { timeout: 10000 });
  } else {
    // Directly seed the demo session (works in all environments)
    await page.goto(ADMIN_ROUTES.dashboard);

    // Set the demo session in sessionStorage
    await page.evaluate((key) => {
      sessionStorage.setItem(key, 'true');
    }, DEMO_SESSION_KEY);

    // Reload to apply the session
    await page.reload();

    // Verify we're on the admin page (not redirected to login)
    await expect(page).toHaveURL(/\/admin/);
  }
}

/**
 * Logs out from admin session.
 * Clears the demo session storage and navigates away from admin.
 *
 * @param page - Playwright page object
 */
export async function logoutAdmin(page: Page): Promise<void> {
  // Clear demo session from sessionStorage
  await page.evaluate((key) => {
    sessionStorage.removeItem(key);
  }, DEMO_SESSION_KEY);

  // Navigate to home page
  await page.goto('/');
}

/**
 * Checks if user is logged in as admin.
 *
 * @param page - Playwright page object
 * @returns True if admin session exists
 */
export async function isAdminLoggedIn(page: Page): Promise<boolean> {
  return page.evaluate((key) => {
    return sessionStorage.getItem(key) === 'true';
  }, DEMO_SESSION_KEY);
}

/**
 * Seeds the admin session directly without going through login flow.
 * Useful for tests that need to start with an authenticated state.
 *
 * @param page - Playwright page object
 */
export async function seedAdminSession(page: Page): Promise<void> {
  // Need to navigate to a page first to access sessionStorage
  await page.goto('/');

  await page.evaluate((key) => {
    sessionStorage.setItem(key, 'true');
  }, DEMO_SESSION_KEY);
}

/**
 * Clears the admin session.
 *
 * @param page - Playwright page object
 */
export async function clearAdminSession(page: Page): Promise<void> {
  await page.evaluate((key) => {
    sessionStorage.removeItem(key);
  }, DEMO_SESSION_KEY);
}

/**
 * Navigates to admin page with authentication.
 * If not logged in, performs login first.
 *
 * @param page - Playwright page object
 * @param route - Admin route to navigate to (default: dashboard)
 */
export async function navigateToAdminWithAuth(
  page: Page,
  route: string = ADMIN_ROUTES.dashboard
): Promise<void> {
  // Check if already logged in
  await page.goto('/');
  const isLoggedIn = await isAdminLoggedIn(page);

  if (!isLoggedIn) {
    await loginAsAdmin(page);
  }

  // Navigate to the requested admin route
  if (route !== ADMIN_ROUTES.dashboard) {
    await page.goto(route);
  }
}

/**
 * Test fixture for admin authentication state.
 * Use this to set up tests that require admin access.
 */
export interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
}

/**
 * Gets the current admin authentication state.
 *
 * @param page - Playwright page object
 * @returns Current auth state
 */
export async function getAdminAuthState(page: Page): Promise<AdminAuthState> {
  const isAuthenticated = await isAdminLoggedIn(page);

  return {
    isAuthenticated,
    email: isAuthenticated ? DEMO_CREDENTIALS.email : null,
  };
}
