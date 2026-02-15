const SAVED_EVENTS_KEY = 'event-spark-saved-events';
const DISMISSED_EVENTS_KEY = 'event-spark-dismissed-events';

export function getSavedEventIds(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(SAVED_EVENTS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(SAVED_EVENTS_KEY);
    return [];
  }
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
  if (!dismissed) return [];
  try {
    return JSON.parse(dismissed);
  } catch {
    localStorage.removeItem(DISMISSED_EVENTS_KEY);
    return [];
  }
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

// ============================================================================
// Demo Mode Override
// ============================================================================

const DEMO_MODE_OVERRIDE_KEY = 'event-spark-demo-mode-override';

export function getDemoModeOverride(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_MODE_OVERRIDE_KEY) === 'true';
}

export function setDemoModeOverride(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    localStorage.setItem(DEMO_MODE_OVERRIDE_KEY, 'true');
  } else {
    localStorage.removeItem(DEMO_MODE_OVERRIDE_KEY);
  }
}
