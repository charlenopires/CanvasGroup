import { NextResponse } from 'next/server';

export async function GET() {
    const neonDb = process.env.NEON_DB;

    return NextResponse.json({
        exists: !!neonDb,
        firstChars: neonDb?.substring(0, 20) || 'NOT SET',
        startsWithPostgresql: neonDb?.startsWith('postgresql://') || false,
        startsWithNapi: neonDb?.startsWith('napi_') || false,
        length: neonDb?.length || 0,
    });
}
