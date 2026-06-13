import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET ?businessProfileId= — credit balance in pence for signed-in user. */
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessProfileId = req.nextUrl.searchParams.get('businessProfileId');
    if (!businessProfileId) {
      return NextResponse.json({ error: 'businessProfileId required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('customer_credits')
      .select('balance_pence')
      .eq('user_id', session.user.id)
      .eq('business_profile_id', businessProfileId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ balancePence: data?.balance_pence ?? 0 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}
