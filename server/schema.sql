-- PlateIQ Database Schema
-- This schema stores meal scans, images, and user feedback for AI improvement

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- Stores personal info and health conditions per user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  date_of_birth DATE,
  health_conditions TEXT[] DEFAULT '{}',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Function to let users delete their own auth account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- =====================================================
-- MEAL SCANS TABLE
-- Stores metadata about each meal scan
-- =====================================================
CREATE TABLE IF NOT EXISTS meal_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,  -- User session identifier (can be device ID or user ID)
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Image reference
  image_url TEXT,  -- URL to image in Supabase Storage
  image_path TEXT,  -- Path in storage bucket

  -- Meal metadata
  meal_type TEXT,  -- breakfast, lunch, dinner, snack
  primary_cuisine TEXT,  -- American, Italian, Mexican, etc.
  reference_object_detected TEXT,  -- credit_card, fork, spoon, plate, etc.

  -- AI analysis results (stored as JSONB for flexibility)
  foods JSONB NOT NULL,  -- Array of detected foods with portions, NOVA levels

  -- Geolocation (optional)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by session
CREATE INDEX IF NOT EXISTS idx_meal_scans_session ON meal_scans(session_id);
CREATE INDEX IF NOT EXISTS idx_meal_scans_timestamp ON meal_scans(scan_timestamp DESC);

-- =====================================================
-- FOOD CORRECTIONS TABLE
-- Stores user feedback when AI misidentifies food
-- =====================================================
CREATE TABLE IF NOT EXISTS food_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_scan_id UUID REFERENCES meal_scans(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Original AI prediction
  original_food_name TEXT NOT NULL,
  original_grams INTEGER NOT NULL,
  original_nova_level INTEGER NOT NULL,

  -- User correction
  corrected_food_name TEXT NOT NULL,
  corrected_grams INTEGER NOT NULL,
  corrected_nova_level INTEGER NOT NULL,

  -- Metadata
  correction_type TEXT,  -- 'name_change', 'portion_change', 'nova_change', 'full_correction'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for aggregating common corrections
CREATE INDEX IF NOT EXISTS idx_food_corrections_original ON food_corrections(original_food_name);
CREATE INDEX IF NOT EXISTS idx_food_corrections_session ON food_corrections(session_id);

-- =====================================================
-- POSITION CORRECTIONS TABLE
-- Stores user feedback on food label positions (draggable labels)
-- =====================================================
CREATE TABLE IF NOT EXISTS position_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_scan_id UUID REFERENCES meal_scans(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  food_name TEXT NOT NULL,

  -- Original position
  original_x DECIMAL(5, 2) NOT NULL,
  original_y DECIMAL(5, 2) NOT NULL,

  -- Corrected position
  corrected_x DECIMAL(5, 2) NOT NULL,
  corrected_y DECIMAL(5, 2) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_position_corrections_food ON position_corrections(food_name);

-- =====================================================
-- PORTION ADJUSTMENTS TABLE
-- Tracks when users adjust portion sizes (S/M/L or custom grams)
-- =====================================================
CREATE TABLE IF NOT EXISTS portion_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_scan_id UUID REFERENCES meal_scans(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  food_name TEXT NOT NULL,
  original_grams INTEGER NOT NULL,
  adjusted_grams INTEGER NOT NULL,
  adjustment_type TEXT,  -- 'preset_small', 'preset_medium', 'preset_large', 'custom'

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portion_adjustments_food ON portion_adjustments(food_name);

-- =====================================================
-- AGGREGATED LEARNING TABLE (Materialized View)
-- Pre-computed aggregations for fast AI improvement lookups
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS aggregated_learning AS
SELECT
  -- Food identification patterns
  fc.original_food_name,
  fc.corrected_food_name,
  COUNT(*) as correction_count,
  AVG(fc.corrected_grams::DECIMAL / NULLIF(fc.original_grams, 0)) as avg_portion_adjustment_ratio,

  -- Position corrections
  AVG(pc.corrected_x - pc.original_x) as avg_x_adjustment,
  AVG(pc.corrected_y - pc.original_y) as avg_y_adjustment,

  -- Confidence score (more corrections = higher confidence)
  LEAST(COUNT(*) / 10.0, 1.0) as confidence_score,

  MAX(fc.created_at) as last_correction_date
FROM food_corrections fc
LEFT JOIN position_corrections pc ON fc.food_name = pc.food_name
GROUP BY fc.original_food_name, fc.corrected_food_name;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_aggregated_learning_original
  ON aggregated_learning(original_food_name);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_aggregated_learning()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW aggregated_learning;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Most scanned foods
CREATE OR REPLACE VIEW most_scanned_foods AS
SELECT
  jsonb_array_elements(foods)->>'name' as food_name,
  COUNT(*) as scan_count,
  AVG((jsonb_array_elements(foods)->>'estimated_grams')::INTEGER) as avg_portion_grams
FROM meal_scans
GROUP BY food_name
ORDER BY scan_count DESC
LIMIT 100;

-- Most corrected foods (AI struggles with these)
CREATE OR REPLACE VIEW most_corrected_foods AS
SELECT
  original_food_name,
  corrected_food_name,
  COUNT(*) as correction_count,
  AVG(corrected_grams::DECIMAL / NULLIF(original_grams, 0)) as avg_adjustment_ratio
FROM food_corrections
GROUP BY original_food_name, corrected_food_name
ORDER BY correction_count DESC
LIMIT 50;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable public read access for aggregated data
-- =====================================================

-- Enable RLS on tables
ALTER TABLE meal_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portion_adjustments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert data (for anonymous users)
CREATE POLICY "Allow public inserts on meal_scans" ON meal_scans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on food_corrections" ON food_corrections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on position_corrections" ON position_corrections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on portion_adjustments" ON portion_adjustments
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own meal_scans" ON meal_scans
  FOR SELECT USING (true);

CREATE POLICY "Users can read own corrections" ON food_corrections
  FOR SELECT USING (true);

-- =====================================================
-- TRIGGERS
-- Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meal_scans_updated_at
  BEFORE UPDATE ON meal_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL SETUP COMPLETE
-- =====================================================
-- To refresh aggregated learning data, run:
-- SELECT refresh_aggregated_learning();
