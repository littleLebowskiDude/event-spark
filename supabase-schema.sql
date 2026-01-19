-- Event Spark Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  venue_name VARCHAR(255),
  category VARCHAR(50) CHECK (category IN ('music', 'food', 'market', 'art', 'community', 'sport', 'workshop', 'festival', 'other')),
  ticket_url VARCHAR(500),
  is_free BOOLEAN DEFAULT true,
  price VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on start_date for faster queries
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view events)
CREATE POLICY "Public can view events" ON events
  FOR SELECT USING (true);

-- Policy for authenticated users to manage events
CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events" ON events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events" ON events
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for Beechworth events
INSERT INTO events (title, description, image_url, start_date, end_date, location, venue_name, category, ticket_url, is_free, price) VALUES
  ('Beechworth Farmers Market', 'The monthly Beechworth Farmers Market features local produce, artisan goods, fresh baked treats, and live music. Meet local farmers and producers while enjoying the historic town center atmosphere.', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop', NOW() + INTERVAL '2 days', NULL, 'Ford Street, Beechworth VIC 3747', 'Beechworth Town Center', 'market', NULL, true, NULL),
  ('Jazz in the Vines', 'An evening of smooth jazz surrounded by the beautiful vineyards of the Beechworth wine region. Local and interstate jazz musicians perform under the stars. BYO picnic or purchase from local food vendors.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', NOW() + INTERVAL '5 days', NULL, 'Pennyweight Winery, Beechworth VIC', 'Pennyweight Winery', 'music', 'https://example.com/tickets', false, '$45 per person'),
  ('Historic Gold Mine Tour', 'Explore the rich gold mining history of Beechworth with a guided tour of the old gold mines. Learn about the Chinese miners, the eureka stockade, and the impact of the gold rush on the region.', 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=600&fit=crop', NOW() + INTERVAL '1 day', NULL, 'Historic Precinct, Beechworth VIC', 'Burke Museum', 'community', NULL, false, '$20 adults / $10 kids'),
  ('Community Yoga in the Park', 'Start your Sunday morning with a relaxing yoga session in the beautiful Lake Sambell park. All levels welcome. Bring your own mat and water bottle.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop', NOW() + INTERVAL '3 days', NULL, 'Lake Sambell, Beechworth VIC', 'Lake Sambell Park', 'sport', NULL, true, NULL),
  ('Beechworth Bakery Masterclass', 'Learn the secrets of the famous Beechworth Bakery! Join our bakers for a hands-on bread making workshop. Take home your creations and a recipe booklet.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop', NOW() + INTERVAL '7 days', NULL, '27 Camp St, Beechworth VIC 3747', 'Beechworth Bakery', 'workshop', 'https://example.com/bakery', false, '$85 per person'),
  ('Ned Kelly Historical Walk', 'Walk through the historic streets of Beechworth and visit the sites associated with the famous bushranger Ned Kelly. See the courthouse where he was tried and the gaol where he was held.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', NOW() + INTERVAL '4 days', NULL, 'Beechworth Historic Precinct', 'Beechworth Visitor Centre', 'community', NULL, true, NULL),
  ('Local Art Exhibition Opening', 'Celebrate the opening of a new exhibition featuring works by local Beechworth and North East Victorian artists. Wine and cheese provided. Artists will be present to discuss their work.', 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop', NOW() + INTERVAL '6 days', NULL, 'Gallery 101, Beechworth VIC', 'Beechworth Art Gallery', 'art', NULL, true, NULL),
  ('Golden Horseshoes Festival', 'Annual celebration of Beechworth''s gold mining heritage with live entertainment, historical reenactments, food stalls, and activities for the whole family. Don''t miss the gold panning competition!', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop', NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days', 'Beechworth Town Center', 'Various Locations', 'festival', 'https://example.com/festival', false, '$15 day pass');
