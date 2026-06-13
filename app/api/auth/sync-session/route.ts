import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { applyPublicMutationGuards } from '@/lib/security/api-guards';

/**
 * This API route syncs the session from the Authorization header to cookies
 * This is needed because client-side auth stores sessions in localStorage,
 * but API routes need cookies to access the session.
 */
export async function POST(req: NextRequest) {
  const blocked = applyPublicMutationGuards(req, 'sync_session', 60, 10 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const { access_token, refresh_token } = await req.json();
    
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const supabaseUrl =
      normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      }
    );
    
    // Set the session using the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error('Error setting session:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      user: data.user,
    });
  } catch (error: any) {
    console.error('Error syncing session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync session' },
      { status: 500 }
    );
  }
}

