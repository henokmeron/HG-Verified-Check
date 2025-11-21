-- URGENT DATABASE FIX
-- Run this SQL directly on your Neon database to fix the missing columns

-- Add missing columns to vehicle_lookups table
ALTER TABLE vehicle_lookups 
  ADD COLUMN IF NOT EXISTS success boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS report_type varchar DEFAULT 'comprehensive' NOT NULL,
  ADD COLUMN IF NOT EXISTS processing_time integer,
  ADD COLUMN IF NOT EXISTS api_provider varchar DEFAULT 'vidcheck' NOT NULL,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_vehicle_lookups_success ON vehicle_lookups (success);
CREATE INDEX IF NOT EXISTS idx_vehicle_lookups_user_id ON vehicle_lookups (user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_lookups_registration ON vehicle_lookups (registration);
CREATE INDEX IF NOT EXISTS idx_vehicle_lookups_created_at ON vehicle_lookups (created_at);

-- Verify columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicle_lookups' 
ORDER BY ordinal_position;

