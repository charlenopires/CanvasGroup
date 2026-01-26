import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      ok: true,
      received: body,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: String(error)
    }, { status: 400 });
  }
}
