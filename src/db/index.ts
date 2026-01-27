import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Force load .env.local FIRST to override any Next.js cached values
// This runs before Next.js's own environment variable processing
const envLocalPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath, override: true });

console.log('[DB] Loaded .env.local from:', envLocalPath);

// Validate environment variable
const connectionString = process.env.NEON_DB;

// DEBUG: Log what we're actually reading
console.log('[DB] NEON_DB value (first 50 chars):', connectionString?.substring(0, 50));
console.log('[DB] NEON_DB starts with:', connectionString?.substring(0, 10));

if (!connectionString) {
  console.error('[DB] NEON_DB environment variable is not set');
  throw new Error('NEON_DB environment variable is not set. Please add your Neon PostgreSQL connection string to .env file.');
}

// Validate that it's a proper PostgreSQL connection string, not an API key
if (connectionString.startsWith('napi_')) {
  console.error('[DB] ERROR: You are using a Neon API key instead of a connection string!');
  console.error('[DB] Please use the PostgreSQL connection string from your Neon dashboard.');
  console.error('[DB] It should look like: postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname');
  throw new Error('Invalid NEON_DB: API key provided instead of PostgreSQL connection string. Please check your .env file.');
}

if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
  console.error('[DB] ERROR: NEON_DB must be a valid PostgreSQL connection string');
  console.error('[DB] It should start with postgresql:// or postgres://');
  throw new Error('Invalid NEON_DB: Must be a PostgreSQL connection string starting with postgresql://');
}

// Create neon client
const sql = neon(connectionString);

// Create drizzle instance
export const db = drizzle({ client: sql, schema });

// Log successful initialization (only once)
console.log('[DB] Database client initialized');

export * from './schema';
