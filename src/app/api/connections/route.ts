import { NextRequest, NextResponse } from 'next/server';
import { db, connections, activityLogs, groups } from '@/db';
import { isNull, eq, or, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: ReturnType<typeof eq>[] = [];

    // Filter by deleted status
    if (!includeDeleted) {
      conditions.push(isNull(connections.deletedAt));
    }

    // Filter by group (either source or target)
    if (groupId) {
      conditions.push(
        or(
          eq(connections.sourceId, groupId),
          eq(connections.targetId, groupId)
        )!
      );
    }

    // Count total for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(connections)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = Number(countResult[0]?.count || 0);

    // Fetch connections with relations
    const allConnections = await db.query.connections.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        source: true,
        target: true,
      },
      orderBy: [desc(connections.createdAt)],
      limit: limit + 1, // Fetch one extra to check for more
      offset,
    });

    // Check if there are more results
    const hasMore = allConnections.length > limit;
    const data = hasMore ? allConnections.slice(0, limit) : allConnections;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, targetId, appName, userId } = body;

    if (!sourceId || !targetId || !appName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const [newConnection] = await db.insert(connections).values({
      sourceId,
      targetId,
      appName,
    }).returning();

    // Log activity if userId is provided
    if (userId) {
      // Get group names for better details
      const sourceGroup = await db.query.groups.findFirst({
        where: eq(groups.id, sourceId),
        columns: { name: true },
      });
      const targetGroup = await db.query.groups.findFirst({
        where: eq(groups.id, targetId),
        columns: { name: true },
      });

      await db.insert(activityLogs).values({
        userId,
        action: 'create',
        entityType: 'connection',
        entityId: newConnection.id,
        details: `Created connection "${appName}" between "${sourceGroup?.name || sourceId}" and "${targetGroup?.name || targetId}"`,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json(newConnection, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}
