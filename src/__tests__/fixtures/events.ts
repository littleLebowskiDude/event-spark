import type { Event, EventCategory } from '@/lib/types';

/**
 * Factory function to create test events with default values.
 * Override any property by passing it in the overrides object.
 */
export function createTestEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: 'test-event-' + Math.random().toString(36).substring(7),
    title: 'Test Event',
    description: 'A test event description',
    image_url: 'https://example.com/image.jpg',
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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0);

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
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0, 0);

  return createTestEvent({
    title: 'Event Tomorrow',
    start_date: tomorrow.toISOString(),
    ...overrides,
  });
}

/**
 * Create a past event
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
 * Create an event with all fields populated
 */
export function createFullEvent(overrides?: Partial<Event>): Event {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return createTestEvent({
    title: 'Full Featured Event',
    description: 'A comprehensive event with all fields filled out for testing purposes.',
    image_url: 'https://example.com/full-event-image.jpg',
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
    id: 'minimal-event-' + Math.random().toString(36).substring(7),
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
 * Collection of events for testing list views
 */
export function createEventList(count: number = 5): Event[] {
  return Array.from({ length: count }, (_, index) =>
    createTestEvent({
      id: `list-event-${index}`,
      title: `Event ${index + 1}`,
    })
  );
}

/**
 * Events organized by category for category testing
 */
export const categoryEvents: Record<EventCategory, Event> = {
  music: createTestEvent({ id: 'music-event', title: 'Music Festival', category: 'music' }),
  food: createTestEvent({ id: 'food-event', title: 'Food Fair', category: 'food' }),
  market: createTestEvent({ id: 'market-event', title: 'Farmers Market', category: 'market' }),
  art: createTestEvent({ id: 'art-event', title: 'Art Exhibition', category: 'art' }),
  community: createTestEvent({ id: 'community-event', title: 'Community Meetup', category: 'community' }),
  sport: createTestEvent({ id: 'sport-event', title: 'Sports Day', category: 'sport' }),
  workshop: createTestEvent({ id: 'workshop-event', title: 'Craft Workshop', category: 'workshop' }),
  festival: createTestEvent({ id: 'festival-event', title: 'Town Festival', category: 'festival' }),
  other: createTestEvent({ id: 'other-event', title: 'Other Event', category: 'other' }),
};

/**
 * Invalid event data for validation testing
 */
export const invalidEventData = {
  emptyTitle: { title: '' },
  longTitle: { title: 'A'.repeat(201) },
  longDescription: { description: 'B'.repeat(5001) },
  invalidImageUrl: { image_url: 'not-a-url' },
  invalidTicketUrl: { ticket_url: 'also-not-a-url' },
  invalidStartDate: { start_date: 'invalid-date' },
  endBeforeStart: (startDate: string) => ({
    start_date: startDate,
    end_date: new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
  }),
  paidWithoutPrice: { is_free: false, price: null },
};
