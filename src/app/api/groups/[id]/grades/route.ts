import { NextRequest, NextResponse } from 'next/server';
import { db, grades, groups, users, activityLogs } from '@/db';
import { eq, desc } from 'drizzle-orm';

// GET - Fetch grade history for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gradeHistory = await db.query.grades.findMany({
      where: eq(grades.groupId, id),
      with: {
        gradedByUser: {
          columns: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: [desc(grades.createdAt)],
    });

    // Transform grades for display (divide by 10)
    const transformedGrades = gradeHistory.map(g => ({
      ...g,
      grade: g.grade / 10,
    }));

    return NextResponse.json({
      currentGrade: transformedGrades[0] || null,
      history: transformedGrades,
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

// POST - Create new grade (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { grade, observations, userId } = body;

    // Validate grade value (0-10)
    if (typeof grade !== 'number' || grade < 0 || grade > 10) {
      return NextResponse.json(
        { error: 'Grade must be between 0 and 10' },
        { status: 400 }
      );
    }

    // Validate 0.5 increment
    if ((grade * 10) % 5 !== 0) {
      return NextResponse.json(
        { error: 'Grade must be in 0.5 increments' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists and is admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can assign grades' },
        { status: 403 }
      );
    }

    // Verify group exists
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, id),
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert grade (stored as 0-100 internally)
    const [newGrade] = await db.insert(grades).values({
      groupId: id,
      grade: Math.round(grade * 10),
      observations: observations?.trim() || null,
      gradedBy: userId,
    }).returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: userId,
      action: 'create',
      entityType: 'grade',
      entityId: newGrade.id,
      details: `Assigned grade ${grade} to group "${group.name}"${observations ? ` - ${observations}` : ''}`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ...newGrade,
      grade: newGrade.grade / 10,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    );
  }
}
