import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const seenTitles = new Set();
  let deletedCount = 0;
  
  for (const course of courses) {
    if (seenTitles.has(course.title)) {
      console.log(`Deleting duplicate course: ${course.id}`);
      await prisma.course.delete({ where: { id: course.id } });
      deletedCount++;
    } else {
      seenTitles.add(course.title);
      console.log(`Keeping course: ${course.id} (${course.title})`);
    }
  }
  
  console.log(`Deleted ${deletedCount} duplicate courses.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
