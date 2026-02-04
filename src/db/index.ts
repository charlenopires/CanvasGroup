import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// In local dev, Next.js loads .env.local automatically.
// In production (Fly.io), env vars are set by the platform.
// During Docker build, NEON_DB is intentionally absent.

const connectionString = process.env.NEON_DB;

let db: NeonHttpDatabase<typeof schema>;

if (connectionString) {
  if (connectionString.startsWith('napi_')) {
    throw new Error('Invalid NEON_DB: API key provided instead of PostgreSQL connection string.');
  }
  if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
    throw new Error('Invalid NEON_DB: Must be a PostgreSQL connection string starting with postgresql://');
  }

  const sql = neon(connectionString);
  db = drizzle({ client: sql, schema });
} else {
  // Build time: NEON_DB is not available. Create a proxy that throws
  // only if someone actually tries to query the database during build.
  db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
    get(_, prop) {
      if (prop === 'then' || typeof prop === 'symbol') return undefined;
      throw new Error(`Database not available: NEON_DB is not set (accessed: ${String(prop)})`);
    },
  });
}

export { db };
export * from './schema';
