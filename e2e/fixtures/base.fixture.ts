import { test as base, Page } from '@playwright/test';

/**
 * Storage keys used by Event-Spark application
 */
export const STORAGE_KEYS = {
  SAVED_EVENTS: 'event-spark-saved-events',
  DISMISSED_EVENTS: 'event-spark-dismissed-events',
} as const;

/**
 * Custom fixture types for Event-Spark E2E tests
 */
export interface EventSparkFixtures {
  /**
   * Clears all Event-Spark related localStorage data
   */
  clearStorage: () => Promise<void>;

  /**
   * Seeds the saved events storage with the provided event IDs
   * @param ids - Array of event IDs to save
   */
  seedSavedEvents: (ids: string[]) => Promise<void>;

  /**
   * Gets the current saved event IDs from localStorage
   * @returns Array of saved event IDs
   */
  getSavedEventIds: () => Promise<string[]>;

  /**
   * Seeds the dismissed events storage with the provided event IDs
   * @param ids - Array of event IDs to dismiss
   */
  seedDismissedEvents: (ids: string[]) => Promise<void>;

  /**
   * Gets the current dismissed event IDs from localStorage
   * @returns Array of dismissed event IDs
   */
  getDismissedEventIds: () => Promise<string[]>;
}

/**
 * Extended Playwright test with Event-Spark specific fixtures
 */
export const test = base.extend<EventSparkFixtures>({
  clearStorage: async ({ page }, use) => {
    const clearStorage = async () => {
      await page.evaluate((keys) => {
        localStorage.removeItem(keys.SAVED_EVENTS);
        localStorage.removeItem(keys.DISMISSED_EVENTS);
      }, STORAGE_KEYS);
    };
    await use(clearStorage);
  },

  seedSavedEvents: async ({ page }, use) => {
    const seedSavedEvents = async (ids: string[]) => {
      await page.evaluate(
        ({ key, ids }) => {
          localStorage.setItem(key, JSON.stringify(ids));
        },
        { key: STORAGE_KEYS.SAVED_EVENTS, ids }
      );
    };
    await use(seedSavedEvents);
  },

  getSavedEventIds: async ({ page }, use) => {
    const getSavedEventIds = async (): Promise<string[]> => {
      return page.evaluate((key) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      }, STORAGE_KEYS.SAVED_EVENTS);
    };
    await use(getSavedEventIds);
  },

  seedDismissedEvents: async ({ page }, use) => {
    const seedDismissedEvents = async (ids: string[]) => {
      await page.evaluate(
        ({ key, ids }) => {
          localStorage.setItem(key, JSON.stringify(ids));
        },
        { key: STORAGE_KEYS.DISMISSED_EVENTS, ids }
      );
    };
    await use(seedDismissedEvents);
  },

  getDismissedEventIds: async ({ page }, use) => {
    const getDismissedEventIds = async (): Promise<string[]> => {
      return page.evaluate((key) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      }, STORAGE_KEYS.DISMISSED_EVENTS);
    };
    await use(getDismissedEventIds);
  },
});

export { expect } from '@playwright/test';
export type { Page };
