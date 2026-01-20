import { test, expect, STORAGE_KEYS } from './fixtures/base.fixture';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventDetailModal } from './pages/EventDetailModal';
import {
  mockEventsSuccess,
  mockEmptyEvents,
  mockSlowEventsResponse,
  getSavedEventIds,
  getDismissedEventIds,
  waitForAnimation,
} from './utils';
import {
  TEST_EVENTS,
  createEventList,
  createTestEvent,
  getDefaultTestEvents,
} from './fixtures/events.fixture';

/**
 * Swipe Flow E2E Tests
 *
 * Tests the core swipe functionality of the Event-Spark application
 * including card display, save/dismiss actions, drag gestures,
 * keyboard navigation, and the event detail modal.
 */
test.describe('Swipe Flow', () => {
  let discoverPage: DiscoverPage;
  let eventDetailModal: EventDetailModal;

  test.beforeEach(async ({ page, clearStorage }) => {
    discoverPage = new DiscoverPage(page);
    eventDetailModal = new EventDetailModal(page);

    // Clear storage before each test to ensure clean state
    await page.goto('/');
    await clearStorage();
  });

  test.describe('Card Display and Loading', () => {
    test('should display first event card after loading', async ({ page }) => {
      const testEvents = getDefaultTestEvents();
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Verify the card stack is visible
      const cardStack = discoverPage.getCardStack();
      await expect(cardStack).toBeVisible();

      // Verify at least one card is displayed
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Verify the first event title is displayed
      const cardTitle = await discoverPage.getCardTitle();
      expect(cardTitle).toBeTruthy();
    });

    test('should show loading skeleton while fetching', async ({ page }) => {
      const testEvents = getDefaultTestEvents();
      // Mock with 1 second delay to observe loading state
      await mockSlowEventsResponse(page, testEvents, 1000);

      await discoverPage.goto();

      // Check for loading state (animated skeleton)
      const isLoading = await discoverPage.isLoading();
      expect(isLoading).toBe(true);

      // Wait for cards to load
      await discoverPage.waitForCardsToLoad();

      // Verify loading state is gone and cards are displayed
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should display empty state when no events', async ({ page }) => {
      await mockEmptyEvents(page);

      await discoverPage.goto();

      // Wait for the page to finish loading
      await page.waitForLoadState('networkidle');
      await waitForAnimation(page, 500);

      // Verify empty state is displayed
      const isEmpty = await discoverPage.isEmptyState();
      expect(isEmpty).toBe(true);
    });
  });

  test.describe('Swipe Right (Save) - via button', () => {
    test('should save event when clicking heart button', async ({ page }) => {
      const testEvents = getDefaultTestEvents();
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get the first event title before swiping
      const firstEventTitle = await discoverPage.getCardTitle();

      // Click the save button
      await discoverPage.clickSaveButton();

      // Verify the card advanced (new title or empty state)
      await waitForAnimation(page);
      const newTitle = await discoverPage.getCardTitle();

      // If there are more events, title should be different
      if (testEvents.length > 1) {
        expect(newTitle).not.toBe(firstEventTitle);
      }
    });

    test('should persist saved event ID to localStorage', async ({
      page,
      getSavedEventIds: getFixtureSavedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'save-test-event-001', title: 'Save Test Event' }),
        createTestEvent({ id: 'save-test-event-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Verify no saved events initially
      const initialSaved = await getFixtureSavedEventIds();
      expect(initialSaved).toHaveLength(0);

      // Save the first event
      await discoverPage.clickSaveButton();
      await waitForAnimation(page);

      // Verify the event ID was persisted to localStorage
      const savedEventIds = await getFixtureSavedEventIds();
      expect(savedEventIds).toContain('save-test-event-001');
    });

    test('should advance to next card', async ({ page }) => {
      const testEvents = [
        createTestEvent({ id: 'advance-001', title: 'First Event' }),
        createTestEvent({ id: 'advance-002', title: 'Second Event' }),
        createTestEvent({ id: 'advance-003', title: 'Third Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Verify first card
      const firstTitle = await discoverPage.getCardTitle();
      expect(firstTitle).toContain('First Event');

      // Save the first event
      await discoverPage.clickSaveButton();
      await waitForAnimation(page);

      // Verify second card is now showing
      const secondTitle = await discoverPage.getCardTitle();
      expect(secondTitle).toContain('Second Event');
    });
  });

  test.describe('Swipe Left (Dismiss) - via button', () => {
    test('should dismiss event when clicking X button', async ({ page }) => {
      const testEvents = getDefaultTestEvents();
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get the first event title before dismissing
      const firstEventTitle = await discoverPage.getCardTitle();

      // Click the pass button
      await discoverPage.clickPassButton();

      // Verify the card advanced
      await waitForAnimation(page);
      const newTitle = await discoverPage.getCardTitle();

      if (testEvents.length > 1) {
        expect(newTitle).not.toBe(firstEventTitle);
      }
    });

    test('should persist dismissed event ID to localStorage', async ({
      page,
      getDismissedEventIds: getFixtureDismissedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'dismiss-test-001', title: 'Dismiss Test Event' }),
        createTestEvent({ id: 'dismiss-test-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Verify no dismissed events initially
      const initialDismissed = await getFixtureDismissedEventIds();
      expect(initialDismissed).toHaveLength(0);

      // Dismiss the first event
      await discoverPage.clickPassButton();
      await waitForAnimation(page);

      // Verify the event ID was persisted to localStorage
      const dismissedEventIds = await getFixtureDismissedEventIds();
      expect(dismissedEventIds).toContain('dismiss-test-001');
    });

    test('should advance to next card', async ({ page }) => {
      const testEvents = [
        createTestEvent({ id: 'dismiss-advance-001', title: 'First Event' }),
        createTestEvent({ id: 'dismiss-advance-002', title: 'Second Event' }),
        createTestEvent({ id: 'dismiss-advance-003', title: 'Third Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Verify first card
      const firstTitle = await discoverPage.getCardTitle();
      expect(firstTitle).toContain('First Event');

      // Dismiss the first event
      await discoverPage.clickPassButton();
      await waitForAnimation(page);

      // Verify second card is now showing
      const secondTitle = await discoverPage.getCardTitle();
      expect(secondTitle).toContain('Second Event');
    });
  });

  test.describe('Drag Gestures', () => {
    test('should save event when dragging card right', async ({
      page,
      getSavedEventIds: getFixtureSavedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'drag-right-001', title: 'Drag Right Event' }),
        createTestEvent({ id: 'drag-right-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get initial title
      const initialTitle = await discoverPage.getCardTitle();
      expect(initialTitle).toContain('Drag Right Event');

      // Perform swipe right gesture
      await discoverPage.swipeRight(250);
      await waitForAnimation(page, 500);

      // Verify event was saved
      const savedEventIds = await getFixtureSavedEventIds();
      expect(savedEventIds).toContain('drag-right-001');

      // Verify card advanced
      const newTitle = await discoverPage.getCardTitle();
      expect(newTitle).toContain('Second Event');
    });

    test('should dismiss event when dragging card left', async ({
      page,
      getDismissedEventIds: getFixtureDismissedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'drag-left-001', title: 'Drag Left Event' }),
        createTestEvent({ id: 'drag-left-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get initial title
      const initialTitle = await discoverPage.getCardTitle();
      expect(initialTitle).toContain('Drag Left Event');

      // Perform swipe left gesture
      await discoverPage.swipeLeft(250);
      await waitForAnimation(page, 500);

      // Verify event was dismissed
      const dismissedEventIds = await getFixtureDismissedEventIds();
      expect(dismissedEventIds).toContain('drag-left-001');

      // Verify card advanced
      const newTitle = await discoverPage.getCardTitle();
      expect(newTitle).toContain('Second Event');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should save event when pressing right arrow key', async ({
      page,
      getSavedEventIds: getFixtureSavedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'keyboard-right-001', title: 'Keyboard Right Event' }),
        createTestEvent({ id: 'keyboard-right-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get initial title
      const initialTitle = await discoverPage.getCardTitle();
      expect(initialTitle).toContain('Keyboard Right Event');

      // Press right arrow to save
      await discoverPage.pressArrowRight();
      await waitForAnimation(page, 500);

      // Verify event was saved
      const savedEventIds = await getFixtureSavedEventIds();
      expect(savedEventIds).toContain('keyboard-right-001');

      // Verify card advanced
      const newTitle = await discoverPage.getCardTitle();
      expect(newTitle).toContain('Second Event');
    });

    test('should dismiss event when pressing left arrow key', async ({
      page,
      getDismissedEventIds: getFixtureDismissedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'keyboard-left-001', title: 'Keyboard Left Event' }),
        createTestEvent({ id: 'keyboard-left-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Get initial title
      const initialTitle = await discoverPage.getCardTitle();
      expect(initialTitle).toContain('Keyboard Left Event');

      // Press left arrow to dismiss
      await discoverPage.pressArrowLeft();
      await waitForAnimation(page, 500);

      // Verify event was dismissed
      const dismissedEventIds = await getFixtureDismissedEventIds();
      expect(dismissedEventIds).toContain('keyboard-left-001');

      // Verify card advanced
      const newTitle = await discoverPage.getCardTitle();
      expect(newTitle).toContain('Second Event');
    });
  });

  test.describe('Card Tap and Detail View', () => {
    test('should open event detail modal when tapping card', async ({ page }) => {
      const testEvents = [
        createTestEvent({
          id: 'tap-detail-001',
          title: 'Tap Detail Event',
          description: 'Test description for detail view',
        }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Tap the card to open detail modal
      await discoverPage.tapCard();

      // Verify modal is open
      await eventDetailModal.waitForOpen();
      const isOpen = await eventDetailModal.isOpen();
      expect(isOpen).toBe(true);
    });

    test('should display event information in modal', async ({ page }) => {
      const testEvents = [
        createTestEvent({
          id: 'modal-info-001',
          title: 'Modal Info Event',
          description: 'Detailed description for the modal test',
          venue_name: 'Test Venue Hall',
          category: 'music',
          is_free: true,
        }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Open detail modal
      await discoverPage.tapCard();
      await eventDetailModal.waitForOpen();

      // Verify event information is displayed
      const title = await eventDetailModal.getTitle();
      expect(title).toContain('Modal Info Event');

      const description = await eventDetailModal.getDescription();
      expect(description).toContain('Detailed description for the modal test');

      const category = await eventDetailModal.getCategory();
      expect(category.toLowerCase()).toContain('music');
    });

    test('should close modal when clicking X', async ({ page }) => {
      const testEvents = [
        createTestEvent({ id: 'close-modal-001', title: 'Close Modal Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Open detail modal
      await discoverPage.tapCard();
      await eventDetailModal.waitForOpen();

      // Verify modal is open
      expect(await eventDetailModal.isOpen()).toBe(true);

      // Close the modal
      await eventDetailModal.close();
      await eventDetailModal.waitForClose();

      // Verify modal is closed
      expect(await eventDetailModal.isOpen()).toBe(false);
    });

    test('should save event from detail modal', async ({
      page,
      getSavedEventIds: getFixtureSavedEventIds,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'modal-save-001', title: 'Modal Save Event' }),
        createTestEvent({ id: 'modal-save-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Open detail modal
      await discoverPage.tapCard();
      await eventDetailModal.waitForOpen();

      // Click save button in modal (save auto-closes the modal via onSave callback)
      await eventDetailModal.clickSave();
      await waitForAnimation(page, 500);

      // Verify event was saved
      const savedEventIds = await getFixtureSavedEventIds();
      expect(savedEventIds).toContain('modal-save-001');

      // Wait for modal to close (happens automatically after save)
      await eventDetailModal.waitForClose();

      // Verify the saved event is still displayed (save doesn't advance the card stack)
      const title = await discoverPage.getCardTitle();
      expect(title).toContain('Modal Save Event');
    });

    test('should pass event from detail modal', async ({
      page,
    }) => {
      const testEvents = [
        createTestEvent({ id: 'modal-pass-001', title: 'Modal Pass Event' }),
        createTestEvent({ id: 'modal-pass-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Open detail modal
      await discoverPage.tapCard();
      await eventDetailModal.waitForOpen();

      // Click pass button in modal (closes modal without dismissing event)
      await eventDetailModal.clickPass();
      await waitForAnimation(page, 500);

      // Verify modal is closed (pass closes the modal via onPass + onClose callbacks)
      await eventDetailModal.waitForClose();

      // Verify the same event is still displayed (pass from modal doesn't advance the card stack)
      const title = await discoverPage.getCardTitle();
      expect(title).toContain('Modal Pass Event');
    });
  });

  test.describe('End of Stack', () => {
    test('should display "no more events" after swiping all cards', async ({ page }) => {
      // Create a small set of events to swipe through
      const testEvents = [
        createTestEvent({ id: 'end-stack-001', title: 'First Event' }),
        createTestEvent({ id: 'end-stack-002', title: 'Second Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Swipe through all events
      await discoverPage.clickPassButton();
      await waitForAnimation(page, 500);

      await discoverPage.clickPassButton();
      await waitForAnimation(page, 500);

      // Verify empty state is displayed
      const isEmpty = await discoverPage.isEmptyState();
      expect(isEmpty).toBe(true);

      // Verify the empty state message
      const emptyMessage = await discoverPage.getEmptyStateMessage();
      expect(emptyMessage.toLowerCase()).toContain('no more events');
    });

    test('should allow starting over after reaching end of stack', async ({ page }) => {
      const testEvents = [
        createTestEvent({ id: 'start-over-001', title: 'First Event' }),
      ];
      await mockEventsSuccess(page, testEvents);

      await discoverPage.goto();
      await discoverPage.waitForCardsToLoad();

      // Swipe through all events
      await discoverPage.clickPassButton();
      await waitForAnimation(page, 500);

      // Verify empty state
      expect(await discoverPage.isEmptyState()).toBe(true);

      // Click start over button
      await discoverPage.clickStartOver();
      await waitForAnimation(page);

      // Verify cards are visible again
      await discoverPage.waitForCardsToLoad();
      const cardCount = await discoverPage.getVisibleCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Verify first card is showing again
      const title = await discoverPage.getCardTitle();
      expect(title).toContain('First Event');
    });
  });
});
