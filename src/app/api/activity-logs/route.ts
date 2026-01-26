import { NextRequest, NextResponse } from 'next/server';
import { db, activityLogs } from '@/db';
import { desc, eq, gte, lte, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions
    const conditions = [];

    if (action) {
      conditions.push(eq(activityLogs.action, action as any));
    }

    if (entityType) {
      conditions.push(eq(activityLogs.entityType, entityType));
    }

    if (startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      // Add 1 day to include the end date fully
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      conditions.push(lte(activityLogs.createdAt, endDateTime));
    }

    // Query with pagination
    const offset = (page - 1) * limit;

    const logs = await db.query.activityLogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        user: {
          columns: {
            id: true,
            displayName: true,
            photoURL: true,
            email: true,
          },
        },
      },
      orderBy: [desc(activityLogs.createdAt)],
      limit: limit + 1, // Fetch one extra to check if there are more
      offset,
    });

    // Check if there are more results
    const hasMore = logs.length > limit;
    const data = hasMore ? logs.slice(0, limit) : logs;

    // Get total count for pagination info
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(activityLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

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
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
