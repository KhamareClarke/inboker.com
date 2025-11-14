import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/actions/clients';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, full_name, email, phone, pipeline_stage, notes } = body;

    if (!workspace_id || !full_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await createClient({
      workspace_id,
      full_name,
      email,
      phone,
      pipeline_stage: pipeline_stage || 'lead',
      notes,
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
}
