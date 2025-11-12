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
    pool.connect().then(client => {
      console.log('✅ Successfully connected to database');
      client.release();
    }).catch(err => {
      console.error('❌ Database connection failed:', err.message);
      console.error('Please check your DATABASE_URL configuration in the Deployments pane.');
    });

    db = drizzle({ client: pool, schema });
  }
} catch (error) {
  console.error('❌ Database initialization failed:', (error as Error).message);
  // Don't throw here - allow server to start but log the error
}

export { pool, db };