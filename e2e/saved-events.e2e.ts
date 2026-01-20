import { test, expect } from './fixtures/base.fixture';
import { SavedPage } from './pages/SavedPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { BottomNav } from './pages/components/BottomNav';
import { mockEventsSuccess, waitForAnimation } from './utils';
import { TEST_EVENTS, createTestEvent, getDefaultTestEvents } from './fixtures/events.fixture';

/**
 * E2E Tests for Saved Events functionality.
 *
 * These tests cover the Saved Events page (/saved) including:
 * - Empty state display
 * - Saved events list display
 * - Event interactions (tap, remove)
 * - Cross-page persistence between Discover and Saved
 */

test.describe('Saved Events Page', () => {
  // ============================================================================
  // Empty State Tests
  // ============================================================================

  test.describe('Empty State', () => {
    test('should display empty state when no saved events', async ({ page, clearStorage }) => {
      // Ensure no saved events exist
      await page.goto('/');
      await clearStorage();

      // Mock the API to return events (for when we navigate)
      await mockEventsSuccess(page, getDefaultTestEvents());

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify empty state is displayed
      const isEmptyState = await savedPage.isEmptyState();
      expect(isEmptyState).toBe(true);

      // Verify the header is still visible
      const header = savedPage.getPageHeader();
      await expect(header).toBeVisible();
    });

    test('should show message to discover events', async ({ page, clearStorage }) => {
      // Ensure no saved events exist
      await page.goto('/');
      await clearStorage();

      await mockEventsSuccess(page, getDefaultTestEvents());

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Check for the instructional message
      const emptyStateMessage = await savedPage.getEmptyStateMessage();
      expect(emptyStateMessage).toContain('Swipe right');
      expect(emptyStateMessage).toContain('heart');
    });
  });

  // ============================================================================
  // Saved Events List Tests
  // ============================================================================

  test.describe('Saved Events List', () => {
    test('should display saved events (seeded via localStorage)', async ({
      page,
      seedSavedEvents,
    }) => {
      // Create test events with specific IDs
      const savedEventIds = [
        TEST_EVENTS.basic.id,
        TEST_EVENTS.music.id,
        TEST_EVENTS.food.id,
      ];
      const testEvents = [TEST_EVENTS.basic, TEST_EVENTS.music, TEST_EVENTS.food];

      // Mock API to return these events when fetched by IDs
      await mockEventsSuccess(page, testEvents);

      // Navigate first to initialize the page context
      await page.goto('/');

      // Seed the saved events into localStorage
      await seedSavedEvents(savedEventIds);

      // Navigate to the saved page
      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify events are displayed
      const eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(3);
    });

    test('should show event title, date, venue for each card', async ({
      page,
      seedSavedEvents,
    }) => {
      // Use a fully populated event for this test
      const testEvent = createTestEvent({
        id: 'e2e-full-display-test',
        title: 'Full Display Test Event',
        venue_name: 'Test Display Venue',
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Mock API to return this event
      await mockEventsSuccess(page, [testEvent]);

      // Navigate first to initialize the page context
      await page.goto('/');

      // Seed the saved event
      await seedSavedEvents([testEvent.id]);

      // Navigate to saved page
      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify the event card displays title
      const title = await savedPage.getEventTitle(0);
      expect(title).toBe('Full Display Test Event');

      // Verify the event card displays venue
      const venue = await savedPage.getEventVenue(0);
      expect(venue).toBe('Test Display Venue');

      // Verify the event card displays time (we check it exists, not specific format)
      const time = await savedPage.getEventTime(0);
      expect(time.length).toBeGreaterThan(0);
    });

    test('should navigate from Discover to Saved via bottom nav', async ({
      page,
      seedSavedEvents,
    }) => {
      // Set up test data
      const testEvents = [TEST_EVENTS.basic, TEST_EVENTS.music];
      await mockEventsSuccess(page, testEvents);

      // Navigate to Discover page first
      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Seed some saved events while on discover
      await seedSavedEvents([TEST_EVENTS.basic.id]);

      // Navigate using bottom nav
      const bottomNav = new BottomNav(page);
      await bottomNav.waitForVisible();
      await bottomNav.clickSaved();

      // Wait for navigation
      await page.waitForURL('**/saved');
      await waitForAnimation(page);

      // Verify we are on the saved page
      const savedPage = new SavedPage(page);
      const header = savedPage.getPageHeader();
      await expect(header).toBeVisible();

      // Verify the Saved nav link is active
      const isSavedActive = await bottomNav.isSavedActive();
      expect(isSavedActive).toBe(true);
    });
  });

  // ============================================================================
  // Event Interaction Tests
  // ============================================================================

  test.describe('Event Interaction', () => {
    test('should open event detail when tapping saved event', async ({
      page,
      seedSavedEvents,
    }) => {
      // Set up test event
      const testEvent = createTestEvent({
        id: 'e2e-tap-test-event',
        title: 'Tap Test Event',
        description: 'This is a description for the tap test event',
        venue_name: 'Tap Test Venue',
      });

      await mockEventsSuccess(page, [testEvent]);
      await page.goto('/');
      await seedSavedEvents([testEvent.id]);

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Click on the event card
      await savedPage.clickEvent(0);

      // Verify the event detail modal opens
      // The EventDetail component shows the event title in an h1
      const detailTitle = page.locator('h1:has-text("Tap Test Event")');
      await expect(detailTitle).toBeVisible();

      // Verify description is visible
      const description = page.locator('text=This is a description for the tap test event');
      await expect(description).toBeVisible();

      // Close button should be visible
      const closeButton = page.locator('button[aria-label="Close"]');
      await expect(closeButton).toBeVisible();
    });

    test('should remove event when clicking trash icon', async ({
      page,
      seedSavedEvents,
      getSavedEventIds,
    }) => {
      // Set up multiple test events
      const testEvents = [
        createTestEvent({ id: 'e2e-remove-test-1', title: 'Event To Remove' }),
        createTestEvent({ id: 'e2e-remove-test-2', title: 'Event To Keep' }),
      ];

      await mockEventsSuccess(page, testEvents);
      await page.goto('/');
      await seedSavedEvents([testEvents[0].id, testEvents[1].id]);

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify initial state - 2 events
      let eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(2);

      // Get the title of the first event before removal
      const firstEventTitle = await savedPage.getEventTitle(0);

      // Find the index of "Event To Remove"
      const allTitles = await savedPage.getAllEventTitles();
      const removeIndex = allTitles.findIndex((t) => t === 'Event To Remove');

      // Click the remove button for "Event To Remove"
      await savedPage.removeEvent(removeIndex);

      // Wait for animation to complete
      await waitForAnimation(page, 500);

      // Verify only 1 event remains
      eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(1);

      // Verify the remaining event is "Event To Keep"
      const remainingTitle = await savedPage.getEventTitle(0);
      expect(remainingTitle).toBe('Event To Keep');
    });

    test('should update localStorage on removal', async ({
      page,
      seedSavedEvents,
      getSavedEventIds,
    }) => {
      // Set up test events
      const testEvents = [
        createTestEvent({ id: 'e2e-storage-test-1', title: 'Storage Event 1' }),
        createTestEvent({ id: 'e2e-storage-test-2', title: 'Storage Event 2' }),
      ];

      await mockEventsSuccess(page, testEvents);
      await page.goto('/');
      await seedSavedEvents([testEvents[0].id, testEvents[1].id]);

      // Verify initial localStorage state
      let savedIds = await getSavedEventIds();
      expect(savedIds).toHaveLength(2);
      expect(savedIds).toContain('e2e-storage-test-1');
      expect(savedIds).toContain('e2e-storage-test-2');

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Remove the first event
      await savedPage.removeEvent(0);
      await waitForAnimation(page, 500);

      // Verify localStorage is updated
      savedIds = await getSavedEventIds();
      expect(savedIds).toHaveLength(1);

      // One of the events should be removed
      expect(
        savedIds.includes('e2e-storage-test-1') || savedIds.includes('e2e-storage-test-2')
      ).toBe(true);
      expect(savedIds).not.toEqual(['e2e-storage-test-1', 'e2e-storage-test-2']);
    });
  });

  // ============================================================================
  // Cross-Page Persistence Tests
  // ============================================================================

  test.describe('Cross-Page Persistence', () => {
    test('should show newly saved event from Discover in Saved page', async ({
      page,
      clearStorage,
      getSavedEventIds,
    }) => {
      // Clear any existing saved events
      await page.goto('/');
      await clearStorage();

      // Set up test events for Discover page
      const testEvents = [
        createTestEvent({
          id: 'e2e-cross-page-event-1',
          title: 'Cross Page Test Event',
          venue_name: 'Cross Page Venue',
        }),
        createTestEvent({
          id: 'e2e-cross-page-event-2',
          title: 'Another Event',
        }),
      ];

      await mockEventsSuccess(page, testEvents);

      // Navigate to Discover page
      const discoverPage = new DiscoverPage(page);
      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get the title of the current card
      const cardTitle = await discoverPage.getCardTitle();

      // Save the event by clicking the save button
      await discoverPage.clickSaveButton();

      // Verify the event was saved to localStorage
      const savedIds = await getSavedEventIds();
      expect(savedIds.length).toBeGreaterThan(0);

      // Navigate to Saved page
      const bottomNav = new BottomNav(page);
      await bottomNav.clickSaved();
      await page.waitForURL('**/saved');

      const savedPage = new SavedPage(page);
      await savedPage.waitForEventsToLoad();

      // Verify the saved event appears
      const eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBeGreaterThanOrEqual(1);

      // Verify the specific event title is present in saved events
      const savedTitles = await savedPage.getAllEventTitles();
      expect(savedTitles).toContain(cardTitle);
    });

    test('should not show removed event back on Discover', async ({
      page,
      seedSavedEvents,
      getSavedEventIds,
    }) => {
      // Set up test events
      const testEvent = createTestEvent({
        id: 'e2e-removed-event-test',
        title: 'Event To Be Removed',
      });

      await mockEventsSuccess(page, [testEvent]);
      await page.goto('/');
      await seedSavedEvents([testEvent.id]);

      // Go to Saved page and remove the event
      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify the event is there initially
      let eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(1);

      // Remove the event
      await savedPage.removeEvent(0);
      await waitForAnimation(page, 500);

      // Verify it's gone from the Saved page
      const isEmpty = await savedPage.isEmptyState();
      expect(isEmpty).toBe(true);

      // Verify localStorage no longer contains this event
      const savedIds = await getSavedEventIds();
      expect(savedIds).not.toContain('e2e-removed-event-test');

      // Navigate back to Discover
      const bottomNav = new BottomNav(page);
      await bottomNav.clickDiscover();
      await page.waitForURL(/\/$/);

      // The event should appear in Discover again (not filtered as saved)
      // The Discover page shows unsaved events, so the removed event should be there
      const discoverPage = new DiscoverPage(page);
      await discoverPage.waitForCardsToLoad();

      // Verify we can see the event card (it's the only event)
      const cardTitle = await discoverPage.getCardTitle();
      expect(cardTitle).toBe('Event To Be Removed');

      // The save button should not show as "saved" state
      const saveButton = discoverPage.getSaveButton();
      await expect(saveButton).toBeVisible();
    });

    test('should persist saved events across page reloads', async ({
      page,
      seedSavedEvents,
      getSavedEventIds,
    }) => {
      // Set up test event
      const testEvent = createTestEvent({
        id: 'e2e-persist-reload-test',
        title: 'Persist Across Reload',
      });

      await mockEventsSuccess(page, [testEvent]);
      await page.goto('/');
      await seedSavedEvents([testEvent.id]);

      // Navigate to Saved page and verify event is there
      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      let eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(1);

      // Reload the page
      await page.reload();
      await savedPage.waitForEventsToLoad();

      // Verify the event is still there after reload
      eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(1);

      const title = await savedPage.getEventTitle(0);
      expect(title).toBe('Persist Across Reload');

      // Verify localStorage still has the event
      const savedIds = await getSavedEventIds();
      expect(savedIds).toContain('e2e-persist-reload-test');
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  test.describe('Edge Cases', () => {
    test('should handle event detail modal close and return to list', async ({
      page,
      seedSavedEvents,
    }) => {
      const testEvent = createTestEvent({
        id: 'e2e-modal-close-test',
        title: 'Modal Close Test',
      });

      await mockEventsSuccess(page, [testEvent]);
      await page.goto('/');
      await seedSavedEvents([testEvent.id]);

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Open event detail
      await savedPage.clickEvent(0);

      // Verify modal is open
      const detailTitle = page.locator('h1:has-text("Modal Close Test")');
      await expect(detailTitle).toBeVisible();

      // Close the modal
      const closeButton = page.locator('button[aria-label="Close"]');
      await closeButton.click();
      await waitForAnimation(page, 500);

      // Verify we're back to the list view
      const header = savedPage.getPageHeader();
      await expect(header).toBeVisible();

      // Verify the event card is still visible
      const eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(1);
    });

    test('should display events grouped by date', async ({ page, seedSavedEvents }) => {
      // Create events on different dates
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const testEvents = [
        createTestEvent({
          id: 'e2e-date-group-1',
          title: 'Tomorrow Event',
          start_date: tomorrow.toISOString(),
        }),
        createTestEvent({
          id: 'e2e-date-group-2',
          title: 'Next Week Event',
          start_date: nextWeek.toISOString(),
        }),
      ];

      await mockEventsSuccess(page, testEvents);
      await page.goto('/');
      await seedSavedEvents([testEvents[0].id, testEvents[1].id]);

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify events are displayed
      const eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(2);

      // Get the date group headers - there should be at least 1 (possibly 2 if dates differ)
      const dateGroups = await savedPage.getDateGroups();
      expect(dateGroups.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle removing all events and show empty state', async ({
      page,
      seedSavedEvents,
    }) => {
      const testEvent = createTestEvent({
        id: 'e2e-remove-all-test',
        title: 'Last Event',
      });

      await mockEventsSuccess(page, [testEvent]);
      await page.goto('/');
      await seedSavedEvents([testEvent.id]);

      const savedPage = new SavedPage(page);
      await savedPage.goto();
      await savedPage.waitForEventsToLoad();

      // Verify event is there
      let eventCount = await savedPage.getSavedEventCount();
      expect(eventCount).toBe(1);

      // Remove the only event
      await savedPage.removeEvent(0);
      await waitForAnimation(page, 500);

      // Verify empty state is shown
      const isEmpty = await savedPage.isEmptyState();
      expect(isEmpty).toBe(true);
    });
  });
});
