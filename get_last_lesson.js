import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { isGenerated: true },
    select: { content: true }
  });
  const lastLesson = lessons[lessons.length - 1];
  console.log("FULL DIAGRAM BLOCK:");
  console.log(lastLesson?.content?.match(/```mermaid([\s\S]*?)```/)?.[1] || "No mermaid diagram found");
}
main().finally(() => prisma.$disconnect());
