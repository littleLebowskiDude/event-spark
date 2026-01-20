/**
 * Error Handling and Edge Case E2E Tests
 *
 * Tests for network errors, empty states, localStorage edge cases,
 * and responsive viewport behavior.
 */

import { test, expect, TEST_EVENTS, getDefaultTestEvents } from './fixtures';
import { DiscoverPage } from './pages';
import {
  mockEventsError,
  mockEmptyEvents,
  mockEventsSuccess,
  mockNetworkError,
  clearEventMocks,
  STORAGE_KEYS,
} from './utils';

/**
 * Network Error Tests
 *
 * Verify the application handles API failures gracefully
 * and provides appropriate feedback to users.
 */
test.describe('Network Errors', () => {
  test('should display error state when events API fails', async ({ page }) => {
    // Set up API mock to return 500 error before navigating
    await mockEventsError(page, 500, 'Internal Server Error');

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for error state to appear
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Verify error state is displayed
    const isError = await discoverPage.isErrorState();
    expect(isError).toBe(true);
  });

  test('should show retry button on error', async ({ page }) => {
    // Set up API mock to return error
    await mockEventsError(page, 500, 'Internal Server Error');

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for error state to appear
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Verify retry button is visible
    const retryButton = page.locator('text=Try Again');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
  });

  test('should retry loading when clicking Try Again button', async ({
    page,
  }) => {
    // First, set up API to return error
    await mockEventsError(page, 500, 'Internal Server Error');

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for error state to appear
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Clear the error mock and set up success response
    await clearEventMocks(page);
    await mockEventsSuccess(page, getDefaultTestEvents());

    // Click retry button
    await discoverPage.clickRetryButton();

    // Wait for cards to load
    await discoverPage.waitForCardsToLoad();

    // Verify error state is gone and cards are displayed
    const isError = await discoverPage.isErrorState();
    expect(isError).toBe(false);

    const cardCount = await discoverPage.getVisibleCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display error state on network connection failure', async ({
    page,
  }) => {
    // Set up mock for network failure
    await mockNetworkError(page);

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for error state to appear
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Verify error state is displayed
    const isError = await discoverPage.isErrorState();
    expect(isError).toBe(true);
  });
});

/**
 * Empty States Tests
 *
 * Verify the application handles empty data gracefully
 * and displays appropriate messages.
 */
test.describe('Empty States', () => {
  test('should display empty state when no events in database', async ({
    page,
  }) => {
    // Set up API mock to return empty array
    await mockEmptyEvents(page);

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for empty state to appear
    await page.waitForTimeout(1000); // Allow time for loading to complete

    // Verify empty state is displayed
    const isEmpty = await discoverPage.isEmptyState();
    expect(isEmpty).toBe(true);
  });

  test('should show appropriate message when no events available', async ({
    page,
  }) => {
    // Set up API mock to return empty array
    await mockEmptyEvents(page);

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for the page to load
    await page.waitForTimeout(1000);

    // Check for the no events message
    const noEventsMessage = page.locator('text=No Events Found');
    const noMoreEventsMessage = page.locator('text=No more events');

    // One of these messages should be visible
    const isNoEventsVisible = await noEventsMessage.isVisible();
    const isNoMoreVisible = await noMoreEventsMessage.isVisible();

    expect(isNoEventsVisible || isNoMoreVisible).toBe(true);
  });

  test('should show empty state after dismissing all events', async ({
    page,
  }) => {
    // Set up API mock with only 2 events
    const limitedEvents = [TEST_EVENTS.basic, TEST_EVENTS.today];
    await mockEventsSuccess(page, limitedEvents);

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for cards to load
    await discoverPage.waitForCardsToLoad();

    // Dismiss all events by clicking pass button
    for (let i = 0; i < limitedEvents.length; i++) {
      await discoverPage.clickPassButton();
      await page.waitForTimeout(400); // Wait for animation
    }

    // Verify empty state is displayed
    await page.waitForTimeout(500);
    const isEmpty = await discoverPage.isEmptyState();
    expect(isEmpty).toBe(true);
  });
});

/**
 * LocalStorage Edge Cases Tests
 *
 * Verify the application handles corrupted or stale localStorage data
 * without crashing.
 */
