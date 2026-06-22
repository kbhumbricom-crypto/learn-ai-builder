import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { courseIds } = await request.json();

    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: 'Invalid course IDs' }, { status: 400 });
    }

    await prisma.course.deleteMany({
      where: {
        id: { in: courseIds }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
