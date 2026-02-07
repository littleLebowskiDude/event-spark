import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Event, CreateEventInput, UpdateEventInput } from './types';
import { isE2EDemoMode } from './env';

// ============================================================================
// Error Types
// ============================================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Result Types for Better Error Handling
// ============================================================================

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// ============================================================================
// Supabase Client Setup
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Placeholder URL for build-time when env vars are not set
// This allows the build to complete without real credentials
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key-for-build';

// Validate environment variables at startup (only warn, don't fail)
const isMissingConfig = !supabaseUrl || !supabaseAnonKey;
if (isMissingConfig && typeof window !== 'undefined') {
  console.warn(
    '[Event Spark] Supabase environment variables not configured. ' +
    'Running in demo mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for production.'
  );
}

// Use placeholder values during build if not configured
// This prevents build failures while maintaining type safety
export const supabase = createClient<Database>(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseAnonKey || PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// ============================================================================
// E2E Demo Mode Storage
// Uses localStorage for event storage during E2E tests
// ============================================================================

const DEMO_EVENTS_KEY = 'demo_events_storage';

/**
 * Generate a UUID for demo events
 */
function generateDemoUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get seed events for demo mode
 */
function getSeedDemoEvents(): Event[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'demo-event-001',
      title: 'Community Market Day',
      description: 'Join us for a local market featuring fresh produce, handmade crafts, and live entertainment.',
      image_url: 'https://picsum.photos/seed/market/800/600',
      start_date: tomorrow.toISOString(),
      end_date: null,
      location: 'Town Square, Beechworth VIC 3747',
      venue_name: 'Beechworth Town Square',
      category: 'market',
      ticket_url: null,
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-002',
      title: 'Live Jazz Night',
      description: 'An evening of smooth jazz with local and touring musicians.',
      image_url: 'https://picsum.photos/seed/jazz/800/600',
      start_date: nextWeek.toISOString(),
      end_date: null,
      location: '45 Ford Street, Beechworth VIC 3747',
      venue_name: 'The Bridge Hotel',
      category: 'music',
      ticket_url: 'https://example.com/jazz-night',
      is_free: false,
      price: '$25',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-003',
      title: 'Art Workshop: Watercolors',
      description: 'Learn watercolor painting techniques in this beginner-friendly workshop.',
      image_url: 'https://picsum.photos/seed/art/800/600',
      start_date: nextMonth.toISOString(),
      end_date: null,
      location: '12 Camp Street, Beechworth VIC 3747',
      venue_name: 'Beechworth Arts Center',
      category: 'workshop',
      ticket_url: 'https://example.com/workshop',
      is_free: false,
      price: '$45',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    // Real upcoming events (Feb/Mar 2026)
    {
      id: 'demo-event-004',
      title: 'Noise Pop Festival 2026',
      description: 'The 33rd annual Noise Pop Festival returns to San Francisco — a multi-venue celebration of independent music, film, and arts across the Bay Area. Dozens of acts perform at intimate venues throughout the city.',
      image_url: 'https://picsum.photos/seed/noisepop/800/600',
      start_date: '2026-02-19T18:00:00.000Z',
      end_date: '2026-03-01T23:59:00.000Z',
      location: 'Various Venues, San Francisco, CA',
      venue_name: 'Multiple Venues',
      category: 'music',
      ticket_url: 'https://noisepopfest.com',
      is_free: false,
      price: '$35–$75',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-005',
      title: 'South Beach Wine & Food Festival',
      description: 'A star-studded culinary festival featuring celebrity chefs, gourmet tastings, wine, spirits, and beachside parties. Highlights include lobster rolls, truffle-infused bites, and Southern-inspired comfort food paired with fine wine and craft cocktails.',
      image_url: 'https://picsum.photos/seed/sobewff/800/600',
      start_date: '2026-02-19T11:00:00.000Z',
      end_date: '2026-02-22T23:00:00.000Z',
      location: 'Miami Beach, FL',
      venue_name: 'Miami Beach Convention Center',
      category: 'food',
      ticket_url: 'https://sobewff.org',
      is_free: false,
      price: '$150–$500',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-006',
      title: 'Austin Marathon 2026',
      description: 'One of the top destination marathons in the US, featuring a marathon, half marathon, and 5K through the heart of Austin. The scenic course winds past the Texas State Capitol, Lady Bird Lake, and vibrant East Austin neighborhoods.',
      image_url: 'https://picsum.photos/seed/austinrun/800/600',
      start_date: '2026-02-15T07:00:00.000Z',
      end_date: '2026-02-15T14:00:00.000Z',
      location: 'Austin, TX',
      venue_name: 'Downtown Austin Start Line',
      category: 'sport',
      ticket_url: 'https://youraustinmarathon.com',
      is_free: false,
      price: '$75–$170',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-007',
      title: 'Outer Sunset Lunar New Year Night Market',
      description: 'A free, all-ages night market packed with top local food vendors, live music, cultural performances, interactive activities, artisan makers, and a vibrant community atmosphere inspired by night markets across Asia.',
      image_url: 'https://picsum.photos/seed/lunarmarket/800/600',
      start_date: '2026-02-27T17:00:00.000Z',
      end_date: '2026-02-27T22:00:00.000Z',
      location: 'Outer Sunset, San Francisco, CA',
      venue_name: 'Outer Sunset Neighborhood',
      category: 'market',
      ticket_url: null,
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-008',
      title: 'Montreux Jazz Festival Miami',
      description: 'The legendary Montreux Jazz Festival makes its Miami debut at The Hangar at Regatta Grove in Coconut Grove. Headliners include Nile Rodgers with CHIC, six-time Grammy-winning band TOTO, and Colombian electro-tropical group Bomba Estéreo.',
      image_url: 'https://picsum.photos/seed/montreuxmiami/800/600',
      start_date: '2026-02-27T19:00:00.000Z',
      end_date: '2026-03-01T23:00:00.000Z',
      location: 'Coconut Grove, Miami, FL',
      venue_name: 'The Hangar at Regatta Grove',
      category: 'music',
      ticket_url: 'https://montreuxjazzfestival.com',
      is_free: false,
      price: '$85–$250',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-009',
      title: 'Florida Strawberry Festival',
      description: 'An 11-day community celebration of the strawberry harvest. More than 650,000 visitors enjoy headline entertainment, livestock shows, exhibits, parades, contests, midway rides, and of course delicious strawberry shortcake.',
      image_url: 'https://picsum.photos/seed/berryfest/800/600',
      start_date: '2026-02-26T10:00:00.000Z',
      end_date: '2026-03-08T22:00:00.000Z',
      location: '303 BerryFest Place, Plant City, FL 33563',
      venue_name: 'Florida Strawberry Festival Grounds',
      category: 'festival',
      ticket_url: 'https://flstrawberryfestival.com',
      is_free: false,
      price: '$15',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-010',
      title: 'Charleston Wine + Food Festival',
      description: 'Now in its 21st year, this five-day festival brings together top chefs, winemakers, authors, artisans, and experts from around the world for master classes, parties, specialty dinners, and tasting events celebrating Southern cuisine.',
      image_url: 'https://picsum.photos/seed/charlestonwine/800/600',
      start_date: '2026-02-23T11:00:00.000Z',
      end_date: '2026-03-01T22:00:00.000Z',
      location: 'Charleston, SC',
      venue_name: 'Marion Square & Various Venues',
      category: 'food',
      ticket_url: 'https://charlestonwineandfood.com',
      is_free: false,
      price: '$50–$350',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-011',
      title: 'Matisse\'s Jazz: Rhythms in Color',
      description: 'A major exhibition at the Art Institute of Chicago exploring Henri Matisse\'s iconic Jazz series — vibrant cut-outs created between 1943 and 1947. The show features the complete portfolio of 20 prints alongside preparatory works and related paintings.',
      image_url: 'https://picsum.photos/seed/matissejazz/800/600',
      start_date: '2026-03-07T10:00:00.000Z',
      end_date: '2026-06-01T17:00:00.000Z',
      location: '111 S Michigan Ave, Chicago, IL 60603',
      venue_name: 'Art Institute of Chicago',
      category: 'art',
      ticket_url: 'https://www.artic.edu/exhibitions',
      is_free: false,
      price: '$25',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-012',
      title: 'On the Flip Side — Public Art Fund',
      description: 'A free public art exhibition on JCDecaux bus shelters in NYC, Chicago, and Boston, featuring works by six visionary photographers. Accessible to all, the series transforms everyday urban spaces into open-air galleries.',
      image_url: 'https://picsum.photos/seed/publicart/800/600',
      start_date: '2026-02-04T00:00:00.000Z',
      end_date: '2026-04-05T23:59:00.000Z',
      location: 'Bus Shelters — New York, Chicago, Boston',
      venue_name: 'JCDecaux Bus Shelters',
      category: 'art',
      ticket_url: 'https://www.publicartfund.org',
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-013',
      title: 'Okeechobee Music Festival 2026',
      description: 'Okeechobee returns after a three-year break for its 10th anniversary — a four-day camping festival at Sunshine Grove in south Florida. Headliners include Fisher, GRiZ (two sets), T-Pain, and The Lumineers.',
      image_url: 'https://picsum.photos/seed/okeechobee/800/600',
      start_date: '2026-03-19T12:00:00.000Z',
      end_date: '2026-03-22T23:59:00.000Z',
      location: 'Sunshine Grove, Okeechobee, FL',
      venue_name: 'Sunshine Grove',
      category: 'festival',
      ticket_url: 'https://okeechobeefest.com',
      is_free: false,
      price: '$249–$599',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-014',
      title: 'Oregon Chocolate Festival',
      description: 'This year\'s theme is "From Bean To Boss: The Power Of Chocolate," highlighting the women shaping the chocolate world. Enjoy an artisan marketplace, chocolate competitions, chocolate brunch, cocoa-and-cocktails, and wine dinners.',
      image_url: 'https://picsum.photos/seed/chocfest/800/600',
      start_date: '2026-03-04T10:00:00.000Z',
      end_date: '2026-03-08T18:00:00.000Z',
      location: 'Ashland, OR',
      venue_name: 'Ashland Hills Hotel & Suites',
      category: 'food',
      ticket_url: 'https://oregonchocolatefestival.com',
      is_free: false,
      price: '$20–$85',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-015',
      title: 'Gasparilla Distance Classic',
      description: 'A festive weekend of running in Tampa featuring a half marathon, 15K, 8K, and 5K. Four distances and four challenge combinations make this one of Florida\'s most popular running events, all set against Tampa\'s waterfront.',
      image_url: 'https://picsum.photos/seed/gasparilla/800/600',
      start_date: '2026-02-21T06:30:00.000Z',
      end_date: '2026-02-22T13:00:00.000Z',
      location: 'Tampa, FL',
      venue_name: 'Bayshore Boulevard',
      category: 'sport',
      ticket_url: 'https://rungasparilla.com',
      is_free: false,
      price: '$45–$120',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-016',
      title: 'Gem & Jam Festival 2026',
      description: 'The beloved Gem & Jam Festival returns to the Sonoran Desert with more than 50 artists, a massive gem and mineral show, live art installations, and wellness workshops. A unique fusion of music, geology, and community.',
      image_url: 'https://picsum.photos/seed/gemandjam/800/600',
      start_date: '2026-02-06T14:00:00.000Z',
      end_date: '2026-02-08T23:59:00.000Z',
      location: 'Pima County Fairgrounds, Tucson, AZ',
      venue_name: 'Pima County Fairgrounds',
      category: 'festival',
      ticket_url: 'https://gemandjamfestival.com',
      is_free: false,
      price: '$179–$399',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];
}

/**
 * Get demo events from localStorage (or seed if empty)
 */
function getDemoEvents(): Event[] {
  if (typeof window === 'undefined') {
    return getSeedDemoEvents();
  }

  const stored = localStorage.getItem(DEMO_EVENTS_KEY);
  if (!stored) {
    const seedEvents = getSeedDemoEvents();
    localStorage.setItem(DEMO_EVENTS_KEY, JSON.stringify(seedEvents));
    return seedEvents;
  }

  try {
    return JSON.parse(stored);
  } catch {
    const seedEvents = getSeedDemoEvents();
    localStorage.setItem(DEMO_EVENTS_KEY, JSON.stringify(seedEvents));
    return seedEvents;
  }
}

/**
 * Save demo events to localStorage
 */
function saveDemoEvents(events: Event[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_EVENTS_KEY, JSON.stringify(events));
}

/**
 * Check if Supabase is properly configured.
 * Useful for conditional rendering in components.
 */
export function checkSupabaseConfig(): { configured: boolean; message?: string } {
  if (!supabaseUrl) {
    return {
      configured: false,
      message: 'NEXT_PUBLIC_SUPABASE_URL is not set',
    };
  }
  if (!supabaseAnonKey) {
    return {
      configured: false,
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set',
    };
  }
  return { configured: true };
}

// ============================================================================
// Event Queries with Proper Error Handling
// ============================================================================

/**
 * Fetch upcoming events (start_date >= now), ordered by date ascending.
 * Returns a Result type for explicit error handling.
 */
export async function getEvents(): Promise<Result<Event[], DatabaseError>> {
  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const now = new Date();
    const events = getDemoEvents()
      .filter((e) => new Date(e.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return ok(events);
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return err(new DatabaseError(
        'Failed to fetch events',
        error.code,
        error.message
      ));
    }

    return ok(data || []);
  } catch (e) {
    console.error('Unexpected error fetching events:', e);
    return err(new DatabaseError('An unexpected error occurred while fetching events'));
  }
}

/**
 * Fetch a single event by ID.
 * Returns a Result type with NotFoundError if event doesn't exist.
 */
export async function getEventById(id: string): Promise<Result<Event, DatabaseError | NotFoundError>> {
  if (!id) {
    return err(new ValidationError('Event ID is required', 'id') as unknown as DatabaseError);
  }

  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const events = getDemoEvents();
    const event = events.find((e) => e.id === id);
    if (!event) {
      return err(new NotFoundError('Event', id));
    }
    return ok(event);
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 = no rows returned
      if (error.code === 'PGRST116') {
        return err(new NotFoundError('Event', id));
      }
      console.error('Error fetching event:', error);
      return err(new DatabaseError(
        'Failed to fetch event',
        error.code,
        error.message
      ));
    }

    if (!data) {
      return err(new NotFoundError('Event', id));
    }

    return ok(data);
  } catch (e) {
    console.error('Unexpected error fetching event:', e);
    return err(new DatabaseError('An unexpected error occurred while fetching the event'));
  }
}

