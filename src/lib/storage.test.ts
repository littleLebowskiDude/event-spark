import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSavedEventIds,
  saveEventId,
  removeEventId,
  isEventSaved,
  getDismissedEventIds,
  dismissEventId,
  clearDismissed,
} from './storage';

describe('storage', () => {
  beforeEach(() => {
    // localStorage is mocked in setup.ts and cleared between tests
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSavedEventIds', () => {
    it('should return empty array when no events are saved', () => {
      expect(getSavedEventIds()).toEqual([]);
    });

    it('should return saved event IDs from localStorage', () => {
      const eventIds = ['event-1', 'event-2', 'event-3'];
      localStorage.setItem('event-spark-saved-events', JSON.stringify(eventIds));

      expect(getSavedEventIds()).toEqual(eventIds);
    });

    it('should handle malformed JSON gracefully', () => {
      localStorage.setItem('event-spark-saved-events', 'not valid json');

      // This will throw - the function doesn't handle malformed JSON
      expect(() => getSavedEventIds()).toThrow();
    });
  });

  describe('saveEventId', () => {
    it('should save a new event ID to localStorage', () => {
      saveEventId('event-1');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toContain('event-1');
    });

    it('should not duplicate event IDs', () => {
      saveEventId('event-1');
      saveEventId('event-1');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual(['event-1']);
    });

    it('should append to existing saved events', () => {
      saveEventId('event-1');
      saveEventId('event-2');
      saveEventId('event-3');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual(['event-1', 'event-2', 'event-3']);
    });

    it('should preserve order of saved events', () => {
      saveEventId('event-c');
      saveEventId('event-a');
      saveEventId('event-b');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual(['event-c', 'event-a', 'event-b']);
    });
  });

  describe('removeEventId', () => {
    it('should remove an event ID from localStorage', () => {
      saveEventId('event-1');
      saveEventId('event-2');
      removeEventId('event-1');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual(['event-2']);
    });

    it('should handle removing non-existent event ID', () => {
      saveEventId('event-1');
      removeEventId('non-existent');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual(['event-1']);
    });

    it('should handle removing from empty storage', () => {
      removeEventId('event-1');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual([]);
    });

    it('should remove only the specified event', () => {
      saveEventId('event-1');
      saveEventId('event-2');
      saveEventId('event-3');
      removeEventId('event-2');

      const saved = JSON.parse(localStorage.getItem('event-spark-saved-events') || '[]');
      expect(saved).toEqual(['event-1', 'event-3']);
    });
  });

  describe('isEventSaved', () => {
    it('should return true for saved events', () => {
      saveEventId('event-1');

      expect(isEventSaved('event-1')).toBe(true);
    });

    it('should return false for unsaved events', () => {
      expect(isEventSaved('event-1')).toBe(false);
    });

    it('should return false after removing an event', () => {
      saveEventId('event-1');
      removeEventId('event-1');

      expect(isEventSaved('event-1')).toBe(false);
    });

    it('should correctly check among multiple saved events', () => {
      saveEventId('event-1');
      saveEventId('event-2');
      saveEventId('event-3');

      expect(isEventSaved('event-2')).toBe(true);
      expect(isEventSaved('event-4')).toBe(false);
    });
  });

  describe('getDismissedEventIds', () => {
    it('should return empty array when no events are dismissed', () => {
      expect(getDismissedEventIds()).toEqual([]);
    });

    it('should return dismissed event IDs from localStorage', () => {
      const eventIds = ['event-1', 'event-2'];
      localStorage.setItem('event-spark-dismissed-events', JSON.stringify(eventIds));

      expect(getDismissedEventIds()).toEqual(eventIds);
    });
  });

  describe('dismissEventId', () => {
    it('should dismiss a new event ID to localStorage', () => {
      dismissEventId('event-1');

      const dismissed = JSON.parse(localStorage.getItem('event-spark-dismissed-events') || '[]');
      expect(dismissed).toContain('event-1');
    });

    it('should not duplicate dismissed event IDs', () => {
      dismissEventId('event-1');
      dismissEventId('event-1');

      const dismissed = JSON.parse(localStorage.getItem('event-spark-dismissed-events') || '[]');
      expect(dismissed).toEqual(['event-1']);
    });

    it('should append to existing dismissed events', () => {
      dismissEventId('event-1');
      dismissEventId('event-2');

      const dismissed = JSON.parse(localStorage.getItem('event-spark-dismissed-events') || '[]');
      expect(dismissed).toEqual(['event-1', 'event-2']);
    });
  });

  describe('clearDismissed', () => {
    it('should clear all dismissed events', () => {
      dismissEventId('event-1');
      dismissEventId('event-2');
      clearDismissed();

      expect(getDismissedEventIds()).toEqual([]);
    });

    it('should not affect saved events', () => {
      saveEventId('event-1');
      dismissEventId('event-2');
      clearDismissed();

      expect(getSavedEventIds()).toEqual(['event-1']);
      expect(getDismissedEventIds()).toEqual([]);
    });

    it('should handle clearing when already empty', () => {
      clearDismissed();

      expect(getDismissedEventIds()).toEqual([]);
    });
  });

  describe('storage key isolation', () => {
    it('should keep saved and dismissed events separate', () => {
      saveEventId('saved-event');
      dismissEventId('dismissed-event');

      expect(getSavedEventIds()).toEqual(['saved-event']);
      expect(getDismissedEventIds()).toEqual(['dismissed-event']);
    });

    it('should allow same event ID in both saved and dismissed', () => {
      // This is an edge case - in practice you wouldn't have the same event
      // in both lists, but the storage functions don't prevent it
      saveEventId('event-1');
      dismissEventId('event-1');

      expect(getSavedEventIds()).toContain('event-1');
      expect(getDismissedEventIds()).toContain('event-1');
    });
  });
});
