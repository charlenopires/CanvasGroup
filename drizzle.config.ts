import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.NEON_DB) {
  throw new Error('NEON_DB environment variable is not set');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEON_DB,
  },
});
