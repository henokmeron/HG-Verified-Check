-- MANUAL MIGRATION SCRIPT FOR NEON DATABASE
-- Copy and paste this entire script into Neon Console SQL Editor and run it
-- This will create all required tables

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar UNIQUE NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"credit_balance" integer DEFAULT 0 NOT NULL,
	"stripe_customer_id" varchar,
	"role" varchar DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"preferences" jsonb DEFAULT '{}',
	"auth_provider" varchar DEFAULT 'local' NOT NULL,
	"provider_id" varchar,
	"password_hash" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"last_login_ip" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_users_auth_provider" ON "users" ("auth_provider");
CREATE INDEX IF NOT EXISTS "idx_users_provider_id" ON "users" ("provider_id");

-- Create sessions table (for Passport sessions)
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");

-- Create vehicle_lookups table
CREATE TABLE IF NOT EXISTS "vehicle_lookups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"registration" varchar NOT NULL,
	"vehicle_data" jsonb,
	"report_raw" jsonb,
	"credits_cost" integer DEFAULT 1 NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"report_type" varchar DEFAULT 'comprehensive' NOT NULL,
	"processing_time" integer,
	"api_provider" varchar DEFAULT 'vidcheck' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_user_id" ON "vehicle_lookups" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_registration" ON "vehicle_lookups" ("registration");
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_created_at" ON "vehicle_lookups" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_vehicle_lookups_success" ON "vehicle_lookups" ("success");

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS "credit_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"stripe_payment_intent_id" varchar,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_user_id" ON "credit_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_type" ON "credit_transactions" ("type");
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_created_at" ON "credit_transactions" ("created_at");

-- Create saved_reports table
CREATE TABLE IF NOT EXISTS "saved_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"vrm" varchar NOT NULL,
	"check_type" varchar NOT NULL,
	"bytes" integer NOT NULL,
	"file_name" varchar NOT NULL,
	"storage_key" varchar NOT NULL,
	"download_url" varchar NOT NULL,
	"lookup_id" varchar,
	"download_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_saved_reports_user_id" ON "saved_reports" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_saved_reports_vrm" ON "saved_reports" ("vrm");
CREATE INDEX IF NOT EXISTS "idx_saved_reports_created_at" ON "saved_reports" ("created_at");

-- Create shared_reports table
CREATE TABLE IF NOT EXISTS "shared_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_code" varchar NOT NULL,
	"lookup_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "shared_reports_share_code_unique" UNIQUE("share_code")
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS "analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar NOT NULL,
	"user_id" varchar,
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

-- Create system_config table
CREATE TABLE IF NOT EXISTS "system_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar UNIQUE NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_system_config_key" ON "system_config" ("key");
CREATE INDEX IF NOT EXISTS "idx_system_config_is_public" ON "system_config" ("is_public");

-- Create api_usage table
CREATE TABLE IF NOT EXISTS "api_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
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

-- Add foreign key constraints (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'credit_transactions_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_reports_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shared_reports_lookup_id_vehicle_lookups_id_fk'
  ) THEN
    ALTER TABLE "shared_reports" ADD CONSTRAINT "shared_reports_lookup_id_vehicle_lookups_id_fk" 
    FOREIGN KEY ("lookup_id") REFERENCES "public"."vehicle_lookups"("id") ON DELETE no action ON UPDATE no action;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shared_reports_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "shared_reports" ADD CONSTRAINT "shared_reports_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_lookups_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "vehicle_lookups" ADD CONSTRAINT "vehicle_lookups_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
  END IF;
END $$;

-- Verify tables were created
SELECT 
  table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = t.table_name
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
  VALUES 
    ('users'),
    ('sessions'),
    ('vehicle_lookups'),
    ('credit_transactions'),
    ('saved_reports'),
    ('shared_reports'),
    ('analytics'),
    ('system_config'),
    ('api_usage')
) AS t(table_name);

