import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

export const EventCategorySchema = z.enum([
  'music',
  'food',
  'market',
  'art',
  'community',
  'sport',
  'workshop',
  'festival',
  'other',
]);

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less').nullable(),
  image_url: z.string().url('Invalid image URL').nullable().or(z.literal('')).transform(val => val || null),
  start_date: z.string().datetime({ message: 'Invalid start date' }),
  end_date: z.string().datetime({ message: 'Invalid end date' }).nullable(),
  location: z.string().max(500, 'Location must be 500 characters or less').nullable(),
  venue_name: z.string().max(200, 'Venue name must be 200 characters or less').nullable(),
  category: EventCategorySchema.nullable(),
  ticket_url: z.string().url('Invalid ticket URL').nullable().or(z.literal('')).transform(val => val || null),
  is_free: z.boolean(),
  price: z.string().max(100, 'Price must be 100 characters or less').nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Base schema for event data (without id, created_at, updated_at)
const BaseEventSchema = EventSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Refinement functions for validation
const validatePriceForPaidEvents = (data: { is_free?: boolean; price?: string | null }) => {
  if (data.is_free === false && !data.price) {
    return false;
  }
  return true;
};

const validateEndDateAfterStart = (data: { start_date?: string; end_date?: string | null }) => {
  if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) {
    return false;
  }
  return true;
};

// Schema for creating a new event
export const CreateEventSchema = BaseEventSchema.refine(
  validatePriceForPaidEvents,
  {
    message: 'Price is required for paid events',
    path: ['price'],
  }
).refine(
  validateEndDateAfterStart,
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// Schema for updating an event (all fields optional)
// Note: In Zod v4, .partial() cannot be used on refined schemas
// So we create a partial version of the base schema and apply refinements
export const UpdateEventSchema = BaseEventSchema.partial().refine(
  validatePriceForPaidEvents,
  {
    message: 'Price is required for paid events',
    path: ['price'],
  }
).refine(
  validateEndDateAfterStart,
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// Schema for event form input (before transformation to API format)
export const EventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional().default(''),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')).default(''),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().default(''),
  location: z.string().max(500, 'Location must be 500 characters or less').optional().default(''),
  venue_name: z.string().max(200, 'Venue name must be 200 characters or less').optional().default(''),
  category: EventCategorySchema.default('other'),
  ticket_url: z.string().url('Invalid ticket URL').optional().or(z.literal('')).default(''),
  is_free: z.boolean().default(true),
  price: z.string().max(100, 'Price must be 100 characters or less').optional().default(''),
}).refine(
  (data) => {
    if (!data.is_free && !data.price) {
      return false;
    }
    return true;
  },
  {
    message: 'Price is required for paid events',
    path: ['price'],
  }
).refine(
  (data) => {
    if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) {
      return false;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// ============================================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================================

export type EventCategory = z.infer<typeof EventCategorySchema>;
export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventFormInput = z.infer<typeof EventFormSchema>;

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Music',
  food: 'Food & Drink',
  market: 'Market',
  art: 'Art & Culture',
  community: 'Community',
  sport: 'Sport',
  workshop: 'Workshop',
  festival: 'Festival',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music: 'bg-purple-500',
  food: 'bg-orange-500',
  market: 'bg-green-500',
  art: 'bg-pink-500',
  community: 'bg-blue-500',
  sport: 'bg-red-500',
  workshop: 'bg-yellow-500',
  festival: 'bg-indigo-500',
  other: 'bg-gray-500',
};

/**
 * Direction for card swipe gestures.
 * - 'left' = pass/dismiss
 * - 'right' = save/like
 */
export type SwipeDirection = 'left' | 'right';

/**
 * @deprecated Use SwipeDirection type instead.
 * Legacy interface kept for backward compatibility.
 */
export interface SwipeAction {
  direction: SwipeDirection;
  eventId: string;
}

// ============================================================================
// API and Error Types
// ============================================================================

/**
 * Standard loading states for async operations.
 * Use this for consistent loading state management across components.
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * API error response structure.
 * Used for displaying user-friendly error messages.
 */
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

/**
 * Generic async state for data fetching.
 * Useful for managing component state with loading, error, and data.
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Pagination parameters for list queries.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Filter parameters for event queries.
 */
export interface EventFilters {
  category?: EventCategory;
  isFree?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  search?: string;
}
