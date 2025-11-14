// Database migration runner
// Automatically runs migrations on startup if tables don't exist

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure WebSocket constructor for Neon serverless
if (typeof global !== 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

let migrationRun = false;

// Embedded migration SQL as fallback if file can't be read
function getEmbeddedMigrationSQL(): string {
  return `
CREATE TABLE IF NOT EXISTS "credit_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"stripe_payment_intent_id" varchar,
	"created_at" timestamp DEFAULT now()
);
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
	"created_at" timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
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
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"credit_balance" integer DEFAULT 0 NOT NULL,
	"stripe_customer_id" varchar,
	"role" varchar DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
CREATE TABLE IF NOT EXISTS "vehicle_lookups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"registration" varchar NOT NULL,
	"vehicle_data" jsonb,
	"report_raw" jsonb,
	"credits_cost" integer DEFAULT 1 NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'credit_transactions_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_reports_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
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
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END \$\$;
  `.trim();
}

export async function ensureTablesExist(): Promise<boolean> {
  if (migrationRun) {
    return true; // Already checked
  }

  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not set - skipping migrations');
    return false;
  }

  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 1, // Single connection for migrations
    });

    // Check if users table exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const usersTableExists = checkResult.rows[0]?.exists || false;

    if (usersTableExists) {
      console.log('✅ Database tables already exist');
      migrationRun = true;
      await pool.end();
      return true;
    }

    console.log('📦 Database tables not found - running migrations...');
    
    // Read migration file
    // In serverless, we need to use the compiled path
    let migrationPath: string;
    try {
      // Try relative path from dist/server
      migrationPath = join(__dirname, '..', '..', 'migrations', '0000_nasty_tusk.sql');
      // Check if file exists, if not try absolute path
      try {
        readFileSync(migrationPath, 'utf-8');
      } catch {
        // Try from project root
        migrationPath = join(process.cwd(), 'migrations', '0000_nasty_tusk.sql');
      }
    } catch {
      // Fallback: embed migration SQL directly
      migrationPath = '';
    }
    
    let migrationSQL: string;
    if (migrationPath) {
      try {
        migrationSQL = readFileSync(migrationPath, 'utf-8');
      } catch (error) {
        console.error('❌ Could not read migration file, using embedded SQL');
        // Fallback to embedded SQL (see below)
        migrationSQL = getEmbeddedMigrationSQL();
      }
    } else {
      migrationSQL = getEmbeddedMigrationSQL();
    }
    
    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute all statements in a transaction
    const client = await pool.connect();
    try {
      console.log('🔄 Starting database migration transaction...');
      await client.query('BEGIN');
      
      let statementCount = 0;
      for (const statement of statements) {
        if (statement.trim()) {
          statementCount++;
          console.log(`🔄 Executing migration statement ${statementCount}/${statements.length}...`);
          await client.query(statement);
        }
      }
      
      console.log(`✅ Executed ${statementCount} migration statements, committing...`);
      await client.query('COMMIT');
      console.log('✅ Database migrations completed successfully');
      migrationRun = true;
      return true;
    } catch (error: any) {
      console.error('❌ Error during migration, rolling back...');
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('❌ Rollback also failed:', rollbackError);
      }
      
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ Migration failed:', errorMessage);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error detail:', error?.detail);
      
      // If tables already exist (race condition), that's okay
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || error?.code === '42P07') {
        console.log('✅ Tables already exist (race condition or already created)');
        migrationRun = true;
        return true;
      }
      
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('❌ Failed to run migrations:', errorMessage);
    // Don't throw - allow app to continue (might be a connection issue)
    return false;
  }
}

