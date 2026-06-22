const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const lesson = await prisma.lesson.findFirst({
    where: { content: { contains: "lede" } },
    orderBy: { id: 'desc' }
  });
  if (lesson) {
    const text = lesson.content;
    console.log('Length:', text.length);
    console.log('End text:', text.substring(text.length - 1000));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
