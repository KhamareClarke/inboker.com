import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, businessType } = body;

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    console.log('Lead submitted:', { name, email, businessType });

    return NextResponse.json({ ok: true, message: 'Thank you! Check your email for the templates.' });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
