-- Add success column to vehicle_lookups if it doesn't exist
-- This fixes the issue where the column might be missing in production

ALTER TABLE "vehicle_lookups"
  ADD COLUMN IF NOT EXISTS "success" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "error_message" text;

-- Ensure index exists
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_success" ON "vehicle_lookups" ("success");

