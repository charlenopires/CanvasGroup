import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.NEON_DB) {
  throw new Error('NEON_DB environment variable is not set. Please add your Neon PostgreSQL connection string to .env file.');
}

const sql = neon(process.env.NEON_DB);

export const db = drizzle({ client: sql, schema });

export * from './schema';
