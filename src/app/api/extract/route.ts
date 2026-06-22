import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import prisma from '@/lib/prisma';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { courseUrl, notes, instructorOverride } = await req.json();

    if (!courseUrl) {
      return NextResponse.json({ error: 'Course URL is required' }, { status: 400 });
    }

    // 1. Fetch the page with a strict timeout to prevent hanging connections
    const response = await fetch(courseUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the provided URL' }, { status: 400 });
    }

    // Protect against OOM crashes by rejecting massive binary files
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return NextResponse.json({ error: 'URL must point to an HTML page or text document.' }, { status: 400 });
    }
    
    const html = await response.text();
    
    // 2. Extract raw text from the page (stripping garbage)
    const $ = cheerio.load(html);
    $('script, style, noscript, nav, footer, iframe, svg, img').remove();
    let pageText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Fallback if body is empty (e.g. client-rendered SPA without SSR)
    if (pageText.length < 50) {
      // Just extract all text from the HTML broadly
      pageText = $.text().replace(/\s+/g, ' ').trim();
    }
    
    // Expanded limit to 25k characters to give the lesson generator real facts to work with
    pageText = pageText.substring(0, 25000);

    // 2.5 Validation Check: Ensure we actually got readable content
    if (pageText.length < 300) {
      return NextResponse.json(
        { error: 'This link does not contain enough readable content to build a course. Please provide a link to an article, document, or wiki.' }, 
        { status: 400 }
      );
    }

    // 3. Universal AI Extraction
    const prompt = `You are a world-class curriculum designer and AI extractor. 
    
Analyze the following text extracted from a webpage (it may be messy).
Determine if it is a course, a syllabus, an article, or a relevant educational topic.
If the content is completely irrelevant, blocked, or invalid, set "isValid" to false.

If it is valid, extract and infer a structured curriculum from it. 
CRITICAL DISTILLATION INSTRUCTION: You MUST compress and distill the syllabus into EXACTLY 4 to 6 core modules. Each module MUST contain EXACTLY 3 to 5 critical lessons. DO NOT extract every single item from the text if it is massive. Synthesize the most important concepts into this tight structure.
You must ADAPT the curriculum, module titles, lesson topics, and the instructor persona based on these User Instructions:
User Custom Instructions: "${notes || 'None provided'}"
Instructor Override: "${instructorOverride || 'None provided'}"

Return a strict JSON object matching exactly this schema:
{
  "isValid": boolean,
  "course": {
    "title": string, // Main title of the course
    "tagline": string, // A short hook or subtitle
    "instructorName": string, // From the text or the Override
    "instructorTitle": string, // e.g. "Senior Designer", "Professor"
    "instructorBio": string // A concise 2-3 sentence bio. DO NOT include massive paragraphs.
  },
  "persona": {
     "summary": "1 sentence description of their teaching style",
     "voice": ["3 to 5 adjectives"],
     "signatures": ["3 to 5 teaching habits or recurring themes"],
     "analogies": ["1 or 2 types of analogies they use"]
  },
  "modules": [
    {
      "title": "Module Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "preview": "A 1-2 sentence preview of what the lesson covers."
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
        model: groq('llama-3.3-70b-versatile'),
        prompt,
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(25000),
      });
      textOutput = result.text;
    } catch (apiError: any) {
      console.error("Groq API Error:", apiError);
      const errMsg = (apiError?.message || '').toLowerCase();
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exhausted') || errMsg.includes('rate limit')) {
         return NextResponse.json({ 
           error: 'Google API Rate Limit Exceeded', 
           isRateLimit: true,
           retryAfter: 60
         }, { status: 429 });
      }
      return NextResponse.json({ error: `Groq API returned an error: ${apiError?.message}` }, { status: 500 });
    }

    // Clean up markdown code blocks if any
    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

    let extraction;
    try {
      extraction = JSON.parse(textOutput);
    } catch (parseError) {
      console.error("Failed to parse LLM JSON output:", textOutput);
      return NextResponse.json({ error: 'AI failed to generate a valid course structure. Please try again.' }, { status: 500 });
    }

    if (!extraction.isValid) {
      return NextResponse.json({ error: 'The provided URL does not appear to contain valid course or educational content.' }, { status: 400 });
    }

    const { course, persona, modules } = extraction;

    // 4. Save to Database (Atomic nested create)
    const dbCourse = await prisma.course.create({
      data: {
        title: course.title || 'Custom AI Course',
        tagline: course.tagline || '',
        sourceLabel: new URL(courseUrl).hostname,
        sourceText: pageText,
        modulesCount: modules?.length || 0,
        lessonsCount: modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0,
        instructor: {
          create: {
            name: course.instructorName || 'AI Expert',
            title: course.instructorTitle || 'Instructor',
            linkedin: '',
            persona: JSON.stringify(persona || {})
          }
        },
        modules: {
          create: (modules || []).map((mod: any, i: number) => ({
            n: i + 1,
            title: mod.title || `Module ${i + 1}`,
            weekLabel: mod.title,
            lessons: {
              create: (mod.lessons || []).filter((l: any) => l.title).map((lesson: any) => ({
                title: lesson.title,
                hasPreview: !!(lesson.preview),
                content: lesson.preview || null,
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({ courseId: dbCourse.id, success: true });

  } catch (error: any) {
    console.error('Extraction error:', error);
    
    // Check if it's a rate limit error
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('exhausted') || error.status === 429) {
      return NextResponse.json({ 
        error: 'Google API Rate Limit Exceeded', 
        isRateLimit: true,
        retryAfter: 60 // Wait 60 seconds
      }, { status: 429 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to extract course content' },
      { status: 500 }
    );
  }
}
