import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/brand/[slug] – Public brand info for white-label login/booking.
 * Returns logo, company name, and colors for the given business_slug.
 * Used by login page when ?brand=slug is present so the form shows business branding.
 * Uses service role when available so it works regardless of RLS.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const client = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    : supabase;

  if (!client) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data, error } = await client
    .from('business_profiles')
    .select('business_slug, business_name, logo_url, primary_color, secondary_color')
    .eq('business_slug', slug.trim())
    .maybeSingle();

  if (error) {
    console.error('[api/brand] fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load brand' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  }

  return NextResponse.json({
    business_slug: data.business_slug,
    business_name: data.business_name,
    logo_url: data.logo_url,
    primary_color: data.primary_color ?? '#3b82f6',
    secondary_color: data.secondary_color ?? '#06b6d4',
  });
}
