-- ========================================
-- COMPLETE DATABASE FIX FOR AUTOCHECKPRO
-- Run this in Neon Console SQL Editor
-- ========================================

-- Step 1: Add ALL missing columns to vehicle_lookups
ALTER TABLE vehicle_lookups 
  ADD COLUMN IF NOT EXISTS vehicle_data jsonb,
  ADD COLUMN IF NOT EXISTS report_raw jsonb,
  ADD COLUMN IF NOT EXISTS success boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS report_type varchar DEFAULT 'comprehensive',
  ADD COLUMN IF NOT EXISTS processing_time integer,
  ADD COLUMN IF NOT EXISTS api_provider varchar DEFAULT 'vidcheck',
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Step 2: Rename credits_used to credits_cost (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vehicle_lookups' AND column_name = 'credits_used'
  ) THEN
    ALTER TABLE vehicle_lookups RENAME COLUMN credits_used TO credits_cost;
    RAISE NOTICE 'Renamed credits_used to credits_cost';
  END IF;
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'Could not rename column: %', SQLERRM;
END $$;

-- Step 3: Ensure credits_cost exists
ALTER TABLE vehicle_lookups ADD COLUMN IF NOT EXISTS credits_cost integer DEFAULT 1;

-- Step 4: Update existing records to have success = true where it's null
UPDATE vehicle_lookups SET success = true WHERE success IS NULL;

-- Step 5: Verify all columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vehicle_lookups'
ORDER BY ordinal_position;

