-- QUICK FIX for "session_pkey already exists" error
-- Run this in Neon Console SQL Editor to fix the sessions table

-- Drop the problematic constraint and table
DO $$
BEGIN
  -- Drop constraints
  ALTER TABLE IF EXISTS "sessions" DROP CONSTRAINT IF EXISTS "session_pkey";
  ALTER TABLE IF EXISTS "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";
  
  -- Drop the table
  DROP TABLE IF EXISTS "sessions" CASCADE;
  
  RAISE NOTICE 'Dropped sessions table';
EXCEPTION
  WHEN OTHERS THEN
    -- Force drop if anything fails
    DROP TABLE IF EXISTS "sessions" CASCADE;
END $$;

-- Recreate the sessions table with correct structure
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL,
	CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
);

-- Create the index
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");

-- Verify it was created
SELECT 
  'sessions' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'sessions'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

