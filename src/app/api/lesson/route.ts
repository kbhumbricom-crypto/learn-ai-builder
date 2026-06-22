import { NextResponse } from 'next/server';
import { streamText, generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import prisma from '@/lib/prisma';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { lessonId, strength = 10, forceGenerate = false } = await req.json();

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: { instructor: true }
            }
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Return cached content if lesson was already generated
    if (!forceGenerate && lesson.isGenerated && lesson.content) {
      return NextResponse.json({ content: lesson.content, title: lesson.title, success: true });
    }

    const course = lesson.module.course;
    const instructor = course.instructor;
    const persona = instructor?.persona ? JSON.parse(instructor.persona) : {};

    // ---------------------------------------------------------------------------
    // STAGE 1: THE ARCHITECT (Fast Research & Structuring)
    // ---------------------------------------------------------------------------
    const architectPrompt = `You are an expert curriculum architect.
    Your job is to read the Source Material and create a highly detailed, fact-dense outline for a specific lesson.
    
    Source Material:
    ${course.sourceText ? `"""\n${course.sourceText}\n"""` : 'No source material provided.'}
    
    Course: ${course.title}
    Module: ${lesson.module.title}
    Lesson: ${lesson.title}
    
    Output a strict, bulleted outline containing:
    1. The core learning objectives.
    2. Specific facts, definitions, or numbers pulled strictly from the Source Material.
    3. A suggested structural flow for the lesson.
    
    Do NOT write the actual lesson prose. Just output the outline.`;

    const { text: architectOutline } = await generateText({
      model: groq('llama-3.1-8b-instant'), // Extremely fast 8B model for outlining
      prompt: architectPrompt,
      temperature: 0.1,
    });

    // ---------------------------------------------------------------------------
    // STAGE 2: THE AUTHOR (Prose & Formatting)
    // ---------------------------------------------------------------------------
    const prompt = `Ghost-write ONE comprehensive, deep-dive lesson AS the instructor.
    Instructor Name: ${instructor?.name}
    Instructor Title: ${instructor?.title}
    
    Here is the Architect's Detailed Outline (Use this as your absolute ground truth for facts and structure):
    """
    ${architectOutline}
    """
    
    Persona:
    Summary: ${persona.summary}
    Voice: ${persona.voice?.join(', ')}
    Habits: ${persona.signatures?.join(', ')}
    Analogies: ${persona.analogies?.join(', ')}
    Depth: ${persona.depth || 'High'}
    
    Course Title: ${course.title}
    Module Title: ${lesson.module.title}
    Lesson Title: ${lesson.title}
    
    Persona-strength: ${strength}/10
    (0 = neutral textbook, 10 = full mimicry of the persona). Adjust your voice/example/depth mimicry accordingly.
    
    Constraints:
    - Strictly follow the Architect's Outline provided above.
    - ~600–800 words. This MUST be a comprehensive deep dive.
    - Write in a highly engaging, scannable "Medium / LinkedIn" article style using Markdown.
    - Do NOT include a top-level # Lesson Title header. Start directly with the hook.
    - Use "The Hook Economy": Open with a bold, controversial, or highly relatable statement.
    - Use "White Space as a Feature": Keep paragraphs extremely short (1 to 3 sentences maximum) for high scannability.
    - Use markdown formatting extensively: **bolding** for emphasis, > blockquotes for quotes or key rules, and bullet points for lists.
    - FLOWCHART RULES: If explaining a step-by-step process, system, or timeline, generate exactly ONE flowchart using a code block labeled \`\`\`flowchart.
      Inside the code block, simply write a bulleted list of the steps. You can optionally add a description separated by a colon. 
      Example format:
      \`\`\`flowchart
      - MVP: Build the absolute minimum viable product to test the core hypothesis.
      - Build and Test: Deploy it to a small group of beta testers.
      - Customer Discovery: Gather feedback and find product-market fit.
      - Iterate and Refine: Polish the features based on data.
      \`\`\`
      DO NOT use Mermaid.js syntax. Only use the simple bulleted list format above.
    - Break down complex topics thoroughly with clear Markdown headers (##).
    - Provide at least one rich, real-world example.
    - NEVER repeat paragraphs or sentences. Keep the narrative moving forward.
    - Do NOT explicitly state your persona or role (e.g. do NOT say "As a product leader", "As a professor", "As an expert"). Just adopt the tone, content, and perspective naturally.
    - Do NOT wrap your response in a json block. Just output raw markdown text.
    `;

    let result;
    try {
      result = await streamText({
        model: groq('llama-3.3-70b-versatile'), // Heavy model for prose
        prompt,
        temperature: 0.3,
        abortSignal: AbortSignal.timeout(25000),
        onFinish: async ({ text }) => {
          try {
            await prisma.lesson.update({
              where: { id: lessonId },
              data: { content: text, isGenerated: true }
            });
          } catch (dbError) {
            console.error("Critical DB Sync Error during stream finish:", dbError);
          }
        }
      });
    } catch (initialError: any) {
      const errMsg = (initialError?.message || '').toLowerCase();
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
        console.warn("Primary model rate limited. Falling back to secondary model for streaming...");
        result = await streamText({
          model: groq('llama-3.1-8b-instant'), // Fallback
          prompt,
          temperature: 0.3,
          abortSignal: AbortSignal.timeout(25000),
          onFinish: async ({ text }) => {
            try {
              await prisma.lesson.update({
                where: { id: lessonId },
                data: { content: text, isGenerated: true }
              });
            } catch (dbError) {
              console.error("Critical DB Sync Error during fallback stream finish:", dbError);
            }
          }
        });
      } else {
        throw initialError;
      }
    }

    return result.toTextStreamResponse({
      headers: {
        'x-lesson-title': encodeURIComponent(lesson.title)
      }
    });
  } catch (error: any) {
    console.error('Lesson Generation API Error:', error);
    const errMsg = (error?.message || '').toLowerCase();
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
      return NextResponse.json({ error: 'Google API Rate Limit Exceeded', isRateLimit: true, retryAfter: 60 }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
