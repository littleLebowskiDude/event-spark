/**
 * E2E Test Fixtures
 *
 * Re-exports all fixtures for convenient importing:
 * import { test, expect, TEST_EVENTS, loginAsAdmin } from '../fixtures';
 */

// Base test fixtures
export { test, expect, STORAGE_KEYS } from './base.fixture';
export type { EventSparkFixtures } from './base.fixture';

// Event fixtures and factories
export {
  createTestEvent,
  createTodayEvent,
  createTomorrowEvent,
  createPaidEvent,
  createPastEvent,
  createFullEvent,
  createMinimalEvent,
  createEventList,
  getDefaultTestEvents,
  getEventsByCategory,
  TEST_EVENTS,
} from './events.fixture';
export type { Event, EventCategory } from './events.fixture';

// Auth fixtures
export {
  loginAsAdmin,
  logoutAdmin,
  isAdminLoggedIn,
  seedAdminSession,
  clearAdminSession,
  navigateToAdminWithAuth,
  getAdminAuthState,
  DEMO_CREDENTIALS,
  ADMIN_ROUTES,
  DEMO_SESSION_KEY,
} from './auth.fixture';
export type { AdminAuthState } from './auth.fixture';
