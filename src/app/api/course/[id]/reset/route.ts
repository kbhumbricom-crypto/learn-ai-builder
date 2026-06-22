import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: { modules: { select: { id: true } } }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const moduleIds = course.modules.map(m => m.id);

    await prisma.lesson.updateMany({
      where: {
        moduleId: { in: moduleIds }
      },
      data: {
        completed: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
