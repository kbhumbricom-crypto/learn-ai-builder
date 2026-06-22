import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.lead.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to fetch lead count:', error);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
      },
    });
    
    const count = await prisma.lead.count();

    return NextResponse.json({ success: true, lead, count });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint failed on the fields: (`email`)
      return NextResponse.json(
        { error: 'This email is already on the early access list.' },
        { status: 409 }
      );
    }

    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to join early access list. Please try again later.' },
      { status: 500 }
    );
  }
}
