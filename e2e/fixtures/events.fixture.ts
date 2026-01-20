/**
 * Event type matching the application's Event interface
 * Simplified version for E2E tests
 */
export type EventCategory =
  | 'music'
  | 'food'
  | 'market'
  | 'art'
  | 'community'
  | 'sport'
  | 'workshop'
  | 'festival'
  | 'other';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  venue_name: string | null;
  category: EventCategory | null;
  ticket_url: string | null;
  is_free: boolean;
  price: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Generates a random UUID for test events
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Factory function to create test events with default values.
 * Override any property by passing it in the overrides object.
 */
export function createTestEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: overrides?.id || generateUUID(),
    title: 'Test Event',
    description: 'A test event description for E2E testing',
    image_url: 'https://picsum.photos/seed/test/400/300',
    start_date: tomorrow.toISOString(),
    end_date: null,
    location: '123 Test Street, Beechworth VIC 3747',
    venue_name: 'Test Venue',
    category: 'community' as EventCategory,
    ticket_url: 'https://example.com/tickets',
    is_free: true,
    price: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    ...overrides,
  };
}

/**
 * Create a valid event for today
 */
export function createTodayEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  // Set to today at 7pm
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    19,
    0,
    0
  );

  return createTestEvent({
    title: 'Event Today',
    start_date: today.toISOString(),
    ...overrides,
  });
}

/**
 * Create a valid event for tomorrow
 */
export function createTomorrowEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    18,
    0,
    0
  );

  return createTestEvent({
    title: 'Event Tomorrow',
    start_date: tomorrow.toISOString(),
    ...overrides,
  });
}

/**
 * Create a paid event
 */
export function createPaidEvent(overrides?: Partial<Event>): Event {
  return createTestEvent({
    title: 'Paid Event',
    is_free: false,
    price: '$25 per person',
    ...overrides,
  });
}

/**
 * Create a past event (should typically be filtered out)
 */
export function createPastEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return createTestEvent({
    title: 'Past Event',
    start_date: pastDate.toISOString(),
    ...overrides,
  });
}

/**
 * Create an event with all fields populated
 */
export function createFullEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return createTestEvent({
    title: 'Full Featured Event',
    description:
      'A comprehensive event with all fields filled out for E2E testing purposes. This includes a longer description to test text truncation and display.',
    image_url: 'https://picsum.photos/seed/full/400/300',
    start_date: tomorrow.toISOString(),
    end_date: dayAfter.toISOString(),
    location: '456 Complete Ave, Beechworth VIC 3747',
    venue_name: 'Grand Venue Hall',
    category: 'festival' as EventCategory,
    ticket_url: 'https://tickets.example.com/full-event',
    is_free: false,
    price: '$50 - $100',
    ...overrides,
  });
}

/**
 * Create a minimal valid event (only required fields)
 */
export function createMinimalEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: overrides?.id || generateUUID(),
    title: 'Minimal Event',
    description: null,
    image_url: null,
    start_date: tomorrow.toISOString(),
    end_date: null,
    location: null,
    venue_name: null,
    category: null,
    ticket_url: null,
    is_free: true,
    price: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    ...overrides,
  };
}

/**
 * Create a list of events for testing pagination/lists
 */
export function createEventList(count: number = 5): Event[] {
  return Array.from({ length: count }, (_, index) =>
    createTestEvent({
      id: `list-event-${index}-${generateUUID()}`,
      title: `Event ${index + 1}`,
    })
  );
}

/**
 * Pre-defined test events for consistent E2E testing
 */
export const TEST_EVENTS = {
  // Basic events
  basic: createTestEvent({
    id: 'e2e-basic-event-001',
    title: 'Basic Test Event',
  }),

  // Today's event
  today: createTodayEvent({
    id: 'e2e-today-event-001',
    title: 'Happening Today',
  }),

  // Tomorrow's event
  tomorrow: createTomorrowEvent({
    id: 'e2e-tomorrow-event-001',
    title: 'Happening Tomorrow',
  }),

  // Paid event
  paid: createPaidEvent({
    id: 'e2e-paid-event-001',
    title: 'Premium Concert',
    price: '$45',
    category: 'music' as EventCategory,
  }),

  // Free event
  free: createTestEvent({
    id: 'e2e-free-event-001',
    title: 'Free Community Gathering',
    is_free: true,
    category: 'community' as EventCategory,
  }),

  // Full featured event
  full: createFullEvent({
    id: 'e2e-full-event-001',
  }),

  // Minimal event
  minimal: createMinimalEvent({
    id: 'e2e-minimal-event-001',
  }),

  // Category-specific events
  music: createTestEvent({
    id: 'e2e-music-event-001',
    title: 'Live Music Night',
    category: 'music' as EventCategory,
  }),

  food: createTestEvent({
    id: 'e2e-food-event-001',
    title: 'Food Festival',
    category: 'food' as EventCategory,
  }),

  market: createTestEvent({
    id: 'e2e-market-event-001',
    title: 'Farmers Market',
    category: 'market' as EventCategory,
  }),

  art: createTestEvent({
    id: 'e2e-art-event-001',
    title: 'Art Exhibition',
    category: 'art' as EventCategory,
  }),

  workshop: createTestEvent({
    id: 'e2e-workshop-event-001',
    title: 'Pottery Workshop',
    category: 'workshop' as EventCategory,
    is_free: false,
    price: '$30',
  }),

  festival: createTestEvent({
    id: 'e2e-festival-event-001',
    title: 'Summer Festival',
    category: 'festival' as EventCategory,
  }),

  sport: createTestEvent({
    id: 'e2e-sport-event-001',
    title: 'Community Fun Run',
    category: 'sport' as EventCategory,
  }),
} as const;

/**
 * Get a list of default test events for mocking API responses
 */
export function getDefaultTestEvents(): Event[] {
  return [
    TEST_EVENTS.basic,
    TEST_EVENTS.today,
    TEST_EVENTS.paid,
    TEST_EVENTS.free,
    TEST_EVENTS.music,
    TEST_EVENTS.food,
    TEST_EVENTS.market,
  ];
}

/**
 * Get events by category
 */
export function getEventsByCategory(category: EventCategory): Event[] {
  return Object.values(TEST_EVENTS).filter(
    (event) => event.category === category
  );
}
