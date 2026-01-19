const SAVED_EVENTS_KEY = 'event-spark-saved-events';
const DISMISSED_EVENTS_KEY = 'event-spark-dismissed-events';

export function getSavedEventIds(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(SAVED_EVENTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveEventId(eventId: string): void {
  const saved = getSavedEventIds();
  if (!saved.includes(eventId)) {
    saved.push(eventId);
    localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(saved));
  }
}

export function removeEventId(eventId: string): void {
  const saved = getSavedEventIds();
  const filtered = saved.filter(id => id !== eventId);
  localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(filtered));
}

export function isEventSaved(eventId: string): boolean {
  return getSavedEventIds().includes(eventId);
}

export function getDismissedEventIds(): string[] {
  if (typeof window === 'undefined') return [];
  const dismissed = localStorage.getItem(DISMISSED_EVENTS_KEY);
  return dismissed ? JSON.parse(dismissed) : [];
}

export function dismissEventId(eventId: string): void {
  const dismissed = getDismissedEventIds();
  if (!dismissed.includes(eventId)) {
    dismissed.push(eventId);
    localStorage.setItem(DISMISSED_EVENTS_KEY, JSON.stringify(dismissed));
  }
}

export function clearDismissed(): void {
  localStorage.removeItem(DISMISSED_EVENTS_KEY);
}