/**
 * Fetch multiple events by their IDs.
 * Useful for fetching saved events from local storage.
 */
export async function getEventsByIds(ids: string[]): Promise<Result<Event[], DatabaseError>> {
  if (ids.length === 0) {
    return ok([]);
  }

  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const events = getDemoEvents()
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return ok(events);
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', ids)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events by IDs:', error);
      return err(new DatabaseError(
        'Failed to fetch events',
        error.code,
        error.message
      ));
    }

    return ok(data || []);
  } catch (e) {
    console.error('Unexpected error fetching events by IDs:', e);
    return err(new DatabaseError('An unexpected error occurred while fetching events'));
  }
}

/**
 * Fetch all events (including past events), ordered by date ascending.
 * Used for admin dashboard.
 */
export async function getAllEvents(): Promise<Result<Event[], DatabaseError>> {
  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const events = getDemoEvents();
    return ok(events.sort((a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ));
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching all events:', error);
      return err(new DatabaseError(
        'Failed to fetch events',
        error.code,
        error.message
      ));
    }

    return ok(data || []);
  } catch (e) {
    console.error('Unexpected error fetching all events:', e);
    return err(new DatabaseError('An unexpected error occurred while fetching events'));
  }
}

/**
 * Create a new event.
 * Returns the created event on success.
 */
