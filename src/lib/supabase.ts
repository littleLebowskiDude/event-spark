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
    // Real upcoming events — Beechworth & North East Victoria
    {
      id: 'demo-event-004',
      title: 'Chiltern Community Market',
      description: 'A fun day out for all the family with a variety of local artisan stalls, foods and coffee, and activities to keep the kids entertained. Browse stalls for hidden treasures while listening to local musicians, then explore the historic streetscape of Chiltern.',
      image_url: 'https://picsum.photos/seed/chilternmarket/800/600',
      start_date: '2026-03-01T08:00:00.000Z',
      end_date: '2026-03-01T13:00:00.000Z',
      location: 'Main Street, Chiltern VIC 3683',
      venue_name: 'Chiltern Tourist Park',
      category: 'market',
      ticket_url: null,
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-005',
      title: 'Brighter Days Festival',
      description: 'A three-day family-friendly fundraising festival held on the Labour Day weekend in Bright. Featuring live music, silent disco, car and bike show \'n\' shine, kids\' activities, rides, the Amazing Chase, and a family bike ride. All proceeds support children\'s charities fighting Epidermolysis Bullosa and SUDC.',
      image_url: 'https://picsum.photos/seed/brighterdays/800/600',
      start_date: '2026-03-06T07:00:00.000Z',
      end_date: '2026-03-08T17:00:00.000Z',
      location: 'Coronation Avenue, Bright VIC 3741',
      venue_name: 'Pioneer Park Recreation Reserve',
      category: 'festival',
      ticket_url: 'https://www.brighterdays.org.au',
      is_free: false,
      price: 'See website for tickets',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-006',
      title: 'Tastes of Rutherglen 2026',
      description: 'A weekend-long wine and food festival showcasing the best of Rutherglen wine country. Your festival pass unlocks 19 cellar doors with perfectly paired regional cuisine, masterclasses, live music, wine blending workshops, and specialty tastings. Designated drivers enter free.',
      image_url: 'https://picsum.photos/seed/rutherglen/800/600',
      start_date: '2026-03-06T10:00:00.000Z',
      end_date: '2026-03-08T17:00:00.000Z',
      location: 'Rutherglen Wine Region, VIC',
      venue_name: 'Rutherglen Wineries',
      category: 'food',
      ticket_url: 'https://www.explorerutherglen.com.au',
      is_free: false,
      price: '$40',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-007',
      title: 'Beechworth Biennale 2026',
      description: 'An exciting contemporary art event held throughout the streets of Beechworth. Over three days, experience thought-provoking art on display during the day and at several sites open after dark. Guest speaker Myles Russell-Cook, Artistic Director of ACCA, will be in attendance. Free entry, family friendly, and accessible.',
      image_url: 'https://picsum.photos/seed/biennale/800/600',
      start_date: '2026-03-07T10:00:00.000Z',
      end_date: '2026-03-09T17:00:00.000Z',
      location: 'Various locations, Beechworth VIC 3747',
      venue_name: 'Beechworth Town Centre',
      category: 'art',
      ticket_url: 'https://beechworthbiennale.com.au',
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-008',
      title: 'Mansfield Pottery Festival',
      description: 'An annual celebration of ceramics on the Labour Day weekend. Browse over 50 pottery stalls from Victorian and interstate potters in the High Street, enjoy the Poets of Pottery exhibition, hands-on workshops for all skill levels, live demonstrations, and the Potters Dinner.',
      image_url: 'https://picsum.photos/seed/pottery/800/600',
      start_date: '2026-03-07T09:00:00.000Z',
      end_date: '2026-03-10T16:00:00.000Z',
      location: 'High Street, Mansfield VIC 3722',
      venue_name: 'Mansfield High Street',
      category: 'workshop',
      ticket_url: 'https://madpotters.org.au/mansfield-pottery-festival/',
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-009',
      title: 'The High Country Hop 2026',
      description: 'Bridge Road Brewers\' famed harvest beer and music festival returns to Beechworth for its 11th year. Taste the freshest ales made with locally sourced hops, discover regional winemakers and distillers, enjoy next-level food, and catch live music from Floodlights, Joey Lightbulb, Public Figures, and more. Family-friendly and all-ages.',
      image_url: 'https://picsum.photos/seed/highcountryhop/800/600',
      start_date: '2026-03-27T16:00:00.000Z',
      end_date: '2026-03-29T23:00:00.000Z',
      location: 'Ford Street, Beechworth VIC 3747',
      venue_name: 'Beechworth Historic Precinct Reserve',
      category: 'food',
      ticket_url: 'https://thehighcountryhop.com.au',
      is_free: false,
      price: 'See website for tickets',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-010',
      title: 'Beechworth Golden Horseshoes Festival',
      description: 'The biggest festival on the Beechworth calendar, held over the Easter long weekend. Celebrating the 1855 legend of Daniel Cameron\'s golden-shod horse, the festival features a Grand Parade, Easter Egg Hunt, fun-run, night market, vintage car Show & Shine, Echoes of History walking tour, Easter Carnival, and the Rotary Easter Saturday Market with 120+ stalls.',
      image_url: 'https://picsum.photos/seed/goldenhorseshoes/800/600',
      start_date: '2026-04-03T09:00:00.000Z',
      end_date: '2026-04-06T17:00:00.000Z',
      location: 'Ford Street, Beechworth VIC 3747',
      venue_name: 'Beechworth Town Centre',
      category: 'festival',
      ticket_url: 'https://www.beechworthgoldenhorseshoes.com.au',
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-011',
      title: 'Easter Saturday Market — Rotary Beechworth',
      description: 'The Rotary Club of Beechworth brings another fantastic Easter Saturday Market to Queen Victoria Park, held under the shade of the old pine trees. Around 120 great stalls offering arts and crafts, food and drinks, jewellery, clothing, and bric-a-brac — part of the Golden Horseshoes Festival weekend.',
      image_url: 'https://picsum.photos/seed/eastermarket/800/600',
      start_date: '2026-04-04T08:00:00.000Z',
      end_date: '2026-04-04T15:00:00.000Z',
      location: 'Queen Victoria Park, Beechworth VIC 3747',
      venue_name: 'Queen Victoria Park',
      category: 'market',
      ticket_url: null,
      is_free: true,
      price: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-012',
      title: 'Beechworth Granite Classic 2026',
      description: 'Australia\'s favourite gravel cycling event — a three-day festival of epic rides, live music, and community spirit in the High Country. Choose from 115km, 90km, 45km, or 15km courses through the stunning dirt roads surrounding Beechworth. Hosted by Bridge Road Brewers with a Gravel Expo, Carpark Party, and Club Granite afterparty.',
      image_url: 'https://picsum.photos/seed/graniteclassic/800/600',
      start_date: '2026-04-17T07:00:00.000Z',
      end_date: '2026-04-19T12:00:00.000Z',
      location: 'Ford Street, Beechworth VIC 3747',
      venue_name: 'Beechworth Historic Precinct Reserve',
      category: 'sport',
      ticket_url: 'https://events.humanitix.com/beechworth-granite-classic-2026',
      is_free: false,
      price: 'See website for tickets',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-013',
      title: 'Beechworth Drive Back In Time',
      description: 'A wonderful display of over 250 vintage and classic cars, motorcycles, and engines — all must be over 25 years old. The weekend kicks off with a welcome BBQ and tractor trek on Saturday, followed by the main static display on Ford Street on Sunday. The Beechworth Old Cranks Motor Club also runs the historic Crossley Engine in Wallace Park at midday.',
      image_url: 'https://picsum.photos/seed/drivebackintime/800/600',
      start_date: '2026-05-03T08:00:00.000Z',
      end_date: '2026-05-03T16:00:00.000Z',
      location: 'Ford Street, Beechworth VIC 3747',
      venue_name: 'Ford Street & Police Paddocks',
      category: 'community',
      ticket_url: null,
      is_free: true,
      price: 'Gold coin donation',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-014',
      title: 'Learn to Dance — Beechworth',
      description: 'A fun-filled weekly dance evening for all ages at the Beechworth Senior Citizens Hall. New Vogue, Ballroom, and Latin styles covered across three sessions: absolute beginners at 6:30pm, beginners at 7:15pm, and intermediate with social dancing from 8:00pm.',
      image_url: 'https://picsum.photos/seed/dancenights/800/600',
      start_date: nextWeek.toISOString(),
      end_date: null,
      location: 'Senior Citizens Hall, Beechworth VIC 3747',
      venue_name: 'Beechworth Senior Citizens Hall',
      category: 'community',
      ticket_url: null,
      is_free: false,
      price: 'Contact for details',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo-event-015',
      title: 'AsylumFest 2026',
      description: 'A three-day horror book and pop culture festival set inside the eerie halls of Mayday Hills, Beechworth\'s historic 1800s psychiatric facility. Features a horror film night, ghost story competition, book sales and author signings, tabletop gaming, SFX makeup workshops, horror prop making, ghost tours, and collectible oddities.',
      image_url: 'https://picsum.photos/seed/asylumfest/800/600',
      start_date: '2026-10-23T10:00:00.000Z',
      end_date: '2026-10-25T17:00:00.000Z',
      location: 'Mayday Hills, Beechworth VIC 3747',
      venue_name: 'Mayday Hills',
      category: 'festival',
      ticket_url: 'https://www.asylumfest.com.au',
      is_free: true,
      price: 'Free entry (some ticketed evening events)',
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
  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
    const now = new Date();
    const events = getDemoEvents()
      .filter((e) => new Date(e.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return ok(events);
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

  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
    const events = getDemoEvents();
    const event = events.find((e) => e.id === id);
    if (!event) {
      return err(new NotFoundError('Event', id));
    }
    return ok(event);
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

  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
    const events = getDemoEvents()
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return ok(events);
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
  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
    const events = getDemoEvents();
    return ok(events.sort((a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ));
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
  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
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

  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
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

  // Use demo storage in E2E demo mode or when Supabase is not configured
  if (isE2EDemoMode() || !isSupabaseConfigured()) {
    const events = getDemoEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return err(new NotFoundError('Event', id));
    }

    events.splice(index, 1);
    saveDemoEvents(events);
    return ok(true);
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
