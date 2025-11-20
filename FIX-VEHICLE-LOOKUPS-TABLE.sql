-- ============================================================================
-- URGENT FIX: Add missing columns to vehicle_lookups table
-- Run this in Neon Console SQL Editor: https://console.neon.tech
-- This will add all the missing columns without losing existing data
-- ============================================================================

-- Add missing columns to vehicle_lookups table
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS vehicle_data jsonb;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS report_raw jsonb;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS success boolean DEFAULT true NOT NULL;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS report_type varchar DEFAULT 'comprehensive' NOT NULL;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS processing_time integer;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS api_provider varchar DEFAULT 'vidcheck' NOT NULL;
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Rename credits_used to credits_cost if it exists (for consistency with code)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicle_lookups' AND column_name = 'credits_used') THEN
    ALTER TABLE vehicle_lookups RENAME COLUMN credits_used TO credits_cost;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Column might already be renamed, ignore error
    NULL;
END $$;

-- Add credits_cost if it doesn't exist
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS credits_cost integer DEFAULT 1 NOT NULL;

-- ============================================================================
-- DONE! Refresh your admin page
-- ============================================================================

