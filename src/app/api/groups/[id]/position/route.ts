import { NextResponse } from 'next/server';
import { db, groups } from '@/db';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { x, y } = body;

    if (typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json(
        { error: 'Invalid position coordinates' },
        { status: 400 }
      );
    }

    const [updatedGroup] = await db
      .update(groups)
      .set({
        positionX: Math.round(x),
        positionY: Math.round(y),
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();

    if (!updatedGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, position: { x: updatedGroup.positionX, y: updatedGroup.positionY } });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}
