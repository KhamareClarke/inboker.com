import { NextRequest, NextResponse } from 'next/server';
import { storeEmpireOsRecommendation } from '@/lib/empire-os/store-recommendations';

function authorize(req: NextRequest): boolean {
  const secret = process.env.EMPIRE_OS_SECRET?.trim();
  if (!secret) return false;
  const h = req.headers.get('x-empire-secret')?.trim();
  const auth = req.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  return h === secret || bearer === secret;
}

/**
 * Inbound from Empire OS: push a recommendation row (service role insert in store fn).
 * Headers: X-Empire-Secret or Authorization: Bearer {EMPIRE_OS_SECRET}
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const businessId = typeof body.businessId === 'string' ? body.businessId.trim() : '';
  const skillId = typeof body.skillId === 'number' ? body.skillId : Number(body.skillId);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const action = typeof body.action === 'string' ? body.action.trim() : null;
  const impactRaw = typeof body.estimatedImpact === 'string' ? body.estimatedImpact.toLowerCase() : 'medium';
  const estimatedImpact =
    impactRaw === 'high' || impactRaw === 'low' || impactRaw === 'medium' ? impactRaw : 'medium';

  if (!businessId || !title || !description || !Number.isFinite(skillId)) {
    return NextResponse.json(
      { error: 'businessId, skillId, title, description required' },
      { status: 400 }
    );
  }

  const ok = await storeEmpireOsRecommendation({
    businessId,
    skillId,
    title,
    description,
    action,
    estimatedImpact,
    metadata: (body.metadata as Record<string, unknown>) || {},
  });

  if (!ok) {
    return NextResponse.json({ error: 'Failed to store recommendation' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
