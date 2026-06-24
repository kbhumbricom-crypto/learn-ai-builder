import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAvailableGroqClient, markKeyRateLimited } from '@/lib/groqRotation';
import * as cheerio from 'cheerio';
import { generateText } from 'ai';

// This endpoint should be called periodically by a Cron job or a background worker
export async function POST(req: Request) {
  try {
    // 1. Get the oldest pending job
    const job = await prisma.jobQueue.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    if (!job) {
      return NextResponse.json({ message: 'Queue is empty' });
    }

    // 2. Check if we have an available API key
    let groqClient: any;
    let currentKey: string = '';
    
    try {
      const available = getAvailableGroqClient();
      groqClient = available.client;
      currentKey = available.apiKey;
    } catch (e: any) {
      if (e.message.startsWith('ALL_KEYS_EXHAUSTED')) {
         return NextResponse.json({ message: 'All keys exhausted, will try later', retryAfter: parseInt(e.message.split(':')[1], 10) });
      }
      throw e;
    }

    // 3. Mark job as processing
    await prisma.jobQueue.update({
      where: { id: job.id },
      data: { status: 'PROCESSING' }
    });

    // 4. Run extraction logic
    const response = await fetch(job.courseUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      await failJob(job.id, 'Failed to fetch the provided URL');
      return NextResponse.json({ message: 'Job failed' });
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, noscript, nav, footer, iframe, svg, img').remove();
    let pageText = $('body').text().replace(/\s+/g, ' ').trim();
    if (pageText.length < 50) pageText = $.text().replace(/\s+/g, ' ').trim();
    pageText = pageText.substring(0, 25000);

    if (pageText.length < 300) {
      await failJob(job.id, 'This link does not contain enough readable content to build a course.');
      return NextResponse.json({ message: 'Job failed' });
    }

    const prompt = `You are a world-class curriculum designer and AI extractor. 
Analyze the following text extracted from a webpage (it may be messy).
Determine if it is a course, a syllabus, an article, or a relevant educational topic.
If the content is completely irrelevant, blocked, or invalid, set "isValid" to false.

CRITICAL DISTILLATION INSTRUCTION: You MUST compress and distill the syllabus into EXACTLY 4 to 6 core modules. Each module MUST contain EXACTLY 3 to 5 critical lessons.
You must ADAPT the curriculum based on these User Instructions:
User Custom Instructions: "${job.notes || 'None provided'}"
Instructor Override: "${job.instructorOverride || 'None provided'}"

Return a strict JSON object matching exactly this schema:
{
  "isValid": boolean,
  "course": {
    "title": string,
    "tagline": string,
    "instructorName": string,
    "instructorTitle": string,
    "instructorBio": string
  },
  "persona": {
     "summary": "1 sentence description",
     "voice": ["3 to 5 adjectives"],
     "signatures": ["3 to 5 teaching habits"],
     "analogies": ["1 or 2 types of analogies"]
  },
  "modules": [
    {
      "title": "Module Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "preview": "A 1-2 sentence preview"
        }
      ]
    }
  ]
}

Page Text to analyze:
---
${pageText}
---`;

    let textOutput = "{}";
    try {
      const result = await generateText({
        model: groqClient('llama-3.3-70b-versatile'),
        prompt,
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(25000),
      });
      textOutput = result.text;
    } catch (apiError: any) {
      const errMsg = (apiError?.message || '').toLowerCase();
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exhausted') || errMsg.includes('rate limit')) {
         markKeyRateLimited(currentKey, 60);
         // Put job back to PENDING
         await prisma.jobQueue.update({ where: { id: job.id }, data: { status: 'PENDING' } });
         return NextResponse.json({ message: 'Rate limited during processing, requeued.' });
      }
      throw apiError;
    }

    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    let extraction;
    try {
      extraction = JSON.parse(textOutput);
    } catch (parseError) {
      await failJob(job.id, 'AI failed to generate a valid course structure.');
      return NextResponse.json({ message: 'Job failed' });
    }

    if (!extraction.isValid) {
      await failJob(job.id, 'The provided URL does not appear to contain valid course or educational content.');
      return NextResponse.json({ message: 'Job failed' });
    }

    const { course, persona, modules } = extraction;

    const dbCourse = await prisma.course.create({
      data: {
        title: course.title || 'Custom AI Course',
        tagline: course.tagline,
        sourceLabel: 'Extracted Content',
        sourceText: pageText,
        modulesCount: modules.length,
        lessonsCount: modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0),
        instructor: {
          create: {
            name: course.instructorName || 'AI Expert',
            title: course.instructorTitle || 'Curriculum Designer',
            persona: JSON.stringify(persona),
          }
        },
        modules: {
          create: modules.map((mod: any, mIndex: number) => ({
            n: mIndex + 1,
            title: mod.title,
            lessons: {
              create: mod.lessons.map((les: any) => ({
                title: les.title,
                content: JSON.stringify({ lede: les.preview, blocks: [] })
              }))
            }
          }))
        }
      }
    });

    // 5. Mark job as completed and save courseId
    await prisma.jobQueue.update({
      where: { id: job.id },
      data: { status: 'COMPLETED', courseId: dbCourse.id }
    });

    return NextResponse.json({ message: 'Job processed successfully', courseId: dbCourse.id });

  } catch (error: any) {
    console.error("Queue processing error:", error);
    return NextResponse.json({ error: 'Failed to process queue' }, { status: 500 });
  }
}

async function failJob(id: string, error: string) {
  await prisma.jobQueue.update({
    where: { id },
    data: { status: 'FAILED', error }
  });
}
