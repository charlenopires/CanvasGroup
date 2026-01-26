import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { isAdminEmail } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET endpoint for debugging
export async function GET() {
  console.log('[Auth Login GET] Health check');
  try {
    const { db } = await import('@/db');
    const { users } = await import('@/db/schema');

    const count = await db.select().from(users);
    return NextResponse.json({
      status: 'ok',
      userCount: count.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Auth Login GET] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

interface LoginRequest {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export async function POST(request: NextRequest) {
  console.log('[Auth Login] === NEW REQUEST ===');

  try {
    // Dynamic import to catch any module-level errors
    const { db } = await import('@/db');
    const { users, activityLogs } = await import('@/db/schema');

    console.log('[Auth Login] DB modules loaded');

    // Parse body
    let body: LoginRequest;
    try {
      const rawBody = await request.text();
      console.log('[Auth Login] Raw body length:', rawBody.length);
      body = JSON.parse(rawBody);
      console.log('[Auth Login] Body parsed:', { email: body.email, hasUid: !!body.firebaseUid });
    } catch (parseError) {
      console.error('[Auth Login] Parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON', details: String(parseError) }, { status: 400 });
    }

    const { firebaseUid, email, displayName, photoURL } = body;

    // Validate
    if (!firebaseUid || !email) {
      console.log('[Auth Login] Validation failed - missing fields');
      return NextResponse.json({ error: 'firebaseUid and email are required' }, { status: 400 });
    }

    // Get metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const role = isAdminEmail(email) ? 'admin' : 'student';

    console.log('[Auth Login] Looking up user by firebaseUid:', firebaseUid.substring(0, 8) + '...');

    // Find user by firebaseUid
    let existingUser = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });

    console.log('[Auth Login] Found by uid:', !!existingUser);

    // If not found, try by email
    if (!existingUser) {
      console.log('[Auth Login] Trying by email:', email);
      existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      console.log('[Auth Login] Found by email:', !!existingUser);
    }

    let user;

    if (existingUser) {
      console.log('[Auth Login] Updating existing user:', existingUser.id);
      const [updatedUser] = await db
        .update(users)
        .set({
          firebaseUid,
          email,
          displayName: displayName || existingUser.displayName,
          photoURL: photoURL || existingUser.photoURL,
          role,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      user = updatedUser;
      console.log('[Auth Login] User updated');
    } else {
      console.log('[Auth Login] Creating new user...');
      const [newUser] = await db
        .insert(users)
        .values({
          firebaseUid,
          email,
          displayName,
          photoURL,
          role,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        })
        .returning();
      user = newUser;
      console.log('[Auth Login] User created:', user.id);
    }

    // Log activity (non-blocking)
    db.insert(activityLogs).values({
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      details: `User ${email} logged in`,
      ipAddress,
      userAgent,
    }).catch(err => console.error('[Auth Login] Activity log error:', err));

    const response = {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
    };

    console.log('[Auth Login] SUCCESS:', response.email, response.role);
    return NextResponse.json(response);

  } catch (error) {
    console.error('[Auth Login] TOP-LEVEL ERROR:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      error: 'Server error',
      details: message,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined
    }, { status: 500 });
  }
}
