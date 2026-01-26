import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { connections, activityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get client IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find connection with related groups
    const connection = await db.query.connections.findFirst({
      where: eq(connections.id, id),
      with: {
        source: true,
        target: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Soft delete - set deletedAt timestamp
    await db
      .update(connections)
      .set({ deletedAt: new Date() })
      .where(eq(connections.id, id));

    // Log the deletion in activity log
    await db.insert(activityLogs).values({
      action: 'delete',
      entityType: 'connection',
      entityId: id,
      details: `Removed connection "${connection.appName}" between ${connection.source?.name || 'Unknown'} and ${connection.target?.name || 'Unknown'}`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        appName: connection.appName,
        sourceName: connection.source?.name,
        targetName: connection.target?.name,
      },
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}