export async function createEvent(
  event: CreateEventInput
): Promise<Result<Event, DatabaseError | ValidationError>> {
  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const now = new Date().toISOString();
    const newEvent: Event = {
      id: generateDemoUUID(),
      title: event.title,
      description: event.description || null,
      image_url: event.image_url || null,
      start_date: event.start_date,
      end_date: event.end_date || null,
      location: event.location || null,
      venue_name: event.venue_name || null,
      category: event.category || null,
      ticket_url: event.ticket_url || null,
      is_free: event.is_free ?? true,
      price: event.price || null,
      created_at: now,
      updated_at: now,
    };

    const events = getDemoEvents();
    events.push(newEvent);
    saveDemoEvents(events);
    return ok(newEvent);
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);

      // Handle specific constraint violations
      if (error.code === '23505') {
        return err(new ValidationError('An event with this information already exists'));
      }

      return err(new DatabaseError(
        'Failed to create event',
        error.code,
        error.message
      ));
    }

    if (!data) {
      return err(new DatabaseError('Failed to create event - no data returned'));
    }

    return ok(data);
  } catch (e) {
    console.error('Unexpected error creating event:', e);
    return err(new DatabaseError('An unexpected error occurred while creating the event'));
  }
}

/**
 * Update an existing event.
 * Returns the updated event on success.
 */
