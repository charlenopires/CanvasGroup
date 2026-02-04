import { NextRequest, NextResponse } from 'next/server';
import { db, projectSubmissions, activityLogs, groups } from '@/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const submissions = await db.query.projectSubmissions.findMany({
      where: groupId ? eq(projectSubmissions.groupId, groupId) : undefined,
      with: {
        group: {
          columns: { id: true, name: true, type: true },
        },
        submittedByUser: {
          columns: { displayName: true, email: true },
        },
      },
      orderBy: [desc(projectSubmissions.createdAt)],
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, projectUrl, userId } = body;

    if (!groupId || !projectUrl) {
      return NextResponse.json(
        { error: 'groupId and projectUrl are required' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      const url = new URL(projectUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json(
          { error: 'URL must use http or https protocol' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Verify group exists
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      columns: { id: true, name: true },
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

    // Check if group already has a submission (upsert)
    const existing = await db.query.projectSubmissions.findFirst({
      where: eq(projectSubmissions.groupId, groupId),
    });

    let submission;

    if (existing) {
      const [updated] = await db
        .update(projectSubmissions)
        .set({
          projectUrl,
          submittedBy: userId || null,
          updatedAt: new Date(),
        })
        .where(eq(projectSubmissions.id, existing.id))
        .returning();
      submission = updated;

      if (userId) {
        await db.insert(activityLogs).values({
          userId,
          action: 'update',
          entityType: 'submission',
          entityId: submission.id,
          details: `Updated project link for group "${group.name}": ${projectUrl}`,
          ipAddress,
          userAgent,
        });
      }
    } else {
      const [created] = await db.insert(projectSubmissions).values({
        groupId,
        projectUrl,
        submittedBy: userId || null,
      }).returning();
      submission = created;

      if (userId) {
        await db.insert(activityLogs).values({
          userId,
          action: 'create',
          entityType: 'submission',
          entityId: submission.id,
          details: `Submitted project link for group "${group.name}": ${projectUrl}`,
          ipAddress,
          userAgent,
        });
      }
    }

    return NextResponse.json(submission, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}
