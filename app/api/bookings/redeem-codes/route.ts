import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase-service-role';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normEmail(e: string) {
  return e.trim().toLowerCase();
}

function normCode(c: string) {
  return c.trim().toUpperCase();
}

/**
 * POST — apply gift voucher balance and/or promo discount to an existing booking (service role).
 * Body: { bookingId, clientEmail, voucherCode?, promoCode? }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = getServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    const db = admin as any;

    const body = await req.json();
    const bookingId = body.bookingId as string | undefined;
    const clientEmail = body.clientEmail as string | undefined;
    const voucherCode = body.voucherCode ? normCode(String(body.voucherCode)) : '';
    const promoCode = body.promoCode ? normCode(String(body.promoCode)) : '';

    if (!bookingId || !clientEmail) {
      return NextResponse.json({ error: 'bookingId and clientEmail required' }, { status: 400 });
    }
    if (!voucherCode && !promoCode) {
      return NextResponse.json({ error: 'Provide voucherCode and/or promoCode' }, { status: 400 });
    }

    const { data: booking, error: bErr } = await db
      .from('business_profile_bookings')
      .select(
        `
        id,
        business_profile_id,
        service_id,
        client_email,
        amount,
        applied_voucher_id,
        applied_promo_id,
        business_profile_services ( price )
      `
      )
      .eq('id', bookingId)
      .maybeSingle();

    if (bErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const row = booking as unknown as {
      id: string;
      business_profile_id: string;
      service_id: string;
      client_email: string;
      amount: number | null;
      applied_voucher_id: string | null;
      applied_promo_id: string | null;
      business_profile_services: { price: number } | null;
    };

    if (normEmail(row.client_email) !== normEmail(clientEmail)) {
      return NextResponse.json({ error: 'Email does not match booking' }, { status: 403 });
    }

    if (row.applied_voucher_id && voucherCode) {
      return NextResponse.json({ ok: true, message: 'Voucher already applied' });
    }
    if (row.applied_promo_id && promoCode) {
      return NextResponse.json({ ok: true, message: 'Promo already applied' });
    }

    const svcRaw = row.business_profile_services as unknown;
    const svc = Array.isArray(svcRaw)
      ? (svcRaw[0] as { price?: number } | undefined)
      : (svcRaw as { price?: number } | null | undefined);

    let amountPence = Math.round(Number(row.amount ?? svc?.price ?? 0) * 100);
    if (amountPence <= 0) {
      return NextResponse.json({ error: 'No payable amount on booking' }, { status: 400 });
    }

    let appliedPromoId: string | null = null;
    let appliedVoucherId: string | null = null;

    if (promoCode && !row.applied_promo_id) {
      const { data: promos, error: pErr } = await db
        .from('promo_codes')
        .select('*')
        .eq('business_profile_id', row.business_profile_id)
        .eq('active', true);

      if (pErr) {
        return NextResponse.json({ error: pErr.message }, { status: 500 });
      }

      const promo = (promos || []).find((p: { code: string }) => normCode(p.code) === promoCode);
      if (!promo) {
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
      }

      const pr = promo as {
        id: string;
        expires_at: string | null;
        max_redemptions: number | null;
        redemptions_count: number;
        discount_type: string;
        discount_value: number;
      };

      if (pr.expires_at && new Date(pr.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Promo code expired' }, { status: 400 });
      }
      if (pr.max_redemptions != null && pr.redemptions_count >= pr.max_redemptions) {
        return NextResponse.json({ error: 'Promo code fully redeemed' }, { status: 400 });
      }

      let discountPence = 0;
      if (pr.discount_type === 'percent') {
        discountPence = Math.min(amountPence, Math.round((amountPence * pr.discount_value) / 100));
      } else {
        discountPence = Math.min(amountPence, pr.discount_value);
      }

      amountPence -= discountPence;
      appliedPromoId = pr.id;

      const { error: upPromo } = await db
        .from('promo_codes')
        .update({ redemptions_count: pr.redemptions_count + 1 })
        .eq('id', pr.id);

      if (upPromo) {
        return NextResponse.json({ error: upPromo.message }, { status: 500 });
      }
    }

    if (voucherCode && !row.applied_voucher_id) {
      const { data: vouchers, error: vErr } = await db
        .from('gift_vouchers')
        .select('*')
        .eq('business_profile_id', row.business_profile_id)
        .eq('status', 'active');

      if (vErr) {
        return NextResponse.json({ error: vErr.message }, { status: 500 });
      }

      const v = (vouchers || []).find((x: { code: string }) => normCode(x.code) === voucherCode) as
        | {
            id: string;
            balance_pence: number;
            expires_at: string | null;
          }
        | undefined;

      if (!v) {
        return NextResponse.json({ error: 'Invalid gift voucher code' }, { status: 400 });
      }
      if (v.expires_at && new Date(v.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Gift voucher expired' }, { status: 400 });
      }
      if (v.balance_pence <= 0) {
        return NextResponse.json({ error: 'Gift voucher has no balance' }, { status: 400 });
      }

      const usePence = Math.min(v.balance_pence, amountPence);
      amountPence -= usePence;
      appliedVoucherId = v.id;

      const newBal = v.balance_pence - usePence;
      const { error: vUp } = await db
        .from('gift_vouchers')
        .update({
          balance_pence: newBal,
          status: newBal <= 0 ? 'redeemed' : 'active',
        })
        .eq('id', v.id);

      if (vUp) {
        return NextResponse.json({ error: vUp.message }, { status: 500 });
      }
    }

    const newAmount = Math.max(0, amountPence) / 100;
    const patch: Record<string, unknown> = {
      amount: newAmount,
      updated_at: new Date().toISOString(),
    };
    if (appliedPromoId) patch.applied_promo_id = appliedPromoId;
    if (appliedVoucherId) patch.applied_voucher_id = appliedVoucherId;

    const { error: bu } = await db.from('business_profile_bookings').update(patch).eq('id', bookingId);
    if (bu) {
      return NextResponse.json({ error: bu.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, amount: newAmount });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}
