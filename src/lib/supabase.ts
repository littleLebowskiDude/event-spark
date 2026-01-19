import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Event, CreateEventInput, UpdateEventInput } from './types';

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
  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  if (!id) {
    return err(new ValidationError('Event ID is required', 'id') as unknown as DatabaseError);
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
  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  if (ids.length === 0) {
    return ok([]);
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
  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  if (!id) {
    return err(new ValidationError('Event ID is required', 'id'));
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
  if (!isSupabaseConfigured()) {
    return err(new DatabaseError('Supabase is not configured. Check environment variables.'));
  }

  if (!id) {
    return err(new ValidationError('Event ID is required', 'id') as unknown as DatabaseError);
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
