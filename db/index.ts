import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database connection configuration
 * Ensure DATABASE_URL is set in your .env.local file
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
// Using prepare: false for compatibility with serverless/edge runtime
const client = postgres(connectionString, { prepare: false });

// Create drizzle instance with schema
export const db = drizzle(client, { schema });
