// This file is no longer needed - role is returned from login API
// Keeping for backwards compatibility
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { role: 'business_owner' },
    { status: 200 }
  );
}

