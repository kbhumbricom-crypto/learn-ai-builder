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
          { 
            title: 'The Two Systems: Fast Brain vs. Slow Brain', 
            hasPreview: true, 
            isGenerated: true, 
            content: `
# Welcome to System 1 and System 2

Imagine you are driving on an empty highway. You don't have to think about keeping the car in the lane; you just do it. You can listen to the radio, talk to your passenger, or get lost in thought. This is **System 1** at work: fast, automatic, intuitive, and largely unconscious.

Now imagine you are asked to multiply 17 by 24 in your head. You immediately feel a sense of cognitive strain. You have to retrieve the rules of multiplication, hold intermediate results in your memory, and focus intently. This is **System 2**: slow, deliberate, analytical, and highly conscious.

## The Core Concept

In his groundbreaking work, Nobel laureate Daniel Kahneman popularized this two-system framework to explain how we think and make decisions.

1. **System 1 (The Autopilot):** It operates automatically and quickly, with little or no effort and no sense of voluntary control. It handles innate skills (like recognizing a face) and learned associations (like reading simple words).
2. **System 2 (The Pilot):** It allocates attention to the effortful mental activities that demand it, including complex computations. The operations of System 2 are often associated with the subjective experience of agency, choice, and concentration.

### Why Does This Matter?

Most of the time, we navigate the world using System 1. It is incredibly efficient and usually highly accurate in familiar situations. However, System 1 is prone to systematic errors, or **biases**. Because it relies on heuristics (mental shortcuts), it can be easily fooled.

System 2 is lazy. It typically accepts the suggestions of System 1 without much scrutiny. When System 1 encounters a problem it cannot solve (like the math problem above), it calls on System 2 to help. 

The key to better decision-making is learning to recognize situations in which mistakes are likely and trying harder to avoid significant mistakes when the stakes are high. You need to know when to trust your intuition (System 1) and when to engage your analytical mind (System 2).
            `
          },
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
