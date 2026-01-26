import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    env: {
      NEON_DB: !!process.env.NEON_DB,
    },
    database: 'unknown' as string,
  };

  try {
    // Test database connection
    const result = await db.execute(sql`SELECT 1 as test`);
    checks.database = 'connected';
  } catch (error) {
    checks.database = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json(checks);
}
