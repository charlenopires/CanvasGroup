import { NextRequest, NextResponse } from 'next/server';
import { db, groups, groupMembers, activityLogs } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allGroups = await db.query.groups.findMany({
      with: {
        members: true,
        grades: {
          orderBy: (grades, { desc }) => [desc(grades.createdAt)],
          limit: 1,
        },
      },
      orderBy: (groups, { asc }) => [asc(groups.type), asc(groups.name)],
    });

    // Transform to include grade and observations from the most recent grade entry
    const groupsWithGrade = allGroups.map(group => ({
      ...group,
      grade: group.grades[0] ? group.grades[0].grade : undefined,
      observations: group.grades[0] ? group.grades[0].observations : undefined,
    }));

    return NextResponse.json(groupsWithGrade);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, leaderName, leaderAvatar, projectId, status, positionX, positionY, members, userId } = body;

    // Get IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create group
    const [newGroup] = await db.insert(groups).values({
      name,
      type,
      leaderName,
      leaderAvatar,
      projectId,
      status: status || 'active',
      positionX: positionX || 0,
      positionY: positionY || 0,
      createdBy: userId || null,
    }).returning();

    // Add members if provided
    if (members && members.length > 0) {
      await db.insert(groupMembers).values(
        members.map((memberName: string) => ({
          groupId: newGroup.id,
          name: memberName,
        }))
      );
    }

    // Log activity if userId is provided
    if (userId) {
      await db.insert(activityLogs).values({
        userId,
        action: 'create',
        entityType: 'group',
        entityId: newGroup.id,
        details: `Created group "${name}" (${type})`,
        ipAddress,
        userAgent,
      });
    }

    // Fetch the complete group with members
    const completeGroup = await db.query.groups.findFirst({
      where: eq(groups.id, newGroup.id),
      with: {
        members: true,
      },
    });

    return NextResponse.json(completeGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
