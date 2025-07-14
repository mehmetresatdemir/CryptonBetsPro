import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon with stability improvements
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
neonConfig.pipelineTLS = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let pool: Pool | null = null;
let dbInstance: any = null;

export async function initializeDatabase() {
  try {
    console.log('[DB] Initializing database connection...');
    
    // Create pool with improved connection settings
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 60000,
      max: 10,
      allowExitOnIdle: false
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('[DB] Database pool error:', err);
    });

    // Test connection with timeout
    const client = await pool.connect();
    try {
      await Promise.race([
        client.query('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ]);
    } finally {
      client.release();
    }

    dbInstance = drizzle({ client: pool, schema });
    console.log('[DB] Database connection established successfully');
    
    return dbInstance;
  } catch (error) {
    console.error('[DB] Database initialization failed:', error);
    throw error;
  }
}

// Export pool for other modules that need it
export { pool };

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!dbInstance) {
      console.error('[DB] Database instance is null, attempting to reinitialize...');
      // For development, we could return a mock or try to reinitialize
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return dbInstance[prop];
  }
});