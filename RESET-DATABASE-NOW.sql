-- ============================================================================
-- EMERGENCY DATABASE RESET
-- This will DELETE ALL DATA and recreate tables from scratch
-- Run this in Neon Console SQL Editor: https://console.neon.tech
-- ============================================================================

-- Step 1: Drop ALL existing tables (this removes corrupted state)
DROP TABLE IF EXISTS "credit_transactions" CASCADE;
DROP TABLE IF EXISTS "saved_reports" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "shared_reports" CASCADE;
DROP TABLE IF EXISTS "vehicle_lookups" CASCADE;
DROP TABLE IF EXISTS "analytics" CASCADE;
DROP TABLE IF EXISTS "system_config" CASCADE;
DROP TABLE IF EXISTS "api_usage" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Step 2: Create users table FIRST (all other tables reference this)
CREATE TABLE "users" (
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

-- Step 3: Create sessions table (CRITICAL: Correct primary key name)
CREATE TABLE "sessions" (
	"sid" varchar NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL,
	CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
);

-- Step 4: Create other tables
CREATE TABLE "credit_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"stripe_payment_intent_id" varchar,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "saved_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"vrm" varchar NOT NULL,
	"report_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "shared_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_code" varchar NOT NULL,
	"lookup_id" varchar NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "vehicle_lookups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"registration" varchar NOT NULL,
	"lookup_data" jsonb NOT NULL,
	"credits_used" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar NOT NULL,
	"user_id" varchar,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "system_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar UNIQUE NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "api_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"endpoint" varchar NOT NULL,
	"method" varchar NOT NULL,
	"status_code" integer NOT NULL,
	"response_time_ms" integer,
	"created_at" timestamp DEFAULT now()
);

-- Step 5: Create indexes for performance
CREATE INDEX "idx_users_email" ON "users" ("email");
CREATE INDEX "idx_users_role" ON "users" ("role");
CREATE INDEX "idx_users_created_at" ON "users" ("created_at");
CREATE INDEX "idx_users_auth_provider" ON "users" ("auth_provider");
CREATE INDEX "idx_users_provider_id" ON "users" ("provider_id");
CREATE INDEX "idx_sessions_expire" ON "sessions" ("expire");
CREATE INDEX "idx_credit_transactions_user_id" ON "credit_transactions" ("user_id");
CREATE INDEX "idx_saved_reports_user_id" ON "saved_reports" ("user_id");
CREATE INDEX "idx_saved_reports_vrm" ON "saved_reports" ("vrm");
CREATE INDEX "idx_shared_reports_share_code" ON "shared_reports" ("share_code");
CREATE INDEX "idx_shared_reports_lookup_id" ON "shared_reports" ("lookup_id");
CREATE INDEX "idx_vehicle_lookups_user_id" ON "vehicle_lookups" ("user_id");
CREATE INDEX "idx_vehicle_lookups_registration" ON "vehicle_lookups" ("registration");
CREATE INDEX "idx_analytics_event_type" ON "analytics" ("event_type");
CREATE INDEX "idx_analytics_user_id" ON "analytics" ("user_id");
CREATE INDEX "idx_analytics_created_at" ON "analytics" ("created_at");
CREATE INDEX "idx_system_config_key" ON "system_config" ("key");
CREATE INDEX "idx_api_usage_user_id" ON "api_usage" ("user_id");
CREATE INDEX "idx_api_usage_endpoint" ON "api_usage" ("endpoint");

-- Step 6: Add foreign key constraints
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "shared_reports" ADD CONSTRAINT "shared_reports_lookup_id_vehicle_lookups_id_fk" FOREIGN KEY ("lookup_id") REFERENCES "vehicle_lookups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "vehicle_lookups" ADD CONSTRAINT "vehicle_lookups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================================================
-- DONE! Your database is now clean and ready.
-- Go back to your app and try logging in again.
-- ============================================================================

