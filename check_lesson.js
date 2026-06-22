import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 1
  });
  console.log(JSON.stringify(lessons, null, 2));
}
main();
