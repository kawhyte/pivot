import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database connection configuration
 * Ensure DATABASE_URL is set in your .env.local file
 */
const connectionString = import.meta.env.VITE_DATABASE_URL;

// Only create connection if DATABASE_URL is available
// This prevents build-time errors when env vars aren't set yet
let client: ReturnType<typeof postgres> | null = null;

if (connectionString) {
  // Create postgres connection
  // Using prepare: false for compatibility with serverless/edge runtime
  client = postgres(connectionString, { prepare: false });
}

// Create drizzle instance with schema (or placeholder if no connection)
// The actual database calls will fail at runtime if DATABASE_URL isn't set,
// but this allows the build to complete
export const db = client ? drizzle(client, { schema }) : null as any;
