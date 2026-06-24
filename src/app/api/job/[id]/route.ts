import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.jobQueue.findUnique({
      where: { id: params.id }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: job.status,
      courseId: job.courseId,
      error: job.error
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