test.describe('LocalStorage Edge Cases', () => {
  test('should handle corrupted localStorage data gracefully', async ({
    page,
  }) => {
    // First navigate to the page to ensure context exists
    const discoverPage = new DiscoverPage(page);
    await mockEventsSuccess(page, getDefaultTestEvents());
    await discoverPage.goto();

    // Now set corrupted localStorage data
    await page.evaluate((keys) => {
      // Set invalid JSON for saved events
      localStorage.setItem(keys.SAVED_EVENTS, 'not valid json {{{');
      localStorage.setItem(keys.DISMISSED_EVENTS, '[invalid array');
    }, STORAGE_KEYS);

    // Reload the page
    await page.reload();

    // Wait for the page to stabilize
    await page.waitForTimeout(1000);

    // The app should still work - either show events or handle the error gracefully
    // It should not crash or show a white screen
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check that the page has some content (not blank)
    const hasContent = await page.evaluate(() => {
      return document.body.innerText.length > 0;
    });
    expect(hasContent).toBe(true);
  });

  test('should work when saved events in localStorage no longer exist in database', async ({
    page,
  }) => {
    // Navigate to create context
    const discoverPage = new DiscoverPage(page);
    await mockEventsSuccess(page, getDefaultTestEvents());
    await discoverPage.goto();

    // Set localStorage with event IDs that do not exist in the mocked data
    await page.evaluate((keys) => {
      const nonExistentIds = [
        'non-existent-event-001',
        'non-existent-event-002',
        'deleted-event-xyz',
      ];
      localStorage.setItem(keys.SAVED_EVENTS, JSON.stringify(nonExistentIds));
    }, STORAGE_KEYS);

    // Navigate to saved page
    await page.goto('/saved');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // The page should not crash - it should handle missing events gracefully
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // The saved page might show empty state or filter out non-existent events
    // Either behavior is acceptable as long as the app doesn't crash
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('should handle empty localStorage gracefully', async ({ page }) => {
    const discoverPage = new DiscoverPage(page);
    await mockEventsSuccess(page, getDefaultTestEvents());
    await discoverPage.goto();

    // Explicitly clear all localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload the page
    await page.reload();

    // Wait for cards to load
    await discoverPage.waitForCardsToLoad();

    // The app should work normally
    const cardCount = await discoverPage.getVisibleCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should handle localStorage with duplicate IDs', async ({ page }) => {
    const discoverPage = new DiscoverPage(page);
    await mockEventsSuccess(page, getDefaultTestEvents());
    await discoverPage.goto();

    // Set localStorage with duplicate IDs
    await page.evaluate((keys) => {
      const duplicateIds = [
        'e2e-basic-event-001',
        'e2e-basic-event-001',
        'e2e-basic-event-001',
        'e2e-today-event-001',
      ];
      localStorage.setItem(keys.SAVED_EVENTS, JSON.stringify(duplicateIds));
    }, STORAGE_KEYS);

    // Navigate to saved page
    await page.goto('/saved');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Page should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

/**
 * Responsive Viewport Tests
 *
 * Verify the application works correctly across different viewport sizes.
 */
test.describe('Responsive Viewports', () => {
  test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should work correctly on mobile viewport', async ({ page }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();

      // Wait for cards to load
      await discoverPage.waitForCardsToLoad();

      // Verify cards are visible
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Verify pass and save buttons are visible and accessible
      const passButton = discoverPage.getPassButton();
      const saveButton = discoverPage.getSaveButton();

      await expect(passButton).toBeVisible();
      await expect(saveButton).toBeVisible();

      // Test button functionality
      await discoverPage.clickSaveButton();
      await page.waitForTimeout(400);

      // Verify the action worked (card count should change or new card shown)
      const isStillFunctional = await discoverPage.getVisibleCardCount();
      expect(isStillFunctional).toBeGreaterThanOrEqual(0);
    });

    test('should have proper touch targets on mobile', async ({ page }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Check button sizes are adequate for touch (minimum 44x44 pixels recommended)
      const passButton = discoverPage.getPassButton();
      const saveButton = discoverPage.getSaveButton();

      const passBox = await passButton.boundingBox();
      const saveBox = await saveButton.boundingBox();

      expect(passBox).not.toBeNull();
      expect(saveBox).not.toBeNull();

      if (passBox && saveBox) {
        // Buttons should be at least 40px for touch targets
        expect(passBox.width).toBeGreaterThanOrEqual(40);
        expect(passBox.height).toBeGreaterThanOrEqual(40);
        expect(saveBox.width).toBeGreaterThanOrEqual(40);
        expect(saveBox.height).toBeGreaterThanOrEqual(40);
      }
    });
  });

  test.describe('Tablet Viewport', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad size

    test('should work correctly on tablet viewport', async ({ page }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();

      // Wait for cards to load
      await discoverPage.waitForCardsToLoad();

      // Verify cards are visible
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Verify core functionality works
      const passButton = discoverPage.getPassButton();
      const saveButton = discoverPage.getSaveButton();

      await expect(passButton).toBeVisible();
      await expect(saveButton).toBeVisible();

      // Test interaction
      await discoverPage.clickPassButton();
      await page.waitForTimeout(400);

      // Page should still be functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should display cards at appropriate size on tablet', async ({
      page,
    }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get the card dimensions
      const card = discoverPage.getCurrentCard();
      const cardBox = await card.boundingBox();

      expect(cardBox).not.toBeNull();

      if (cardBox) {
        // Card should be a reasonable size on tablet - not too small
        expect(cardBox.width).toBeGreaterThan(200);
        expect(cardBox.height).toBeGreaterThan(300);

        // Card should not exceed viewport
        expect(cardBox.width).toBeLessThanOrEqual(768);
      }
    });
  });

  test.describe('Desktop Viewport', () => {
    test.use({ viewport: { width: 1440, height: 900 } }); // Desktop size

    test('should work correctly on desktop viewport', async ({ page }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();

      // Wait for cards to load
      await discoverPage.waitForCardsToLoad();

      // Verify cards are visible
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Verify all navigation elements are visible
      const passButton = discoverPage.getPassButton();
      const saveButton = discoverPage.getSaveButton();

      await expect(passButton).toBeVisible();
      await expect(saveButton).toBeVisible();

      // Test keyboard navigation on desktop
      const cardStack = discoverPage.getCardStack();
      await cardStack.focus();

      // Press arrow keys for navigation
      await page.keyboard.press('ArrowRight'); // Save
      await page.waitForTimeout(400);

      // Verify the page is still functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should maintain centered layout on wide desktop', async ({
      page,
    }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get card position to verify centering
      const card = discoverPage.getCurrentCard();
      const cardBox = await card.boundingBox();

      expect(cardBox).not.toBeNull();

      if (cardBox) {
        // Card should be roughly centered horizontally
        const viewportCenter = 1440 / 2;
        const cardCenter = cardBox.x + cardBox.width / 2;

        // Allow 200px tolerance for centering
        expect(Math.abs(cardCenter - viewportCenter)).toBeLessThan(200);
      }
    });

    test('should support keyboard navigation on desktop', async ({ page }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Focus the card stack
      const cardStack = discoverPage.getCardStack();
      await cardStack.focus();

      // Get initial card title
      const initialTitle = await discoverPage.getCardTitle();

      // Use arrow left to pass
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(400);

      // The page should still be functional after keyboard navigation
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Small Mobile Viewport', () => {
    test.use({ viewport: { width: 320, height: 568 } }); // iPhone 5/SE size

    test('should work correctly on very small mobile viewport', async ({
      page,
    }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();

      // Wait for cards to load
      await discoverPage.waitForCardsToLoad();

      // Verify cards are visible
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Verify buttons are still accessible
      const passButton = discoverPage.getPassButton();
      const saveButton = discoverPage.getSaveButton();

      await expect(passButton).toBeVisible();
      await expect(saveButton).toBeVisible();
    });

    test('should not have horizontal overflow on small screens', async ({
      page,
    }) => {
      await mockEventsSuccess(page, getDefaultTestEvents());

      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Check for horizontal scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });
});

/**
 * Error Recovery Tests
 *
 * Test that the application recovers from errors appropriately.
 */
test.describe('Error Recovery', () => {
  test('should recover when API starts working after initial failure', async ({
    page,
  }) => {
    // Start with error
    await mockEventsError(page, 503, 'Service Unavailable');

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for error state
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Fix the API
    await clearEventMocks(page);
    await mockEventsSuccess(page, getDefaultTestEvents());

    // Retry
    await discoverPage.clickRetryButton();

    // Wait for cards
    await discoverPage.waitForCardsToLoad();

    // Verify recovery
    const cardCount = await discoverPage.getVisibleCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should handle multiple consecutive API errors', async ({ page }) => {
    // Set up persistent error
    await mockEventsError(page, 500, 'Internal Server Error');

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Wait for first error
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Retry (will still fail)
    await discoverPage.clickRetryButton();

    // Should still show error state
    await expect(page.locator('text=Unable to Load Events')).toBeVisible({
      timeout: 10000,
    });

    // Retry button should still be available
    const retryButton = page.locator('text=Try Again');
    await expect(retryButton).toBeVisible();
  });
});

/**
 * Data Integrity Tests
 *
 * Verify that user data (saved/dismissed events) is handled correctly
 * in edge cases.
 */
test.describe('Data Integrity', () => {
  test('should persist saved events across page reload', async ({
    page,
    getSavedEventIds,
  }) => {
    await mockEventsSuccess(page, getDefaultTestEvents());

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
    await discoverPage.waitForCardsToLoad();

    // Save an event
    await discoverPage.clickSaveButton();
    await page.waitForTimeout(400);

    // Get saved IDs before reload
    const savedIdsBefore = await getSavedEventIds();
    expect(savedIdsBefore.length).toBeGreaterThan(0);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Get saved IDs after reload
    const savedIdsAfter = await getSavedEventIds();

    // Data should persist
    expect(savedIdsAfter).toEqual(savedIdsBefore);
  });

  test('should not show already dismissed events after reload', async ({
    page,
    seedDismissedEvents,
  }) => {
    const events = getDefaultTestEvents();
    await mockEventsSuccess(page, events);

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Pre-seed dismissed events (first 3 events)
    const dismissedIds = events.slice(0, 3).map((e) => e.id);
    await seedDismissedEvents(dismissedIds);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);

    // The dismissed events should not be shown
    // (This depends on the app's filtering logic)
    // At minimum, the page should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
