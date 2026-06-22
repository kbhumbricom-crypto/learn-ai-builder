import { PrismaClient } from '@prisma/client';
import { DEMO_COURSE_ID } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.upsert({
    where: { id: DEMO_COURSE_ID },
    update: {},
    create: {
      id: DEMO_COURSE_ID,
      title: 'The Psychology of Decision Making',
      tagline: 'Why we choose what we choose, and how to choose better.',
      audience: 'Curious minds, professionals, and lifelong learners',
      durationLabel: '6 weeks',
      modulesCount: 3,
      lessonsCount: 8,
      instructor: {
        create: {
          name: 'Dr. Maya Chen',
          title: 'Behavioral Psychologist & Author',
          persona: JSON.stringify({
            summary: 'A warm, sharp-witted professor who makes complex psychological research feel like dinner-table conversation. She weaponizes everyday stories to make abstract concepts click.',
            voice: ['Conversational', 'Witty', 'Story-driven', 'Empathetic'],
            signatures: ['Opens with a surprising real-world scenario', 'Uses "Here\'s the weird part..." as a transition', 'Ends lessons with a reflective question'],
            analogies: ['Compares cognitive biases to optical illusions', 'Uses grocery shopping as a decision-making lab', 'References poker strategy for risk assessment'],
            depth: 'Accessible but rigorous. Cites studies but always translates them into plain language.',
          }),
        },
      },
    },
  });

  // Cleanup existing modules for idempotency
  await prisma.module.deleteMany({
    where: { courseId: DEMO_COURSE_ID },
  });

  // Module 1
  await prisma.module.create({
    data: {
      n: 1,
      title: 'The Architecture of Choice',
      weekLabel: 'Week 1-2',
      blurb: 'How your brain builds decisions before you even know you\'re deciding.',
      courseId: course.id,
      lessons: {
        create: [
          { title: 'The Two Systems: Fast Brain vs. Slow Brain', hasPreview: false, isGenerated: false, content: null },
          { title: 'Why Your First Instinct Is Usually Wrong', hasPreview: false, isGenerated: false, content: null },
          { title: 'The Paradox of Too Many Options', hasPreview: false, isGenerated: false, content: null },
        ],
      },
    },
  });

  // Module 2
  await prisma.module.create({
    data: {
      n: 2,
      title: 'The Hidden Persuaders',
      weekLabel: 'Week 3-4',
      blurb: 'The invisible forces that shape your choices every single day.',
      courseId: course.id,
      lessons: {
        create: [
          { title: 'Anchoring: Why the First Number Wins', hasPreview: false, isGenerated: false, content: null },
          { title: 'The Framing Effect: Same Facts, Different Decisions', hasPreview: false, isGenerated: false, content: null },
          { title: 'Social Proof and the Herd Instinct', hasPreview: false, isGenerated: false, content: null },
        ],
      },
    },
  });

  // Module 3
  await prisma.module.create({
    data: {
      n: 3,
      title: 'Designing Better Decisions',
      weekLabel: 'Week 5-6',
      blurb: 'Practical frameworks for making clearer, calmer, and more confident choices.',
      courseId: course.id,
      lessons: {
        create: [
          { title: 'Pre-Mortems: Thinking Backward to Move Forward', hasPreview: false, isGenerated: false, content: null },
          { title: 'The 10-10-10 Rule for High-Stakes Choices', hasPreview: false, isGenerated: false, content: null },
        ],
      },
    },
  });

  console.log('Demo course seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
