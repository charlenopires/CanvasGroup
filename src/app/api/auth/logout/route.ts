import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, activityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface LogoutRequest {
  firebaseUid: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LogoutRequest = await request.json();
    const { firebaseUid } = body;

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'firebaseUid is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });

    if (user) {
      // Log the logout activity
      await db.insert(activityLogs).values({
        userId: user.id,
        action: 'logout',
        entityType: 'user',
        entityId: user.id,
        details: `User ${user.email} logged out`,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { error: 'Failed to process logout' },
      { status: 500 }
    );
  }
}
