import { Page } from '@playwright/test';

/**
 * Storage keys used by Event-Spark application
 */
export const STORAGE_KEYS = {
  SAVED_EVENTS: 'event-spark-saved-events',
  DISMISSED_EVENTS: 'event-spark-dismissed-events',
} as const;

/**
 * Gets the saved event IDs from localStorage.
 *
 * @param page - Playwright page object
 * @returns Array of saved event IDs
 */
export async function getSavedEventIds(page: Page): Promise<string[]> {
  return page.evaluate((key) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }, STORAGE_KEYS.SAVED_EVENTS);
}

/**
 * Gets the dismissed event IDs from localStorage.
 *
 * @param page - Playwright page object
 * @returns Array of dismissed event IDs
 */
export async function getDismissedEventIds(page: Page): Promise<string[]> {
  return page.evaluate((key) => {
    const dismissed = localStorage.getItem(key);
    return dismissed ? JSON.parse(dismissed) : [];
  }, STORAGE_KEYS.DISMISSED_EVENTS);
}

/**
 * Sets the saved event IDs in localStorage.
 *
 * @param page - Playwright page object
 * @param ids - Array of event IDs to save
 */
export async function setSavedEventIds(
  page: Page,
  ids: string[]
): Promise<void> {
  await page.evaluate(
    ({ key, ids }) => {
      localStorage.setItem(key, JSON.stringify(ids));
    },
    { key: STORAGE_KEYS.SAVED_EVENTS, ids }
  );
}

/**
 * Sets the dismissed event IDs in localStorage.
 *
 * @param page - Playwright page object
 * @param ids - Array of event IDs to dismiss
 */
export async function setDismissedEventIds(
  page: Page,
  ids: string[]
): Promise<void> {
  await page.evaluate(
    ({ key, ids }) => {
      localStorage.setItem(key, JSON.stringify(ids));
    },
    { key: STORAGE_KEYS.DISMISSED_EVENTS, ids }
  );
}

/**
 * Adds an event ID to the saved events list.
 *
 * @param page - Playwright page object
 * @param eventId - Event ID to add
 */
export async function addSavedEventId(
  page: Page,
  eventId: string
): Promise<void> {
  await page.evaluate(
    ({ key, eventId }) => {
      const saved = localStorage.getItem(key);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      if (!ids.includes(eventId)) {
        ids.push(eventId);
        localStorage.setItem(key, JSON.stringify(ids));
      }
    },
    { key: STORAGE_KEYS.SAVED_EVENTS, eventId }
  );
}

/**
 * Removes an event ID from the saved events list.
 *
 * @param page - Playwright page object
 * @param eventId - Event ID to remove
 */
export async function removeSavedEventId(
  page: Page,
  eventId: string
): Promise<void> {
  await page.evaluate(
    ({ key, eventId }) => {
      const saved = localStorage.getItem(key);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      const filtered = ids.filter((id) => id !== eventId);
      localStorage.setItem(key, JSON.stringify(filtered));
    },
    { key: STORAGE_KEYS.SAVED_EVENTS, eventId }
  );
}

/**
 * Adds an event ID to the dismissed events list.
 *
 * @param page - Playwright page object
 * @param eventId - Event ID to dismiss
 */
export async function addDismissedEventId(
  page: Page,
  eventId: string
): Promise<void> {
  await page.evaluate(
    ({ key, eventId }) => {
      const dismissed = localStorage.getItem(key);
      const ids: string[] = dismissed ? JSON.parse(dismissed) : [];
      if (!ids.includes(eventId)) {
        ids.push(eventId);
        localStorage.setItem(key, JSON.stringify(ids));
      }
    },
    { key: STORAGE_KEYS.DISMISSED_EVENTS, eventId }
  );
}

/**
 * Clears all Event-Spark related localStorage data.
 *
 * @param page - Playwright page object
 */
export async function clearAllStorage(page: Page): Promise<void> {
  await page.evaluate((keys) => {
    localStorage.removeItem(keys.SAVED_EVENTS);
    localStorage.removeItem(keys.DISMISSED_EVENTS);
  }, STORAGE_KEYS);
}

/**
 * Clears only the saved events from localStorage.
 *
 * @param page - Playwright page object
 */
export async function clearSavedEvents(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, STORAGE_KEYS.SAVED_EVENTS);
}

/**
 * Clears only the dismissed events from localStorage.
 *
 * @param page - Playwright page object
 */
export async function clearDismissedEvents(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, STORAGE_KEYS.DISMISSED_EVENTS);
}

/**
 * Checks if an event is saved.
 *
 * @param page - Playwright page object
 * @param eventId - Event ID to check
 * @returns True if the event is saved
 */
export async function isEventSaved(
  page: Page,
  eventId: string
): Promise<boolean> {
  const savedIds = await getSavedEventIds(page);
  return savedIds.includes(eventId);
}

/**
 * Checks if an event is dismissed.
 *
 * @param page - Playwright page object
 * @param eventId - Event ID to check
 * @returns True if the event is dismissed
 */
export async function isEventDismissed(
  page: Page,
  eventId: string
): Promise<boolean> {
  const dismissedIds = await getDismissedEventIds(page);
  return dismissedIds.includes(eventId);
}

/**
 * Gets a snapshot of all storage data for debugging.
 *
 * @param page - Playwright page object
 * @returns Object containing all storage data
 */
export async function getStorageSnapshot(page: Page): Promise<{
  savedEvents: string[];
  dismissedEvents: string[];
}> {
  return page.evaluate((keys) => {
    const saved = localStorage.getItem(keys.SAVED_EVENTS);
    const dismissed = localStorage.getItem(keys.DISMISSED_EVENTS);
    return {
      savedEvents: saved ? JSON.parse(saved) : [],
      dismissedEvents: dismissed ? JSON.parse(dismissed) : [],
    };
  }, STORAGE_KEYS);
}
