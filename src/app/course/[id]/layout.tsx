import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles, CheckCircle, Circle, PlayCircle, BookOpen, Settings } from 'lucide-react';
import SidebarClient from './SidebarClient';

import SidebarWrapperClient from './SidebarWrapperClient';
import CourseLayoutClient from './CourseLayoutClient';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { n: 'asc' },
        include: {
          lessons: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <CourseLayoutClient sidebar={<SidebarWrapperClient course={course} courseId={id} />}>
      {children}
    </CourseLayoutClient>
  );
}
