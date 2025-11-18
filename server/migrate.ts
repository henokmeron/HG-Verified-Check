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
-- Drop sessions table if it has wrong primary key constraint (handles session_pkey error)
-- CRITICAL: This must execute BEFORE creating the sessions table
DO \$\$
BEGIN
  -- Drop any existing sessions table with wrong constraints
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sessions') THEN
    -- Drop all constraints first
    ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "session_pkey";
    ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";
    -- Drop the table
    DROP TABLE IF EXISTS "sessions" CASCADE;
    RAISE NOTICE 'Dropped existing sessions table to fix constraint issues';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, try to drop the table anyway
    DROP TABLE IF EXISTS "sessions" CASCADE;
END \$\$;

CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL,
	CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
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

-- Add missing columns to users table if they don't exist (for existing tables created with incomplete schema)
DO \$\$
BEGIN
  -- Add is_active column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active') THEN
    ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;
  END IF;
  
  -- Add last_login_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_login_at') THEN
    ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;
  END IF;
  
  -- Add preferences column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'preferences') THEN
    ALTER TABLE "users" ADD COLUMN "preferences" jsonb DEFAULT '{}';
  END IF;
  
  -- Add auth_provider column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_provider') THEN
    ALTER TABLE "users" ADD COLUMN "auth_provider" varchar DEFAULT 'local' NOT NULL;
  END IF;
  
  -- Add provider_id column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'provider_id') THEN
    ALTER TABLE "users" ADD COLUMN "provider_id" varchar;
  END IF;
  
  -- Add password_hash column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash') THEN
    ALTER TABLE "users" ADD COLUMN "password_hash" text;
  END IF;
  
  -- Add email_verified column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_verified') THEN
    ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;
  END IF;
  
  -- Add mfa_enabled column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'mfa_enabled') THEN
    ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;
  END IF;
  
  -- Add last_login_ip column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_login_ip') THEN
    ALTER TABLE "users" ADD COLUMN "last_login_ip" varchar;
  END IF;
  
  -- Ensure email is NOT NULL if it's nullable (for existing incomplete tables)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email' AND is_nullable = 'YES') THEN
    -- First, set NULL emails to empty string for existing rows
    UPDATE "users" SET "email" = '' WHERE "email" IS NULL;
    -- Then make it NOT NULL
    ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
  END IF;
