import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateGiftVoucherCode } from '@/lib/gift-voucher';

/** List or create gift vouchers for the signed-in business owner. */
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
      return NextResponse.json({ vouchers: [] });
    }

    const { data, error } = await supabase
      .from('gift_vouchers')
      .select('*')
      .eq('business_profile_id', (profile as { id: string }).id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vouchers: data || [] });
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
    const amountGbp = Number(body.amountGbp);
    if (!Number.isFinite(amountGbp) || amountGbp <= 0 || amountGbp > 5000) {
      return NextResponse.json({ error: 'amountGbp must be between 0 and 5000' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'No business profile' }, { status: 400 });
    }

    const pence = Math.round(amountGbp * 100);
    const expiresInDays = Number(body.expiresInDays);
    const expiresAt =
      Number.isFinite(expiresInDays) && expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null;

    let code = generateGiftVoucherCode(12);
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabase
        .from('gift_vouchers')
        .insert({
          business_profile_id: (profile as { id: string }).id,
          code,
          initial_value_pence: pence,
          balance_pence: pence,
          status: 'active',
          expires_at: expiresAt,
          metadata: { createdBy: session.user.id },
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ voucher: data });
      }
      if (error?.code !== '23505') {
        return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 500 });
      }
      code = generateGiftVoucherCode(12);
    }

    return NextResponse.json({ error: 'Could not allocate unique code' }, { status: 500 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}
