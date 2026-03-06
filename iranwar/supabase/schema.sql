-- Enable PostGIS for clustering and mapping
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable pg_cron for daily reset tasks (optional if using external cron)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ==========================================
-- 1. Events Table (Core Data)
-- ==========================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT CHECK (category IN ('KINETIC','DIPLOMATIC','INTENT','LEADERSHIP')),
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  headline TEXT NOT NULL,
  summary TEXT,
  -- geography type points are stored as (longitude, latitude)
  location GEOGRAPHY(POINT, 4326),
  location_name TEXT,
  sources JSONB DEFAULT '[]',
  verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING','VERIFIED','UNVERIFIED')),
  source_count INTEGER DEFAULT 0,
  leader_quotes JSONB DEFAULT '[]',
  sentiment TEXT CHECK (sentiment IN ('ESCALATORY','DIPLOMATIC','ULTIMATUM','NEUTRAL')),
  raw_sources JSONB DEFAULT '[]',
  is_breaking BOOLEAN DEFAULT FALSE,
  lang_summary JSONB DEFAULT '{}'  -- {en, fr, es, fa, ar, zh}
);

-- Indexes for Map queries and Feed sorting
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_location ON events USING GIST(location);
CREATE INDEX idx_events_verification ON events(verification_status);

-- ==========================================
-- 2. Site Configuration (Donation tracking)
-- ==========================================
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert defaults for the $20/day goal
INSERT INTO site_config (key, value) VALUES ('daily_donations_total', '0');
INSERT INTO site_config (key, value) VALUES ('daily_goal', '20');

-- ==========================================
-- 3. Profiles (Optional Premium handling later)
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free',
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. Realtime configuration
-- ==========================================
-- Enable replication for specific tables to push data to Next.js clients
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE site_config;

-- ==========================================
-- 5. Row Level Security Policies
-- ==========================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to events
CREATE POLICY "Public events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Allow anonymous read access to config (to show donation bar)
CREATE POLICY "Site config is viewable by everyone" ON site_config
  FOR SELECT USING (true);

-- Profiles are only readable by the user themselves
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- (Optional) Service role bypass RLS by default natively, no policy required for inserts from edge functions.
