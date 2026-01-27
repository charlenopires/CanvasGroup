
import { NextResponse } from 'next/server';
import { db, grades } from '@/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { groupId, grade, observations } = body;

        if (!groupId || grade === undefined) {
            return NextResponse.json(
                { error: 'Group ID and grade are required' },
                { status: 400 }
            );
        }

        // Insert new grade entry (historical record)
        const [newGrade] = await db.insert(grades).values({
            groupId,
            grade,
            observations,
        }).returning();

        return NextResponse.json(newGrade);
    } catch (error) {
        console.error('Error saving grade:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
