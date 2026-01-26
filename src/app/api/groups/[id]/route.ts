import { NextRequest, NextResponse } from 'next/server';
import { db, groups, groupMembers, connections, activityLogs } from '@/db';
import { eq, or, isNull } from 'drizzle-orm';

// PATCH - Update group
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, leaderName, leaderAvatar, projectId, status, positionX, positionY, members, userId } = body;

    // Get IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if group exists
    const existingGroup = await db.query.groups.findFirst({
      where: eq(groups.id, id),
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof groups.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (leaderName !== undefined) updateData.leaderName = leaderName;
    if (leaderAvatar !== undefined) updateData.leaderAvatar = leaderAvatar;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (status !== undefined) updateData.status = status;
    if (positionX !== undefined) updateData.positionX = positionX;
    if (positionY !== undefined) updateData.positionY = positionY;

    // Update group
    const [updatedGroup] = await db
      .update(groups)
      .set(updateData)
      .where(eq(groups.id, id))
      .returning();

    // Update members if provided
    if (members !== undefined) {
      // Delete existing members
      await db.delete(groupMembers).where(eq(groupMembers.groupId, id));

      // Add new members
      if (members.length > 0) {
        await db.insert(groupMembers).values(
          members.map((memberName: string) => ({
            groupId: id,
            name: memberName,
          }))
        );
      }
    }

    // Log activity if userId is provided
    if (userId) {
      await db.insert(activityLogs).values({
        userId,
        action: 'update',
        entityType: 'group',
        entityId: id,
        details: `Updated group "${updatedGroup.name}"`,
        ipAddress,
        userAgent,
      });
    }

    // Fetch the complete group with members
    const completeGroup = await db.query.groups.findFirst({
      where: eq(groups.id, id),
      with: {
        members: true,
      },
    });

    return NextResponse.json(completeGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse body for userId (optional)
    let userId: string | null = null;
    try {
      const body = await request.json();
      userId = body.userId || null;
    } catch {
      // Body is optional for DELETE
    }

    // Get IP and user agent for activity log
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if group exists
    const existingGroup = await db.query.groups.findFirst({
      where: eq(groups.id, id),
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Soft delete associated connections (mark as deleted)
    await db
      .update(connections)
      .set({ deletedAt: new Date() })
      .where(
        or(
          eq(connections.sourceId, id),
          eq(connections.targetId, id)
        )
      );

    // Delete members
    await db.delete(groupMembers).where(eq(groupMembers.groupId, id));

    // Delete the group
    await db.delete(groups).where(eq(groups.id, id));

    // Log activity if userId is provided
    if (userId) {
      await db.insert(activityLogs).values({
        userId,
        action: 'delete',
        entityType: 'group',
        entityId: id,
        details: `Deleted group "${existingGroup.name}" and soft-deleted associated connections`,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
