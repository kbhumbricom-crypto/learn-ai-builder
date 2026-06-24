import { NextResponse } from 'next/server';
import { streamText, generateText } from 'ai';
import { getAvailableGroqClient, markKeyRateLimited } from '@/lib/groqRotation';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { lessonId, strength = 10, forceGenerate = false, modelId = 'llama-3.3-70b-versatile' } = await req.json();

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

    let groqClient: any;
    let currentKey: string = '';
    
    try {
      const available = getAvailableGroqClient();
      groqClient = available.client;
      currentKey = available.apiKey;
    } catch (e: any) {
      if (e.message.startsWith('ALL_KEYS_EXHAUSTED')) {
         const retryAfter = parseInt(e.message.split(':')[1], 10);
         return NextResponse.json({ 
           error: 'All AI Engines are currently busy. Please wait.', 
           isRateLimit: true,
           retryAfter
         }, { status: 429 });
      }
      throw e;
    }

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

    let architectOutline = "";
    let architectSuccess = false;
    let architectLastError: any = null;
    const ARCHITECT_MODELS = ['llama-3.1-8b-instant', 'gemma2-9b-it', 'mixtral-8x7b-32768'];

    for (const model of ARCHITECT_MODELS) {
      try {
        let currentGroqClient = groqClient;
        try {
          const { text } = await generateText({
            model: currentGroqClient(model),
            prompt: architectPrompt,
            temperature: 0.1,
          });
          architectOutline = text;
          architectSuccess = true;
          break;
        } catch (e: any) {
          const errMsg = (e?.message || '').toLowerCase();
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
             markKeyRateLimited(currentKey, 60);
             const backup = getAvailableGroqClient();
             currentGroqClient = backup.client;
             currentKey = backup.apiKey;
             
             const { text } = await generateText({
               model: currentGroqClient(model),
               prompt: architectPrompt,
               temperature: 0.1,
             });
             architectOutline = text;
             architectSuccess = true;
             break;
          } else {
             throw e;
          }
        }
      } catch (loopError: any) {
        architectLastError = loopError;
        console.warn(`Architect Model ${model} failed. Automatically trying next fallback...`);
      }
    }

    if (!architectSuccess) {
      throw architectLastError || new Error("All AI engines failed to generate the outline.");
    }

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

    const FALLBACK_MODELS = ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.1-8b-instant'];
    let result;
    let success = false;
    let lastError: any = null;

    for (const model of FALLBACK_MODELS) {
      try {
        let currentGroqClient = groqClient;
        
        try {
          result = await streamText({
            model: currentGroqClient(model),
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
          success = true;
          break; // If successful, exit loop
        } catch (streamError: any) {
          const errMsg = (streamError?.message || '').toLowerCase();
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
            console.warn(`Model ${model} rate limited on primary key. Swapping to backup key...`);
            markKeyRateLimited(currentKey, 60);
            
            const backup = getAvailableGroqClient();
            currentGroqClient = backup.client;
            currentKey = backup.apiKey;
            
            result = await streamText({
              model: currentGroqClient(model),
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
            success = true;
            break; // If successful on backup key, exit loop
          } else {
            throw streamError; // Throw up to loopError block
          }
        }
      } catch (loopError: any) {
        lastError = loopError;
        console.warn(`Model ${model} failed (${loopError?.message || 'Unknown'}). Automatically trying next fallback...`);
      }
    }

    if (!success || !result) {
      throw lastError || new Error("All AI engines failed to respond.");
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
