/**
 * E2E Test Utilities
 *
 * Re-exports all utilities for convenient importing:
 * import { waitForAnimation, mockEventsSuccess, getSavedEventIds } from '../utils';
 */

// Storage helpers
export {
  getSavedEventIds,
  getDismissedEventIds,
  setSavedEventIds,
  setDismissedEventIds,
  addSavedEventId,
  removeSavedEventId,
  addDismissedEventId,
  clearAllStorage,
  clearSavedEvents,
  clearDismissedEvents,
  isEventSaved,
  isEventDismissed,
  getStorageSnapshot,
  STORAGE_KEYS,
} from './storage-helpers';

// Test helpers
export {
  waitForAnimation,
  waitForAnimationsToSettle,
  simulateSwipeRight,
  simulateSwipeLeft,
  simulateSwipeUp,
  simulateSwipeDown,
  simulateTap,
  simulateLongPress,
  waitForElementStable,
  scrollIntoViewAndWait,
  takeDebugScreenshot,
  waitForNetworkIdle,
  getComputedStyle,
  hasClass,
  DEFAULT_ANIMATION_DURATION,
  SWIPE_THRESHOLD,
} from './test-helpers';

// API mocks
export {
  mockEventsSuccess,
  mockEventsError,
  mockEmptyEvents,
  mockNetworkError,
  mockEventsTimeout,
  mockSlowEventsResponse,
  mockEventsNotFound,
  mockEventsUnauthorized,
  mockEventsRateLimited,
  clearEventMocks,
  mockEventsConditional,
  captureEventRequests,
  waitForEventRequest,
  waitForEventResponse,
} from './api-mocks';
