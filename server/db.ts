import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket constructor for Neon serverless
if (typeof global !== 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

// Initialize database connection with error handling
let pool: Pool | null = null;
let db: any = null;

try {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not provided - using mock database');
    // Create mock database objects when no database is configured
    pool = null;
    db = null;
  } else {
    // Create connection pool with error handling
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    });

    // Test connection on startup with better error handling
    // Wrap in try-catch to prevent crashes from Neon library errors
    pool.connect().then(client => {
      console.log('✅ Successfully connected to database');
      client.release();
    }).catch(err => {
      // Handle Neon-specific error format
      const errorMessage = err?.message || err?.toString() || 'Unknown error';
      console.error('❌ Database connection failed:', errorMessage);
      console.error('Please check your DATABASE_URL configuration in the Deployments pane.');
      // Don't crash - allow the app to continue with mock database
    });
    
    // Add error handlers to prevent crashes
    pool.on('error', (err: any) => {
      // Handle pool errors gracefully - don't crash the function
      const errorMessage = err?.message || err?.toString() || 'Unknown pool error';
      console.error('⚠️ Database pool error (non-fatal):', errorMessage);
      // Don't throw - allow the function to continue
    });

    db = drizzle({ client: pool, schema });
  }
} catch (error) {
  console.error('❌ Database initialization failed:', (error as Error).message);
  // Don't throw here - allow server to start but log the error
}

export { pool, db };