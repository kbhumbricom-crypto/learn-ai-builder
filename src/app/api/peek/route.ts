import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(5000), // timeout after 5s
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try to get a meaningful title
    let title = $('title').text().trim();
    if (!title || title.length < 5) {
      title = $('h1').first().text().trim();
    }

    // Clean up title
    title = title.replace(/\n/g, '').replace(/\s+/g, ' ').substring(0, 100);

    return NextResponse.json({ title: title || 'Course Syllabus' });
  } catch (error) {
    console.error('Peek error:', error);
    // Silent fail for the UI so it doesn't look broken, just doesn't show peek
    return NextResponse.json({ title: '' });
  }
}
