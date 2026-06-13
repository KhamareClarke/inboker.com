import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profiles, error: pErr } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', session.user.id);

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    const ids = (profiles || []).map((p: { id: string }) => p.id);
    if (ids.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const { data: rows, error } = await supabase
      .from('empire_os_recommendations')
      .select('*')
      .in('business_id', ids)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recommendations: rows || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const status = body.status === 'implemented' || body.status === 'dismissed' ? body.status : null;
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status (implemented|dismissed) required' }, { status: 400 });
    }

    const { data: rec, error: rErr } = await supabase
      .from('empire_os_recommendations')
      .select('id, business_id')
      .eq('id', id)
      .maybeSingle();

    if (rErr || !rec) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: bp } = await supabase
      .from('business_profiles')
      .select('user_id')
      .eq('id', (rec as { business_id: string }).business_id)
      .maybeSingle();

    if (!bp || (bp as { user_id: string }).user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const patch =
      status === 'implemented'
        ? { status, implemented_at: now, dismissed_at: null as string | null }
        : { status, dismissed_at: now, implemented_at: null as string | null };

    const { error: uErr } = await supabase.from('empire_os_recommendations').update(patch).eq('id', id);

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
