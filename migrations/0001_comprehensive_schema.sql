-- Comprehensive Database Schema Migration
-- This includes ALL columns from the schema.ts file

-- First, add missing columns to existing users table
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "last_login_at" timestamp,
  ADD COLUMN IF NOT EXISTS "preferences" jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "auth_provider" varchar DEFAULT 'local' NOT NULL,
  ADD COLUMN IF NOT EXISTS "provider_id" varchar,
  ADD COLUMN IF NOT EXISTS "password_hash" text,
  ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "mfa_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "last_login_ip" varchar;

-- Add indexes to users table
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_users_auth_provider" ON "users" ("auth_provider");
CREATE INDEX IF NOT EXISTS "idx_users_provider_id" ON "users" ("provider_id");

-- Update credit_transactions table
ALTER TABLE "credit_transactions"
  ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "idx_credit_transactions_user_id" ON "credit_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_type" ON "credit_transactions" ("type");
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_created_at" ON "credit_transactions" ("created_at");

-- Update vehicle_lookups table with all columns
ALTER TABLE "vehicle_lookups"
  ADD COLUMN IF NOT EXISTS "report_type" varchar DEFAULT 'comprehensive' NOT NULL,
  ADD COLUMN IF NOT EXISTS "processing_time" integer,
  ADD COLUMN IF NOT EXISTS "api_provider" varchar DEFAULT 'vidcheck' NOT NULL,
  ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_user_id" ON "vehicle_lookups" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_registration" ON "vehicle_lookups" ("registration");
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_created_at" ON "vehicle_lookups" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_success" ON "vehicle_lookups" ("success");

-- Update saved_reports table
ALTER TABLE "saved_reports"
  ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "expires_at" timestamp;

CREATE INDEX IF NOT EXISTS "idx_saved_reports_user_id" ON "saved_reports" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_saved_reports_vrm" ON "saved_reports" ("vrm");
CREATE INDEX IF NOT EXISTS "idx_saved_reports_created_at" ON "saved_reports" ("created_at");

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS "analytics" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_type" varchar NOT NULL,
  "user_id" varchar REFERENCES "users"("id") ON DELETE SET NULL,
  "session_id" varchar,
  "page" varchar,
  "referrer" varchar,
  "user_agent" text,
  "ip_address" varchar,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_analytics_event_type" ON "analytics" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_analytics_user_id" ON "analytics" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_analytics_created_at" ON "analytics" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_analytics_session_id" ON "analytics" ("session_id");

-- Create system_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS "system_config" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar UNIQUE NOT NULL,
  "value" jsonb NOT NULL,
  "description" text,
  "is_public" boolean DEFAULT false NOT NULL,
  "updated_by" varchar REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_system_config_key" ON "system_config" ("key");
CREATE INDEX IF NOT EXISTS "idx_system_config_is_public" ON "system_config" ("is_public");

-- Create api_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS "api_usage" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar REFERENCES "users"("id") ON DELETE SET NULL,
  "endpoint" varchar NOT NULL,
  "method" varchar NOT NULL,
  "status_code" integer NOT NULL,
  "response_time" integer NOT NULL,
  "request_size" integer,
  "response_size" integer,
  "ip_address" varchar,
  "user_agent" text,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_api_usage_user_id" ON "api_usage" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_api_usage_endpoint" ON "api_usage" ("endpoint");
CREATE INDEX IF NOT EXISTS "idx_api_usage_created_at" ON "api_usage" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_api_usage_status_code" ON "api_usage" ("status_code");