END \$\$;

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

  // CRITICAL: Use UNPOOLED connection for migrations (better for transactions and DDL)
  // Pooled connections can interfere with CREATE TABLE and other DDL operations
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is NOT SET!');
    console.error('❌ Cannot run migrations without a database connection string');
    console.error('📋 Note: DATABASE_URL_UNPOOLED is preferred for migrations');
    return false;
  }
  
  const dbUrlPreview = dbUrl.substring(0, 30) + '...';
  const usingUnpooled = !!process.env.DATABASE_URL_UNPOOLED;
  console.log(`📋 Using ${usingUnpooled ? 'DATABASE_URL_UNPOOLED' : 'DATABASE_URL'} for migrations:`, dbUrlPreview);
  console.log('📋 Connection string length:', dbUrl.length);
  console.log('📋 Connection string starts with:', dbUrl.substring(0, 10));
  if (!usingUnpooled) {
    console.log('⚠️ Consider using DATABASE_URL_UNPOOLED for migrations (better for DDL operations)');
  }
  
  let pool: Pool | null = null;
  try {
    console.log('🔄 Creating database connection pool...');
    pool = new Pool({ 
      connectionString: dbUrl,
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
      const errorMessage = checkError?.message || checkError?.toString() || 'Unknown error';
      const errorCode = checkError?.code || '';
      console.error('❌ Error checking for users table:', errorMessage);
      console.error('❌ Error code:', errorCode);
      console.error('❌ Error detail:', checkError?.detail);
      console.error('❌ Error stack:', checkError?.stack);
      
      // CRITICAL: If authentication fails, provide clear instructions and stop
      if (errorMessage.includes('password authentication failed') || errorMessage.includes('authentication failed')) {
        console.error('');
        console.error('🔴 ============================================');
        console.error('🔴 DATABASE AUTHENTICATION ERROR');
        console.error('🔴 ============================================');
        console.error('❌ The DATABASE_URL in Vercel has an incorrect password.');
        console.error('');
        console.error('✅ TO FIX:');
        console.error('1. Go to Neon Console: https://console.neon.tech');
        console.error('2. Select your database project');
        console.error('3. Click "Connection Details" or "Connection String"');
        console.error('4. Copy the ENTIRE connection string');
        console.error('5. Go to Vercel → Settings → Environment Variables');
        console.error('6. Find DATABASE_URL and update it with the correct connection string');
        console.error('7. Make sure it\'s set for Production environment');
        console.error('8. Redeploy your project');
        console.error('');
        console.error('📖 See FIX-DATABASE-AUTHENTICATION.md for detailed steps');
        console.error('🔴 ============================================');
        console.error('');
        
        // Don't proceed with migration if authentication fails
        await pool.end();
        return false;
      }
      
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
    // CRITICAL: users table MUST be created first (it's referenced by other tables)
    // CRITICAL: DO blocks that drop tables must run BEFORE CREATE TABLE
    const dropTableStatements: string[] = [];
    const usersTableStatements: string[] = [];
    const otherTableStatements: string[] = [];
    const indexStatements: string[] = [];
    const constraintStatements: string[] = [];
    const otherStatements: string[] = [];
    
    for (const stmt of statements) {
      const upperStmt = stmt.toUpperCase();
      // CRITICAL: DO blocks that drop tables must run FIRST
      if (upperStmt.startsWith('DO $$') && (upperStmt.includes('DROP TABLE') || upperStmt.includes('DROP CONSTRAINT'))) {
        dropTableStatements.push(stmt);
      } else if (upperStmt.startsWith('CREATE TABLE')) {
        // CRITICAL: users table must be created first
        // Check for users table (case-insensitive, with or without quotes)
        const stmtLower = stmt.toLowerCase();
        if (stmtLower.includes('"users"') || stmtLower.includes("'users'") || stmtLower.includes(' table "users"') || stmtLower.includes(' table users')) {
          usersTableStatements.push(stmt);
          console.log('✅ Detected users table CREATE statement');
        } else {
          otherTableStatements.push(stmt);
        }
      } else if (upperStmt.startsWith('CREATE INDEX')) {
        indexStatements.push(stmt);
      } else if (upperStmt.startsWith('DO $$') || upperStmt.includes('ALTER TABLE') || upperStmt.includes('ADD CONSTRAINT')) {
        constraintStatements.push(stmt);
      } else {
        otherStatements.push(stmt);
      }
    }
    
    // Reorder: drop statements FIRST, then users table, then other tables, then indexes, then constraints, then other
    statements = [...dropTableStatements, ...usersTableStatements, ...otherTableStatements, ...indexStatements, ...constraintStatements, ...otherStatements];
    
    console.log(`📋 Reordered statements: ${dropTableStatements.length} drop statement(s), ${usersTableStatements.length} users table(s), ${otherTableStatements.length} other tables, ${indexStatements.length} indexes, ${constraintStatements.length} constraints, ${otherStatements.length} other`);
    
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
            
            // CRITICAL: If transaction is aborted (25P02), we need to rollback and retry
            if (errorCode === '25P02') {
              console.error(`❌ [${statementCount}] Transaction aborted - previous statement failed`);
              console.error(`❌ [${statementCount}] Need to rollback and retry migration`);
              // Rollback and throw to retry the entire migration
              try {
                await client.query('ROLLBACK');
                console.log('✅ Rolled back transaction due to abort');
              } catch (rollbackErr) {
                console.error('❌ Rollback failed:', rollbackErr);
              }
              throw new Error(`Migration failed: transaction aborted at statement ${statementCount}. Previous statement: ${errorMsg}`);
            }
            
            if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorCode === '42P07') {
              console.log(`⚠️ [${statementCount}] Skipped (already exists): ${statementPreview}`);
              skippedCount++;
            } else {
              console.error(`❌ [${statementCount}] Statement failed: ${errorMsg}`);
              console.error(`❌ [${statementCount}] Error code: ${errorCode}`);
              console.error(`❌ [${statementCount}] Error detail: ${stmtError?.detail || 'none'}`);
              errorCount++;
              // For non-critical errors, continue but we'll verify tables at the end
              // For critical errors (like missing table), throw to abort transaction
              if (errorMsg.includes('does not exist') && errorCode === '42P01') {
                console.error(`❌ [${statementCount}] CRITICAL: Table does not exist - this should not happen if statements are ordered correctly`);
                // Don't throw here - let it continue and we'll check at the end
              }
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

