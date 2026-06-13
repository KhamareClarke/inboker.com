import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** List or create promo codes for the signed-in business owner. */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ codes: [] });
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('business_profile_id', (profile as { id: string }).id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ codes: data || [] });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const code = String(body.code || '')
      .trim()
      .toUpperCase();
    const discountType = body.discountType === 'fixed_pence' ? 'fixed_pence' : 'percent';
    const discountValue = Number(body.discountValue);
    if (!code || code.length < 3) {
      return NextResponse.json({ error: 'code must be at least 3 characters' }, { status: 400 });
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: 'discountValue invalid' }, { status: 400 });
    }
    if (discountType === 'percent' && discountValue > 100) {
      return NextResponse.json({ error: 'percent cannot exceed 100' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'No business profile' }, { status: 400 });
    }

    const maxRedemptions =
      body.maxRedemptions != null && Number.isFinite(Number(body.maxRedemptions))
        ? Math.max(1, Math.floor(Number(body.maxRedemptions)))
        : null;
    const expiresInDays = Number(body.expiresInDays);
    const expiresAt =
      Number.isFinite(expiresInDays) && expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null;

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        business_profile_id: (profile as { id: string }).id,
        code,
        discount_type: discountType,
        discount_value: Math.round(discountType === 'fixed_pence' ? discountValue : discountValue),
        max_redemptions: maxRedemptions,
        expires_at: expiresAt,
        active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Code already exists for this business' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: data });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}
