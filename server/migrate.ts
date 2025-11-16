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
// This includes the comprehensive schema with ALL columns
function getEmbeddedMigrationSQL(): string {
  return `
-- Comprehensive schema with all columns
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
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_users_auth_provider" ON "users" ("auth_provider");
CREATE INDEX IF NOT EXISTS "idx_users_provider_id" ON "users" ("provider_id");

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
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");

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
  // CRITICAL: Check if migration already ran (module-level cache)
  if (migrationRun) {
    console.log('✅ Migrations already completed (cached)');
    return true;
  }

  // CRITICAL: Log DATABASE_URL status (without exposing the actual URL)
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is NOT SET!');
    console.error('❌ Cannot run migrations without DATABASE_URL');
    return false;
  }
  
  const dbUrlPreview = process.env.DATABASE_URL.substring(0, 30) + '...';
  console.log('📋 DATABASE_URL is set:', dbUrlPreview);
  console.log('📋 DATABASE_URL length:', process.env.DATABASE_URL.length);
  console.log('📋 DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 10));
  
  let pool: Pool | null = null;
  try {
    console.log('🔄 Creating database connection pool...');
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 1, // Single connection for migrations
    });
    console.log('✅ Database pool created');

    // CRITICAL: Check if users table exists FIRST (before any migration attempts)
    // This is the fastest check and avoids unnecessary work
    console.log('🔍 Checking if database tables exist...');
    let checkResult;
    try {
      console.log('🔄 Executing table existence check query...');
      checkResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      console.log('✅ Table existence check completed');
      console.log('📋 Check result:', checkResult?.rows?.[0]);
    } catch (checkError: any) {
      console.error('❌ Error checking for users table:', checkError?.message);
      console.error('❌ Error code:', checkError?.code);
      console.error('❌ Error detail:', checkError?.detail);
      console.error('❌ Error stack:', checkError?.stack);
      // If we can't even check, the database might not be accessible
      // But we'll still try to run migrations in case it's a temporary issue
      console.log('⚠️ Could not check table existence, proceeding with migration attempt...');
    }

    const usersTableExists = checkResult?.rows?.[0]?.exists || false;

    if (usersTableExists) {
      console.log('✅ Database tables already exist - no migration needed');
      migrationRun = true;
      if (pool) await pool.end();
      return true;
    }

    console.log('📦 Database tables not found - running migrations...');
    
    // Use embedded comprehensive SQL (includes ALL columns from schema.ts)
    // This ensures all columns exist even if migration file can't be read
    console.log('📦 Using comprehensive embedded migration SQL...');
    const migrationSQL = getEmbeddedMigrationSQL();
    
    // CRITICAL: Split SQL statements and ensure tables are created before indexes
    // Split by statement-breakpoint or semicolon for embedded SQL
    let statements: string[] = [];
    
    // Try splitting by statement-breakpoint first (for file-based migrations)
    if (migrationSQL.includes('--> statement-breakpoint')) {
      statements = migrationSQL
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
    } else {
      // For embedded SQL, split by semicolons but keep DO blocks together
      const lines = migrationSQL.split('\n');
      let currentStatement = '';
      let inDoBlock = false;
      
      for (const line of lines) {
        currentStatement += line + '\n';
        
        // Track DO blocks
        if (line.trim().startsWith('DO')) {
          inDoBlock = true;
        }
        if (inDoBlock && line.trim().endsWith('$$;')) {
          inDoBlock = false;
          statements.push(currentStatement.trim());
          currentStatement = '';
        } else if (!inDoBlock && line.trim().endsWith(';') && !line.trim().startsWith('--')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      }
      
      // Add any remaining statement
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      
      // Filter out empty statements and comments
      statements = statements
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && s !== ';');
    }
    
    // CRITICAL: Sort statements to ensure tables are created before indexes
    // Tables must come before indexes and foreign keys
    const tableStatements: string[] = [];
    const indexStatements: string[] = [];
    const constraintStatements: string[] = [];
    const otherStatements: string[] = [];
    
    for (const stmt of statements) {
      const upperStmt = stmt.toUpperCase();
      if (upperStmt.startsWith('CREATE TABLE')) {
        tableStatements.push(stmt);
      } else if (upperStmt.startsWith('CREATE INDEX')) {
        indexStatements.push(stmt);
      } else if (upperStmt.startsWith('DO $$') || upperStmt.includes('ALTER TABLE') || upperStmt.includes('ADD CONSTRAINT')) {
        constraintStatements.push(stmt);
      } else {
        otherStatements.push(stmt);
      }
    }
    
    // Reorder: tables first, then indexes, then constraints, then other
    statements = [...tableStatements, ...indexStatements, ...constraintStatements, ...otherStatements];
    
    console.log(`📋 Reordered statements: ${tableStatements.length} tables, ${indexStatements.length} indexes, ${constraintStatements.length} constraints, ${otherStatements.length} other`);
    
    console.log(`📋 Prepared ${statements.length} migration statements to execute`);

    // Execute all statements in a transaction
    console.log('🔄 Connecting to database for migration...');
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    try {
      console.log('🔄 Starting database migration transaction...');
      await client.query('BEGIN');
      console.log('✅ Transaction started');
      
      let statementCount = 0;
      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const statement of statements) {
        if (statement.trim() && !statement.trim().startsWith('--')) {
          statementCount++;
          const statementPreview = statement.substring(0, 100).replace(/\n/g, ' ');
          console.log(`🔄 [${statementCount}/${statements.length}] Executing: ${statementPreview}...`);
          try {
            const result = await client.query(statement);
            console.log(`✅ [${statementCount}] Statement executed successfully`);
            successCount++;
          } catch (stmtError: any) {
            // If statement fails but it's because object already exists, that's okay
            const errorMsg = stmtError?.message || '';
            const errorCode = stmtError?.code || '';
            console.log(`⚠️ [${statementCount}] Statement error: ${errorMsg} (code: ${errorCode})`);
            
            if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorCode === '42P07') {
              console.log(`⚠️ [${statementCount}] Skipped (already exists): ${statementPreview}`);
              skippedCount++;
            } else {
              console.error(`❌ [${statementCount}] Statement failed: ${errorMsg}`);
              console.error(`❌ [${statementCount}] Error code: ${errorCode}`);
              console.error(`❌ [${statementCount}] Error detail: ${stmtError?.detail || 'none'}`);
              errorCount++;
              // Don't throw - continue with other statements
              // We'll verify at the end if tables exist
            }
          }
        }
      }
      
      console.log(`📊 Migration summary: ${successCount} succeeded, ${skippedCount} skipped, ${errorCount} errors out of ${statementCount} statements`);
      
      // Commit transaction even if some statements had errors (they might be "already exists" errors)
      console.log(`🔄 Committing transaction...`);
      try {
        await client.query('COMMIT');
        console.log('✅ Transaction committed successfully');
      } catch (commitError: any) {
        console.error('❌ Error committing transaction:', commitError?.message);
        throw commitError;
      }
      
      // CRITICAL: Verify tables were created before marking as complete
      const verifyResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      const verified = verifyResult.rows[0]?.exists || false;
      
      if (verified) {
        console.log('✅ Migration verified - users table exists');
        migrationRun = true;
        client.release();
        await pool.end();
        return true;
      } else {
        console.error('❌ Migration completed but users table still does not exist');
        client.release();
        await pool.end();
        return false;
      }
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
      
      // If error is about objects already existing, check if tables actually exist
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || error?.code === '42P07') {
        console.log('⚠️ Migration error suggests objects already exist - verifying...');
        try {
          const verifyResult = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'users'
            );
          `);
          const verified = verifyResult.rows[0]?.exists || false;
          if (verified) {
            console.log('✅ Tables verified to exist despite error - migration successful');
            migrationRun = true;
            client.release();
            await pool.end();
            return true;
          }
        } catch (verifyError: any) {
          console.error('❌ Could not verify table existence:', verifyError?.message);
        }
      }
      
      client.release();
      await pool.end();
      return false;
    } finally {
      if (client) {
        try {
          client.release();
        } catch (e) {
          console.error('❌ Error releasing client:', e);
        }
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('❌ Migration error (outer catch):', errorMessage);
    console.error('❌ Error stack:', error?.stack);
    
    // CRITICAL: Even if migration fails, check if tables exist (might have been created by another instance)
    if (pool) {
      try {
        const finalCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        const tablesExist = finalCheck.rows[0]?.exists || false;
        if (tablesExist) {
          console.log('✅ Tables exist despite migration error - marking as complete');
          migrationRun = true;
          await pool.end();
          return true;
        }
      } catch (checkError: any) {
        console.error('❌ Could not verify tables after error:', checkError?.message);
      } finally {
        try {
          await pool.end();
        } catch (e) {
          // Ignore pool end errors
        }
      }
    }
    
    return false;
  }
}