export async function updateEvent(
  id: string,
  event: UpdateEventInput
): Promise<Result<Event, DatabaseError | NotFoundError | ValidationError>> {
  if (!id) {
    return err(new ValidationError('Event ID is required', 'id'));
  }

  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const events = getDemoEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return err(new NotFoundError('Event', id));
    }

    const updatedEvent: Event = {
      ...events[index],
      ...event,
      updated_at: new Date().toISOString(),
    };
    events[index] = updatedEvent;
    saveDemoEvents(events);
    return ok(updatedEvent);
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .update({ ...event, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // PGRST116 = no rows returned (event not found)
      if (error.code === 'PGRST116') {
        return err(new NotFoundError('Event', id));
      }

      console.error('Error updating event:', error);
      return err(new DatabaseError(
        'Failed to update event',
        error.code,
        error.message
      ));
    }

    if (!data) {
      return err(new NotFoundError('Event', id));
    }

    return ok(data);
  } catch (e) {
    console.error('Unexpected error updating event:', e);
    return err(new DatabaseError('An unexpected error occurred while updating the event'));
  }
}

/**
 * Delete an event by ID.
 * Returns true on success.
 */
export async function deleteEvent(id: string): Promise<Result<boolean, DatabaseError | NotFoundError>> {
  if (!id) {
    return err(new ValidationError('Event ID is required', 'id') as unknown as DatabaseError);
  }

  // Use demo storage in E2E demo mode
  if (isE2EDemoMode()) {
    const events = getDemoEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return err(new NotFoundError('Event', id));
    }

    events.splice(index, 1);
    saveDemoEvents(events);
    return ok(true);
  }

  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  try {
    // First check if the event exists
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return err(new NotFoundError('Event', id));
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return err(new DatabaseError(
        'Failed to delete event',
        error.code,
        error.message
      ));
    }

    return ok(true);
  } catch (e) {
    console.error('Unexpected error deleting event:', e);
    return err(new DatabaseError('An unexpected error occurred while deleting the event'));
  }
}
