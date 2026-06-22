import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { completed: true },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { n: 'asc' },
                  include: { lessons: { orderBy: { id: 'asc' } } }
                }
              }
            }
          }
        }
      }
    });

    const allLessons = lesson.module.course.modules.flatMap((m: any) => m.lessons);
    const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
    const nextLesson = allLessons[currentIndex + 1];

    return NextResponse.json({ success: true, lesson, nextLessonId: nextLesson?.id || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
