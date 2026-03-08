import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, businessSize, website, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    console.log('Contact form submitted:', { name, email, businessSize, website, message });

    return NextResponse.json({ ok: true, message: 'Thank you! We will get back to you within 24 hours.' });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
