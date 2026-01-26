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
