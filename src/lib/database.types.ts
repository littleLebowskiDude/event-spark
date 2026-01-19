/**
 * Database type definitions for Supabase.
 * These types represent the database schema and ensure type safety
 * when interacting with Supabase.
 *
 * To regenerate these types from your Supabase schema, run:
 * npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          start_date: string;
          end_date: string | null;
          location: string | null;
          venue_name: string | null;
          category: EventCategoryDb | null;
          ticket_url: string | null;
          is_free: boolean;
          price: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          start_date: string;
          end_date?: string | null;
          location?: string | null;
          venue_name?: string | null;
          category?: EventCategoryDb | null;
          ticket_url?: string | null;
          is_free?: boolean;
          price?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          start_date?: string;
          end_date?: string | null;
          location?: string | null;
          venue_name?: string | null;
          category?: EventCategoryDb | null;
          ticket_url?: string | null;
          is_free?: boolean;
          price?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      event_category: EventCategoryDb;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type EventCategoryDb =
  | 'music'
  | 'food'
  | 'market'
  | 'art'
  | 'community'
  | 'sport'
  | 'workshop'
  | 'festival'
  | 'other';

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table types
export type EventRow = Tables<'events'>;
export type EventInsert = TablesInsert<'events'>;
export type EventUpdate = TablesUpdate<'events'>;
